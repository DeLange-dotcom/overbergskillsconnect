import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Private "save this person" control. Favourites are only ever visible to the
 * person who saved them and never expose a phone number.
 */
export function FavouriteButton({
  profileId,
  className = "",
  withLabel = true,
}: {
  profileId: string;
  className?: string;
  withLabel?: boolean;
}) {
  const { t } = useTranslation();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!active) return;
      if (!uid) {
        setSignedIn(false);
        return;
      }
      setSignedIn(true);
      const { data } = await supabase
        .from("noticeboard_favourites")
        .select("id")
        .eq("user_id", uid)
        .eq("profile_id", profileId)
        .maybeSingle();
      if (active) setSaved(!!data);
    })();
    return () => {
      active = false;
    };
  }, [profileId]);

  if (signedIn === null) return null;

  async function toggle() {
    if (!signedIn) {
      toast.info(t("publicProfile.favourite.signInToSave"));
      return;
    }
    setBusy(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setBusy(false);
      return;
    }
    if (saved) {
      const { error } = await supabase
        .from("noticeboard_favourites")
        .delete()
        .eq("user_id", uid)
        .eq("profile_id", profileId);
      setBusy(false);
      if (error) return toast.error(t("publicProfile.favourite.removeError"));
      setSaved(false);
      toast.success(t("publicProfile.favourite.removed"));
    } else {
      const { error } = await supabase
        .from("noticeboard_favourites")
        .insert({ user_id: uid, profile_id: profileId });
      setBusy(false);
      if (error) return toast.error(t("publicProfile.favourite.saveError"));
      setSaved(true);
      toast.success(t("publicProfile.favourite.saved"));
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={
        saved ? t("publicProfile.favourite.removeAriaLabel") : t("publicProfile.favourite.saveAriaLabel")
      }
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition ${
        saved
          ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
          : "bg-white border-brand-dark/10 text-brand-dark hover:border-brand-primary/40"
      } ${className}`}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={`size-4 ${saved ? "fill-current" : ""}`} />
      )}
      {withLabel && (
        <span>{saved ? t("publicProfile.favourite.savedLabel") : t("publicProfile.favourite.saveLabel")}</span>
      )}
    </button>
  );
}
