import { getSession } from "@/lib/auth/get-session";
import NotificationsForm from "../../components/notifications-form/notifications-form";
import { getAllUserConfiguration } from "@/lib/actions";
import { UserConfiguration } from "@/types/user-configuration";

export default async function Notificaciones() {
  const session = await getSession();
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
