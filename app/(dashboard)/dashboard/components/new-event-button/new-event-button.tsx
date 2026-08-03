import { Plus } from "lucide-react";
import Link from "next/link";

export default function NewEventButton() {
  return (
    <Link
      href="/dashboard/nuevo-evento"
      className="flex items-center justify-center gap-2 bg-ey-turquoise hover:bg-ey-turquoise-dark transition-colors duration-500 text-neutral-950 font-bold shadow-md py-3 px-5 rounded-md"
    >
      <Plus className="h-4 w-4" /> Crear evento
    </Link>
  );
}
