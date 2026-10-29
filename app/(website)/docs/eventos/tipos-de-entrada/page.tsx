import type { Metadata } from "next";
import { DocsPageHeader, ComingSoonNotice } from "../../components/docs-ui";

export const metadata: Metadata = {
  title: "Crear tipos de entrada | Documentación | EyTickets",
};

export default function TiposDeEntradaDocsPage() {
  return (
    <>
      <DocsPageHeader title="Crear tipos de entrada" />
      <ComingSoonNotice feature="Crear tipos de entrada" />
    </>
  );
}
