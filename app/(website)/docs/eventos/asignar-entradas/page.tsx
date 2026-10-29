import type { Metadata } from "next";
import { DocsPageHeader, ComingSoonNotice } from "../../components/docs-ui";

export const metadata: Metadata = {
  title: "Asignar y ajustar stock de entradas | Documentación | EyTickets",
};

export default function AsignarEntradasDocsPage() {
  return (
    <>
      <DocsPageHeader title="Asignar y ajustar stock de entradas" />
      <ComingSoonNotice feature="Asignar y ajustar stock de entradas" />
    </>
  );
}
