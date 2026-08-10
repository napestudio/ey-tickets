"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateEvent } from "@/lib/actions";
import { EditWizardStepper } from "./edit-wizard-stepper";
import { EditStep1Datos } from "./edit-step-1-datos";
import { EditStep2Tipo } from "./edit-step-2-tipo";
import { EditStep3Fechas } from "./edit-step-3-fechas";
import { EditStep4Lugar } from "./edit-step-4-lugar";
import { EditStep5Image } from "./edit-step-5-image";
import { EditStep6Status } from "./edit-step-6-status";
import { EditWizardStep } from "./types";
import {
  WizardStep1Data,
  WizardStep2Data,
  WizardStep3Data,
  WizardStep4Data,
} from "../create-event-wizard/types";
import { Evento, EventStatus } from "@/types/event";

type WizardEventState = {
  step1: WizardStep1Data;
  step2: WizardStep2Data;
  step3: WizardStep3Data;
  step4: WizardStep4Data;
  step6: { status: EventStatus };
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
    step2: { eventType: evento.eventType ?? "PUBLIC" },
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
    step6: { status: evento.status ?? "ACTIVE" },
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

  async function handleSaveStep2(data: WizardStep2Data) {
    try {
      await updateEvent({ eventType: data.eventType }, evento.id);
      setState((prev) => ({ ...prev, step2: data }));
      markSaved(2);
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
      markSaved(3);
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
      markSaved(4);
      toast({ title: "Cambios guardados" });
    } catch {
      toast({ variant: "destructive", title: "Error guardando los cambios" });
      throw new Error("Save failed");
    }
  }

  async function handleSaveStep6(data: { status: EventStatus }) {
    try {
      await updateEvent({ status: data.status }, evento.id);
      setState((prev) => ({ ...prev, step6: data }));
      markSaved(6);
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
        <EditStep2Tipo initialData={state.step2} onSave={handleSaveStep2} />
      )}
      {currentStep === 3 && (
        <EditStep3Fechas initialData={state.step3} onSave={handleSaveStep3} />
      )}
      {currentStep === 4 && (
        <EditStep4Lugar
          initialData={state.step4}
          onSave={handleSaveStep4}
          producerState={producerState}
          producerCity={producerCity}
        />
      )}
      {currentStep === 5 && (
        <EditStep5Image
          eventId={evento.id}
          eventTitle={evento.title}
          eventImage={evento.image || null}
          eventImagePublicId={evento.imagePublicId ?? null}
          thumbnailImage={evento.thumbnailImage ?? null}
          thumbnailImagePublicId={evento.thumbnailImagePublicId ?? null}
        />
      )}
      {currentStep === 6 && (
        <EditStep6Status initialData={state.step6} onSave={handleSaveStep6} />
      )}
    </div>
  );
}
