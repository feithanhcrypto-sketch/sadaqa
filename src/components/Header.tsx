import { Heart } from 'lucide-react';

interface HeaderProps {
  onAboutClick: () => void;
}

export function Header({ onAboutClick }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5 sm:px-10 sm:py-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/20">
            <Heart className="h-5 w-5 text-white" strokeWidth={2.5} fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl">
            Cagnotte Solidaire
          </span>
        </div>

        <button
          onClick={onAboutClick}
          className="text-sm font-medium text-white/80 transition-colors hover:text-white drop-shadow-sm"
        >
          À propos
        </button>
      </div>
    </header>
  );
}
