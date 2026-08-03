import { getSession } from "@/lib/auth/get-session";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { InviteUserDialog } from "@/components/dashboard/invite-user-dialog";
import UserInvitationsTable from "@/components/dashboard/user-invitations-table";

import UsersTable from "@/components/dashboard/users-table";
import {
  getAllUsersByProducerId,
  getPendingInvitationsByUser,
} from "@/lib/actions";

import { User } from "@/types/user";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) return;

  const { id: userId, role, producerId } = session.user;

  if (role !== "SUPERADMIN" && !producerId) return;

  const accounts = await getAllUsersByProducerId(producerId!);
  const invitations = await getPendingInvitationsByUser(userId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-5">
        <DashboardHeader
          title="Usuarios"
          subtitle="Administra los usuarios de la plataforma"
        />
      </div>
      <div className="w-full space-y-5">
        <InviteUserDialog
          invitations={invitations}
          userId={userId}
          producerId={producerId!}
          session={session}
        />
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
