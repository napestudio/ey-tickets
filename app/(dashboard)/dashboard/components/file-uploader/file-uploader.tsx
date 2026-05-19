"use client";

import { useCallback, useRef, Dispatch, SetStateAction, DragEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

type FileUploaderProps = {
  onFieldChange: (url: string) => void;
  imageUrl: string;
  setFiles: Dispatch<SetStateAction<File[]>>;
  setFileUpdated: Dispatch<SetStateAction<boolean>>;
  onDelete: (url: string) => Promise<void>;
};

const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function FileUploader({
  imageUrl,
  onFieldChange,
  setFiles,
  setFileUpdated,
  onDelete,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) return;
      setFileUpdated(true);
      setFiles([file]);
      onFieldChange(convertFileToUrl(file));
    },
    [setFiles, onFieldChange, setFileUpdated]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDeleteImage = async (url: string) => {
    setFiles([]);
    onFieldChange("");
    await onDelete(url);
  };

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !imageUrl && inputRef.current?.click()}
        className="flex-center border bg-dark-3 flex cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50"
      >
        <div className="flex-center text-center flex-col py-5 text-grey-500 relative min-h-[245px]">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt="image"
                fill
                className="object-cover aspect-square"
              />
              <Button
                variant="secondary"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(imageUrl);
                }}
                className="absolute top-2 right-2"
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleInputChange}
                className="hidden"
              />
              <ImagePlus
                className="m-auto"
                size={40}
                strokeWidth={1}
                absoluteStrokeWidth
              />
              <h3 className="mb-2 mt-2">Tamaño máximo 900KB</h3>
              <p className="p-medium-12">PNG, JPG, WEBP</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
