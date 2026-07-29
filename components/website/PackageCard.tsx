import { cn, formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { ticketMaskY } from "./ui/utils";

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
        "bg-transparent border-none ",
      )}
    >
      <div style={ticketMaskY} className="h-full flex flex-col justify-between text-ey-dark">
        <CardHeader
          className={cn(
            "text-center overflow-hidden bg-ey-turquoise border-none",
            featured && "bg-ey-orange w-full",
            featured === 2 && "bg-white",
          )}
        >
          <CardTitle className="font-bold">{title}</CardTitle>
          <CardDescription className="text-xl text-ey-dark">
            {quantity} entradas
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(
            "text-center bg-ey-turquoise p-6 pt-0",
            featured && "bg-ey-orange w-full",
            featured === 2 && "bg-white",
          )}>
          <div className="space-y-2">
            <div className="text-2xl font-bold border-b pb-4 border-ey-dark">
              ARS <span className="text-6xl ">{formatPrice(unitPrice)}</span>{" "}
              <br />
              por ticket
            </div>
            <div className="text-lg ">
              Total: ARS {formatPrice(totalPrice)}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
