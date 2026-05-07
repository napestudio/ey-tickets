"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <Button
      className="w-full bg-yellow hover:bg-yellow-light text-black hover:bg-opacity-10 hover:shadow-none transition-all rounded-none py-8 text-2xl border-4 border-black shadow-hard"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      Gmail
    </Button>
  );
}
