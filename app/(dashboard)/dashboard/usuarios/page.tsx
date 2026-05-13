import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { InviteUserDialog } from "@/components/dashboard/invite-user-dialog";
import StatsCards from "@/components/dashboard/stats-cards";
import UserInvitationsTable from "@/components/dashboard/user-invitations-table";

import UsersTable from "@/components/dashboard/users-table";
import { Button } from "@/components/ui/button";
import {
  getAllUsersByClientId,
  getPendingInvitationsByUser,
} from "@/lib/actions";

import { User } from "@/types/user";

import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  if (session.user.type === "SELLER") redirect("/dashboard");
  const accounts = await getAllUsersByClientId(session.user.clientId!);

  const userId = session.user.id;
  const clientId = session.user.clientId;
  const invitations = await getPendingInvitationsByUser(userId);
  if (!clientId) return;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-5">
        <DashboardHeader
          title="Usuarios"
          subtitle="Administra los usuarios de la plataforma"
        />
      </div>
      <div className="w-full space-y-5">
        {/* <StatsCards /> */}
        <InviteUserDialog
          invitations={invitations}
          userId={userId}
          clientId={clientId}
          session={session}
        >
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Invitar Usuario
          </Button>
        </InviteUserDialog>
        <div className="max-w-[95vw] space-y-10">
          {accounts && (
            <UsersTable accounts={accounts as User[]} session={session} />
          )}
          {invitations.length > 0 && (
            <UserInvitationsTable invitations={invitations} />
          )}
        </div>
      </div>
    </div>
  );
}
