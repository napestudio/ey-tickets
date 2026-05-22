import {Button} from "../ui/Button";
import {Card} from "../ui/Card";
import { Paragraph } from "../ui/Paragraph";

export default function WebsiteHero() {
  const handleCL = () => {
    console.log("Comenzar button clicked");
  };

  return (
    <div className="h-svh bg-linear-to-b from-ey-dark to-ey-turquoise-darker to-80%">
      <div className="container mx-auto text-white  h-full">
        <div className="grid md:grid-cols-12 h-full">
          <div className="col-span-6 grid items-center">
            <div>
              <h1 className="text-8xl text-white font-base-neue font-bold">
                EVENTOS
              </h1>
              <Paragraph
                size="sm"
                weight="normal"
                className="mt-4 letter-spacing-wide"
              >
                La manera más facil de gestionar tus eventos.
              </Paragraph>
            </div>
          </div>
          <div className="col-span-6 grid items-center">
            <div className="h-[70%] w-full">
              <Card className="h-full w-full flex flex-col items-center justify-center gap-6">
                <Button variant="primary" size="md" className="mt-8">
                  Comenzar
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
