"use client";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-base-neue font-bold transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-white/90",
        secondary: "bg-transparent border border-white text-black hover:bg-white/10",
        ghost: "bg-transparent text-black hover:bg-white/10",
        outline: "bg-transparent border border-black text-black hover:bg-white/10",
        link: "bg-transparent text-black underline-offset-4 hover:underline",
      },
      size: {
        sm: "text-sm px-4 py-2",
        md: "text-base px-6 py-3",
        lg: "text-xl px-8 py-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

// Props base compartidas
interface BaseProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
}

// Dos tipos mutuamente exclusivos
type AsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: never;
  };

type AsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

type ButtonProps = AsButton | AsLink;

export function Button({ variant, size, className, children, ...rest }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as AsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as AsButton)}>
      {children}
    </button>
  );
}