"use client";

import { useState } from "react";
import { FileUploader } from "@/app/(dashboard)/dashboard/components/file-uploader/file-uploader";
import { uploadImage, deleteImage } from "@/lib/image-actions";
import { updateEvent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// ─── Main Image Section ────────────────────────────────────────────────────────

interface MainImageSectionProps {
  eventId: string;
  eventImage: string | null;
  eventImagePublicId: string | null;
  eventTitle: string;
}

function MainImageSection({
  eventId,
  eventImage,
  eventImagePublicId,
  eventTitle,
}: MainImageSectionProps) {
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
        if (!res || "ok" in res) throw new Error("Error subiendo la imagen");
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
      toast({ title: "Imagen principal actualizada" });
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
    <div className="space-y-3">
      <div>
        <h2 className="font-semibold text-base">Imagen principal</h2>
        <p className="text-sm text-muted-foreground">
          Se muestra en la página del evento. Recomendado: formato vertical
          (3:4).
        </p>
      </div>
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
        <div className="relative w-full h-64 rounded-md overflow-hidden bg-neutral-100 border group">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={eventTitle}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-sm text-muted-foreground">
              Sin imagen principal
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

// ─── Thumbnail Section ─────────────────────────────────────────────────────────

interface ThumbnailSectionProps {
  eventId: string;
  thumbnailImage: string | null;
  thumbnailImagePublicId: string | null;
  eventTitle: string;
}

function ThumbnailSection({
  eventId,
  thumbnailImage,
  thumbnailImagePublicId,
  eventTitle,
}: ThumbnailSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileUpdated, setFileUpdated] = useState(false);
  const [imagePublicId, setImagePublicId] = useState<string | null>(
    thumbnailImagePublicId,
  );
  const [imageUrl, setImageUrl] = useState<string>(thumbnailImage ?? "");

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
        if (!res || "ok" in res) throw new Error("Error subiendo la miniatura");
        newImageUrl = res.url;
        newPublicId = res.publicId;
        setImageUrl(newImageUrl);
        setImagePublicId(newPublicId);
        setFileUpdated(false);
      }

      await updateEvent(
        {
          thumbnailImage: newImageUrl || "",
          thumbnailImagePublicId: newPublicId,
        },
        eventId,
      );
      setIsEditing(false);
      toast({ title: "Miniatura actualizada" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error actualizando la miniatura",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFiles([]);
    setFileUpdated(false);
    setImageUrl(thumbnailImage ?? "");
    setImagePublicId(thumbnailImagePublicId);
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-semibold text-base">Miniatura</h2>
        <p className="text-sm text-muted-foreground">
          Imagen cuadrada para listados y previsualizaciones. Recomendado: 1:1.
        </p>
      </div>
      {isEditing ? (
        <div className="space-y-3">
          <div className="max-w-xs">
            <FileUploader
              onFieldChange={(url: string) => setImageUrl(url)}
              imageUrl={imageUrl}
              setFiles={setFiles}
              setFileUpdated={setFileUpdated}
              square
              onDelete={async (_url: string) => {
                if (imagePublicId) {
                  await deleteImage(imagePublicId);
                }
                setImagePublicId(null);
                setImageUrl("");
                await updateEvent(
                  { thumbnailImage: "", thumbnailImagePublicId: null },
                  eventId,
                );
              }}
            />
          </div>
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
        <div className="relative w-48 h-48 rounded-md overflow-hidden bg-neutral-100 border group">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={eventTitle}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-sm text-muted-foreground text-center px-2">
              Sin miniatura
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

// ─── EventImagesManager ────────────────────────────────────────────────────────

interface EventImagesManagerProps {
  eventId: string;
  eventTitle: string;
  eventImage: string | null;
  eventImagePublicId: string | null;
  thumbnailImage: string | null;
  thumbnailImagePublicId: string | null;
}

export default function EventImagesManager({
  eventId,
  eventTitle,
  eventImage,
  eventImagePublicId,
  thumbnailImage,
  thumbnailImagePublicId,
}: EventImagesManagerProps) {
  return (
    <div className="space-y-10">
      <MainImageSection
        eventId={eventId}
        eventTitle={eventTitle}
        eventImage={eventImage}
        eventImagePublicId={eventImagePublicId}
      />
      <ThumbnailSection
        eventId={eventId}
        eventTitle={eventTitle}
        thumbnailImage={thumbnailImage}
        thumbnailImagePublicId={thumbnailImagePublicId}
      />
    </div>
  );
}
