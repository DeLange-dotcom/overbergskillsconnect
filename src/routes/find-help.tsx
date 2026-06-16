import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_CATEGORIES, TRAVEL, categoryLabel, travelLabel } from "@/lib/constants";
import { MapPin, Car, Calendar, Clock, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/find-help")({
  head: () => ({
    meta: [
      { title: "Find Approved Help — Hineni Skills Register" },
      {
        name: "description",
        content: "Browse vetted community workers in the Overberg. Contact safely through Hineni.",
      },
    ],
  }),
  component: FindHelp,
});

type Provider = {
  id: string;
  display_name: string;
  town: string;
  services: string[];
  skills_summary: string;
  days_available: string[];
  typical_hours: string[];
  max_travel: string;
  own_transport: boolean;
  drivers_licence: boolean;
  available_immediately: boolean;
};

function FindHelp() {
  const [service, setService] = useState<string>("");
  const [town, setTown] = useState<string>("");
  const [selected, setSelected] = useState<Provider | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["approved_providers", service, town],
    queryFn: async (): Promise<Provider[]> => {
      let q = supabase.from("approved_providers_public").select("*").order("display_name");
      if (service) q = q.contains("services", [service]);
      if (town) q = q.ilike("town", `%${town}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Provider[];
    },
  });

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Find approved help</h1>
        <p className="text-brand-dark/70 max-w-2xl mb-8">
          Every person below has been vetted by Hineni. To protect their privacy, contact happens
          through us — we'll introduce you safely.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mb-8 p-4 bg-brand-soft rounded-2xl">
          <div>
            <label className="text-xs uppercase tracking-wider text-brand-dark/60">Service</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            >
              <option value="">All services</option>
              {SERVICE_CATEGORIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-wider text-brand-dark/60">Town</label>
            <input
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="e.g. Hermanus, Bredasdorp"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-20 text-brand-dark/50">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-20 text-brand-dark/60">
            No approved providers match these filters yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <article
                key={p.id}
                className="bg-white border border-brand-dark/5 rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-heading text-lg font-semibold">{p.display_name}</h3>
                  {p.available_immediately && (
                    <span className="text-[10px] uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
                      Available now
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-brand-dark/60 mb-3">
                  <MapPin className="size-3.5" /> {p.town}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.services.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-brand-soft text-brand-dark/80"
                    >
                      {categoryLabel(s)}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-brand-dark/70 mb-4 line-clamp-3">{p.skills_summary}</p>
                <div className="text-xs text-brand-dark/60 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> {p.days_available.join(", ").toUpperCase() || "—"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {p.typical_hours.join(", ")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Car className="size-3.5" /> {travelLabel(p.max_travel)} ·{" "}
                    {p.own_transport ? "Own transport" : "No transport"}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(p)}
                  className="mt-auto inline-flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-medium hover:brightness-110"
                >
                  <MessageCircle className="size-4" /> Contact through Hineni
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {selected && <ContactModal provider={selected} onClose={() => setSelected(null)} />}
    </SiteLayout>
  );
}

function ContactModal({ provider, onClose }: { provider: Provider; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("contact_requests").insert({
      service_provider_id: provider.id,
      requester_name: (fd.get("name") as string).trim(),
      requester_contact: (fd.get("contact") as string).trim(),
      requester_email: ((fd.get("email") as string) || "").trim() || null,
      message: ((fd.get("message") as string) || "").trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Hineni has received your request and will be in touch.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="font-heading text-xl font-semibold mb-1">
          Contact {provider.display_name}
        </h2>
        <p className="text-sm text-brand-dark/60 mb-5">
          Hineni will receive your request and introduce you safely. Their private details are
          never shared without consent.
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            required
            name="name"
            placeholder="Your name"
            className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
          />
          <input
            required
            name="contact"
            placeholder="Your phone or WhatsApp"
            className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
          />
          <textarea
            name="message"
            rows={3}
            placeholder="Briefly, what help are you looking for?"
            className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
          />
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-brand-dark/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-brand-primary text-white disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
