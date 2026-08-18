import { COMPANY } from "@/lib/company";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://set-app-olive.vercel.app";

/**
 * schema.org JSON-LD for the landing page: ties the product to Teasoo Consulting
 * and answers the questions search + answer engines ask (what it is, who for,
 * how to get it, compliance). Rendered once in the landing page.
 */
export function LandingJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${COMPANY.website}#org`,
        name: COMPANY.name,
        url: COMPANY.website,
        email: COMPANY.email,
        telephone: COMPANY.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: "43 Oghosa Crescent",
          addressLocality: "Benin City",
          addressRegion: "Edo State",
          addressCountry: "NG",
        },
        sameAs: [COMPANY.website],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}#app`,
        name: "Teasoo SET",
        alternateName: "Stakeholder Engagement Tracker",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        publisher: { "@id": `${COMPANY.website}#org` },
        description:
          "Teasoo SET is a multi-tenant SaaS for logging stakeholder engagements and tracking risk, sentiment and commitments, with strict tenant isolation. GDPR and Nigeria NDPA aligned.",
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          price: "0",
          priceCurrency: "USD",
          description: "Access by invitation; contact Teasoo Consulting for a pilot.",
        },
        featureList: [
          "Central stakeholder directory",
          "Engagement logging",
          "Risk and sentiment tracking",
          "Automatic escalations",
          "Commitment tracking",
          "Leadership portfolio visibility",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Teasoo SET?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Teasoo SET (Stakeholder Engagement Tracker) is a multi-tenant SaaS by Teasoo Consulting that gives organisations one source of truth for stakeholder relationships — logging engagements and tracking risk, sentiment and commitments.",
            },
          },
          {
            "@type": "Question",
            name: "Who is it for?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Multinational and multi-team organisations whose field teams engage regulators, government, community and commercial stakeholders, and whose leadership needs live risk visibility.",
            },
          },
          {
            "@type": "Question",
            name: "How do I get access?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Access is by invitation. Contact Teasoo Consulting at info@teasooconsulting.com to arrange a pilot.",
            },
          },
          {
            "@type": "Question",
            name: "Is it GDPR compliant?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Teasoo SET is built to the EU GDPR and the Nigeria Data Protection Act 2023, with strict database-level tenant isolation and role-based access.",
            },
          },
        ],
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}
