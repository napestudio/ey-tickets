"use client";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { revokeValidatorSession } from "@/lib/actions";
import { useState, useEffect } from "react";

const getStorageKey = (eventId: string) => `validator_session_${eventId}`;

export default function ValidatorsNavbar({ eventId }: { eventId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(eventId));
    if (stored) {
      const { expiresAt } = JSON.parse(stored) as { expiresAt: string };
      setHasSession(new Date(expiresAt) > new Date());
    }
  }, [eventId]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(getStorageKey(eventId));
      if (stored) {
        const { sessionId } = JSON.parse(stored) as { sessionId: string };
        await revokeValidatorSession(sessionId);
        localStorage.removeItem(getStorageKey(eventId));
      }
    } finally {
      setIsLoading(false);
      window.location.reload();
    }
  };

  return (
    <div className="w-full fixed top-0 pb-2 pt-3 bg-neutral-950">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="w-32 flex flex-col gap-1">
            <Logo />
            <span className="text-[0.1rem] text-right font-baseNeue font-medium italic text-neutral-500">
              Validación
            </span>
          </div>
          {hasSession && (
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
