"use client";
import { useState, useEffect } from "react";
import EventInfo from "./event-info";
import TokenForm from "./token-form";
import { ValidatorSessionDeviceData } from "@/types/validators";

const getStorageKey = (eventId: string) => `validator_session_${eventId}`;

type StoredSession = {
  sessionId: string;
  expiresAt: string;
};

function collectDeviceData(): ValidatorSessionDeviceData {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
}

export default function ValidatorsPageHandler({
  eventId,
}: {
  eventId: string;
}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(eventId));
    if (stored) {
      const parsed = JSON.parse(stored) as StoredSession;
      if (new Date(parsed.expiresAt) > new Date()) {
        setSessionId(parsed.sessionId);
      } else {
        localStorage.removeItem(getStorageKey(eventId));
      }
    }
    setIsCheckingStorage(false);
  }, [eventId]);

  const loadValidatorByToken = async (token: string) => {
    setIsLoading(true);
    setDialogError("");

    try {
      const deviceData = collectDeviceData();
      const response = await fetch("/api/validator-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.toUpperCase(),
          eventId,
          deviceData,
        }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error: string };
        setDialogError(body.error ?? "Token inválido");
        return;
      }

      const { sessionId: newSessionId, expiresAt } = (await response.json()) as {
        sessionId: string;
        expiresAt: string;
      };

      localStorage.setItem(
        getStorageKey(eventId),
        JSON.stringify({ sessionId: newSessionId, expiresAt })
      );
      setSessionId(newSessionId);
    } catch {
      setDialogError("Error de conexión. Intentá nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStorage) return null;

  return (
    <>
      {!sessionId && (
        <TokenForm
          onTokenConfirm={loadValidatorByToken}
          loading={isLoading}
          errorMsg={dialogError}
          errorHandler={setDialogError}
        />
      )}
      {sessionId && <EventInfo eventId={eventId} sessionId={sessionId} />}
    </>
  );
}
