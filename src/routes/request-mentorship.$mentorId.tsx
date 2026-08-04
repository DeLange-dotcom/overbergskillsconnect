import { createFileRoute, useParams } from "@tanstack/react-router";
import { requireFeature } from "@/lib/disabled-route";
import { RequestMentorshipPage } from "./request-mentorship.index";

export const Route = createFileRoute("/request-mentorship/$mentorId")({
  beforeLoad: () => requireFeature("apprenticeships"),
  head: () => ({
    meta: [
      { title: "Request Mentorship — Hineni" },
      { name: "description", content: "Request to be matched with a Hineni-vetted mentor." },
    ],
  }),
  component: Page,
});

function Page() {
  const { mentorId } = useParams({ from: "/request-mentorship/$mentorId" });
  return <RequestMentorshipPage mentorId={mentorId} />;
}
