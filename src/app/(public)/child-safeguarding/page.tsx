import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Child Safeguarding Policy",
  description:
    "Our commitment to protecting the children in our care.",
};

export default function ChildSafeguardingPage() {
  return (
    <LegalPageLayout title="Child Safeguarding Policy" lastUpdated="October 2026">
      <p className="lead text-dark/70">
        The safety and wellbeing of every child in our care is our highest
        priority. Save the Orphans Africa is committed to creating a safe,
        protective environment where children can thrive.
      </p>

      <h2>Our Commitment</h2>
      <p>
        Save the Orphans Africa has zero tolerance for any form of child
        abuse, exploitation, or neglect. We are committed to:
      </p>
      <ul>
        <li>Protecting all children in our care from harm</li>
        <li>Responding swiftly and appropriately to any concern raised</li>
        <li>Maintaining transparent, accountable practices</li>
        <li>Complying with Ugandan laws and international child protection standards</li>
      </ul>

      <h2>Code of Conduct</h2>
      <p>All staff, volunteers, and partners must:</p>
      <ul>
        <li>Treat every child with dignity and respect</li>
        <li>Never use inappropriate language or behavior</li>
        <li>Never be alone with a child in a closed or private space</li>
        <li>Never give gifts or money directly to individual children</li>
        <li>Report any concern immediately</li>
        <li>Never engage in physical, emotional, or sexual abuse</li>
      </ul>

      <h2>Staff and Volunteer Screening</h2>
      <p>Before working with children, all staff and volunteers must:</p>
      <ul>
        <li>Provide valid identification and references</li>
        <li>Undergo a criminal background check</li>
        <li>Sign our Child Safeguarding Code of Conduct</li>
        <li>Complete child protection training</li>
      </ul>

      <h2>Reporting Concerns</h2>
      <p>
        Any concern about a child's safety must be reported immediately to our
        Safeguarding Officer:
      </p>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:safeguarding@savetheorphansafrica.org">
            safeguarding@savetheorphansafrica.org
          </a>
        </li>
        <li>
          <strong>Phone:</strong> +256 700 000 000 (24/7 line)
        </li>
      </ul>
      <p>
        Concerns can be reported anonymously. All reports are treated as
        confidential. We do not tolerate retaliation against anyone who
        reports a concern in good faith.
      </p>

      <h2>Media and Photo Policy</h2>
      <p>
        We never publish photos, names, or identifying information about the
        children in our care without:
      </p>
      <ul>
        <li>Written consent from the child's guardian</li>
        <li>Assent from the child (where age-appropriate)</li>
        <li>Approval from our Safeguarding Officer</li>
      </ul>
      <p>
        We use respectful imagery that preserves the dignity of every child.
        We do not publish photos that could:
      </p>
      <ul>
        <li>Reveal sensitive locations</li>
        <li>Enable anyone to locate a specific child</li>
        <li>Pity or exploit the child</li>
      </ul>

      <h2>Digital Safety</h2>
      <p>
        Our website, social media, and email communications follow strict
        safeguarding rules. We do not:
      </p>
      <ul>
        <li>Share children's contact information publicly</li>
        <li>Allow direct communication between donors and children</li>
        <li>Post real-time locations of children</li>
      </ul>

      <h2>Training and Awareness</h2>
      <p>
        All staff receive annual safeguarding training. Volunteers receive
        training before beginning work. We continuously review our practices
        to align with best international standards.
      </p>

      <h2>Our Safeguarding Officers</h2>
      <ul>
        <li>
          <strong>Primary Safeguarding Officer:</strong> [Name redacted for
          public safety]
        </li>
        <li>
          <strong>Deputy Safeguarding Officer:</strong> [Name redacted for
          public safety]
        </li>
      </ul>

      <h2>Review</h2>
      <p>
        This policy is reviewed every 12 months by our Safeguarding Committee
        and updated as needed to reflect best practice and legal requirements.
      </p>

      <h2>Questions?</h2>
      <p>
        For questions or to report a concern, contact{" "}
        <a href="mailto:safeguarding@savetheorphansafrica.org">
          safeguarding@savetheorphansafrica.org
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}