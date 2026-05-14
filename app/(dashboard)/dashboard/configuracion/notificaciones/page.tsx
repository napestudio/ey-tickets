import { getServerSession } from "next-auth";
import NotificationsForm from "../../components/notifications-form/notifications-form";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getAllUserConfiguration } from "@/lib/actions";
import { UserConfiguration } from "@/types/user-configuration";

export default async function Notificaciones() {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const id = session.user.id;
  const userConfiguration = (await getAllUserConfiguration(id)) || [];
  return (
    <div>
      <h2 className="text-lg font-medium">Notificaciones</h2>
      <p className="text-sm text-muted-foreground">
        Elegí que notificaciones recibir en tu e-mail.
      </p>
      <NotificationsForm
        configuration={userConfiguration as UserConfiguration[]}
        userId={id}
      />
    </div>
  );
}
