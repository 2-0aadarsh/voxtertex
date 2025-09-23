interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepTitles,
}: ProgressIndicatorProps) {
  const clampedCurrent = Math.max(1, Math.min(currentStep, totalSteps));
  const progressPercent =
    totalSteps > 1
      ? `${((clampedCurrent - 1) / (totalSteps - 1)) * 100}%`
      : '100%';

  return (
    <div className="w-full px-6">
      <div className="relative w-full h-16">
        {/* full background line */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-200 -translate-y-1/2 z-0" />

        {/* orange progress overlay */}
        <div
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 z-10 bg-orange-500"
          style={{ width: progressPercent }}
        />

        {/* steps positioned by percentage */}
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const leftPercent =
            totalSteps > 1 ? ((step - 1) / (totalSteps - 1)) * 100 : 0;
          const isActive = step <= clampedCurrent;

          return (
            <div
              key={step}
              /* position the step at the exact X% and center it horizontally */
              className="absolute top-0 h-full"
              style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
            >
              <div className="relative w-[1px] h-full">
                {/* circle: absolutely centered vertically at the bar (line center) */}
                <div
                  className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20
                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                    ${isActive ? 'bg-orange-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'}`}
                >
                  {step}
                </div>

                {/* title: independently positioned below the circle */}
                <div
                  className={`absolute left-1/2 z-20 text-xs text-center`}
                  style={{
                    width: 110, // keeps long titles wrapped nicely; tweak as needed
                    transform: 'translateX(-50%)',
                    top: 'calc(50% + 20px)', // 50% = center line; +20px drops below circle
                  }}
                >
                  <span className={isActive ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                    {stepTitles[i]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
