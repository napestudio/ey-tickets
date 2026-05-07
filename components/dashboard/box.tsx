export default function Box({ children }: { children: React.ReactNode }) {
  return <div className="border rounded-lg p-6">{children}</div>;
}
