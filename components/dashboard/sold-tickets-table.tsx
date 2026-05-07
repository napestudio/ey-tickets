"use client";
import { MoreHorizontal } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useState } from "react";
import Box from "./box";
import { TicketOrderTableProps, TicketOrderType } from "@/types/tickets";
import { format } from "date-fns";
import { Input } from "../ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { downloadPdfFile, getTicketOrderById, setQrCode } from "@/lib/actions";

import { jsPDF } from "jspdf";
import { es } from "date-fns/locale";
import { EventoWithTicketsType } from "@/types/event";
import { slugify } from "@/lib/utils";
import ExportEventAsPDF from "../data-pdf";

export default function SoldTicketsTable({
  tickets,
  evento,
}: {
  tickets: TicketOrderTableProps[];
  evento: EventoWithTicketsType;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyInvitations, setShowOnlyInvitations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  // Add this function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredEvents = tickets
    .filter(
      (event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.order?.ticketType
          ?.title!.toLowerCase()
          .includes(searchQuery.toLowerCase())
    )
    .filter((event) => (showOnlyInvitations ? event.isInvitation : true));

  // const handleTicketDownload = async (ticketId: string) => {
  const handleTicketDownload = async (ticket: TicketOrderTableProps) => {
    if (!ticket) return;
    const qrCodeBase64 = await setQrCode(ticket.id);

    const fullDate = format(ticket.date, "dd/MM/yyyy HH:mm", { locale: es });

    // Crear PDF
    const doc = new jsPDF();
    doc.addImage(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAxcAAAB+CAYAAABWM+wzAAAACXBIWXMAAAsSAAALEgHS3X78AAAWUElEQVR4nO3dS44lNRbG8cgGxsAyelZSqydsgB30OtgBqh3UdtgAk54w62VAjRHcVmSVsyIj4+HHOcfn2P+flGqJhsx7bYfDX/gRT4/HYwEAAEOxuLk/0WQA7H1NiQAAEFbPJ4Rnf5vQAUxMO1xYdnrROzOtsiopF6axdNW0Uc06GW0AIFVWkuUy4jXFwLGfKO1p/zlpM8BEmLkA5vXgpo8KdwNc2pSsEQIqYQOYyEjhIvJAycOsBeZEwIA0BpLtRp9FTt+PtgEMSDtcPBl3khEHSgQL9EbAgCbCRp4Zl6VuvzPtAhjEPwy+Bh0G4B/7bWDlsfkBZZFQDsAgLMKFtUidE7MWAGY284CSwfQxygUIzipcWA92I3RMBAt4ww0dvcw0oGTwnIdyAoKq3nPx9NNvxRf948O7KdvJUVn1KIu7Opu1fnpyWCcu91/k9DdcU0MYfaMvg+VybP4GgqmeuXh8eOf9QnfbiSsOOOh8IYEBEHob7ak1T+HbUX5AEKZ7Lp5++s26VLp3RjUzPLV/yujvYA7cyOHBCINyriU5lCUQQFO4qJm96BAwuvGyHAqoxI0cXkRsi8xW6KBcAeeaZy5YHpWP5VAIiJs4vOAkQFDGQACXG7r/+PGbvIv3n/8t+qbr7IXxE3yTTarb8vq+sEwavHyv2/qy+0w4cFg/MerE/Pp5o1M5cU25E+GFjwx67fACUMAhkT0Xv//v38X/zWjLo+4GISyHAgARnpfFECzsUeaAM2IbumsChjG1DmgfLPazFiyHwgC4gcMbN23y8/46rpF+KHvAkctw8d0vf6oOXkfc3N1jORRghBs4vHFxIiAz0y7QPwFO3M5clASMAMujxDsflkNhMtzAgc+hgmDhDv0T4ID4ey5mXh7FcihMghs4PDFvj+mYcYKFS/RPQGfPp0U9fv3q8mL89udl+fhe7317HU6PapLKa1sm1suhjuvM9J2ImFv1KS3n/Y2P9vv683FNBWF2apDhi1FRj1OkbLVeE9SVrZL6qqqbl6Non3746/IXfPdL/tG06+xF6WDbOGA0DYzWsvKwHOptnWUeHQzIqL6OjvsbH+339WfjmgpEfUC5DRbMWmACVv3f3d8hfNRrrcOj//62Pp4fy60307vZi1IjLo9KwWL/z9nEjYkx+IYnau2RYBEOfVO+x8mP188XwVmZlvxIlJmG27p4mfPPCRicHvXJ3cvylG48BAsAMLb29yyFCot6OxZxsL4V+bNrsy6Xw7ooXlA86+lRnpZDAc7QwcMTsfa49veGB3UAWqKHiSsEjU88lMHLZ3gVLlgeVYblUMCL2Tt2DIZgMYxZ+6YZB92zhgxv3/nxZuaC5VFvdZ61IFggCgIGvGhqi0fBAgiAp/ifzFQGLr9n9TmLsyyPOgsWPNECDs1+U0NwZw+R6ONDm6Ffou99a/Qycfv9vj76h2n24u542hI1x9Mayz7GkOVQ16JszJf0+PDu8JrJPb55MJwxL8z7NeV04F3cDtP1OsKshUWbIXAhgHQPHu2e5HpscRgulsyAsc5eaA6eer9cj+VQQDUCxkTOBrKRBp9XwcL79+gVPo/+ruOyok+am2j9350gJ3QdvPnM69+N0K+ehotcJQEj0sv1ct9pwZMb4BQ388ntB58d+susNhhthtHzTJaDOgfOhL0npTAT5Xq6DBcsj7p/p4USBmQAhpMGnp5ukJ3eW1Qs6nLT7ed2UJZDPfDgxY5VwrWBiO/ZuZ25mHF5FMuhADHMXuAN45Bx2gY7PTzKNtr+NY/hMhpe6CgizH0paoBsXhaVjLQ86umHv978M5ZDAdUIGDjUa7C5PkD6+L76sER1ox+KQcgoY7S+fzbclxRlhYsZl0exHKpegBcnVtF+v8vg6MgbWF5TPfply4dHX+5l93289aCtNlRItQ/ruu8UMuiLkIRpC9ECZPbMxWzLo7775c81YBz+fyyHAqpwUw/gbqCqNQC17N89buC+CxYWAfPqb2gGD2Yy0FHWssk3eMnmJbFlUclIy6PWgGE0Pc2AC7NgvXBwRwNQqYGnYv/+PIDwuBzq7B7jbQZ4/3k0wkbv4+cxLdcPviJeE0W9bJq9uPv3tN/e3RMdH9DmaE8TYlv78fTT3D6UHujkHi9uaf9dJctRm9ZnnfElrGfWB7WTvogVwRU/wskNGJosO59tmGA5FCCGG+agJAacGn18zgmAW9oPktJ3jBQozkh/B4N7vNv+JwUKQoU5l+Ud9YG22vyw9uxFr4AhjGABYEgRBsy9Zi3W+1f0QHHG+wyWVwQKjKRqz0Xu6VHa+y8ssRwqX+RTlaRPRcN1cROw82hdUxaDmdq+XWH9vYuB23pQyO8F/75G3VvV+9IY4NiDAWOPx69fbf6i3+Oqvave0K1xPG3xZ4jd8Yw8qAr79OXzfoCqz7/5b93VreNrhYDR0dXAVXIA6v3hkZWzEwgX44cyZ39LI3S0hgwCBiy9HtMyk1RLPZaNtDxKEIMp4As6cIfWvnv70/oJvfXv1mFnHyyky1eC5mdqWSrFJm8Y4n4koClccHoUEIfzGzQdunMSg84o/bvWk3JvYeKO9Od1Vv8u+px1DNX7kBxAWvN7LlgeVYxZC3Tj+Vq5enElfEmDzZplNJMukVoH6M2/5GgQanXv3QaMluVTjvbgdJXq8kv9xV2C0/LgiiVvYxJ/id6ZkV6u14Bgge4IGPFIP9mUGpDWhoySPn70Nfcldbuvt5Kn3pIhpCVcLpPvwXkbKvzTnPW++t0dr3v2AjYSCRcznh4FREbAiEVyIHI2IG35GyV9uwfG95aXcpUu95L/VmPWw3oGa5Sg6TlYeFo+u/0szHDIyK3f1vIWm7lgedQtUjBc4RSWOZ310dvBZ00/XhowZnmA1FquUo7+9j5w1H4+ixmsWVmUT4QN8wSNOrV1u//vSsvcbFlUMunyKIIFXPIaMJi9sLcdWNYOiL3PYPRoV66fUh8sszr7/3LU1D8Bo4/IJ3AZ3bdCb7KXrt/ScCd6FC2nRwHxeL3JSGyARZ21L08/pafZRH6JpoJQZdFS70lN/Zfc5zmWtt5aduknulG+hzSjcrm9xsXfc5EbMDQ5a3DcaIFKBIz+toPN3A+TO8Dk4ZFfLSGDgFlGe7Zv5IE4AeML47J4uhrfmi+LSiZZHkUHixC8b/BeuIF0tw0YkU66QZtU16V1zx4cG1f9dulg0yLsa9Qx+we7hqynoyVkKuGC06OAeDx30Ovn4glVf9uBpmT/jrHqPqEN9HHXV/acMdz/balx3cwBY1/fZ/WrOIZ+EzDUZi44PYpZC8RDwEAOD/17LR5StSmdwSJg2DnrHz0vP9x+Nq7Ncmud59bv0b8nWOavAka3ZVHJoMujCBYIi4CBHDkBg4HlmEpnMXLbASsUyvUOFJL74nI6iqv+f7bZi/Xku98bf4dwuHsJGKrhguVRQEysYUUOiRkM+vS4Is9gjUojVHg6WOPsvjTbQyeNI7VT22nsj5/7AvHTot78lflOj6KTxRC8dtaEHgQy/KyNxhH0V7j+31oHhelHwhomtj8RrO2CtiFjbUePD++artfuy6KSQZZHESwAAyyP8uPu6TVLo8bHDEYfpWHiIuBxfQZi9SLQNWA8/fRbVdswCRcsjwL6qr1e2H8BIAd7cOzkhIqMmSLqIaA1WNzVreQ1Vhsw1JdFJRMsj+KJDVyrnTL3PIBnGtwHD/17DqsnfjvTDOK028Hs1/vV0qd1wLn9ufg1D4JFXDnLCwvaQpaaJVJm4SJXSUHUDJaUBkoEC4RAwACAPmqXjp2FisIBJKEivqqxpkTQKA0YpuFCY+OX5/ObAY8IGNCg9dR6kLpl9uIzqY3ds9j31xUDRUIFXrSEjJKAYb6he8CX69FR7oy8Dv7q4oq0oXHEPRiAFNq5P7PXR86AcBvqnn74S/0zIa61Pa3t5eP7sjmG3IDh5rSoPTZ3A7oIGLDCRt5nj1keRkk/RFTqb0LUxVmoOJod2pT37NfacB6/frVc1WvttabVN3cJF5weBcRGwICUq357wDY2TcCowT38i6NQsZuZ4FjZiVyNl9d2kdk2DmkEjG4zF5yLDfRHKMdsaPM2pO7xsz3E2IeKwkEjwWJC+3aR2kzJtScdMNwui0qYvQB0sTwKUiQfGg3ctpi9yDRT/7INFZVPobsFC2/7LGe/L6U2UxoyJANG13DB8ijABwIGRlf6jgvltk3A2Nn3PzMGi5onzusLzqzKipeWdlPVV9SEDKmA0X3mguVRgA8EDGgpvVlN0p4IGCcM6t9VudeGisWgrAgU8W1DRm7AaP3S7pdFJZw2Ekf0d4/MfA47AQOWjtraZO0o3dOm6XOO7uPbdjBT/deEisUgWBAoxmT5MN/FG7o1Xq4HoM6IL9lDDBMH1GkfnKVgsdb9LPWfTvdZxz61wULD2ofTj49N62Wney7CxWL4hQHo4caEXJZr7Ev3WyTG7XnaNykbh4quDylrQ8WyCxbSZTZK380M+j2L8XaYZVEJy6OAcqXXDQcjwJL1gMB5+x52L8a+D/rulz+nSlMty1G0ZyxKWC595j6kQztguAoXGqdHAai7bth/AS3bpTA4NPRejDVUIJ9msDjiad/k0Wc5uy/Rn5TR3HvhZllUwvIoQE/pviX2X6DVWaC1GgjULolKOrflxyjLpdZ2sIaKzsEiVFhby+woWEhfO2s/v/2JiGDhS7hlUfAvwsb7mY8/ZgYDvaSBJU+PqmyLLVLf9fy5ma0os/bRLAm6xz3GJ3czFwuzF4A6ZjCg4Si0p6fV3gaXJW3aYTv2PqPx/NmefvjLwUeJZQ0VLPs+N+uxxdG4DBcLAQNwh4CBO58Hkw8vg9/WJVFB7Mvbusx7//1c7md7tqHCctYi2qzSTMcWR8WyKGBSNQcjsERqalM/7AnWhq/qqmaQzYM+Zb1nK9aAsYbxXsua774/SypjcR0uLN8mCFHur//NE1bV37l9IuTxKarlyWsEjCbcU8s93ZXbpEcuz9iWXI8h9n1wrzb5+X7V5SjkbahJ5cE+nbjcLosCYMNq/wUQHUv8QuLhZLley9ye/57HPVooQ7gAwAZvjCa7PROW0cu6MiPI5u2jfTU14UPq98A5wgWAZwQMjEZj/TjtNxS3sxZrsPj4/u0QLOgyvbvQQHiYDOECmEDuyWsEDAxAfUBJ+8VO7uD6+Ye9pBgd4QKYgObRzgQMOFI1YGNp1JC0B+/VT+Q1DhQBPCFcAJPIDRg1S0kIGPBK62hN2q5rmsFCbIkPG5cxKsIFMBHNgFGLQRqENLXZmoBM23VJO1iII2BgNIQLAIc4ohaBiCz7I2DgguoyJgIGRkK4ACZTsv+CDd4I4LaNas/E0X7d0Kpnk/0RuQGD9naOsvGBcAFMiICBQYgPJmm/YXH60uTSNci12B/hApgUAQPBvWqTd+25pA3TfsPReJ/JY/2xPtXp8eGd5Z8DVBAugIkRMBCU26fUtF9zom1hEyp8f2na2SuUhy+EC2ByvAMDwVQPJi1mLxbaryXxYOH+G+MNrjd/CBcAeAcGorhsfzntmIAxjOmDBW0MXhEuADzjHRhwrstSKAKGO08ECyRcYz4RLgAU4x0YMFQ0mJSevVgEAgYDIDEqG7f7fZ12M7ctriu/CBcAXrDBG46IP6Hesg7ItOMmKm3hjx+/cRksStvajG2L68k3wgWAVwgYcKBpIKl1SIFEwKAtF1MJFV6DRa1Z2tUfP36T9V25zvoiXAB4g4CBHj7XsdneCssDCrYIGfe02sI2VHz/z/9K//quRm9Ta7BADIQLAIc4ohZW0mD78eGd2GDS4wloe7TntzTaQhJptoI+8jWCRSyECwCnOKIWWtIgMtWnxmAySsBgJuN1qPAULKzrRWIQPVJbWstjXyYcEOIf4QLAJQIGpBwNpLUGk6Vq26/kQGfGkKEdMJdgMxZbM59Stn52Zivi+nr2AgAgZx2gjbZREvXuBjcWoSKF4/V/7/7d2va7DgIl1+/vwpfY7/XiqF1otYVPD0banqN+nlER+0xnjgbTrW1rE9ykP66KNHv1+//+zX0kMMIFgFuaA7Tam6fVDR/3Sp+QrnVu+jJGo4CxKGwSHiVonLURzYC51vnH9zILNLT7m6un9BLh1Xs70p69gq2nx8N3ODy7IVx1/pKdu9eGflQudzfE0U7G8OR5aUfHOrFqp7kDtKViKYJF+7wqJ64pfWkAbhkstjTb75ZVu/AcNu4Cp2bATMs417qWHitolHnu8h+NdtWzDe3byLZ/tuh709/rOc4cNUwxcwEgm8cZDPi3XTveK1iUalnipzWLsXeyvEj1b+Z+jisWM1c5fVRNnyO9zKhkX4FGH3kwwBf9/Vd/a/d3mbEYCOECQBECBnJtQ8W3P/+dNeDTVNJ2F4E9RFYhY8vrJl6rgFlSvy0aQ8b28xW1L+0+0rr9/P2ff3XvFyCPcAGgWOkgrQQBI7ajE248BIukJmAsjcukeoQML/btYYRgsVU6GN8/oa8JsKO0p0/LiY/DFYeDxMZRtACqRHiHAPSl41iPjmVd695TsEhqXhApMSg+K6cR7b/n2g48LomzrIuzpT+15RK1La2fuXUZFPcI35i5AFAt9ykwT6HGUHJDX+u8x5PkXDWzbxKzGMm2LEeZ0ThrHxYBs6WtWcyW3g2mI+zxadX7QAfYIVwAMMH+C/8kngamUOE5WCTbGYzSkCEZlqMGjbv24j1gbmn2N2enCe5J7fFZHLUjy2Vx8GPIo2hLRWzsNcdmos1dO9GuE8/t1OqIzxy15cQ1VW9b5lEGk3u1n9uijXgdKJ5J7cGyLUiNFaTL+u640yPSbcq6/ZTuu9Ic5+XcD7THmTMGKmYuADSzeEkZ/NmHiqVwBsCT2kMKJJdKnbka1EsOHFtnrrahYnHSFmpmTBeBct0vg+rZR2q1n9z24nHfFXQRLgCIIGDM4egpXNTZir3aZVLLrlws27aHja0jzFzt7cv1bhCes5+gtI9cDNqSZvuJtCwOsggXAMQQMMZzNViKPltxJH2XlkGR1cCwp3278NwWJPqaXiEuYlvqsSwOvhAuAIjSfAcG9OWuUV4GCxV7LbMYSa/ZDC1ns1ZLgLZg8TAj59rxvPyu1YgzWKhDuAAgjiNq/ZHYVDhDqNjazmIsjd97X/4R2n3NIRaeafY3JddXxOV3ZzRnsLg/xBX2tKhev8cLngroaClXiToZqV41v4vG7+aaOrZ92dzs5aMdrnoPpEpmrRaH7SH3GvZ0ip9kv2PVfs6+c+13aS2D3v+9xGcYDTMXAFSwPCouAsWx/UzGIlw+dwPV1sFjy0B4pFkriSVGUicgSSy/S67qt+a75raX2WY0cY9wAUANASOG7WB5YZBwa1s+lgMr6/Pyo4XM0v7mqDzPBuGa+wkkl9+d0Wg7hAqcIVwAUEXA8GMfIhLqpt7RbMYSuExnn7Xq+cIzi5DRSqN9cI8YT4hwcXZDnB3l4g91cmw79e/Z6PXHzVvPvmyjhI3RZq0klxkdsRgEewusVoGzZ//LvVuW+w3dAABEdzR4sRwszjhrJRkEPMwmWIUNlkmiFeECAIAOLJ+WzjpAbHnq7n2JmFb7IUygFeECAAAMr3QwziAbqEO4AAAAANBuWZb/A3Q6aoJCVSM4AAAAAElFTkSuQmCC",
      "PNG",
      20,
      10,
      50,
      10
    );
    // Texto principal
    doc.setFontSize(12);
    doc.text(`N.: ${String(ticket.code).padStart(5, "0") || "-"}`, 20, 30);
    doc.setFontSize(18);
    doc.text(`${evento.title || "-"}`, 20, 40);

    doc.setFontSize(12);
    doc.text(
      `Comprador: ${ticket.name || "-"} ${ticket.lastName || "-"}`,
      20,
      48
    );
    doc.text(`Tipo de ticket: ${ticket.ticketType?.title || "-"}`, 20, 53);
    doc.text(`Fecha:  ${fullDate}hs`, 20, 58);
    doc.text(`Dirección: ${evento.address || "-"}`, 20, 63);
    doc.text(`Lugar: ${evento.address || "-"}`, 20, 68);

    // Agregar imagen QR al PDF (posición x: 140, y: 30, tamaño: 50x50)
    doc.addImage(qrCodeBase64, "PNG", 20, 75, 40, 40);
    // Descargar PDF
    doc.save(`ticket-${slugify(evento.title)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {evento.tickets && evento.tickets.length > 0 ? (
        <>
          <div className="flex flex-col items-start gap-2 mb-4">
            <div className="flex gap-2">
              <ExportEventAsPDF
                eventTitle={evento.title}
                ticketsData={evento.tickets as Partial<TicketOrderTableProps>[]}
                quantity={evento.tickets.length}
                type={"ESTADISTICAS"}
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
              />
              <Button
                variant={showOnlyInvitations ? "default" : "outline"}
                onClick={() => setShowOnlyInvitations((prev) => !prev)}
              >
                {showOnlyInvitations ? "Ver todos" : "Ver invitados"}
              </Button>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Comprador</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex items-start flex-col ">
                        <div className="font-bold">
                          {ticket.name} {ticket.lastName}
                        </div>
                        <div className="text-xs">{ticket.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{ticket.dni}</TableCell>
                    <TableCell className="font-medium">
                      {ticket.order?.ticketType?.title}
                    </TableCell>
                    <TableCell className="font-medium">
                      {format(ticket.createdAt!, "dd/MM/yyyy")}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full inline-flex gap-1 items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md cursor-pointer"
                              onClick={() => handleTicketDownload(ticket)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-file-image-icon lucide-file-image w-4 h-4"
                              >
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                <circle cx="10" cy="12" r="2" />
                                <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
                              </svg>{" "}
                              Descargar
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;

                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={pageNumber === currentPage}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  if (pageNumber === 2 && currentPage > 3) {
                    return (
                      <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (
                    pageNumber === totalPages - 1 &&
                    currentPage < totalPages - 2
                  ) {
                    return (
                      <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="flex items-center gap-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : (
        <Box>
          <p className="font-bold text-gray-500">No hay tokens creados.</p>
        </Box>
      )}
    </div>
  );
}
