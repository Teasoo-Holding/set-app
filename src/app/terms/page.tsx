import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The rules for using Teasoo SET.",
  alternates: { canonical: "/terms" },
};

const lead = (
  <>
    <p>
      These terms explain the rules for using {COMPANY.product}. By using it, you agree to them. If you don&apos;t
      agree, please don&apos;t use the service.
    </p>
    <p>
      {COMPANY.product} is provided by {COMPANY.name} (&quot;we&quot;, &quot;us&quot;). You can reach us at{" "}
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
    </p>
  </>
);

const sections: LegalSection[] = [
  {
    id: "who-can-use",
    title: "Who can use Teasoo SET",
    body: (
      <>
        <p>Access is by invitation from an administrator. When you have an account:</p>
        <ul>
          <li>keep your password secret and don&apos;t let anyone else use your account;</li>
          <li>you&apos;re responsible for what happens under your account;</li>
          <li>tell us straight away if you think someone else has your login.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Using the service properly",
    body: (
      <>
        <p>Use {COMPANY.product} only to manage stakeholder relationships for your organisation. You must not:</p>
        <ul>
          <li>try to access another organisation&apos;s data, or get around our security;</li>
          <li>upload anything unlawful, harmful, or that you don&apos;t have the right to store;</li>
          <li>disrupt the service or put it under unreasonable load;</li>
          <li>copy, resell, or rent the service without our written permission.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-data",
    title: "Your organisation's data",
    body: (
      <>
        <p>
          Your organisation owns the information it puts into {COMPANY.product}. We only process it to provide the
          service, in line with our <a href="/privacy">Privacy notice</a> and our agreement with your organisation.
        </p>
        <p>
          You&apos;re responsible for making sure you&apos;re allowed to store the stakeholder information you enter.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Availability",
    body: (
      <p>
        We work hard to keep the service running, but we can&apos;t promise it will always be available. We may need to
        carry out maintenance, and we may change or improve features over time.
      </p>
    ),
  },
  {
    id: "suspension",
    title: "Suspending or ending access",
    body: (
      <p>
        We may suspend or end access if these terms are broken, or if we need to protect the service or other users.
        Your organisation can ask us to close its account at any time.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: (
      <p>
        We provide the service with reasonable care and skill. We&apos;re not responsible for losses we couldn&apos;t
        reasonably expect, or for things outside our reasonable control. Nothing in these terms limits any
        responsibility that can&apos;t be limited by law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time. If we make an important change, we&apos;ll let you know. If you
        keep using the service after that, you accept the new terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Which law applies",
    body: <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>,
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        {COMPANY.name}
        <br />
        {COMPANY.address}
        <br />
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    ),
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms of service" lead={lead} sections={sections} />;
}
