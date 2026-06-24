'use client';

import { useLenis } from 'lenis/react';
import { Button } from '@/components/website/ui/Button';

interface ScrollToButtonProps {
  target: string;
  className?: string;
  children: React.ReactNode;
}

export default function ScrollToButton({ target, className, children }: ScrollToButtonProps) {
  const lenis = useLenis();

  const handleClick = (e: React.MouseEvent) => {
    console.log("🚀 ~ handleClick ~ e: React.MouseEvent:", e)
    e.preventDefault();
    
    lenis?.scrollTo(target, { offset: -80, duration: 1.4 });
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={className}
    >
      {children}
    </Button>
  );
}