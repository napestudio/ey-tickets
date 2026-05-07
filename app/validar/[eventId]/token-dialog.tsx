"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface ValidatorContainerProps {
  onTokenConfirm: (token: string) => void;
  loading: boolean;
  errorMsg: string;
  errorHandler: (error: string) => void;
}

export default function TokenDialog({
  onTokenConfirm,
  loading,
  errorMsg,
  errorHandler,
}: ValidatorContainerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [tokenValue, setToken] = useState<string>("");
  const [isInputValid, setInputValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConfirm = () => {
    setToken("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onTokenConfirm(tokenValue);
  };

  const handleTokenChange = (v: string) => {
    errorHandler("");
    if (v.length == 8) {
      setToken(v);
      setInputValid(true);
    } else {
      setInputValid(false);
      setToken("");
    }
  };

  useLayoutEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [dialogRef]);

  return (
    <dialog className="backdrop:bg-gray-50 p-5" ref={dialogRef}>
      <div className="space-y-5">
        <h4 className="text-2xl">Ingresar Token</h4>
        <Input
          placeholder="Token"
          disabled={isLoading}
          onChange={(e) => handleTokenChange(e.target.value)}
          ref={inputRef}
        ></Input>
        <Button
          className="w-full"
          onClick={handleConfirm}
          disabled={!isInputValid || loading}
        >
          Ingresar
        </Button>
        {errorMsg && <p>{errorMsg}</p>}
      </div>
    </dialog>
  );
}
