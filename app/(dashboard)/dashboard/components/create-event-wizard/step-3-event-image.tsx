"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Box from "@/components/dashboard/box";
import { FileUploader } from "@/app/(dashboard)/dashboard/components/file-uploader/file-uploader";
import { WizardStep3Data } from "./types";

interface Step3EventImageProps {
  initialData: WizardStep3Data | null;
  onComplete: (data: WizardStep3Data) => void;
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

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Atrás
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
