import { X, Heart, Shield, Users, Target } from 'lucide-react';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl animate-fade-in-up sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
              <Heart className="h-5 w-5 text-white" fill="white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">À propos</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <p className="leading-relaxed text-gray-600">
            <span className="font-semibold text-gray-900">Cagnotte Solidaire</span> est une
            initiative citoyenne qui soutient des projets ayant un impact positif sur la
            société. Chaque don, quel que soit son montant, contribue directement au
            financement d'actions concrètes.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Target className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Notre mission</p>
                <p className="text-sm text-gray-500">
                  Financer des projets solidaires et accompagner les initiatives locales.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Users className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Transparence totale</p>
                <p className="text-sm text-gray-500">
                  100% des dons sont reversés aux projets soutenus, sans intermediaire.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Shield className="h-4 w-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Paiement securise</p>
                <p className="text-sm text-gray-500">
                  Vos paiements sont traités via Norpo, un prestataire certifié et sécurisé.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
