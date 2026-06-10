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
  featured?: number | boolean;
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
        "rounded-4xl py-6 bg-ey-turquoise text-center shadow-[-1px_-1px_0.5px_0px_rgba(255,255,255,0.15),1px_1px_0.5px_0px_rgba(255,255,255,0.15)]! backdrop-blur-md border-none",
        featured && "bg-ey-orange w-full",
        featured === 2 && "bg-white",
      )}
    >
      <div className="h-full flex flex-col justify-between text-ey-dark">
        <CardHeader>
          <CardTitle className="font-bold">{title}</CardTitle>
          <CardDescription className="text-xl text-ey-dark font-thin">
            {quantity} entradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold border-b pb-2 border-ey-dark">
              ARS <span className="text-6xl ">{formatPrice(unitPrice)}</span>{" "}
              <br />
              por ticket
            </div>
            <div className="text-lg font-thin">
              Total: ARS {formatPrice(totalPrice)}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
