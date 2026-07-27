"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import Box from "@/components/dashboard/box";
import { FileUploader } from "@/app/(dashboard)/dashboard/components/file-uploader/file-uploader";
import { WizardStep5Data } from "./types";

interface Step3EventImageProps {
  initialData: WizardStep5Data | null;
  onComplete: (data: WizardStep5Data) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function Step3EventImage({
  initialData,
  onComplete,
  onBack,
  isLoading,
}: Step3EventImageProps) {
  const [files, setFiles] = useState<File[]>(initialData?.files ?? []);
  const [imageUrl, setImageUrl] = useState<string>(
    initialData?.imageUrl ?? ""
  );
  const [fileUpdated, setFileUpdated] = useState(
    initialData?.fileUpdated ?? false
  );

  function handleComplete() {
    onComplete({
      files,
      imageUrl,
      uploadedImageUrl: initialData?.uploadedImageUrl ?? "",
      imagePublicId: initialData?.imagePublicId ?? null,
      fileUpdated,
    });
  }

  return (
    <div className="space-y-5">
      <Box>
        <div className="space-y-4">
          <h2 className="font-bold">Imagen del evento</h2>
          <p className="text-sm text-muted-foreground">
            Subí una imagen para tu evento. Tamaño máximo: 900KB. Formatos
            aceptados: PNG, JPG, WEBP.
          </p>
          <FileUploader
            onFieldChange={(url) => {
              setImageUrl(url);
            }}
            imageUrl={imageUrl}
            setFiles={setFiles}
            setFileUpdated={setFileUpdated}
            onDelete={async () => {
              setFiles([]);
              setImageUrl("");
              setFileUpdated(false);
            }}
          />
        </div>
      </Box>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          Al hacer clic en &quot;Siguiente&quot;, el evento será creado con toda la información ingresada.
        </span>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Volver
        </Button>
        <Button type="button" onClick={handleComplete} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando evento...
            </>
          ) : (
            "Siguiente"
          )}
        </Button>
      </div>
    </div>
  );
}
