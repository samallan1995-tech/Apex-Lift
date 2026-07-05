import { LegalLayout, H2, P, UL } from '@/components/LegalLayout';

export const metadata = {
  title: 'Terms of Service — AllerSafe',
  description: 'The terms governing your use of AllerSafe, including allergen responsibility and liability.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="29 June 2026">
      <P>
        These terms govern your use of AllerSafe (&quot;the service&quot;, &quot;we&quot;, &quot;us&quot;), provided at
        allersafe.org. By creating an account or using the service, you agree to these terms. If you do not
        agree, do not use the service.
      </P>

      <H2>1. The service</H2>
      <P>
        AllerSafe is a software tool that helps food businesses organise ingredient and dish information and
        produce allergen documents — including Natasha&apos;s Law (PPDS) labels, an allergen matrix, and a public
        QR allergen menu — from the data you enter.
      </P>

      <H2>2. Your responsibility for allergen accuracy — please read</H2>
      <P>
        AllerSafe is a management and formatting tool only. <strong>It does not verify, and cannot verify,
        whether the allergen information you enter is correct.</strong> The documents it produces are based
        entirely on the data you provide.
      </P>
      <P>You remain solely and legally responsible for:</P>
      <UL>
        <li>checking every allergen declaration against current supplier specifications and recipes;</li>
        <li>assessing and managing cross-contamination risks in your premises;</li>
        <li>ensuring all labels, menus and notices are accurate before food is served or sold; and</li>
        <li>complying with all applicable food law, including the Food Information Regulations 2014 and
          Natasha&apos;s Law (PPDS requirements).</li>
      </UL>
      <P>
        You are the legal duty-holder for allergen information under UK food law. Never rely on AllerSafe
        alone — always review outputs against your supplier data.
      </P>

      <H2>3. No warranty</H2>
      <P>
        The service is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any kind, whether
        express or implied, including any warranty that allergen outputs are accurate, complete, current, or
        fit for a particular purpose. We do not warrant that the service will be uninterrupted or error-free.
      </P>

      <H2>4. Limitation of liability</H2>
      <P>
        To the maximum extent permitted by law, we are not liable for any indirect, special, or consequential
        loss, nor for any loss arising from inaccurate allergen information, food-safety incidents, allergic
        reactions, regulatory action, lost profits, or loss of goodwill, however caused. Our total liability
        to you for any claim relating to the service is limited to the amount you paid us in the 12 months
        before the claim arose. Nothing in these terms limits liability that cannot be limited by law (such as
        liability for death or personal injury caused by our negligence, or for fraud).
      </P>

      <H2>5. Free trial, subscriptions and billing</H2>
      <UL>
        <li>New accounts receive a 14-day free trial. No payment is taken during the trial, and you can cancel
          at any time.</li>
        <li>If you choose a paid plan, fees are billed monthly in advance through Stripe and renew
          automatically until cancelled.</li>
        <li>You can cancel anytime from your billing settings; cancellation stops future renewals. Fees already
          paid are non-refundable except where required by law.</li>
        <li>We may change prices on reasonable notice; changes apply from your next billing cycle.</li>
      </UL>

      <H2>6. Acceptable use</H2>
      <P>
        You agree not to misuse the service, attempt to access it unlawfully, disrupt it, or use it to store
        unlawful content. You are responsible for keeping access to your account secure.
      </P>

      <H2>7. Your data</H2>
      <P>
        Our use of personal data is described in our{' '}
        <a href="/privacy" className="text-[#3B6D11] underline">Privacy Policy</a>. You retain ownership of the
        business data you enter, and you grant us the licence needed to operate the service for you.
      </P>

      <H2>8. Suspension and termination</H2>
      <P>
        You may stop using the service at any time. We may suspend or terminate access if you breach these
        terms or to protect the service or other users. On termination, your right to use the service ends.
      </P>

      <H2>9. Changes to these terms</H2>
      <P>
        We may update these terms from time to time. We will post the updated version here and update the
        date above. Continued use after a change means you accept the new terms.
      </P>

      <H2>10. Governing law</H2>
      <P>
        These terms are governed by the laws of England and Wales, and the courts of England and Wales have
        exclusive jurisdiction.
      </P>

      <H2>11. Contact</H2>
      <P>
        AllerSafe — <a href="mailto:support@allersafe.org" className="text-[#3B6D11] underline">support@allersafe.org</a>
      </P>
    </LegalLayout>
  );
}
