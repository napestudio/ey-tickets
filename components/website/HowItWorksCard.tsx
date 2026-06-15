import { Paragraph } from "./ui/Paragraph";
import { Title } from "./ui/Title";

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
  isLast,
}: HowItWorksCardProps & { isLast?: boolean }) {
  return (
    <div className="flex items-center gap-10 text-white text-left overflow-hidden relative">
      <div className="flex flex-col gap-3 items-center self-stretch ">
        <div className="pt-3 aspect-square w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center font-black text-4xl lg:text-6xl z-20 relative rounded-full"
        >
          <span>{number}</span>
        </div>
        {!isLast && <div className="w-[3px] bg-ey-turquoise flex-1" />}
      </div>
      <div className="text-lg items-start flex flex-col gap-2 min-h-30">
        <Title as="h4" className="text-xl lg:text-3xl leading-none font-bold">
          {title}
        </Title>
        <Paragraph className="text-xs sm:text-base text-left text-ey-turquoise-dark max-w-lg">
          {text}
        </Paragraph>
      </div>
    </div>
  );
}
