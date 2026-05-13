-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'SELLER');

-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('MANAGER', 'SELLER', 'VALIDATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'DIGITAL');

-- CreateEnum
CREATE TYPE "GlobalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CONCLUDED', 'DELETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "TicketTypes" AS ENUM ('NORMAL', 'ABONO', 'PROMO', 'DESCUENTO', 'COMPRA_X_OBTEN_Y');

-- CreateEnum
CREATE TYPE "TicketTypeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ENDED', 'DELETED', 'SOLDOUT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ACTIVE', 'PAID', 'PENDING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TicketOrderStatus" AS ENUM ('VALIDATED', 'NOT_VALIDATED');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('DESCUENTO', 'COMPRA_X_OBTEN_Y');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_configurations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventSoldOutNotification" BOOLEAN NOT NULL DEFAULT false,
    "ticketTypeSoldOutNotification" BOOLEAN NOT NULL DEFAULT false,
    "eventToBeSoldOutNotification" BOOLEAN NOT NULL DEFAULT false,
    "ticketTypePublishedNotification" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'SELLER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer_configurations" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "serviceCharge" INTEGER DEFAULT 0,
    "maxValidatorsPerEvent" INTEGER DEFAULT 1,
    "maxInvitesPerEvent" INTEGER DEFAULT 0,
    "maxTicketsPerEvent" INTEGER DEFAULT 0,

    CONSTRAINT "producer_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'SELLER',
    "inviterId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "image" TEXT,
    "dates" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "GlobalStatus" NOT NULL,
    "producerId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "role" "EventRole" NOT NULL DEFAULT 'SELLER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_types" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "time" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0,
    "limit" INTEGER,
    "buyGet" INTEGER,
    "eventId" TEXT NOT NULL,
    "status" "TicketTypeStatus" NOT NULL,
    "type" "TicketTypes" NOT NULL,
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "dates" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ticket_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "lastName" TEXT,
    "dni" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "totalPrice" DECIMAL(10,2),
    "hasPromo" BOOLEAN NOT NULL DEFAULT false,
    "hasCode" BOOLEAN NOT NULL DEFAULT false,
    "discountCode" TEXT DEFAULT '',
    "status" "OrderStatus" NOT NULL,
    "ticketTypeId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isInvitation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_orders" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "lastName" TEXT,
    "dni" TEXT,
    "email" TEXT,
    "base64Qr" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "TicketOrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" SERIAL,
    "ticketTypeId" TEXT,
    "isInvitation" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ticket_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validator_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "eventId" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "validator_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_codes" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "ticketTypeId" TEXT,
    "code" TEXT NOT NULL,
    "discount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "GlobalStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "discount" DECIMAL(10,2),
    "limit" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT,
    "ticketTypeId" TEXT,
    "status" "PromotionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "name" TEXT,
    "producerId" TEXT NOT NULL,
    "userId" TEXT,
    "creatorId" TEXT NOT NULL,
    "apiKey" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_payments" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,

    CONSTRAINT "event_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_token_key" ON "VerificationToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_configurations_userId_key" ON "user_configurations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "producers_slug_key" ON "producers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "producers_email_key" ON "producers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "producer_members_userId_key" ON "producer_members"("userId");

-- CreateIndex
CREATE INDEX "producer_members_producerId_idx" ON "producer_members"("producerId");

-- CreateIndex
CREATE UNIQUE INDEX "producer_configurations_producerId_key" ON "producer_configurations"("producerId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_producerId_idx" ON "events"("producerId");

-- CreateIndex
CREATE INDEX "event_members_eventId_idx" ON "event_members"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "event_members_userId_eventId_key" ON "event_members"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "validator_tokens_token_key" ON "validator_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "event_payments_eventId_paymentMethodId_key" ON "event_payments"("eventId", "paymentMethodId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_configurations" ADD CONSTRAINT "user_configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_members" ADD CONSTRAINT "producer_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_members" ADD CONSTRAINT "producer_members_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_configurations" ADD CONSTRAINT "producer_configurations_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_members" ADD CONSTRAINT "event_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_members" ADD CONSTRAINT "event_members_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validator_tokens" ADD CONSTRAINT "validator_tokens_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_payments" ADD CONSTRAINT "event_payments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_payments" ADD CONSTRAINT "event_payments_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
