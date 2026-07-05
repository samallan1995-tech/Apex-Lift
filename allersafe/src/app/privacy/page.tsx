import { LegalLayout, H2, P, UL } from '@/components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy — AllerSafe',
  description: 'How AllerSafe collects, uses, and protects your personal data under UK GDPR.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="29 June 2026">
      <P>
        This policy explains how AllerSafe (&quot;we&quot;, &quot;us&quot;) collects, uses, and protects personal
        data when you use our website and service at allersafe.org. We are the data controller for the
        personal data described below. If you have any questions, contact us at{' '}
        <a href="mailto:support@allersafe.org" className="text-[#3B6D11] underline">support@allersafe.org</a>.
      </P>

      <H2>1. What we collect</H2>
      <UL>
        <li><strong>Account data:</strong> your email address, used to sign you in with one-time codes.</li>
        <li><strong>Business data you enter:</strong> venue names and addresses, ingredients, dishes, and allergen information. This is mainly business information, but a venue address may identify a sole trader.</li>
        <li><strong>Billing data:</strong> if you subscribe, your payment is processed by Stripe. We do not see or store your card details — we only store a Stripe customer reference and your subscription status.</li>
        <li><strong>Technical data:</strong> a strictly-necessary session cookie to keep you logged in, plus standard server logs (e.g. IP address, request times) used for security and reliability.</li>
      </UL>

      <H2>2. How we use it</H2>
      <UL>
        <li>To provide and operate the service (authentication, storing your menus, generating labels, matrices and QR menus).</li>
        <li>To take payment and manage your subscription.</li>
        <li>To send you essential service emails (login codes, billing notices) and to respond to support requests.</li>
        <li>To keep the service secure, prevent abuse, and meet our legal obligations.</li>
      </UL>

      <H2>3. Our legal bases (UK GDPR)</H2>
      <UL>
        <li><strong>Contract:</strong> to provide the service you have signed up for.</li>
        <li><strong>Legitimate interests:</strong> to secure, maintain and improve the service.</li>
        <li><strong>Legal obligation:</strong> where we must keep records (e.g. for tax).</li>
      </UL>

      <H2>4. Who we share it with (sub-processors)</H2>
      <P>We use trusted providers to run AllerSafe. They process data only on our instructions:</P>
      <UL>
        <li><strong>Supabase</strong> — database and storage.</li>
        <li><strong>Vercel</strong> — application hosting.</li>
        <li><strong>Stripe</strong> — payment processing.</li>
        <li><strong>Resend</strong> — sending transactional emails.</li>
      </UL>
      <P>
        Some of these providers may process data outside the UK/EEA. Where they do, appropriate safeguards
        (such as UK/EU standard contractual clauses) are in place. We do not sell your personal data.
      </P>

      <H2>5. How long we keep it</H2>
      <P>
        We keep your account and business data for as long as your account is active. If you close your
        account, we delete or anonymise your personal data within a reasonable period, except where we must
        keep certain records (for example, billing records for tax purposes). Login codes expire after 15
        minutes.
      </P>

      <H2>6. Your rights</H2>
      <P>Under UK GDPR you have the right to access, correct, delete, restrict, or object to our use of your
        personal data, and the right to data portability. To exercise any of these, email{' '}
        <a href="mailto:support@allersafe.org" className="text-[#3B6D11] underline">support@allersafe.org</a>.
        You also have the right to complain to the Information Commissioner&apos;s Office (ico.org.uk).</P>

      <H2>7. Cookies</H2>
      <P>
        We only use a single strictly-necessary cookie to keep you signed in. We do not use advertising or
        tracking cookies, so no cookie banner is required. If this changes, we will update this policy and
        ask for your consent where needed.
      </P>

      <H2>8. Security</H2>
      <P>
        We protect your data with encryption in transit, access controls, and reputable infrastructure
        providers. No system is perfectly secure, but we take reasonable steps to safeguard your information
        and will notify you and the ICO of any breach where legally required.
      </P>

      <H2>9. Changes to this policy</H2>
      <P>
        We may update this policy from time to time. We will post the new version here and update the date
        above. Continued use of the service after a change means you accept the updated policy.
      </P>

      <H2>10. Contact</H2>
      <P>
        AllerSafe — <a href="mailto:support@allersafe.org" className="text-[#3B6D11] underline">support@allersafe.org</a>
      </P>
    </LegalLayout>
  );
}
