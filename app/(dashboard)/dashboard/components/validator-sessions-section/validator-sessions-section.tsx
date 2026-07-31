import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getValidatorSessionsByEvent } from "@/lib/actions";
import RevokeSessionButton from "./revoke-session-button";

function formatUserAgent(userAgent: string | null): string {
  if (!userAgent) return "Desconocido";
  if (/iPhone|iPad/.test(userAgent)) return "iOS";
  if (/Android/.test(userAgent)) return "Android";
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Mac OS/.test(userAgent)) return "macOS";
  if (/Linux/.test(userAgent)) return "Linux";
  return "Otro";
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function ValidatorSessionsSection({
  eventId,
}: {
  eventId: string;
}) {
  const sessions = await getValidatorSessionsByEvent(eventId);

  if (sessions.length === 0) return null;

  return (
    <Card className="max-w-[90vw] mt-4">
      <CardHeader>
        <CardTitle>Actividad de validadores</CardTitle>
        <CardDescription>
          Sesiones activas e históricas con dispositivo y cantidad de
          validaciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Token</th>
                <th className="pb-2 pr-4 font-medium">IP</th>
                <th className="pb-2 pr-4 font-medium">Dispositivo</th>
                <th className="pb-2 pr-4 font-medium">Validaciones</th>
                <th className="pb-2 pr-4 font-medium">Última actividad</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const isExpired =
                  !session.isActive || new Date(session.expiresAt) <= new Date();
                return (
                  <tr key={session.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        {session.validatorToken?.notes ?? session.token}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {session.ipAddress ?? "-"}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="space-y-0.5">
                        <p>{formatUserAgent(session.userAgent)}</p>
                        {session.timezone && (
                          <p className="text-xs text-muted-foreground">
                            {session.timezone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-center font-semibold">
                      {session._count?.validationEvents ?? 0}
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      {formatDateTime(session.lastActivityAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {isExpired ? (
                        <Badge variant="secondary">Inactiva</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Activa
                        </Badge>
                      )}
                    </td>
                    <td className="py-3">
                      {!isExpired && (
                        <RevokeSessionButton sessionId={session.id} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
