import Image from "next/image";

type EventProducerInfoProps = {
  name: string;
  logo: string | null;
};

export default function EventProducerInfo({
  name,
  logo,
}: EventProducerInfoProps) {
  return (
    <div className="w-200 max-w-[90vw] mx-auto px-6 md:px-10 pb-6">
      <div className="flex items-center gap-3">
        {logo ? (
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/20">
            <Image src={logo} alt={name} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold uppercase text-white">
            {name.charAt(0)}
          </div>
        )}
        <p className="text-sm text-neutral-400">
          Producido por{" "}
          <span className="font-semibold text-white">{name}</span>
        </p>
      </div>
    </div>
  );
}
