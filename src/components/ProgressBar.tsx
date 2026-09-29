import { formatEuro } from '@/lib/format';

interface ProgressBarProps {
  raised: number;
  goal: number;
  donorCount: number;
}

export function ProgressBar({ raised, goal, donorCount }: ProgressBarProps) {
  const percentage = Math.min(Math.round((raised / goal) * 100), 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-lg font-bold text-gray-900 sm:text-xl">
          {formatEuro(raised)}
          <span className="ml-1.5 text-sm font-normal text-gray-400">
            levés sur {formatEuro(goal)}
          </span>
        </span>
        <span className="text-sm font-semibold text-brand-600">{percentage}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700">{donorCount}</span>
          {donorCount > 1 ? 'contributeurs' : 'contributeur'}
        </span>
        <span className="text-gray-300">•</span>
        <span>{formatEuro(goal - raised)} restants</span>
      </div>
    </div>
  );
}
