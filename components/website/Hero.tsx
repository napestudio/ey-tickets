export default function WebsiteHero() {
  return (
    <div className="h-svh bg-linear-to-b from-ey-dark to-ey-turquoise-darker to-80%">
      <div className="container mx-auto text-white  h-full">
        <div className="grid md:grid-cols-12 h-full">
          <div className="col-span-6 grid items-center">
            <div>
              <h1 className="text-8xl text-white font-base-neue font-bold">
                EVENTOS
              </h1>
              <p>La manera más facil de gestionar tus eventos.</p>
            </div>
          </div>
          <div className="col-span-6 grid items-center">
            <div className="bg-neutral-400 h-[70%] w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
