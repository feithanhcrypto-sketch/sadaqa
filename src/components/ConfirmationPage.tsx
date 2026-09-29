import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Heart, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatEuroDecimal, formatDate } from '@/lib/format';

interface ConfirmationPageProps {
  donationId: string;
  onBackHome: () => void;
}

type DonationStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'loading' | 'not_found';

export function ConfirmationPage({ donationId, onBackHome }: ConfirmationPageProps) {
  const [status, setStatus] = useState<DonationStatus>('loading');
  const [amount, setAmount] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchDonation() {
      const { data, error } = await supabase
        .from('donations')
        .select('status, amount_cents, created_at')
        .eq('id', donationId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setStatus('not_found');
        return;
      }

      setAmount(data.amount_cents);
      setCreatedAt(data.created_at);

      if (data.status === 'paid') {
        setStatus('paid');
      } else if (data.status === 'failed') {
        setStatus('failed');
      } else if (data.status === 'expired') {
        setStatus('expired');
      } else {
        setStatus('pending');
      }
    }

    fetchDonation();
    const interval = setInterval(() => {
      setPollCount((c) => {
        if (c >= 20) {
          clearInterval(interval);
          return c;
        }
        fetchDonation();
        return c + 1;
      });
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [donationId]);

  if (status === 'loading' || status === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-6">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            Paiement en cours de confirmation
          </h1>
          <p className="mb-8 leading-relaxed text-gray-500">
            Nous vérifions votre paiement. Cette page se mettra à jour automatiquement.
            Merci de patienter quelques instants.
          </p>
          {amount !== null && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm text-gray-400">Montant du don</p>
              <p className="mt-1 text-3xl font-bold text-brand-600">
                {formatEuroDecimal(amount)}
              </p>
              {createdAt && (
                <p className="mt-2 text-xs text-gray-400">{formatDate(createdAt)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-6">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Don introuvable</h1>
          <p className="mb-8 text-gray-500">
            Nous n'avons pas pu trouver les informations de ce don.
          </p>
          <button
            onClick={onBackHome}
            className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (status === 'failed' || status === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-6">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <Heart className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Le paiement n'a pas abouti</h1>
          <p className="mb-8 leading-relaxed text-gray-500">
            {status === 'expired'
              ? 'Le délai de paiement a expiré. Vous pouvez réessayer quand vous le souhaitez.'
              : "Le paiement a échoué. Aucun montant n'a été débité. Vous pouvez réessayer."}
          </p>
          {amount !== null && (
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm text-gray-400">Montant du don</p>
              <p className="mt-1 text-3xl font-bold text-gray-700">
                {formatEuroDecimal(amount)}
              </p>
            </div>
          )}
          <button
            onClick={onBackHome}
            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // status === 'paid'
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-6">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 animate-count-up">
          <CheckCircle2 className="h-10 w-10 text-brand-600" strokeWidth={2} />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
          Merci pour votre don !
        </h1>
        <p className="mb-8 leading-relaxed text-gray-500">
          Votre paiement a bien été reçu. Grâce à votre générosité, nous pouvons continuer
          à soutenir des projets solidaires. Un reçu vous sera envoyé par email.
        </p>

        {amount !== null && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-400">Votre contribution</p>
            <p className="mt-1 text-4xl font-bold text-brand-600 animate-count-up">
              {formatEuroDecimal(amount)}
            </p>
            {createdAt && (
              <p className="mt-2 text-xs text-gray-400">{formatDate(createdAt)}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onBackHome}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
