import type { Metadata } from "next";
import { DocsPageHeader, ComingSoonNotice } from "../../components/docs-ui";

export const metadata: Metadata = {
  title: "Eliminar un evento | Documentación | EyTickets",
};

export default function EliminarEventoDocsPage() {
  return (
    <>
      <DocsPageHeader title="Eliminar un evento" />
      <ComingSoonNotice feature="Eliminar un evento" />
    </>
  );
}
