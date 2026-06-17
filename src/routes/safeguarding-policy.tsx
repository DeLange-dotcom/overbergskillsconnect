import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  SAFEGUARDING_CONTACT_EMAIL,
  SAFEGUARDING_LAST_UPDATED,
  SAFEGUARDING_POLICY_VERSION,
} from "@/lib/safeguarding";
import { Download, Printer, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/safeguarding-policy")({
  head: () => ({
    meta: [
      { title: "Safeguarding Policy — Hineni" },
      {
        name: "description",
        content:
          "Hineni's Safeguarding Policy covering recruitment, mentoring, apprenticeships, conduct, reporting and digital safety for young people and vulnerable adults.",
      },
    ],
  }),
  component: SafeguardingPolicy,
});

function SafeguardingPolicy() {
  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 print:py-0">
        <div className="flex flex-wrap items-center gap-3 mb-3 print:hidden">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold">
            <ShieldCheck className="size-3.5" /> Safeguarding
          </span>
          <span className="text-xs uppercase tracking-widest text-brand-dark/50">
            Version {SAFEGUARDING_POLICY_VERSION} · Last updated {SAFEGUARDING_LAST_UPDATED}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
          Hineni Safeguarding Policy
        </h1>
        <p className="text-brand-dark/70 mb-6 leading-relaxed">
          This policy sets out Hineni's commitment to the safety, dignity and wellbeing of every
          young person, vulnerable adult and participant who engages with our programmes, including
          apprenticeships, mentorships, work placements and community activities.
        </p>

        <div className="flex flex-wrap gap-2 mb-10 print:hidden">
          <a
            href={`mailto:${SAFEGUARDING_CONTACT_EMAIL}?subject=Safeguarding%20concern`}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:brightness-110 inline-flex items-center gap-2"
          >
            Report a concern
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-brand-dark/10 text-sm inline-flex items-center gap-2 hover:bg-brand-soft"
          >
            <Printer className="size-4" /> Print policy
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white border border-brand-dark/10 text-sm inline-flex items-center gap-2 hover:bg-brand-soft"
            title="Use your browser's 'Save as PDF' option"
          >
            <Download className="size-4" /> Download PDF
          </button>
        </div>

        <Section n={1} title="Purpose">
          <p>
            The purpose of this policy is to ensure that everyone who participates in Hineni's
            activities — including apprentices, mentees, mentors, volunteers, employers,
            apprenticeship providers, staff and community partners — is protected from harm, abuse,
            exploitation, discrimination and neglect.
          </p>
        </Section>

        <Section n={2} title="Scope">
          <p>This policy applies to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>All Hineni staff, volunteers, mentors and board members.</li>
            <li>All apprentices, mentees, young people and vulnerable adults engaging with Hineni.</li>
            <li>All employers, farms, businesses, NPOs and households offering opportunities through Hineni.</li>
            <li>All digital interactions on the Hineni platform.</li>
          </ul>
        </Section>

        <Section n={3} title="Commitment to safety">
          <p>
            Hineni is committed to creating safe, respectful and inclusive environments. We
            recognise our duty of care toward children and vulnerable adults and we comply with
            applicable South African law, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The Children's Act, 38 of 2005;</li>
            <li>The Protection of Personal Information Act (POPIA), 4 of 2013;</li>
            <li>The Criminal Law (Sexual Offences and Related Matters) Amendment Act, 32 of 2007;</li>
            <li>The Basic Conditions of Employment Act and related labour legislation governing young workers;</li>
            <li>The Sector Code on the prevention of child labour.</li>
          </ul>
        </Section>

        <Section n={4} title="Definitions">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Child / Young person:</strong> Any person under the age of 18.</li>
            <li><strong>Vulnerable adult:</strong> Any adult who, by reason of disability, illness or circumstance, requires additional protection.</li>
            <li><strong>Abuse:</strong> Any act or omission that causes physical, emotional, sexual, financial or psychological harm.</li>
            <li><strong>Safeguarding:</strong> The proactive measures taken to protect people from harm.</li>
          </ul>
        </Section>

        <Section n={5} title="Recruitment and vetting">
          <p>All mentors, volunteers and individuals offering placements may be subject to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identity verification;</li>
            <li>Reference checks (minimum two references for mentors);</li>
            <li>A Police Clearance Certificate (PCC) where appropriate;</li>
            <li>Interviews and a signed safeguarding declaration;</li>
            <li>Periodic re-verification (typically every 12 months).</li>
          </ul>
        </Section>

        <Section n={6} title="Code of conduct">
          <p>Every participant agrees to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Treat others with dignity, fairness and respect;</li>
            <li>Avoid any form of harassment, bullying, discrimination or exploitation;</li>
            <li>Maintain appropriate professional boundaries at all times;</li>
            <li>Never share or request explicit material;</li>
            <li>Never provide alcohol, tobacco or illegal substances to a young person;</li>
            <li>Never meet alone in private settings without prior approval and a parent/guardian's written consent.</li>
          </ul>
        </Section>

        <Section n={7} title="Mentoring guidelines">
          <ul className="list-disc pl-5 space-y-1">
            <li>Mentoring sessions should take place in safe, public or supervised settings.</li>
            <li>Online sessions should be conducted on approved platforms with appropriate adults aware.</li>
            <li>Communication between mentors and minors must be transparent and copied to a parent/guardian where reasonable.</li>
            <li>Mentors must not give or receive money, gifts of value or loans.</li>
            <li>Any concern, however minor, must be reported to Hineni without delay.</li>
          </ul>
        </Section>

        <Section n={8} title="Apprenticeship and work placement standards">
          <ul className="list-disc pl-5 space-y-1">
            <li>Placements must comply with South African labour legislation, including limits on the hours, conditions and types of work permitted for young workers.</li>
            <li>Persons under 15 may not be employed. Persons aged 15–17 may only undertake suitable, age-appropriate work and only during school holidays unless otherwise lawfully permitted.</li>
            <li>Health and safety risks must be assessed before any placement begins.</li>
            <li>No young person may be exposed to hazardous machinery, chemicals, heights or work that could harm their physical or moral development.</li>
            <li>Hosts must provide adequate supervision, induction and reasonable support throughout.</li>
            <li>Hineni reserves the right to suspend or end any placement where standards are not met.</li>
          </ul>
        </Section>

        <Section n={9} title="Reporting concerns">
          <p>
            Any concern, allegation or incident relating to a safeguarding matter must be reported
            immediately to Hineni:
          </p>
          <p className="mt-2">
            Email:{" "}
            <a href={`mailto:${SAFEGUARDING_CONTACT_EMAIL}`} className="underline text-brand-primary">
              {SAFEGUARDING_CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            In an emergency, contact the South African Police Service (10111) or Childline South
            Africa (0800 055 555) first.
          </p>
        </Section>

        <Section n={10} title="Confidentiality">
          <p>
            All reports are treated with appropriate confidentiality. Information is shared only
            with those who need it to protect the person at risk, and in accordance with POPIA and
            mandatory reporting duties under South African law.
          </p>
        </Section>

        <Section n={11} title="Digital safety">
          <ul className="list-disc pl-5 space-y-1">
            <li>Personal data is processed in line with POPIA and Hineni's Privacy Notice.</li>
            <li>Photos or videos of young people are only used with explicit, informed consent.</li>
            <li>Users should not share personal contact details with strangers via the platform.</li>
            <li>Suspicious accounts or messages must be reported to Hineni.</li>
          </ul>
        </Section>

        <Section n={12} title="Breaches and enforcement">
          <p>
            Breaches of this policy may result in suspension, removal from the platform, referral
            to the relevant authorities and, where appropriate, criminal prosecution. Hineni
            cooperates fully with law-enforcement and statutory child-protection agencies.
          </p>
        </Section>

        <Section n={13} title="Disclaimer">
          <p>
            Hineni undertakes reasonable verification, vetting and safeguarding measures. However,
            Hineni cannot guarantee the conduct of third parties and accepts no liability for
            injury, loss, damage, misconduct, criminal activity or disputes arising from
            interactions between participants, mentors, employers, apprenticeship providers or
            other users of the platform. Participation is undertaken at the individual's own risk
            and subject to applicable South African law.
          </p>
        </Section>

        <p className="text-xs text-brand-dark/50 mt-12">
          Version {SAFEGUARDING_POLICY_VERSION} · Last updated {SAFEGUARDING_LAST_UPDATED}
        </p>
      </article>
    </SiteLayout>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-heading font-semibold mb-3 text-brand-dark">
        {n}. {title}
      </h2>
      <div className="text-brand-dark/80 leading-relaxed space-y-3 text-[15px]">{children}</div>
    </section>
  );
}
