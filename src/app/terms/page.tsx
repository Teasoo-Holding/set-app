import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Terms of service — Teasoo SET",
  description: "The rules for using Teasoo SET.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <p>
        These terms explain the rules for using {COMPANY.product}. By using it, you agree to them. If you don&apos;t
        agree, please don&apos;t use the service.
      </p>
      <p>
        {COMPANY.product} is provided by {COMPANY.name} (&quot;we&quot;, &quot;us&quot;). You can reach us at{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <h2>Who can use Teasoo SET</h2>
      <p>Access is by invitation from an administrator. When you have an account:</p>
      <ul>
        <li>keep your password secret and don&apos;t let anyone else use your account;</li>
        <li>you&apos;re responsible for what happens under your account;</li>
        <li>tell us straight away if you think someone else has your login.</li>
      </ul>

      <h2>Using the service properly</h2>
      <p>Use {COMPANY.product} only to manage stakeholder relationships for your organisation. You must not:</p>
      <ul>
        <li>try to access another organisation&apos;s data, or get around our security;</li>
        <li>upload anything unlawful, harmful, or that you don&apos;t have the right to store;</li>
        <li>disrupt the service or put it under unreasonable load;</li>
        <li>copy, resell, or rent the service without our written permission.</li>
      </ul>

      <h2>Your organisation&apos;s data</h2>
      <p>
        Your organisation owns the information it puts into {COMPANY.product}. We only process it to provide the
        service, in line with our <a href="/privacy">Privacy notice</a> and our agreement with your organisation.
      </p>
      <p>
        You&apos;re responsible for making sure you&apos;re allowed to store the stakeholder information you enter.
      </p>

      <h2>Availability</h2>
      <p>
        We work hard to keep the service running, but we can&apos;t promise it will always be available. We may need to
        carry out maintenance, and we may change or improve features over time.
      </p>

      <h2>Suspending or ending access</h2>
      <p>
        We may suspend or end access if these terms are broken, or if we need to protect the service or other users.
        Your organisation can ask us to close its account at any time.
      </p>

      <h2>Our responsibility to you</h2>
      <p>
        We provide the service with reasonable care and skill. We&apos;re not responsible for losses we couldn&apos;t
        reasonably expect, or for things outside our reasonable control. Nothing in these terms limits any
        responsibility that can&apos;t be limited by law.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. If we make an important change, we&apos;ll let you know. If you
        keep using the service after that, you accept the new terms.
      </p>

      <h2>Which law applies</h2>
      <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>

      <h2>Contact us</h2>
      <p>
        {COMPANY.name}
        <br />
        {COMPANY.address}
        <br />
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </LegalPage>
  );
}
