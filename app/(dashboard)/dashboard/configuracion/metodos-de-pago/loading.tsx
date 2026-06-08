export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-text-ey-turquoise"></div>
      <span className="ml-4 text-ey-turquoise font-semibold">Cargando...</span>
    </div>
  );
}
