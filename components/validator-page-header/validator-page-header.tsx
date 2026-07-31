"use client";

type Props = {
  eventTitle: string;
  validated: number;
  total: number;
};

export default function ValidatorsPageHeader({
  eventTitle,
  validated,
  total,
}: Props) {
  const notValidated = total - validated;

  return (
    <div className="py-10">
      <div>
        {eventTitle && (
          <h1 className="text-3xl font-bold mb-4 uppercase">{eventTitle}</h1>
        )}
        <div className="pl-2">
          <ul className="space-y-1">
            <li>
              <span className="font-bold">Entradas vendidas:</span> {total}
            </li>
            <li>
              <span className="font-bold">Entradas validadas:</span> {validated}
            </li>
            <li>
              <span className="font-bold">Entradas no validadas:</span>{" "}
              {notValidated}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
