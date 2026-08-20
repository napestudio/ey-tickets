"use client";
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "../ui/button";
import { QrCode, WifiOff } from "lucide-react";
import { validateTicketById } from "@/lib/actions";
import { toast } from "../ui/use-toast";

type ScanResult = "VALIDATED" | "ALREADY_VALIDATED" | "CANCELED" | "ERROR" | null;

export default function QrScannerComponent({
  eventId,
  sessionId,
  updateData,
}: {
  eventId: string;
  sessionId: string;
  updateData: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
      setScanResult(null);
    }
    if (videoRef.current && isOpen) {
      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          qrScanner.stop();
          const ticketId = result.data;

          // Optimistic UI: show validated immediately before server confirms
          setScanResult("VALIDATED");

          const attemptValidation = async (retryCount = 0): Promise<void> => {
            try {
              setIsOffline(false);
              const r = await validateTicketById(ticketId, eventId, sessionId);

              if (r.success) {
                updateData();
                toast({ title: "Ticket validado" });
                setScanResult("VALIDATED");
              } else if (r.alreadyValidated) {
                setScanResult("ALREADY_VALIDATED");
                toast({
                  title: "El ticket ya fue validado con anterioridad",
                  variant: "destructive",
                });
              } else if (r.canceled) {
                setScanResult("CANCELED");
                toast({
                  title: "Esta entrada ha sido cancelada",
                  variant: "destructive",
                });
              } else {
                setScanResult("ERROR");
                toast({
                  title: "Ticket no encontrado para este evento",
                  variant: "destructive",
                });
              }
              setTimeout(() => setIsOpen(false), 1200);
            } catch {
              if (retryCount === 0) {
                // One automatic retry after 500ms
                setTimeout(() => attemptValidation(1), 500);
              } else {
                setIsOffline(true);
                setScanResult("ERROR");
                toast({
                  title:
                    "Sin conexión. Verificá la señal e intentá nuevamente.",
                  variant: "destructive",
                });
                setTimeout(() => setIsOpen(false), 2000);
              }
            }
          };

          await attemptValidation();
        },
        {
          onDecodeError: () => {},
          maxScansPerSecond: 30,
          highlightScanRegion: isOpen,
        },
      );

      qrScanner.start();

      return () => {
        qrScanner.stop();
      };
    }
  }, [videoRef, isOpen, eventId, sessionId]);

  const scanResultBg =
    scanResult === "VALIDATED"
      ? "bg-green-400"
      : scanResult === "ALREADY_VALIDATED"
        ? "bg-red-400"
        : scanResult === "CANCELED"
          ? "bg-orange-400"
          : scanResult === "ERROR"
            ? "bg-yellow-400"
            : "";

  const scanResultText =
    scanResult === "VALIDATED"
      ? "Validado"
      : scanResult === "ALREADY_VALIDATED"
        ? "Ya validado"
        : scanResult === "CANCELED"
          ? "Entrada cancelada"
          : scanResult === "ERROR"
            ? "Error"
            : "Validando...";

  return (
    <>
      <dialog
        open={isOpen}
        className="z-50 px-5 backdrop:bg-black backdrop:bg-opacity-50 w-screen h-svh justify-between inset-0 bg-gray-900"
        ref={dialogRef}
      >
        {isOffline && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-medium">
            <WifiOff className="w-4 h-4" />
            Sin conexión
          </div>
        )}
        <div className="w-full h-full flex flex-col items-center justify-between pt-5">
          <div className="h-[50svh] rounded-xl overflow-hidden shadow-md relative">
            {isOpen && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              ></video>
            )}
            {scanResult !== null && (
              <div
                className={`absolute w-full h-full ${scanResultBg} inset-0 flex items-center justify-center`}
              >
                <span className="font-bold text-black animate-pulse text-xl">
                  {scanResultText}
                </span>
              </div>
            )}
          </div>

          <div
            className={`bg-ey-turquoise-dark rounded-t-xl w-full max-w-95 mx-auto p-5 space-y-2 transition-transform ${
              scanResult !== null ? "opacity-70 translate-y-36" : ""
            }`}
          >
            <h5 className="text-center font-bold text-xl text-neutral-900">
              Apuntá al QR
            </h5>
            <p className="text-center text-neutral-900">
              Apuntar al QR para validar la entrada
            </p>
            <div className="flex items-center justify-center">
              <QrCode width={"200"} height={100} />
            </div>
            <Button
              className="py-6 px-10 z-10 mt-5 w-full text-xl"
              onClick={() => setIsOpen(false)}
              disabled={scanResult !== null}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </dialog>
      <div className="fixed w-full left-0  bottom-0 py-4 px-6">
        <Button
          className="py-8  mx-auto shadow-sm shadow-white/50 bg-ey-turquoise hover:bg-ey-turquoise/50 cursor-pointer text-2xl text-neutral-900 font-bold transition-colors w-full"
          onClick={() => setIsOpen(true)}
        >
          <span className="mr-5">Escanear</span>
          <QrCode />
        </Button>
      </div>
    </>
  );
}
