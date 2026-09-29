import { useState, useRef, useEffect } from 'react';
import { Heart, Shield, Loader2, Check } from 'lucide-react';
import { createCheckoutSession } from '@/lib/checkout';

const PRESET_AMOUNTS = [10, 25, 50, 100];

interface DonationFormProps {
  onDonationCreated: (donationId: string) => void;
}

export function DonationForm({ onDonationCreated }: DonationFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const amountCents = (() => {
    if (customAmount.trim() !== '') {
      const val = parseFloat(customAmount.replace(',', '.'));
      return isNaN(val) ? 0 : Math.round(val * 100);
    }
    if (selectedPreset !== null) return selectedPreset * 100;
    return 0;
  })();

  const isValid = amountCents >= 100;

  function handlePresetClick(value: number) {
    setSelectedPreset(value);
    setCustomAmount('');
  }

  function handleCustomFocus() {
    setSelectedPreset(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession({
        amount_cents: amountCents,
      });

      setSuccess(true);
      onDonationCreated(result.donation_id);

      setTimeout(() => {
        window.location.href = result.checkout_url;
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Amount presets */}
      <div className="mb-3">
        <label className="mb-2 block text-sm font-medium text-gray-600">
          Choisissez un montant
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handlePresetClick(amount)}
              disabled={isLoading || success}
              className={`rounded-xl py-3 text-sm font-semibold transition-all ${
                selectedPreset === amount
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              {amount}€
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount input */}
      <div className="mb-5">
        <div
          className={`flex items-center rounded-xl border-2 bg-white transition-all ${
            customAmount !== '' || selectedPreset === null
              ? 'border-brand-500 ring-2 ring-brand-100'
              : 'border-gray-200'
          } ${isLoading || success ? 'opacity-50' : ''}`}
        >
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            placeholder="Autre montant"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onFocus={handleCustomFocus}
            disabled={isLoading || success}
            className="w-full bg-transparent px-4 py-3.5 text-lg font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:text-base placeholder:font-normal"
          />
          <span className="px-4 text-lg font-semibold text-gray-400">€</span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!isValid || isLoading || success}
        className={`group relative w-full overflow-hidden rounded-xl py-4 text-base font-bold text-white transition-all ${
          isValid && !isLoading && !success
            ? 'bg-brand-600 shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 active:scale-[0.98]'
            : 'cursor-not-allowed bg-gray-300'
        }`}
      >
        {success ? (
          <span className="flex items-center justify-center gap-2">
            <Check className="h-5 w-5" />
            Redirection en cours...
          </span>
        ) : isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Préparation du paiement...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 transition-transform group-hover:scale-110" fill="white" />
            Faire un don
          </span>
        )}
      </button>

      {/* Reassurance */}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
        <Shield className="h-3.5 w-3.5 text-brand-500" />
        Paiement 100% sécurisé via Norpo
      </p>
    </form>
  );
}
