import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Repolyze — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: February 26, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">1. Introduction</h2>
            <p>
              Repolyze (&quot;the Service&quot;), operated by Ossium Inc., is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">2. Information We Collect</h2>

            <h3 className="text-base font-medium text-foreground">2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">Account Information:</strong> When you sign in via GitHub or Google, we receive your name, email address, and profile picture from those providers.</li>
              <li><strong className="text-foreground">Repository URLs:</strong> The public GitHub repository URLs you submit for analysis.</li>
            </ul>

            <h3 className="text-base font-medium text-foreground">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">IP Address:</strong> We collect your IP address for rate limiting and abuse prevention purposes.</li>
              <li><strong className="text-foreground">Usage Data:</strong> We record analysis requests (repository URLs, timestamps) to enforce rate limits for anonymous users.</li>
              <li><strong className="text-foreground">Analytics:</strong> We may use third-party analytics services to understand how the Service is used.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide, maintain, and improve the Service.</li>
              <li>Authenticate your identity and manage your account.</li>
              <li>Enforce rate limits and prevent abuse.</li>
              <li>Analyze public repository code to generate AI-powered insights.</li>
              <li>Communicate with you about service updates (if applicable).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">4. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">Analysis Requests:</strong> Anonymous rate-limiting records (IP address, repository URL) are automatically deleted after 2 days.</li>
              <li><strong className="text-foreground">Account Data:</strong> Your account information is retained as long as your account is active. You may request deletion by contacting us.</li>
              <li><strong className="text-foreground">Repository Code:</strong> We do not store repository source code. Code is fetched in real-time from GitHub, processed for analysis, and discarded.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">5. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">AI Providers:</strong> Repository metadata and code snippets are sent to AI model providers (via OpenRouter) to generate analysis results. These providers process data according to their own privacy policies.</li>
              <li><strong className="text-foreground">Authentication Providers:</strong> GitHub and Google provide authentication data in accordance with their own terms.</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">6. Cookies &amp; Local Storage</h2>
            <p>
              We use cookies for session management and authentication. We may also use local storage to persist user preferences such as theme settings. We do not use cookies for advertising or cross-site tracking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">7. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Request data portability.</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">9. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites (e.g., GitHub repositories). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">10. Children&apos;s Privacy</h2>
            <p>
              The Service is not directed at children under the age of 13. We do not knowingly collect personal information from children. If we discover that a child under 13 has provided us with personal data, we will delete it promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">12. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please reach out to us at{" "}
              <a href="https://x.com/ossium_inc" target="_blank" rel="noopener noreferrer" className="text-foreground underline hover:no-underline">
                @ossium_inc on X
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
