export const SITE_NAME = "EyTickets";
export const SITE_PROD_URL = "https://eytickets.ar";
export const SITE_URL =
  process.env.NODE_ENV === "production"
    ? SITE_PROD_URL
    : "http://localhost:3000/";

export const SITE_DESCRIPTION = "Plataforma de venta de entradas online";

export const WELCOME_TICKET_PACKAGE_QUANTITY = 30;
