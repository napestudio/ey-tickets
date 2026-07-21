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
  { label: "Imagen", description: "Foto del evento" },
  { label: "Entradas", description: "Tipo de ticket" },
];

interface WizardStepperProps {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
}

export function WizardStepper({ currentStep, completedSteps }: WizardStepperProps) {
  return (
    <nav aria-label="Pasos del asistente">
      <ol className="flex items-start w-full">
        {STEPS.map((step, index) => {
          const stepNumber = (index + 1) as WizardStep;
          const isCompleted = completedSteps.has(stepNumber);
          const isCurrent = currentStep === stepNumber;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <li
              key={stepNumber}
              className={cn(
                "flex items-center",
                index < STEPS.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-background text-primary",
                    isUpcoming &&
                      "border-muted-foreground/40 bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <div className="mt-1 hidden sm:block text-center">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent || isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
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
