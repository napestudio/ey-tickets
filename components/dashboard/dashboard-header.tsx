"use client";
interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export default function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-5xl">
        {title}
      </h1>
      <p className="text-sm">{subtitle}</p>
    </div>
  );
}
