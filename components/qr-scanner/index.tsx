"use client";
import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Button } from "../ui/button";
import { QrCode } from "lucide-react";
import { validateTicketById } from "@/lib/actions";
import { toast } from "../ui/use-toast";

export default function QrScannerComponent({
  eventId,
  updateData,
}: {
  eventId: string;
  updateData: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
      setIsScanning(false);
    }
    if (videoRef.current && isOpen) {
      const qrScanner = new QrScanner(
        videoRef.current,
        async (result) => {
          setResult(result.data);
          qrScanner.stop();
          setIsScanning(true);
          try {
            const r = await validateTicketById(result.data, eventId);
            if (r !== false) {
              updateData();
              toast({
                title: "Ticket validado",
              });
            } else {
              toast({
                title: "El ticket ya fue validado con anterioridad",
                variant: "destructive",
              });
            }
            setIsOpen(false);
          } catch (error) {}
        },
        {
          onDecodeError: (error) => {
            console.error(error);
          },
          maxScansPerSecond: 30,
          highlightScanRegion: isOpen,
        }
      );

      qrScanner.start();

      return () => {
        qrScanner.stop();
      };
    }
  }, [videoRef, isOpen, eventId]);

  return (
    <>
      <dialog
        open={isOpen}
        className="z-50 px-5 backdrop:bg-black backdrop:bg-opacity-50 w-screen h-svh justify-between inset-0 bg-gray-900"
        ref={dialogRef}
      >
        <div className="w-full h-full flex flex-col items-center justify-between pt-5">
          <div className="h-[50svh] rounded-xl overflow-hidden shadow-md relative">
            {isOpen && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              ></video>
            )}
            {isScanning && (
              <div className="absolute w-full h-full bg-purple-300 inset-0 flex items-center justify-center">
                <span className="font-bold text-black animate-pulse text-xl">
                  Validando...
                </span>
              </div>
            )}
          </div>

          <div
            className={`bg-white rounded-t-xl w-full max-w-[300px] mx-auto p-5 space-y-2 transition-transform ${
              isScanning ? "opacity-70 translate-y-36" : ""
            }`}
          >
            <h5 className="text-center font-bold text-xl">Apuntá al QR</h5>
            <p className="text-center">Apuntar al QR para validar la entrada</p>
            <div className="flex items-center justify-center">
              <QrCode width={"200"} height={100} />
            </div>
            <Button
              className="py-6 px-10 z-10 mt-5 w-full text-xl"
              onClick={() => setIsOpen(false)}
              disabled={isScanning}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </dialog>
      <Button className="py-5 px-8" onClick={() => setIsOpen(true)}>
        <span className="mr-5">Escanear</span>
        <QrCode />
      </Button>
    </>
  );
}
