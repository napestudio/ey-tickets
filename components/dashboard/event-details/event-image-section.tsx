"use client";

import { useState } from "react";
import { FileUploader } from "@/app/(dashboard)/dashboard/components/file-uploader/file-uploader";
import { uploadImage, deleteImage } from "@/lib/image-actions";
import { updateEvent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EventImageSectionProps {
  eventId: string;
  eventImage: string | null;
  eventImagePublicId: string | null;
  eventTitle: string;
}

export default function EventImageSection({
  eventId,
  eventImage,
  eventImagePublicId,
  eventTitle,
}: EventImageSectionProps) {
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileUpdated, setFileUpdated] = useState(false);
  const [imagePublicId, setImagePublicId] = useState<string | null>(
    eventImagePublicId,
  );
  const [imageUrl, setImageUrl] = useState<string>(eventImage ?? "");

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let newImageUrl = imageUrl;
      let newPublicId = imagePublicId;

      if (fileUpdated && files.length > 0) {
        if (imagePublicId) {
          await deleteImage(imagePublicId);
        }
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await uploadImage(formData, "events");
        if (!res || "ok" in res) {
          throw new Error("Error subiendo la imagen");
        }
        newImageUrl = res.url;
        newPublicId = res.publicId;
        setImageUrl(newImageUrl);
        setImagePublicId(newPublicId);
        setFileUpdated(false);
      }

      await updateEvent(
        { image: newImageUrl || "", imagePublicId: newPublicId },
        eventId,
      );
      setIsEditing(false);
      toast({ title: "Imagen actualizada" });
    } catch {
      toast({ variant: "destructive", title: "Error actualizando la imagen" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFiles([]);
    setFileUpdated(false);
    setImageUrl(eventImage ?? "");
    setImagePublicId(eventImagePublicId);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2">
      <h2 className="font-bold">Miniatura del evento</h2>
      {isEditing ? (
        <div className="space-y-3">
          <FileUploader
            onFieldChange={(url: string) => setImageUrl(url)}
            imageUrl={imageUrl}
            setFiles={setFiles}
            setFileUpdated={setFileUpdated}
            onDelete={async (_url: string) => {
              if (imagePublicId) {
                await deleteImage(imagePublicId);
              }
              setImagePublicId(null);
              setImageUrl("");
              await updateEvent({ image: "", imagePublicId: null }, eventId);
            }}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-64 rounded-md overflow-hidden bg-muted group">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={eventTitle}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-sm text-muted-foreground">
              Sin imagen
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={() => setIsEditing(true)}
            className="absolute top-1 right-1 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
