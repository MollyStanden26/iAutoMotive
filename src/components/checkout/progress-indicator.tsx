interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

// Checkout progress indicator — step X of 7, visible at all times
export function ProgressIndicator({
  currentStep,
  totalSteps = 7,
}: ProgressIndicatorProps) {
  return <div>Step {currentStep} of {totalSteps}</div>;
}
