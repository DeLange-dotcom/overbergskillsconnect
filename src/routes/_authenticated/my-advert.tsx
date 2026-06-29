import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { SKILL_CATEGORIES, AVAILABILITY_OPTIONS } from "@/lib/noticeboard";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, ExternalLink, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-advert")({
  component: MyAdvert,
});

type MyListing = {
  id: string;
  name: string;
  town: string;
  phone: string;
  description: string;
  skills: string[];
  category: string | null;
  years_experience: number | null;
  availability: string | null;
  photo_url: string | null;
  is_hidden: boolean;
  is_archived: boolean;
  public_listing_reference: string | null;
  created_at: string;
};

function MyAdvert() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-advert"],
    queryFn: async (): Promise<MyListing | null> => {
      const { data, error } = await supabase.rpc("noticeboard_my_listing");
      if (error) throw error;
      // Best-effort: stamp last_login_at for lifecycle tracking
      supabase.rpc("noticeboard_touch_login").then(() => {});
      const row = Array.isArray(data) ? data[0] : data;
      return (row as MyListing | undefined) ?? null;
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto mb-3" />
          Loading…
        </div>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="text-5xl mb-4" aria-hidden>📝</div>
          <h1 className="text-3xl font-heading font-bold mb-3">My Listing</h1>
          <p className="text-brand-dark/70 mb-8">
            You haven't created your advert yet.
          </p>
          <Link
            to="/advertise"
            className="inline-flex px-6 py-3.5 rounded-xl bg-brand-primary text-white font-medium"
          >
            Create My Listing
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <MyAdvertEditor
      listing={data}
      onSaved={() => qc.invalidateQueries({ queryKey: ["my-advert"] })}
      onDeleted={() => {
        qc.invalidateQueries({ queryKey: ["my-advert"] });
        navigate({ to: "/advertise" });
      }}
      refetch={refetch}
    />
  );
}

