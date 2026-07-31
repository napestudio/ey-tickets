"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { revokeValidatorSession } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function RevokeSessionButton({
  sessionId,
}: {
  sessionId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRevoke = async () => {
    setIsLoading(true);
    try {
      await revokeValidatorSession(sessionId);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleRevoke}
      disabled={isLoading}
    >
      {isLoading ? "Revocando..." : "Revocar"}
    </Button>
  );
}
