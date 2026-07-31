"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TokenFormProps {
  onTokenConfirm: (token: string) => void;
  loading: boolean;
  errorMsg: string;
  errorHandler: (error: string) => void;
}

export default function TokenForm({
  onTokenConfirm,
  loading,
  errorMsg,
  errorHandler,
}: TokenFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tokenValue, setToken] = useState<string>("");
  const [isInputValid, setInputValid] = useState<boolean>(false);

  const handleTokenChange = (v: string) => {
    errorHandler("");
    if (v.length === 8) {
      setToken(v);
      setInputValid(true);
    } else {
      setInputValid(false);
      setToken("");
    }
  };

  const handleConfirm = () => {
    setToken("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onTokenConfirm(tokenValue);
  };

  return (
    <div className="flex items-center justify-center min-h-[80svh] text-neutral-50">
      <div className="w-full max-w-sm space-y-5 bg-neutral-800 rounded-xl p-6">
        <h4 className="text-2xl font-semibold font-nebulica">Ingresar Token</h4>
        <Input
          placeholder="Token"
          className="text-2xl py-8"
          disabled={loading}
          onChange={(e) => handleTokenChange(e.target.value)}
          ref={inputRef}
        />
        <Button
          className="w-full bg-ey-turquoise font-bold text-neutral-900"
          onClick={handleConfirm}
          disabled={!isInputValid || loading}
        >
          Ingresar
        </Button>
        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
      </div>
    </div>
  );
}
