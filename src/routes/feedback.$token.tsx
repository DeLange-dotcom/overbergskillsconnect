import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { HineniDisclaimer } from "@/components/site/HineniDisclaimer";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/feedback/$token")({
  head: () => ({ meta: [{ title: "Share your feedback — Hineni" }] }),
  component: FeedbackPage,
});

type Engaged = "yes" | "no" | "prefer_not";

function FeedbackPage() {
  const { token } = Route.useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["feedback_lookup", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("lookup_feedback_request", { _token: token });
      if (error) throw error;
      const row = (data ?? [])[0];
      if (!row) throw new Error("invalid_token");
      return row as {
        id: string;
        applicant_type: string;
        applicant_id: string;
        completed_at: string | null;
        applicant_name: string;
      };
    },
    retry: false,
  });

  const [engaged, setEngaged] = useState<Engaged>("yes");
  const [reliability, setReliability] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("submit_feedback", {
        _token: token,
        _engaged: engaged,
        _reliability: reliability,
        _communication: communication,
        _punctuality: punctuality,
        _would_recommend: recommend ?? false,
        _comment: comment.trim() || "",
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Thanks — your feedback is recorded."),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not submit feedback."),
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="grid place-items-center py-20 text-brand-dark/50">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </SiteLayout>
    );
  }

  if (error || !data) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto p-10 text-center">
          <h1 className="text-2xl font-heading font-bold mb-3">Link not valid</h1>
          <p className="text-brand-dark/70 mb-4">
            This feedback link is invalid or has expired.
          </p>
          <Link to="/" className="text-brand-primary underline">Back to Hineni</Link>
        </div>
      </SiteLayout>
    );
  }

  if (data.completed_at || submit.isSuccess) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto p-10 text-center">
          <h1 className="text-2xl font-heading font-bold mb-3">Thank you</h1>
          <p className="text-brand-dark/70">Your feedback has been recorded.</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-heading font-bold mb-2">How did your experience go?</h1>
        <p className="text-brand-dark/70 mb-6">
          You requested contact with <strong>{data.applicant_name}</strong> through Hineni. Your
          honest feedback helps the community.
        </p>

        <div className="bg-white border border-brand-dark/5 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Did you engage this person?</label>
            <div className="flex gap-2 flex-wrap">
              {(["yes", "no", "prefer_not"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEngaged(v)}
                  className={`px-4 py-2 rounded-xl border text-sm ${engaged === v ? "bg-brand-primary text-primary-foreground border-brand-primary" : "border-brand-dark/10 hover:bg-brand-soft"}`}
                >
                  {v === "yes" ? "Yes" : v === "no" ? "No" : "Prefer not to say"}
                </button>
              ))}
            </div>
          </div>

          {engaged === "yes" && (
            <>
              <Rating label="Reliability" value={reliability} onChange={setReliability} />
              <Rating label="Communication" value={communication} onChange={setCommunication} />
              <Rating label="Punctuality" value={punctuality} onChange={setPunctuality} />

              <div>
                <label className="block text-sm font-semibold mb-2">Would you recommend this person?</label>
                <div className="flex gap-2">
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setRecommend(v)}
                      className={`px-4 py-2 rounded-xl border text-sm ${recommend === v ? "bg-brand-primary text-primary-foreground border-brand-primary" : "border-brand-dark/10 hover:bg-brand-soft"}`}
                    >
                      {v ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Any additional comments? (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
              maxLength={1000}
            />
          </div>

          <button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || (engaged === "yes" && recommend === null)}
            className="w-full px-5 py-3 rounded-xl bg-brand-primary text-primary-foreground font-medium disabled:opacity-60"
          >
            {submit.isPending ? "Submitting…" : "Submit feedback"}
          </button>
        </div>

        <div className="mt-6">
          <HineniDisclaimer />
        </div>
      </div>
    </SiteLayout>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} out of 5`}
            className="p-1"
          >
            <Star className={`size-7 ${n <= value ? "text-amber-500 fill-amber-400" : "text-brand-dark/20"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
