"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { uploadImage } from "@/lib/image-actions";
import { createEventAndReturnId } from "@/lib/actions";
import { WizardStepper } from "./wizard-stepper";
import { Step1EventData } from "./step-1-event-data";
import { Step2EventType } from "./step-2-event-type";
import { Step2Dates } from "./step-2-dates";
import { Step4Location } from "./step-4-location";
import { Step3EventImage } from "./step-3-event-image";
import { Step4TicketType } from "./step-7-ticket-type";
import { Step7PaymentMethods } from "./step-7-payment-methods";
import {
  WizardState,
  WizardStep,
  WizardStep1Data,
  WizardStep2Data,
  WizardStep3Data,
  WizardStep4Data,
  WizardStep5Data,
} from "./types";

const STORAGE_KEY = "ey_wizard_state";

type PersistedState = {
  step1: WizardStep1Data | null;
  step2: WizardStep2Data | null;
  step3: WizardStep3Data | null;
  step4: WizardStep4Data | null;
  createdEventId: string | null;
  currentStep: WizardStep;
  completedSteps: number[];
};

function loadPersistedState(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.step3?.saleEndDate) {
      parsed.step3.saleEndDate = new Date(parsed.step3.saleEndDate);
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistState(
  state: WizardState,
  currentStep: WizardStep,
  completedSteps: Set<WizardStep>
) {
  try {
    const toSave: PersistedState = {
      step1: state.step1,
      step2: state.step2,
      step3: state.step3,
      step4: state.step4,
      createdEventId: state.createdEventId,
      currentStep,
      completedSteps: Array.from(completedSteps),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // sessionStorage not available (private browsing, storage full)
  }
}

function clearPersistedState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

interface CreateEventWizardProps {
  producerId: string;
}

export function CreateEventWizard({ producerId }: CreateEventWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isCompletingRef = useRef(false);

  const saved = loadPersistedState();

  const [currentStep, setCurrentStep] = useState<WizardStep>(
    saved?.currentStep ?? 1
  );
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    new Set((saved?.completedSteps ?? []) as WizardStep[])
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [wizardState, setWizardState] = useState<WizardState>({
    step1: saved?.step1 ?? null,
    step2: saved?.step2 ?? null,
    step3: saved?.step3 ?? null,
    step4: saved?.step4 ?? null,
    step5: null,
    createdEventId: saved?.createdEventId ?? null,
  });

  // beforeunload warning while wizard has unsaved data
  useEffect(() => {
    if (wizardState.step1 === null) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (!isCompletingRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [wizardState.step1]);

  function advance(
    newState: WizardState,
    completedStep: WizardStep,
    nextStep: WizardStep
  ) {
    setWizardState(newState);
    const newCompleted = new Set([...completedSteps, completedStep]);
    setCompletedSteps(newCompleted);
    setCurrentStep(nextStep);
    persistState(newState, nextStep, newCompleted);
  }

  function handleStep1Complete(data: WizardStep1Data) {
    advance({ ...wizardState, step1: data }, 1, 2);
  }

  function handleStep2Complete(data: WizardStep2Data) {
    advance({ ...wizardState, step2: data }, 2, 3);
  }

  function handleStep3Complete(data: WizardStep3Data) {
    advance({ ...wizardState, step3: data }, 3, 4);
  }

  function handleStep4Complete(data: WizardStep4Data) {
    advance({ ...wizardState, step4: data }, 4, 5);
  }

  async function handleStep5Complete(data: WizardStep5Data) {
    setIsTransitioning(true);

    let finalImageUrl = data.uploadedImageUrl;
    let finalImagePublicId = data.imagePublicId;

    if (data.fileUpdated && data.files.length > 0) {
      try {
        const formData = new FormData();
        formData.append("file", data.files[0]);
        const res = await uploadImage(formData, "events");
        if (!res || "ok" in res) {
          throw new Error("Error subiendo la imagen");
        }
        finalImageUrl = res.url;
        finalImagePublicId = res.publicId;
      } catch {
        toast({
          variant: "destructive",
          title: "Error subiendo la imagen",
          description: "Por favor intentá nuevamente.",
        });
        setIsTransitioning(false);
        return;
      }
    }

    const step1 = wizardState.step1!;
    const step2 = wizardState.step2!;
    const step3 = wizardState.step3!;
    const step4 = wizardState.step4!;

    const slug = `${step1.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 8)}`;

    try {
      const { eventId } = await createEventAndReturnId({
        title: step1.title,
        slug,
        description: step1.description,
        state: step4.state || null,
        city: step4.city || null,
        address: step4.address,
        venue: step4.venue || null,
        legalText: step1.legalText || null,
        website: step1.website || null,
        dates: JSON.stringify(step3.dateTimeSelections),
        saleEndDate: step3.saleEndDate.toISOString(),
        image: finalImageUrl || null,
        imagePublicId: finalImagePublicId ?? null,
        status: "ACTIVE",
        eventType: step2.eventType,
        category: step1.category,
        restrictions: step1.restrictions,
        ageRestriction: step1.ageRestriction ?? null,
        producerId,
      });

      const newState: WizardState = {
        ...wizardState,
        step5: {
          ...data,
          uploadedImageUrl: finalImageUrl,
          imagePublicId: finalImagePublicId,
        },
        createdEventId: eventId,
      };
      advance(newState, 5, 6);
    } catch {
      toast({
        variant: "destructive",
        title: "Error creando el evento",
        description: "Por favor intentá nuevamente.",
      });
    } finally {
      setIsTransitioning(false);
    }
  }

  function handleStep6Complete() {
    const newCompleted = new Set([...completedSteps, 6 as WizardStep]);
    setCompletedSteps(newCompleted);
    setCurrentStep(7);
    persistState(wizardState, 7, newCompleted);
  }

  function handleStep6Skip() {
    setCurrentStep(7);
    persistState(wizardState, 7, completedSteps);
  }

  function finish() {
    isCompletingRef.current = true;
    clearPersistedState();
    router.push(`/dashboard/evento/${wizardState.createdEventId}`);
  }

  function handleStep7Complete() {
    setCompletedSteps((prev) => new Set([...prev, 7 as WizardStep]));
    finish();
  }

  function handleStep7Skip() {
    finish();
  }

  function handleBack() {
    if (currentStep > 1) {
      const prev = (currentStep - 1) as WizardStep;
      setCurrentStep(prev);
      persistState(wizardState, prev, completedSteps);
    }
  }

  function handleStepClick(step: WizardStep) {
    setCurrentStep(step);
    persistState(wizardState, step, completedSteps);
  }

  return (
    <div className="space-y-8">
      <WizardStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {currentStep === 1 && (
        <Step1EventData
          initialData={wizardState.step1}
          onComplete={handleStep1Complete}
        />
      )}
      {currentStep === 2 && (
        <Step2EventType
          initialData={wizardState.step2}
          onComplete={handleStep2Complete}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <Step2Dates
          initialData={wizardState.step3}
          onComplete={handleStep3Complete}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <Step4Location
          initialData={wizardState.step4}
          onComplete={handleStep4Complete}
          onBack={handleBack}
        />
      )}
      {currentStep === 5 && (
        <Step3EventImage
          initialData={wizardState.step5}
          onComplete={handleStep5Complete}
          onBack={handleBack}
          isLoading={isTransitioning}
        />
      )}
      {currentStep === 6 && wizardState.createdEventId && (
        <Step7PaymentMethods
          eventId={wizardState.createdEventId}
          producerId={producerId}
          onComplete={handleStep6Complete}
          onSkip={handleStep6Skip}
        />
      )}
      {currentStep === 7 && wizardState.createdEventId && (
        <Step4TicketType
          eventId={wizardState.createdEventId}
          producerId={producerId}
          eventDates={wizardState.step3!.dateTimeSelections}
          onComplete={handleStep7Complete}
          onSkip={handleStep7Skip}
        />
      )}
    </div>
  );
}
