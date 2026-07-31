"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { EditWizardStep } from "./types";

interface StepDefinition {
  label: string;
  description: string;
}

const STEPS: StepDefinition[] = [
  { label: "Datos", description: "Información del evento" },
  { label: "Tipo", description: "Categoría y acceso" },
  { label: "Fechas", description: "Fechas del evento" },
  { label: "Lugar", description: "Ubicación del evento" },
  { label: "Imagen", description: "Foto del evento" },
  { label: "Estado", description: "Estado del evento" },
];

interface EditWizardStepperProps {
  currentStep: EditWizardStep;
  savedSteps: Set<EditWizardStep>;
  onStepClick: (step: EditWizardStep) => void;
}

export function EditWizardStepper({
  currentStep,
  savedSteps,
  onStepClick,
}: EditWizardStepperProps) {
  return (
    <nav aria-label="Pasos de edición">
      <ol className="flex items-start w-full">
        {STEPS.map((step, index) => {
          const stepNumber = (index + 1) as EditWizardStep;
          const isSaved = savedSteps.has(stepNumber);
          const isCurrent = currentStep === stepNumber;

          return (
            <li
              key={stepNumber}
              className={cn(
                "flex items-center",
                index < STEPS.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onStepClick(stepNumber)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors cursor-pointer hover:opacity-80",
                    isSaved && !isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-ey-turquoise bg-ey-turquoise text-black",
                    !isSaved && !isCurrent &&
                      "border-muted-foreground/40 bg-background text-muted-foreground"
                  )}
                >
                  {isSaved && !isCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </button>
                <div className="mt-1 hidden sm:block text-center">
                  <p
                    className={cn(
                      "text-xs font-medium cursor-pointer",
                      isCurrent || isSaved
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => onStepClick(stepNumber)}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 mb-5 transition-colors",
                    isSaved ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
