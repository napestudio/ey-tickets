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

## Verificación de email al registrar una productora

Cuando un usuario se registra como productora en `/registro/productora`:

1. Se crea la productora, el usuario y la membresía en una transacción atómica.
2. Se genera un `VerificationToken` (UUID, 24h de expiración) fuera de la transacción.
3. Se envía un email de verificación al email del owner vía Resend.
4. El usuario puede ingresar al dashboard normalmente sin haber verificado.
5. Mientras la cuenta no esté verificada, el dashboard muestra un banner de aviso.

### Campo `emailVerified` en la sesión

El JWT incluye `emailVerified: Date | null` cargado desde la DB en cada renovación de token. Esto permite mostrar el banner sin queries adicionales por navegación.

### Endpoint de verificación

`GET /api/auth/verify-email?token=<token>`

- Valida el token (existencia y expiración).
- Actualiza `user.emailVerified` con la fecha actual.
- Elimina el `VerificationToken`.
- Redirige a `/dashboard?verification=success`.

### Verificación manual por superadmin

En caso de que el email de verificación no llegue, el superadmin puede validar la cuenta manualmente:

`PATCH /api/superadmin/productoras/:id/verify-email`

- Requiere Bearer token de superadmin.
- Busca el owner (rol `OWNER`) de la productora.
- Setea `emailVerified` en el usuario owner.
- Elimina el `VerificationToken` pendiente si existe.
- Responde `{ success: true, userId, emailVerified }` o `{ alreadyVerified: true }` si ya estaba verificado.
