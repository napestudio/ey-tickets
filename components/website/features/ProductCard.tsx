// components/features/ProductCard.tsx
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";
import { Title } from "../ui/Title";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  title: string;
  description: string;
  href?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function ProductCard({
  title,
  description,
  href,
  onAction,
  actionLabel = "Ver producto",
  className,
}: ProductCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <Title as="h3" className="text-2xl">
        {title}
      </Title>

      <Text size="sm" color="muted" className="flex-1">
        {description}
      </Text>

      {href ? (
        <Button variant="secondary" size="md" href={href}>
          {actionLabel}
        </Button>
      ) : (
        <Button variant="secondary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
