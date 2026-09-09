import { getSession } from "@/lib/auth/get-session";
import { redirect, notFound } from "next/navigation";
import { getVenueById } from "@/lib/api/venues";
import { VenueEditorShell } from "./components/venue-editor-shell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VenueEditPage({ params }: Props) {
  const session = await getSession();
  if (!session?.user?.producerId) redirect("/dashboard");

  const { id } = await params;
  const venue = await getVenueById(id);

  if (!venue || venue.producerId !== session.user.producerId) notFound();

  return <VenueEditorShell venue={venue} />;
}
