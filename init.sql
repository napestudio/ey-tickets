-- Conectar a la base de datos creada por Docker
\c ticketera;

-- Dar permisos totales al usuario postgres sobre el esquema public
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
