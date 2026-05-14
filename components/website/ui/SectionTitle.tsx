import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  rest?: React.HTMLAttributes<HTMLHeadingElement>;
  className?: string;
}

export default function SectionTitle({
  children,
  as = "h2",
  rest,
  className,
}: SectionTitleProps) {
  const Tag = as;
  return (
    <Tag
      className={cn("text-8xl text-white font-base-neue font-bold", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
