"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { uploadImage } from "@/lib/image-actions";
import { createEventAndReturnId } from "@/lib/actions";
import { WizardStepper } from "./wizard-stepper";
import { Step1EventData } from "./step-1-event-data";
import { Step2EventType } from "./step-2-event-type";
import { Step3EventImage } from "./step-3-event-image";
import { Step4TicketType } from "./step-4-ticket-type";
import {
  WizardState,
  WizardStep,
  WizardStep1Data,
  WizardStep2Data,
  WizardStep3Data,
} from "./types";

interface CreateEventWizardProps {
  producerId: string;
}

export function CreateEventWizard({ producerId }: CreateEventWizardProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    new Set()
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [wizardState, setWizardState] = useState<WizardState>({
    step1: null,
    step2: null,
    step3: null,
    createdEventId: null,
  });

  function handleStep1Complete(data: WizardStep1Data) {
    setWizardState((prev) => ({ ...prev, step1: data }));
    setCompletedSteps((prev) => new Set([...prev, 1 as WizardStep]));
    setCurrentStep(2);
  }

  function handleStep2Complete(data: WizardStep2Data) {
    setWizardState((prev) => ({ ...prev, step2: data }));
    setCompletedSteps((prev) => new Set([...prev, 2 as WizardStep]));
    setCurrentStep(3);
  }

  async function handleStep3Complete(data: WizardStep3Data) {
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

    const slug = `${step1.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now()}`;

    try {
      const { eventId } = await createEventAndReturnId({
        title: step1.title,
        slug,
        description: step1.description,
        state: step1.state || null,
        city: step1.city || null,
        address: step1.address,
        venue: step1.venue || null,
        legalText: step1.legalText || null,
        website: step1.website || null,
        dates: JSON.stringify(step1.dateTimeSelections),
        endDate: step1.endDate.toISOString(),
        image: finalImageUrl || null,
        imagePublicId: finalImagePublicId ?? null,
        status: "ACTIVE",
        eventType: step2.eventType,
        category: step1.category,
        restrictions: step1.restrictions,
        ageRestriction: step1.ageRestriction ?? null,
        producerId,
      });

      setWizardState((prev) => ({
        ...prev,
        step3: {
          ...data,
          uploadedImageUrl: finalImageUrl,
          imagePublicId: finalImagePublicId,
        },
        createdEventId: eventId,
      }));
      setCompletedSteps((prev) => new Set([...prev, 3 as WizardStep]));
      setCurrentStep(4);
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

  function handleStep4Complete() {
    setCompletedSteps((prev) => new Set([...prev, 4 as WizardStep]));
    router.push(`/dashboard/evento/${wizardState.createdEventId}`);
  }

  function handleStep4Skip() {
    router.push(`/dashboard/evento/${wizardState.createdEventId}`);
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  }

  return (
    <div className="space-y-8">
      <WizardStepper currentStep={currentStep} completedSteps={completedSteps} />

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
        <Step3EventImage
          initialData={wizardState.step3}
          onComplete={handleStep3Complete}
          onBack={handleBack}
          isLoading={isTransitioning}
        />
      )}
      {currentStep === 4 && wizardState.createdEventId && (
        <Step4TicketType
          eventId={wizardState.createdEventId}
          producerId={producerId}
          eventDates={wizardState.step1!.dateTimeSelections}
          onComplete={handleStep4Complete}
          onSkip={handleStep4Skip}
        />
      )}
    </div>
  );
}
