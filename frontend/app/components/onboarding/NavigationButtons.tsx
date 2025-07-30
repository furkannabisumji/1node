import { Check, CheckCircle, Loader2 } from "lucide-react";

interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  isLastStep?: boolean;
  loading: boolean
}

export function NavigationButtons({
  onPrevious,
  onNext,
  nextDisabled = false,
  previousDisabled = false,
  isLastStep = false,
  loading
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between mt-8">
      <button
        onClick={onPrevious}
        disabled={previousDisabled}
        className="px-6 py-3 border border-gray-300 dark:border-neutral-800 cursor-pointer text-black dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={`px-6 py-3 cursor-pointer rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${isLastStep
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-white hover:bg-white text-black'
          }`}
      >
        {isLastStep ? (
          <>
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Complete Setup
                <CheckCircle size={16} />
              </>
            )}
          </>
        ) : (
          <>
            Next
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}