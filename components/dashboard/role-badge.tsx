"use client";
import { Badge } from "@/components/ui/badge";
import { UserType } from "@/types/user";

interface RoleBadgeProps {
  role: UserType | "PRODUCER";
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "SUPERADMIN":
      return (
        <Badge variant="outline" className="bg-yellow text-gray-800">
          SUPERADMIN
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge variant="outline" className="bg-purple-500/20 text-purple-700">
          ADMIN
        </Badge>
      );
    case "PRODUCER":
      return (
        <Badge variant="outline" className="bg-green text-white">
          PRODUCTOR
        </Badge>
      );
    case "SELLER":
      return (
        <Badge variant="outline" className="bg-orange-500/20 text-black">
          PUNTO DE VENTA
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}
