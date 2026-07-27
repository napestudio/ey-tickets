"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { WizardStep } from "./types";

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
  { label: "Pagos", description: "Métodos de pago" },
  { label: "Entradas", description: "Tipo de ticket" },
];

interface WizardStepperProps {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  onStepClick?: (step: WizardStep) => void;
}

export function WizardStepper({ currentStep, completedSteps, onStepClick }: WizardStepperProps) {
  return (
    <nav aria-label="Pasos del asistente">
      <ol className="flex items-start w-full">
        {STEPS.map((step, index) => {
          const stepNumber = (index + 1) as WizardStep;
          const isCompleted = completedSteps.has(stepNumber);
          const isCurrent = currentStep === stepNumber;
          const isUpcoming = !isCompleted && !isCurrent;
          const isClickable = isCompleted && onStepClick;

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
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(stepNumber)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-ey-turquoise bg-ey-turquoise text-black",
                    isUpcoming &&
                      "border-muted-foreground/40 bg-background text-muted-foreground",
                    isClickable && "cursor-pointer hover:opacity-80",
                    !isClickable && "cursor-default"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </button>
                <div className="mt-1 hidden sm:block text-center">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground",
                      isClickable && "cursor-pointer"
                    )}
                    onClick={() => isClickable && onStepClick(stepNumber)}
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
                    isCompleted ? "bg-primary" : "bg-border"
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
