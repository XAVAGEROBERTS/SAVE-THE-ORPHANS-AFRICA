import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Save the Orphans Africa collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="October 2026">
      <p className="lead text-dark/70">
        Save the Orphans Africa ("we", "our", "us") is committed to protecting
        your privacy. This policy explains how we collect, use, and safeguard
        your personal information when you visit our website or make a
        donation.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, including:</p>
      <ul>
        <li>
          <strong>Contact information:</strong> name, email address, phone
          number, country
        </li>
        <li>
          <strong>Donation information:</strong> amount, payment method,
          transaction reference
        </li>
        <li>
          <strong>Volunteer information:</strong> skills, availability,
          experience, motivation
        </li>
        <li>
          <strong>Communications:</strong> messages you send via our contact
          form or email
        </li>
        <li>
          <strong>Newsletter subscriptions:</strong> email address and
          optionally your name
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process donations and issue receipts</li>
        <li>Respond to inquiries and volunteer applications</li>
        <li>Send newsletters and updates (only if you subscribed)</li>
        <li>Improve our programs and website experience</li>
        <li>Comply with legal and financial obligations</li>
      </ul>

      <h2>3. Legal Basis for Processing</h2>
      <p>
        We process your personal information based on your consent (newsletter
        subscriptions), legitimate interest (responding to inquiries), or
        legal obligation (donation records).
      </p>

      <h2>4. Sharing Your Information</h2>
      <p>
        We do <strong>not</strong> sell or rent your personal information. We
        may share it with:
      </p>
      <ul>
        <li>
          <strong>Payment processors</strong> (Nylon Pay) to process donations
        </li>
        <li>
          <strong>Email service providers</strong> (Resend) to send
          newsletters
        </li>
        <li>
          <strong>Cloud service providers</strong> (Supabase, Vercel) for
          hosting
        </li>
        <li>
          <strong>Legal authorities</strong> when required by law
        </li>
      </ul>

      <h2>5. Data Security</h2>
      <p>
        We protect your data with HTTPS encryption, secure authentication,
        role-based access controls, and regular security reviews. Payment
        information is processed by PCI-compliant third parties and is never
        stored on our servers.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain donation records for at least 7 years for tax and legal
        compliance. Contact messages and volunteer applications are retained
        for up to 2 years. Newsletter subscriptions are retained until you
        unsubscribe.
      </p>

      <h2>7. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your information</li>
        <li>Withdraw consent for newsletters at any time</li>
        <li>Lodge a complaint with a data protection authority</li>
      </ul>

      <h2>8. Cookies</h2>
      <p>
        We use essential cookies to keep you logged in as an administrator.
        We do not use advertising or tracking cookies. If we add analytics in
        the future, we will use privacy-first analytics that do not require
        cookie consent.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        We are committed to protecting the privacy of the children in our
        care. We do not publish identifying information about the children
        we serve without explicit consent. Any photos or stories shared have
        been approved by our child safeguarding team.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this policy occasionally. Changes will be posted on this
        page with a new "last updated" date.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        For questions about this Privacy Policy or to exercise your data
        rights, contact us:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:privacy@savetheorphansafrica.org">
            privacy@savetheorphansafrica.org
          </a>
        </li>
        <li>
          <strong>Address:</strong> 123 Hope Street, Kampala, Uganda
        </li>
      </ul>
    </LegalPageLayout>
  );
}