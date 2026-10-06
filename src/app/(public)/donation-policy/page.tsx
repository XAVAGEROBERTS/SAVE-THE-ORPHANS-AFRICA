import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Donation & Refund Policy",
  description:
    "Understanding how donations are processed, used, and refunded.",
};

export default function DonationPolicyPage() {
  return (
    <LegalPageLayout title="Donation & Refund Policy" lastUpdated="October 2026">
      <p className="lead text-dark/70">
        Thank you for supporting Save the Orphans Africa. This policy explains
        how your donation is processed, used, and what happens if you need a
        refund.
      </p>

      <h2>1. Accepted Donations</h2>
      <p>We accept:</p>
      <ul>
        <li>One-time donations</li>
        <li>Monthly recurring donations</li>
        <li>Program-specific donations (Education, Healthcare, etc.)</li>
        <li>General fund donations (used where most needed)</li>
      </ul>

      <h2>2. Payment Methods</h2>
      <p>We accept the following payment methods via Nylon Pay:</p>
      <ul>
        <li>Mobile Money (MTN, Airtel)</li>
        <li>Credit and debit cards (Visa, Mastercard)</li>
        <li>Bank transfers</li>
      </ul>
      <p>
        All payment information is processed securely by Nylon Pay. We never see
        or store your card details.
      </p>

      <h2>3. How Donations Are Used</h2>
      <p>
        Donations fund our programs: education, healthcare, nutrition, child
        protection, and skills development. We commit to:
      </p>
      <ul>
        <li>Using at least 85% of all donations for direct program costs</li>
        <li>Publishing an annual financial report</li>
        <li>Honoring program-restricted donations whenever possible</li>
      </ul>

      <h2>4. Donation Receipts</h2>
      <p>
        You'll receive an immediate email confirmation after donating, and an
        official receipt within 24 hours. Keep these for your tax records.
      </p>

      <h2>5. Recurring Donations</h2>
      <p>
        Monthly donations are charged on the same day each month. You can
        pause or cancel anytime by emailing{" "}
        <a href="mailto:donations@savetheorphansafrica.org">
          donations@savetheorphansafrica.org
        </a>
        . Cancellation takes effect at the end of your current month.
      </p>

      <h2>6. Refund Policy</h2>
      <p>Refunds are available in the following situations:</p>
      <ul>
        <li>
          <strong>Duplicate charge:</strong> Full refund within 7 days
        </li>
        <li>
          <strong>Incorrect amount:</strong> Difference refunded within 7 days
        </li>
        <li>
          <strong>Unauthorized transaction:</strong> Full refund once
          verified
        </li>
        <li>
          <strong>Technical error:</strong> Full refund
        </li>
      </ul>
      <p>
        Donations are otherwise non-refundable because funds are immediately
        allocated to programs.
      </p>

      <h2>7. How to Request a Refund</h2>
      <p>
        Email{" "}
        <a href="mailto:donations@savetheorphansafrica.org">
          donations@savetheorphansafrica.org
        </a>{" "}
        within 7 days of your donation with:
      </p>
      <ul>
        <li>Your donation reference number</li>
        <li>Date and amount</li>
        <li>Reason for the refund request</li>
      </ul>
      <p>We process refunds within 5-10 business days.</p>

      <h2>8. Failed Transactions</h2>
      <p>
        If your donation fails, no funds are taken. If funds are deducted but
        you don't receive a confirmation, contact us with your reference
        number and we'll resolve it.
      </p>

      <h2>9. Donation Minimums</h2>
      <p>
        We accept donations of any amount. For mobile money, the minimum may
        apply based on the provider.
      </p>

      <h2>10. Tax Information</h2>
      <p>
        Save the Orphans Africa is a registered nonprofit organization in
        Uganda. Donations may be tax-deductible in your jurisdiction.
        Consult a tax advisor for your specific situation.
      </p>

      <h2>11. Contact</h2>
      <p>
        Donation questions? Email{" "}
        <a href="mailto:donations@savetheorphansafrica.org">
          donations@savetheorphansafrica.org
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}