function MyAdvertEditor({
  listing,
  onSaved,
  onDeleted,
  refetch,
}: {
  listing: MyListing;
  onSaved: () => void;
  onDeleted: () => void;
  refetch: () => void;
}) {
  const [name, setName] = useState(listing.name);
  const [town, setTown] = useState(listing.town);
  const [phone, setPhone] = useState(listing.phone);
  const [description, setDescription] = useState(listing.description);
  const [photoUrl, setPhotoUrl] = useState(listing.photo_url ?? "");
  const [yearsExp, setYearsExp] = useState<string>(
    listing.years_experience != null ? String(listing.years_experience) : "",
  );
  const [availability, setAvailability] = useState(listing.availability ?? "");
  const [skills, setSkills] = useState<string[]>(() => {
    // Map any non-standard skills onto the "Other" bucket toggle
    return listing.skills.filter((s) => (SKILL_CATEGORIES as readonly string[]).includes(s));
  });
  const [otherSkills, setOtherSkills] = useState<string>(() =>
    listing.skills.filter((s) => !(SKILL_CATEGORIES as readonly string[]).includes(s)).join(", "),
  );
  const hasOtherInList = otherSkills.trim().length > 0;
  const [otherToggle, setOtherToggle] = useState<boolean>(hasOtherInList);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Keep form in sync if listing changes externally
  useEffect(() => {
    setName(listing.name);
    setTown(listing.town);
    setPhone(listing.phone);
    setDescription(listing.description);
    setPhotoUrl(listing.photo_url ?? "");
    setYearsExp(listing.years_experience != null ? String(listing.years_experience) : "");
    setAvailability(listing.availability ?? "");
  }, [listing.id]);

  function toggleSkill(s: string) {
    if (s === "Other") {
      setOtherToggle((v) => {
        if (v) setOtherSkills("");
        return !v;
      });
      return;
    }
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function save(extra: Partial<Record<string, unknown>> = {}) {
    setSaving(true);
    const customSkills = otherToggle
      ? otherSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const finalSkills = [...skills, ...customSkills];
    if (finalSkills.length === 0) {
      setSaving(false);
      toast.error("Choose at least one skill.");
      return;
    }
    const payload = {
      name: name.trim(),
      town: town.trim(),
      phone: phone.trim(),
      description: description.trim(),
      skills: finalSkills,
      category: finalSkills[0],
      years_experience: yearsExp === "" ? null : Number(yearsExp),
      availability,
      photo_url: photoUrl.trim(),
      ...extra,
    };
    const { error } = await supabase.rpc("noticeboard_my_update", {
      _payload: payload,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Advert updated");
    onSaved();
  }

  async function toggleHidden() {
    const { error } = await supabase.rpc("noticeboard_my_update", {
      _payload: { is_hidden: !listing.is_hidden },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(listing.is_hidden ? "Advert visible" : "Advert hidden");
    refetch();
  }

  async function deleteListing() {
    const { error } = await supabase.rpc("noticeboard_my_delete");
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Advert removed");
    onDeleted();
  }

  const publicUrl = listing.public_listing_reference
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${listing.public_listing_reference}`
    : null;

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold">My Listing</h1>
            <p className="text-brand-dark/60 text-sm mt-1">
              Update any field and your advert changes immediately.
            </p>
          </div>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft whitespace-nowrap"
              title="Preview My Public Listing"
            >
              <ExternalLink className="size-4" /> Preview
            </a>
          )}
        </div>

        {listing.is_archived && (
          <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 mb-4 text-sm text-amber-900">
            Your listing is <strong>archived</strong> and hidden from public search. Use{" "}
            <em>Reactivate listing</em> below to bring it back live.
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-2xl border border-brand-dark/10 bg-white mb-6">
          <div>
            <div className="font-medium">
              {listing.is_hidden ? "Hidden from noticeboard" : "Live on the noticeboard"}
            </div>
            <div className="text-xs text-brand-dark/60">
              {listing.is_hidden
                ? "Other users can't see your advert."
                : "People can find and contact you."}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleHidden}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft"
          >
            {listing.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {listing.is_hidden ? "Make visible" : "Hide"}
          </button>
        </div>

        <IncomingRequests />



        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-5"
        >
          <Field label="Name" value={name} onChange={setName} required />
          <Field label="Town or area" value={town} onChange={setTown} required />

          <div>
            <Label required>Skills</Label>
            <p className="text-xs text-brand-dark/60 mt-1 mb-2">
              Tap to add or remove. Choose "Other" to add your own.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SKILL_CATEGORIES.map((s) => {
                const active = s === "Other" ? otherToggle : skills.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={
                      "px-3 py-2 rounded-xl text-sm border text-left " +
                      (active
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-white border-brand-dark/10 hover:border-brand-primary/40")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {otherToggle && (
              <div className="mt-3">
                <Label required>Please specify your skill(s)</Label>
                <input
                  type="text"
                  value={otherSkills}
                  onChange={(e) => setOtherSkills(e.target.value)}
                  placeholder="e.g. Upholstery, Beekeeper"
                  spellCheck
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
                />
                <p className="text-xs text-brand-dark/60 mt-1">
                  Separate multiple skills with commas.
                </p>
              </div>
            )}
          </div>

          <div>
            <Label>Years of experience</Label>
            <input
              type="number"
              min={0}
              max={70}
              value={yearsExp}
              onChange={(e) => setYearsExp(e.target.value)}
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
          </div>

          <div>
            <Label>Availability</Label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            >
              <option value="">Select…</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label required>Short description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              spellCheck
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
          </div>

          <div>
            <Label>Photo URL</Label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
            <p className="text-xs text-brand-dark/60 mt-1">
              Leave blank to remove your photo.
            </p>
          </div>

          <div>
            <Label required>Telephone number (kept private)</Label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
            <p className="text-xs text-brand-dark/60 mt-1">
              Only shared when you approve a request.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden inline-flex justify-center items-center gap-1.5 py-3.5 rounded-xl border border-brand-dark/15 text-sm"
              >
                <ExternalLink className="size-4" /> Preview my public listing
              </a>
            )}
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-brand-dark/10 flex flex-wrap gap-2">
          {listing.is_archived ? (
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.rpc("noticeboard_my_reactivate");
                if (error) return toast.error(error.message);
                toast.success("Listing reactivated");
                refetch();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm"
            >
              <Eye className="size-4" /> Reactivate listing
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Archive your listing? It will be hidden from public search but can be reactivated any time.")) return;
                const { error } = await supabase.rpc("noticeboard_my_archive");
                if (error) return toast.error(error.message);
                toast.success("Listing archived");
                refetch();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-dark/15 text-brand-dark/80 hover:bg-brand-soft text-sm"
            >
              <EyeOff className="size-4" /> Archive my listing
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm"
          >
            <Trash2 className="size-4" /> Delete my listing
          </button>
        </div>


        {confirmDelete && (
          <div
            className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-heading font-bold mb-2">Delete your advert?</h2>
              <p className="text-brand-dark/70 mb-6">
                Are you sure you want to permanently remove your advert from Overberg Skills
                Connect?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-lg border border-brand-dark/15 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    deleteListing();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
                >
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-brand-dark mb-1">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        spellCheck={["text", "search"].includes(type)}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
      />
    </div>
  );
}

type IncomingRow = {
  id: string;
  requester_name: string;
  requester_contact: string;
  message: string | null;
  status: "pending" | "approved" | "declined";
  created_at: string;
  decided_at: string | null;
};

function IncomingRequests() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["incoming-requests"],
    queryFn: async (): Promise<IncomingRow[]> => {
      const { data, error } = await supabase.rpc("noticeboard_my_incoming_requests");
      if (error) throw error;
      return (data ?? []) as IncomingRow[];
    },
    refetchInterval: 30000,
  });

  async function decide(id: string, decision: "approved" | "declined") {
    const { error } = await supabase.rpc("noticeboard_my_decide", {
      _request_id: id,
      _decision: decision,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(decision === "approved" ? "Contact details shared." : "Request declined.");
    qc.invalidateQueries({ queryKey: ["incoming-requests"] });
  }

  const rows = data ?? [];

  return (
    <section className="mb-8">
      <h2 className="text-xl font-heading font-bold mb-3">People Interested In Me</h2>
      {isLoading ? (
        <div className="text-sm text-brand-dark/60">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="p-5 rounded-2xl border border-dashed border-brand-dark/15 text-sm text-brand-dark/60 text-center">
          No one has asked for your contact details yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const date = new Date(r.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <li
                key={r.id}
                className="p-4 rounded-2xl border border-brand-dark/10 bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.requester_name}</div>
                    <div className="text-xs text-brand-dark/50">Requested {date}</div>
                    {r.message && (
                      <p className="text-sm text-brand-dark/70 mt-2 whitespace-pre-line">
                        {r.message}
                      </p>
                    )}
                  </div>
                  {r.status !== "pending" && (
                    <span
                      className={
                        "text-xs px-2.5 py-1 rounded-full shrink-0 " +
                        (r.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800")
                      }
                    >
                      {r.status === "approved" ? "Approved" : "Declined"}
                    </span>
                  )}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => decide(r.id, "approved")}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium"
                    >
                      ✅ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(r.id, "declined")}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-medium"
                    >
                      ❌ Decline
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
