import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { AVAILABILITY_OPTIONS, type SkillExperience } from "@/lib/noticeboard";
import { LocationSelect } from "@/components/site/LocationSelect";
import {
  SkillExperienceEditor,
  entriesFromSkillExperience,
  entriesToPayload,
  type SkillEntry,
} from "@/components/site/SkillExperienceEditor";

import {
  approvedContactMessage,
  declinedContactMessage,
  openWhatsAppMessage,
} from "@/lib/manual-whatsapp";
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
  skill_experience?: SkillExperience[] | null;

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
          <div className="text-5xl mb-4" aria-hidden>
            📝
          </div>
          <h1 className="osc-heading text-3xl mb-3">My Listing</h1>
          <p className="text-brand-dark/70 mb-8">You haven't created your advert yet.</p>
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
  const [availability, setAvailability] = useState(listing.availability ?? "");
  const [entries, setEntries] = useState<SkillEntry[]>(() =>
    entriesFromSkillExperience(
      listing.skill_experience?.length
        ? listing.skill_experience
        : listing.skills.map((s) => ({ skill: s, experience_level: null })),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteAck, setDeleteAck] = useState(false);

  // Keep form in sync if listing changes externally
  useEffect(() => {
    setName(listing.name);
    setTown(listing.town);
    setPhone(listing.phone);
    setDescription(listing.description);
    setPhotoUrl(listing.photo_url ?? "");
    setAvailability(listing.availability ?? "");
    setEntries(
      entriesFromSkillExperience(
        listing.skill_experience?.length
          ? listing.skill_experience
          : listing.skills.map((s) => ({ skill: s, experience_level: null })),
      ),
    );
  }, [listing.id]);

  async function save(extra: Partial<Record<string, unknown>> = {}) {
    setSaving(true);
    const skillExperience = entriesToPayload(entries);
    if (skillExperience.length === 0) {
      setSaving(false);
      toast.error("Please add at least one skill.");
      return;
    }
    if (skillExperience.some((s) => !s.experience_level)) {
      setSaving(false);
      toast.error("Please choose how much experience you have for each skill.");
      return;
    }
    const finalSkills = skillExperience.map((s) => s.skill);
    const payload = {
      name: name.trim(),
      town: town.trim(),
      phone: phone.trim(),
      description: description.trim(),
      skills: finalSkills,
      skill_experience: skillExperience,
      category: finalSkills[0],
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


  async function togglePaused() {
    const { error } = await supabase.rpc("noticeboard_my_set_paused", {
      _paused: !listing.is_hidden,
    });
    if (error) {
      toast.error("Sorry, we could not change your listing. Please try again.");
      return;
    }
    toast.success(listing.is_hidden ? "Your listing is live again." : "Your listing is paused.");
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
            <h1 className="osc-heading text-3xl sm:text-4xl">My Listing</h1>
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
              {listing.is_hidden ? "Paused — not shown to anyone" : "Live on the noticeboard"}
            </div>
            <div className="text-xs text-brand-dark/60">
              {listing.is_hidden
                ? "Pausing keeps everything saved. Nothing is deleted."
                : "People can find you and ask for your number."}
            </div>
          </div>
          <button
            type="button"
            onClick={togglePaused}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft whitespace-nowrap"
          >
            {listing.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {listing.is_hidden ? "Unpause my listing" : "Pause my listing"}
          </button>
        </div>

        <IncomingRequests listing={listing} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-5"
        >
          <Field label="Name" value={name} onChange={setName} required />
          <LocationSelect value={town} onChange={setTown} required />

          <div>
            <h2 className="osc-heading text-xl">What work can you do?</h2>
            <p className="text-sm text-brand-dark/60 mt-1 mb-3">
              Add, remove or change a skill and its experience level, then save your changes.
            </p>
            <SkillExperienceEditor entries={entries} onChange={setEntries} />
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
            <p className="text-xs text-brand-dark/60 mt-1">Leave blank to remove your photo.</p>
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
                if (
                  !confirm(
                    "Archive your listing? It will be hidden from public search but can be reactivated any time.",
                  )
                )
                  return;
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
        </div>

        <div className="mt-6 p-5 rounded-2xl border border-red-200 bg-red-50/50">
          <h2 className="font-heading font-bold text-red-800 mb-1">Delete my listing</h2>
          <p className="text-sm text-red-900/80 mb-4">
            This is permanent. Your listing and its skills are removed for good. If you only want a
            break, use <strong>Pause my listing</strong> instead — nothing is lost.
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium"
          >
            <Trash2 className="size-4" /> Delete my listing permanently
          </button>
        </div>

        {confirmDelete && (
          <div
            className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="osc-heading text-xl mb-2">
                Permanently delete your listing?
              </h2>
              <p className="text-brand-dark/70 mb-4">
                This cannot be undone. To keep your details for later, choose Cancel and use
                <strong> Pause my listing</strong> instead.
              </p>
              <label className="flex items-start gap-2.5 text-sm mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteAck}
                  onChange={(e) => setDeleteAck(e.target.checked)}
                  className="mt-1 size-4"
                />
                <span>Yes, I understand my listing will be deleted for good.</span>
              </label>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteAck(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-brand-dark/15 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!deleteAck}
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteAck(false);
                    deleteListing();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-40"
                >
                  Delete permanently
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

function IncomingRequests({ listing }: { listing: MyListing }) {
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
    const whatsappWindow = window.open("about:blank", "_blank");
    const { error } = await supabase.rpc("noticeboard_my_decide", {
      _request_id: id,
      _decision: decision,
    });
    if (error) {
      whatsappWindow?.close();
      toast.error(error.message);
      return;
    }
    const row = rows.find((r) => r.id === id);
    if (row?.requester_contact) {
      const message =
        decision === "approved"
          ? approvedContactMessage(listing.name, listing.phone)
          : declinedContactMessage(listing.name);
      openWhatsAppMessage(row.requester_contact, message, whatsappWindow);
      toast.success(
        decision === "approved"
          ? "Approved. WhatsApp is opening so you can send your contact details."
          : "Declined. WhatsApp is opening so you can send the update.",
      );
    } else {
      whatsappWindow?.close();
      toast.success(decision === "approved" ? "Request approved." : "Request declined.");
    }
    qc.invalidateQueries({ queryKey: ["incoming-requests"] });
  }

  const rows = data ?? [];

  return (
    <section className="mb-8">
      <h2 className="osc-heading text-xl mb-3">People Interested In Me</h2>
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
              <li key={r.id} className="p-4 rounded-2xl border border-brand-dark/10 bg-white">
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
                      Approve & WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(r.id, "declined")}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-medium"
                    >
                      Decline & WhatsApp
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
