"use client";
import { Badge } from "@/components/ui/badge";
import { OrganizationRole } from "@/types/user";

interface RoleBadgeProps {
  role: OrganizationRole | string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  switch (role) {
    case "OWNER":
      return (
        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-800">
          OWNER
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge variant="outline" className="bg-purple-500/20 text-purple-700">
          ADMIN
        </Badge>
      );
    case "MANAGER":
      return (
        <Badge variant="outline" className="bg-blue-500/20 text-blue-700">
          MANAGER
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
