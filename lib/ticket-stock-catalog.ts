import { PackageCatalogItem } from "@/types/ticket-stock";

export const PACKAGE_CATALOG: PackageCatalogItem[] = [
  {
    title: "Eventos chicos",
    quantity: 50,
    unitPrice: 310.0,
    totalPrice: 15500.0,
  },
  { title: "Más elegido", quantity: 300, unitPrice: 248, totalPrice: 74400.0 },
  {
    title: "Más conveniente",
    quantity: 1200,
    unitPrice: 186.0,
    totalPrice: 223200.0,
  },
];

export function getUnitPriceForQuantity(qty: number): number {
  if (qty >= PACKAGE_CATALOG[2].quantity) return PACKAGE_CATALOG[2].unitPrice;
  if (qty >= PACKAGE_CATALOG[1].quantity) return PACKAGE_CATALOG[1].unitPrice;
  return PACKAGE_CATALOG[0].unitPrice;
}
