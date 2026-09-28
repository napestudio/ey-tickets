"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

export default function InstallAppButton() {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={promptInstall}
      className="w-full gap-2 border-white/40 text-white hover:bg-white/10 hover:text-white uppercase rounded-2xl cursor-pointer bg-transparent"
    >
      <Download className="h-4 w-4" />
      Descargar app
    </Button>
  );
}
