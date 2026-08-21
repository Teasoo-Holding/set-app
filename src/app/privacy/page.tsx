import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How Teasoo SET handles personal data, and your rights.",
  alternates: { canonical: "/privacy" },
};

const lead = (
  <p>
    This notice explains how {COMPANY.name} handles personal data in {COMPANY.product}, and the rights you have. We
    follow the EU General Data Protection Regulation (GDPR) and the Nigeria Data Protection Act 2023 (NDPA).
  </p>
);

const sections: LegalSection[] = [
  {
    id: "responsible",
    title: "Who is responsible for your data",
    body: (
      <>
        <p>There are two situations:</p>
        <ul>
          <li>
            <strong>When your organisation uses {COMPANY.product}.</strong> Your organisation decides how its people and
            stakeholder data are used, so your organisation is the <strong>data controller</strong> and we are the{" "}
            <strong>data processor</strong> acting on its instructions. If you want to know how your organisation uses
            your data, please ask them.
          </li>
          <li>
            <strong>For our own account and enquiry data</strong> (for example when you contact us, or as the holder of
            an account), {COMPANY.name} is the data controller.
          </li>
        </ul>
        <p>
          Our Data Protection Officer is {COMPANY.dpoName}. You can contact them at{" "}
          <a href={`mailto:${COMPANY.dpoEmail}`}>{COMPANY.dpoEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: "what-data",
    title: "What data we handle",
    body: (
      <ul>
        <li><strong>Account data</strong>: your name, email address, role, and the organisation you belong to.</li>
        <li>
          <strong>Stakeholder data your organisation enters</strong>: such as names, organisations, notes, engagement
          history, commitments, risk and sentiment.
        </li>
        <li>
          <strong>Technical data</strong>: sign-in records and basic logs we need to run and secure the service.
        </li>
      </ul>
    ),
  },
  {
    id: "why",
    title: "Why we handle it, and our legal basis",
    body: (
      <>
        <ul>
          <li>To provide the service under our contract with your organisation. Lawful basis: GDPR Article 6(1)(b); NDPA, performance of a contract.</li>
          <li>To keep the service secure and working properly. Lawful basis: our legitimate interests; NDPA, legitimate interest.</li>
          <li>To meet legal obligations, where they apply.</li>
        </ul>
        <p>We do not sell your data, and we do not use it for advertising.</p>
      </>
    ),
  },
  {
    id: "share",
    title: "Who we share it with",
    body: (
      <>
        <p>We use a small number of trusted providers to run the service. They only process data to provide their service to us, under contract:</p>
        <ul>
          <li><strong>Supabase</strong>: database and sign-in hosting.</li>
          <li><strong>Vercel</strong>: application hosting.</li>
          <li><strong>Brevo</strong>: sending emails such as invitations and reminders.</li>
          <li><strong>PostHog</strong>: privacy-focused product analytics. It shows how the app is used, so we can improve it. It never records your screen, and links containing tokens are not sent.</li>
          <li><strong>Sentry</strong>: error monitoring, so we can find and fix faults. It receives error details and technical diagnostics. It does not receive your name, email, cookies, or the contents of stakeholder records.</li>
        </ul>
        <p>We don&apos;t share your data with anyone else unless the law requires it.</p>
      </>
    ),
  },
  {
    id: "where",
    title: "Where your data is processed",
    body: (
      <p>
        Our providers may process data on servers outside Nigeria and the European Economic Area. Where data is
        transferred internationally, we rely on appropriate safeguards, such as standard contractual clauses, to keep
        it protected.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep personal data for as long as your organisation uses the service, and for a reasonable period afterwards.
        We keep it longer only where the law requires. When it&apos;s no longer needed, we delete or anonymise it.
      </p>
    ),
  },
  {
    id: "safe",
    title: "Keeping your data safe",
    body: (
      <p>
        Each organisation&apos;s data is isolated at the database level, so one organisation can never see
        another&apos;s. Access is controlled by role, data is protected in transit, and we test these controls
        continuously.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the GDPR and the NDPA you can ask to:</p>
        <ul>
          <li>see the personal data we hold about you (access);</li>
          <li>correct it if it&apos;s wrong (rectification);</li>
          <li>delete it (erasure);</li>
          <li>limit or object to how it&apos;s used;</li>
          <li>get a copy in a portable format;</li>
          <li>withdraw your consent, where we relied on it.</li>
        </ul>
        <p>
          If your organisation is the data controller, please ask them first and we&apos;ll help them respond. For data we
          control, contact our Data Protection Officer at <a href={`mailto:${COMPANY.dpoEmail}`}>{COMPANY.dpoEmail}</a>.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and analytics",
    body: (
      <>
        <p>
          We use essential cookies to sign you in and keep the service secure. These are always on because the service
          can&apos;t work without them.
        </p>
        <p>
          We also use privacy-focused analytics (PostHog) to understand how the app is used so we can improve it. This
          runs <strong>only if you accept</strong> when we ask. You can decline, and nothing is collected. Our analytics
          never records your screen, strips any tokens or links before sending, and identifies you only by a random
          identifier, never by your name or email. We don&apos;t use advertising cookies, and we don&apos;t sell your data.
        </p>
      </>
    ),
  },
  {
    id: "complaints",
    title: "Complaints",
    body: (
      <>
        <p>If you&apos;re unhappy with how we handle your data, please tell us first so we can put it right. You can also complain to a data protection authority:</p>
        <ul>
          <li>in Nigeria, the Nigeria Data Protection Commission (NDPC);</li>
          <li>in the EU or UK, your local data protection supervisory authority.</li>
        </ul>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this notice",
    body: <p>We may update this notice. The date at the top shows when we last reviewed it.</p>,
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        {COMPANY.dpoName} (Data Protection Officer)
        <br />
        {COMPANY.name}
        <br />
        {COMPANY.address}
        <br />
        <a href={`mailto:${COMPANY.dpoEmail}`}>{COMPANY.dpoEmail}</a>
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy notice" lead={lead} sections={sections} />;
}
