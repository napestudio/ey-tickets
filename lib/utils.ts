import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const groupDatesByMonth = (dates: { id: number; date: string }[]) => {
  const months: { [key: string]: number[] } = {};
  dates.forEach((d) => {
    const date = new Date(d.date);
    const month = date.toLocaleString("es-ES", { month: "long" });
    if (!months[month]) {
      months[month] = [];
    }
    months[month].push(date.getDate());
  });
  return months;
};

export const formatDatesByMonth = (months: { [key: string]: number[] }) => {
  return Object.entries(months)
    .map(([month, days]) => {
      if (days.length === 1) {
        return `${days[0]} de ${month}`;
      } else {
        return `${days.join(", ").replace(/, (?=[^,]*$)/, " y ")} de ${month}`;
      }
    })
    .join(", ");
};

export const datesFormater = (dates: string) => {
  const parsedDates = JSON.parse(dates);
  const groupedMonths = groupDatesByMonth(parsedDates);
  const groupedDates = formatDatesByMonth(groupedMonths);
  return groupedDates;
};

export const isExpired = (date: Date) => {
  return new Date(date) < new Date();
};

export function slugify(text: string): string {
  return text
    .toLowerCase() // convierte a minúsculas
    .normalize("NFD") // separa letras acentuadas en base + tilde
    .replace(/[\u0300-\u036f]/g, "") // remueve los tildes
    .replace(/[^a-z0-9\s-]/g, "") // elimina caracteres no válidos
    .trim() // remueve espacios al principio y al final
    .replace(/\s+/g, "-"); // reemplaza espacios por guiones
}
