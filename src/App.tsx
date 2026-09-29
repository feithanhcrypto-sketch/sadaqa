import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { AboutModal } from '@/components/AboutModal';
import { DonationForm } from '@/components/DonationForm';
import { ProgressBar } from '@/components/ProgressBar';
import { ConfirmationPage } from '@/components/ConfirmationPage';

const GOAL_CENTS = 50000;
const RAISED_CENTS = 18700;
const DONOR_COUNT = 47;

type View = 'landing' | 'confirmation';

function App() {
  const [view, setView] = useState<View>('landing');
  const [donationId, setDonationId] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Handle Norpo redirect: ?status=success&donation=xxx or ?status=cancelled&donation=xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const donation = params.get('donation');

    if (donation && (status === 'success' || status === 'cancelled' || status === 'pending')) {
      setDonationId(donation);
      setView('confirmation');

      // Clean URL
      const url = window.location.pathname;
      window.history.replaceState({}, document.title, url);
    }
  }, []);

  const handleDonationCreated = useCallback((id: string) => {
    setDonationId(id);
  }, []);

  const handleBackHome = useCallback(() => {
    setView('landing');
    setDonationId(null);
  }, []);

  if (view === 'confirmation' && donationId) {
    return <ConfirmationPage donationId={donationId} onBackHome={handleBackHome} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <Header onAboutClick={() => setAboutOpen(true)} />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-24 pb-12 sm:px-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Main card */}
          <div className="rounded-3xl bg-white p-7 shadow-2xl shadow-brand-900/20 sm:p-9">
            {/* Progress section */}
            <div className="mb-7">
              <ProgressBar
                raised={RAISED_CENTS}
                goal={GOAL_CENTS}
                donorCount={DONOR_COUNT}
              />
            </div>

            {/* Title and description */}
            <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-gray-900 sm:text-3xl">
              Votre soutien peut faire la différence.
            </h1>
            <p className="mb-7 leading-relaxed text-gray-500">
              Chaque don soutient directement des projets solidaires. Ensemble, bâtissons un
              avenir plus juste et plus humain.
            </p>

            {/* Donation form */}
            <DonationForm onDonationCreated={handleDonationCreated} />
          </div>

          {/* Trust indicators below card */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/60">
            <span>Paiement sécurisé</span>
            <span className="text-white/30">•</span>
            <span>Reçu fiscal disponible</span>
            <span className="text-white/30">•</span>
            <span>Don transparent</span>
          </div>
        </div>
      </main>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export default App;
