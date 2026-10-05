import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and conditions for using the Save the Orphans Africa website.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated="October 2026">
      <p className="lead text-dark/70">
        Welcome to the Save the Orphans Africa website. By accessing or using
        this website, you agree to be bound by these Terms of Use.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By visiting our website, submitting forms, or making donations, you
        agree to these Terms. If you do not agree, please do not use our site.
      </p>

      <h2>2. Use of the Website</h2>
      <p>You agree to use this website only for lawful purposes. You must not:</p>
      <ul>
        <li>Attempt to gain unauthorized access to any part of the site</li>
        <li>Submit false or misleading information</li>
        <li>Interfere with the security or functionality of the site</li>
        <li>Use automated systems to abuse our forms or services</li>
        <li>Impersonate any person or organization</li>
      </ul>

      <h2>3. Donations</h2>
      <p>
        All donations are voluntary. By donating, you confirm that the funds
        are lawfully yours and are not derived from illegal activities. We
        reserve the right to refund donations if we detect fraud. See our{" "}
        <a href="/donation-policy">Donation & Refund Policy</a> for details.
      </p>

      <h2>4. Intellectual Property</h2>
      <p>
        All content on this website — including text, images, logos, and code
        — is the property of Save the Orphans Africa or its licensors and is
        protected by copyright laws. You may not copy, reproduce, or
        redistribute any content without written permission.
      </p>

      <h2>5. Third-Party Links</h2>
      <p>
        Our site may contain links to third-party websites (payment
        processors, partner organizations). We are not responsible for the
        content or privacy practices of those sites.
      </p>

      <h2>6. Disclaimer</h2>
      <p>
        Our website is provided "as is" without warranties of any kind. We do
        not guarantee uninterrupted access or that the site will be free of
        errors or viruses.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Save the Orphans Africa is not
        liable for any indirect, incidental, or consequential damages arising
        from your use of this website.
      </p>

      <h2>8. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless Save the Orphans Africa from
        any claims arising from your violation of these Terms.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Uganda. Any disputes will be
        resolved in the courts of Uganda.
      </p>

      <h2>10. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the
        website after changes constitutes acceptance of the new Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Contact{" "}
        <a href="mailto:info@savetheorphansafrica.org">
          info@savetheorphansafrica.org
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}