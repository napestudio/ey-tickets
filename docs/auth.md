# 🛡️ Autenticación con NextAuth + Prisma

## Proveedores

- Google OAuth (GoogleProvider)
- Email/password (CredentialsProvider)

## Adapter

Usamos el PrismaAdapter para manejar usuarios, sesiones y cuentas, **pero** debido a que tenemos lógica de invitaciones y clientes personalizados, en algunos casos tomamos control manual sobre la creación de usuarios.

## Flujo de invitación + creación de usuario

1. Un `superAdmin` invita a un email.
2. El usuario debe aceptar esa invitación previamente.
3. Cuando se loguea con Google:
   - Si el usuario **ya existe**, se permite el login.
   - Si no existe:
     - Se busca la invitación.
     - Se crea el `User` manualmente con su `clientId` asignado.
     - Se crea el `Account` para Google.
     - Se crea la `UserConfiguration`.

> El PrismaAdapter no crea el `User` ni el `Account` en este caso porque lo hacemos manualmente en el callback `signIn`.

## Tabla de configuración (`UserConfiguration`)

- Se crea automáticamente después de crear el usuario (en `signIn`).
- También puede ser creada por `events.linkAccount` si no existía aún.
