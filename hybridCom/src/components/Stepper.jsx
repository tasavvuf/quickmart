import React, { useState, useEffect, Children, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Stepper({
  children,
  initialStep = 1,
  activeStep: controlledActiveStep,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  hideFooter = false,
  renderStepIndicator,
  ...rest
}) {
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;

  const isControlled = controlledActiveStep !== undefined;
  const [internalStep, setInternalStep] = useState(initialStep);
  const currentStep = isControlled ? controlledActiveStep : internalStep;

  const [direction, setDirection] = useState(0);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      setDirection(currentStep > prevStepRef.current ? 1 : -1);
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep) => {
    if (!isControlled) {
      setInternalStep(newStep);
    }
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-2 sm:p-4" {...rest}>
      <div className={`mx-auto w-full max-w-2xl rounded-3xl app-card border border-border ${stepCircleContainerClassName}`}>
        {/* Step Indicators Header */}
        <div className={`flex w-full items-center justify-between p-4 sm:p-6 overflow-x-auto ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Animated Step Content */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`px-4 sm:px-8 py-6 ${contentClassName}`}
        >
          {stepsArray[Math.min(currentStep, totalSteps) - 1]}
        </StepContentWrapper>

        {/* Footer Navigation (only if not hidden) */}
        {!hideFooter && !isCompleted && (
          <div className={`px-6 pb-6 ${footerClassName}`}>
            <div className={`flex items-center ${currentStep !== 1 ? 'justify-between' : 'justify-end'}`}>
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-xl text-xs font-bold app-control cursor-pointer transition hover:opacity-80 active:scale-95"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                {...nextButtonProps}
              >
                {isLastStep ? 'Complete' : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
  const [parentHeight, setParentHeight] = useState('auto');
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      setParentHeight(containerRef.current.offsetHeight || 'auto');
    }
  }, [currentStep, children]);

  return (
    <div className={`w-full min-h-[110px] flex flex-col items-center justify-center ${className}`}>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        {!isCompleted && (
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full flex flex-col items-center justify-center"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const stepVariants = {
  enter: (dir) => ({
    x: dir >= 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir >= 0 ? -40 : 40,
    opacity: 0,
  }),
};

export function Step({ children }) {
  return <div className="w-full flex flex-col items-center justify-center text-center">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step);
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`relative outline-none flex flex-col items-center justify-center shrink-0 ${
        disableStepIndicators ? 'pointer-events-none' : 'cursor-pointer'
      }`}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 0.9, backgroundColor: 'rgba(255,255,255,0.08)', color: '#888' },
          active: { scale: 1.15, backgroundColor: '#f59e0b', color: '#000' },
          complete: { scale: 1, backgroundColor: '#22c55e', color: '#fff' },
        }}
        transition={{ duration: 0.25 }}
        className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs shadow-md"
      >
        {status === 'complete' ? (
          <CheckIcon className="h-4 w-4 text-white" />
        ) : (
          <span className={status === 'active' ? 'text-black font-extrabold text-sm' : 'text-xs'}>{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }) {
  return (
    <div className="relative mx-1 sm:mx-2 h-1 flex-1 min-w-[20px] overflow-hidden rounded-full bg-border">
      <div
        className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500 w-full' : 'w-0'}`}
      />
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
