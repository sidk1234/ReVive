import Layout from "../Layout";
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';
import { base44 } from '@/api/base44Client';

/**
 * Login page.
 *
 * When Supabase is configured this page allows a visitor to authenticate via
 * Google single sign‑on. Pressing the button triggers the Supabase OAuth
 * flow through the base44 API client. During development without
 * Supabase, clicking the button will simply redirect to the demo home
 * page. Users who wish to sign up using the official Base44 platform can
 * also follow the link back to the original site.
 */
export default function LoginPage() {
  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold mb-6 text-white">Sign in to ReVive</h1>
        <p className="text-white/70 max-w-lg mb-8">
          Use your Google account to sign in and start tracking your impact. If
          you don’t yet have a ReVive account, you’ll be prompted to create
          one after signing in.
        </p>
        <LiquidGlassButton size="lg" onClick={() => base44.auth.redirectToLogin()}>
          Continue with Google
        </LiquidGlassButton>
        <p className="text-white/50 mt-6 text-sm">
          Looking for the legacy site?&nbsp;
          <a
            href="https://reviveearth.base44.app"
            className="text-emerald-400 underline"
          >
            Visit the original ReVive
          </a>
        </p>
      </div>
    </Layout>
  );
}