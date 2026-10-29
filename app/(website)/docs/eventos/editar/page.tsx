import type { Metadata } from "next";
import { DocsPageHeader, ComingSoonNotice } from "../../components/docs-ui";

export const metadata: Metadata = {
  title: "Editar un evento | Documentación | EyTickets",
};

export default function EditarEventoDocsPage() {
  return (
    <>
      <DocsPageHeader title="Editar un evento" />
      <ComingSoonNotice feature="Editar un evento" />
    </>
  );
}
