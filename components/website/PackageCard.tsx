import { cn, formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";

interface PricingCardPackage {
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountPrice?: number | null;
  featured?: boolean;
}

export default function PricePackageCard({
  title,
  quantity,
  unitPrice,
  totalPrice,
  discountPrice,
  featured = false,
}: PricingCardPackage) {
  return (
    <Card
      className={cn(
        "shadow-[-1px_-1px_0.5px_0px_rgba(255,255,255,0.15),1px_1px_0.5px_0px_rgba(255,255,255,0.15)] bg-[linear-gradient(175deg,#11111105,#99999924)]! backdrop-blur-md border-none",
        featured &&
          "bg-[linear-gradient(175deg,#11111150,#3addbe50)]! h-[110%]",
      )}
    >
      <div className="h-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-white font-bold">{title}</CardTitle>
          <CardDescription className="text-white text-xl">
            {quantity} entradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-white">
            <div className="text-xl">
              ARS{" "}
              <span className="text-4xl font-bold">
                {formatPrice(unitPrice)}
              </span>{" "}
              por ticket
            </div>
            <div className="text-lg font-semibold">
              Total: {formatPrice(totalPrice)}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
