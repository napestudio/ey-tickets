interface HowItWorksCardProps {
  number: number;
  title: string;
  text: string;
  iconUrl?: string | null;
}

export default function HowItWorksCard({
  number,
  title,
  text,
  iconUrl,
}: HowItWorksCardProps) {
  return (
    <div className="flex items-end text-center gap-4 p-6 text-white">
      <div className="text-8xl leading-none font-bold text-transparent [text-stroke:2px_white] [-webkit-text-stroke:2px_#fff]">
        <span>{number}</span>
        <span className="font-thin text-9xl">.</span>
      </div>
      <div className="text-lg items-start flex flex-col gap-2 pb-3">
        <div className="leading-none font-bold">{title}</div>
        <div className="leading-none text-left">{text}</div>
      </div>
      {iconUrl && (
        <img src={iconUrl} alt={`${title} icon`} className="w-16 h-16 mt-4" />
      )}
    </div>
  );
}
