"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateEvent } from "@/lib/actions";
import { EditWizardStepper } from "./edit-wizard-stepper";
import { EditStep1Datos } from "./edit-step-1-datos";
import { EditStep3Fechas } from "./edit-step-3-fechas";
import { EditStep4Lugar } from "./edit-step-4-lugar";
import { EditWizardStep } from "./types";
import {
  WizardStep1Data,
  WizardStep3Data,
  WizardStep4Data,
} from "../create-event-wizard/types";
import { Evento } from "@/types/event";

type WizardEventState = {
  step1: WizardStep1Data;
  step3: WizardStep3Data;
  step4: WizardStep4Data;
};

function initState(evento: Evento): WizardEventState {
  return {
    step1: {
      title: evento.title,
      description: evento.description,
      category: evento.category ?? null,
      legalText: evento.legalText ?? "",
      website: evento.website ?? "",
      restrictions: evento.restrictions ?? [],
      ageRestriction: evento.ageRestriction ?? null,
    },
    step3: {
      dateTimeSelections: JSON.parse(evento.dates),
      saleEndDate: evento.saleEndDate ? new Date(evento.saleEndDate) : new Date(),
    },
    step4: {
      state: evento.state ?? "",
      city: evento.city ?? "",
      address: evento.address,
      venue: evento.venue ?? "",
    },
  };
}

interface EditEventWizardProps {
  evento: Evento;
  producerState?: string;
  producerCity?: string;
}

export function EditEventWizard({ evento, producerState, producerCity }: EditEventWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<EditWizardStep>(1);
  const [savedSteps, setSavedSteps] = useState<Set<EditWizardStep>>(new Set());
  const [state, setState] = useState<WizardEventState>(() => initState(evento));

  function markSaved(step: EditWizardStep) {
    setSavedSteps((prev) => new Set([...prev, step]));
  }

  async function handleSaveStep1(data: WizardStep1Data) {
    try {
      await updateEvent(
        {
          title: data.title,
          description: data.description,
          category: data.category,
          legalText: data.legalText || null,
          website: data.website || null,
          restrictions: data.restrictions,
          ageRestriction: data.ageRestriction ?? null,
        },
        evento.id
      );
      setState((prev) => ({ ...prev, step1: data }));
      markSaved(1);
      toast({ title: "Cambios guardados" });
    } catch {
      toast({ variant: "destructive", title: "Error guardando los cambios" });
      throw new Error("Save failed");
    }
  }

  async function handleSaveStep3(data: WizardStep3Data) {
    try {
      await updateEvent(
        {
          dates: JSON.stringify(data.dateTimeSelections),
          saleEndDate: data.saleEndDate.toISOString(),
        },
        evento.id
      );
      setState((prev) => ({ ...prev, step3: data }));
      markSaved(2);
      toast({ title: "Cambios guardados" });
    } catch {
      toast({ variant: "destructive", title: "Error guardando los cambios" });
      throw new Error("Save failed");
    }
  }

  async function handleSaveStep4(data: WizardStep4Data) {
    try {
      await updateEvent(
        {
          state: data.state || null,
          city: data.city || null,
          address: data.address,
          venue: data.venue || null,
        },
        evento.id
      );
      setState((prev) => ({ ...prev, step4: data }));
      markSaved(3);
      toast({ title: "Cambios guardados" });
    } catch {
      toast({ variant: "destructive", title: "Error guardando los cambios" });
      throw new Error("Save failed");
    }
  }

  return (
    <div className="space-y-8">
      <EditWizardStepper
        currentStep={currentStep}
        savedSteps={savedSteps}
        onStepClick={setCurrentStep}
      />

      {currentStep === 1 && (
        <EditStep1Datos initialData={state.step1} onSave={handleSaveStep1} />
      )}
      {currentStep === 2 && (
        <EditStep3Fechas initialData={state.step3} onSave={handleSaveStep3} />
      )}
      {currentStep === 3 && (
        <EditStep4Lugar
          initialData={state.step4}
          onSave={handleSaveStep4}
          producerState={producerState}
          producerCity={producerCity}
        />
      )}
    </div>
  );
}
