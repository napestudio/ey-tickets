"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type FaqButtonProps = {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function FaqButton({ header, children, defaultOpen = false }: FaqButtonProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full py-2">
      <button
        className="w-full flex justify-between items-center text-left cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="w-full">{header}</div>
        <span className="text-white text-xl transition-transform duration-200">
          {isOpen ? "-" : "+"}
        </span>
      </button>

      <div
        className={cn(
          "transition-all duration-300 overflow-hidden text-sm text-white",
          isOpen ? "max-h-96 mt-2 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
}
