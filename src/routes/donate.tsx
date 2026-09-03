import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { requireFeature } from "@/lib/disabled-route";
import { Heart, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/donate")({
  beforeLoad: () => requireFeature("donations"),
  validateSearch: (s: Record<string, unknown>) => ({
    amount: typeof s.amount === "number" ? s.amount : undefined,
    purpose: s.purpose === "sponsor_vetting" ? "sponsor_vetting" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Support Hineni — Sponsor a Vetting Check" },
      {
        name: "description",
        content:
          "Your donation helps Hineni vet applicants, run reference checks, and connect people safely.",
      },
    ],
  }),
  component: Donate,
});

const SUGGESTED = [50, 100, 250, 500];

const schema = z.object({
  donor_name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  amount: z.coerce.number().int().min(10).max(1000000),
  frequency: z.enum(["once_off", "monthly"]),
  purpose: z.enum(["general", "sponsor_vetting"]),
  anonymous: z.boolean(),
  message: z.string().max(500).optional().or(z.literal("")),
});

function Donate() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const [amount, setAmount] = useState<number>(search.amount ?? 250);
  const [custom, setCustom] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const finalAmount = custom ? Number(custom) : amount;
    const raw = {
      donor_name: fd.get("donor_name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      amount: finalAmount,
      frequency: (fd.get("frequency") as string) || "once_off",
      purpose: (fd.get("purpose") as string) || "general",
      anonymous: fd.get("anonymous") === "on",
      message: fd.get("message") as string,
    };
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("donatePage.form.checkError"));
      setSubmitting(false);
      return;
    }
    const d = parsed.data;
    const { error } = await supabase.from("donations").insert({
      donor_name: d.donor_name || null,
      email: d.email || null,
      phone: d.phone || null,
      amount_cents: Math.round(d.amount * 100),
      frequency: d.frequency as never,
      purpose: d.purpose as never,
      anonymous: d.anonymous,
      message: d.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-brand-primary mx-auto mb-6" />
          <h1 className="osc-heading text-3xl mb-3">{t("donatePage.thankYou.title")}</h1>
          <p className="text-brand-dark/70 max-w-md mx-auto mb-6">
            {t("donatePage.thankYou.body")}
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-xs uppercase tracking-widest text-brand-accent font-semibold">
          {t("donatePage.badge")}
        </span>
        <h1 className="osc-heading text-3xl sm:text-4xl mt-4 mb-4">
          {t("donatePage.title")}
        </h1>
        <p className="text-brand-dark/75 leading-relaxed mb-4">
          {t("donatePage.intro1")}
        </p>
        <p className="text-brand-dark/75 leading-relaxed mb-8">
          {t("donatePage.intro2")}
        </p>

        <div className="bg-brand-soft border border-brand-dark/5 rounded-2xl p-5 sm:p-7 mb-8">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-full bg-brand-accent/15 grid place-items-center shrink-0">
              <Heart className="size-5 text-brand-accent" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold mb-1">{t("donatePage.sponsor.title")}</h2>
              <p className="text-sm text-brand-dark/70">
                {t("donatePage.sponsor.body")}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-white border border-brand-dark/5 rounded-2xl p-5 sm:p-7 space-y-5"
        >
          <div>
            <div className="text-sm font-medium mb-2">{t("donatePage.form.amountLabel")}</div>
            <div className="grid grid-cols-4 gap-2">
              {SUGGESTED.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAmount(v);
                    setCustom("");
                  }}
                  className={`py-3 rounded-xl border text-sm font-medium ${
                    amount === v && !custom
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "border-brand-dark/10 hover:bg-brand-soft"
                  }`}
                >
                  R{v}
                </button>
              ))}
            </div>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={t("donatePage.form.customPlaceholder")}
              inputMode="numeric"
              className="mt-3 w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
          </div>

          <div>
            <div className="text-sm font-medium mb-2">{t("donatePage.form.frequencyLabel")}</div>
            <div className="flex gap-2">
              <Radio name="frequency" value="once_off" defaultChecked label={t("donatePage.form.onceOff")} />
              <Radio name="frequency" value="monthly" label={t("donatePage.form.monthly")} />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">{t("donatePage.form.purposeLabel")}</div>
            <div className="flex gap-2">
              <Radio
                name="purpose"
                value="general"
                defaultChecked={search.purpose !== "sponsor_vetting"}
                label={t("donatePage.form.purposeGeneral")}
              />
              <Radio
                name="purpose"
                value="sponsor_vetting"
                defaultChecked={search.purpose === "sponsor_vetting"}
                label={t("donatePage.form.purposeSponsor")}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input label={t("donatePage.form.nameLabel")} name="donor_name" />
            <Input label={t("donatePage.form.emailLabel")} name="email" type="email" />
            <Input label={t("donatePage.form.phoneLabel")} name="phone" type="tel" />
          </div>

          <div>
            <Label>{t("donatePage.form.messageLabel")}</Label>
            <textarea
              name="message"
              rows={3}
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
              spellCheck="true"
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="anonymous" className="mt-1 accent-brand-primary" />
            <span>{t("donatePage.form.anonymous")}</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent text-white font-medium hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {t("donatePage.form.submit")}
          </button>
          <p className="text-xs text-brand-dark/50">
            {t("donatePage.form.followUp")}
          </p>
        </form>
      </div>
    </SiteLayout>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1.5 text-brand-dark">{children}</label>;
}
function Input({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
      />
    </div>
  );
}
function Radio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-brand-dark/10 cursor-pointer hover:bg-brand-soft text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="accent-brand-primary"
      />
      <span>{label}</span>
    </label>
  );
}
