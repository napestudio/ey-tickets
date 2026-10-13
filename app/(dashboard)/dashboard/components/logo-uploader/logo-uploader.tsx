"use client";

import { useRef, useState, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { compressImageFile } from "@/lib/client-image-compress";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const LOGO_MAX_WIDTH = 300;

type LogoUploaderProps = {
  imageUrl: string;
  onFieldChange: (url: string) => void;
  setFiles: Dispatch<SetStateAction<File[]>>;
  setFileUpdated: Dispatch<SetStateAction<boolean>>;
  onDelete: () => void | Promise<void>;
};

export function LogoUploader({
  imageUrl,
  onFieldChange,
  setFiles,
  setFileUpdated,
  onDelete,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
    setIsProcessing(true);
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: LOGO_MAX_WIDTH,
      });
      setFileUpdated(true);
      setFiles([compressed]);
      onFieldChange(URL.createObjectURL(compressed));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
      <div
        className="relative w-25 h-25 rounded-full bg-neutral-100/50 hover:bg-white hover:border-neutral-100 transition-colors overflow-hidden border-2 cursor-pointer flex items-center justify-center"
        onClick={() => !imageUrl && inputRef.current?.click()}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/50" />
        ) : imageUrl ? (
          <>
            <Image src={imageUrl} alt="Logo" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <ImagePlus className="text-white w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="text-white w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <ImagePlus className="w-8 h-8 text-muted-foreground/20" />
        )}
      </div>
    </div>
  );
}
