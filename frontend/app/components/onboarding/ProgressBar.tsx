interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-neutral-500">Step {currentStep} of {totalSteps}</span>
      </div>
      <div className="w-full bg-neutral-900 rounded-full h-2.5 border border-white">
        <div 
          className="bg-white h-2 rounded-full transition-all duration-300" 
          style={{width: `${progressPercentage}%`}}
        />
      </div>
    </div>
  );
}