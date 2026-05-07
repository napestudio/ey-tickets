export const SITE_NAME = "yendo.ar";
export const SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://yendo.ar"
    : "http://localhost:3000/";
export const SITE_DESCRIPTION = "Plataforma de venta de entradas online";
export const CLIENT_ID = process.env.CLIENT_ID;
