"use client";
import { useState } from "react";
import EventInfo from "./event-info";
import TokenDialog from "./token-dialog";
import { getEventIdByToken } from "@/lib/actions";
import { toast, useToast } from "@/components/ui/use-toast";

export default function ValidatorsPageHandler({
  eventId,
  soldCount,
}: {
  eventId: string;
  soldCount?: any;
}) {
  const [hasData, setHasData] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loadValidatorByToken = async (token: string) => {
    try {
      setIsLoading(true);
      const callApi = async () => {
        const res = await getEventIdByToken(token.toUpperCase());
        return res;
      };
      const response = await callApi();

      if (response && response?.eventId === eventId) {
        setHasData(true);
        setIsLoading(false);
        setDialogError("");
      } else {
        setHasData(false);
        setIsLoading(false);
        setDialogError("Token invalido");
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      {!hasData && (
        <TokenDialog
          onTokenConfirm={loadValidatorByToken}
          loading={isLoading}
          errorMsg={dialogError}
          errorHandler={setDialogError}
        />
      )}
      {hasData && <EventInfo eventId={eventId} soldCount={soldCount} />}
    </>
  );
}
