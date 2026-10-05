"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        toast({ title: `${label ?? "Dato"} copiado al portapapeles` });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: `Error copiando ${label?.toLowerCase() ?? "el dato"}`,
        });
      });
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-6 w-6 text-white/60 hover:text-white hover:bg-white/10"
      onClick={handleCopy}
      aria-label={`Copiar ${label ?? "valor"}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
}
