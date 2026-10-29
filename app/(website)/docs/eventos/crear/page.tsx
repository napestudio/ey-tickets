import type { Metadata } from "next";
import Link from "next/link";
import {
  DocsPageHeader,
  GuideStep,
  GuideScreenshot,
  ScreenshotPlaceholder,
  DocsNote,
} from "../../components/docs-ui";

const CLOUD = "https://res.cloudinary.com/djpe2etfw/image/upload";

export const metadata: Metadata = {
  title: "Crear un evento | Documentación | EyTickets",
};

export default function CrearEventoDocsPage() {
  return (
    <>
      <DocsPageHeader
        title="Crear un evento"
        description="El asistente de creación te guía en 6 pasos: Datos, Tipo, Fechas, Lugar, Imagen y Pagos."
      />

      <div className="space-y-8">
        <GuideStep number={1} title="Iniciar el asistente">
          <p>
            En el menú lateral del dashboard, abrí <strong>Eventos</strong> y
            hacé clic en el botón <strong>Crear evento</strong>, arriba a la
            derecha del listado.
          </p>
          <GuideScreenshot
            src={`${CLOUD}/docs/eventos-crear/00b-boton-crear-evento.png`}
            width={172}
            height={48}
            alt="Botón 'Crear evento' en el listado de eventos"
            fit="natural"
          />
        </GuideStep>

        <GuideStep number={2} title="Datos del evento">
          <p>Completá:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Título</strong> (mínimo 5 caracteres).
            </li>
            <li>
              <strong>Descripción</strong> del evento.
            </li>
            <li>
              <strong>Categoría</strong> (Música, Teatro, Conferencia, etc.).
            </li>
          </ul>
          <p>
            En <strong>Extras</strong> (opcional) podés agregar texto legal,
            sitio web, restricciones de acceso (ej. &quot;Mayores de 18
            años&quot;) y una edad mínima.
          </p>
          <GuideScreenshot
            src={`${CLOUD}/docs/eventos-crear/01-datos.png`}
            width={1024}
            height={927}
            alt="Paso 1 — Datos del evento"
          />
        </GuideStep>

        <GuideStep number={3} title="Tipo de evento">
          <p>Elegí entre:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Público, con venta</strong>: el evento es visible y se
              puede vender entradas.
            </li>
            <li>
              <strong>Evento privado</strong>: solo accesible mediante un link,
              oculto al público general.
            </li>
          </ul>
          <DocsNote title="No se puede cambiar después">
            El tipo de evento no tiene edición posterior: cambiarlo puede
            generar conflictos con los tipos de entrada ya creados, sobre todo
            si el evento ya tiene entradas emitidas.
          </DocsNote>
          <GuideScreenshot
            src={`${CLOUD}/docs/eventos-crear/02-tipo.png`}
            width={1024}
            height={836}
            alt="Paso 2 — Tipo de evento"
          />
        </GuideStep>

        <GuideStep number={4} title="Fechas">
          <p>
            Agregá una o más fechas y horarios para el evento (podés sumar
            varias funciones con el botón de agregar fecha).
          </p>
          <p>
            Definí también la <strong>fecha de fin de venta</strong> de tickets.
            Por defecto se sugiere la misma fecha de la última función. Esta es
            la fecha general del evento — la configuración individual por tipo
            de ticket se hace después, en el formulario de cada tipo de entrada.
          </p>
          <GuideScreenshot
            src={`${CLOUD}/docs/eventos-crear/03-fechas.png`}
            width={1024}
            height={836}
            alt="Paso 3 — Fechas del evento"
          />
        </GuideStep>

        <GuideStep number={5} title="Lugar">
          <p>
            Seleccioná provincia y ciudad, ingresá la <strong>dirección</strong>{" "}
            y, opcionalmente, el <strong>nombre del lugar</strong> (ej.
            &quot;Teatro Colón&quot;, &quot;Estadio Monumental&quot;).
          </p>
          <GuideScreenshot
            src={`${CLOUD}/docs/eventos-crear/04-lugar.png`}
            width={1024}
            height={836}
            alt="Paso 4 — Ubicación del evento"
          />
        </GuideStep>

        <GuideStep number={6} title="Imagen">
          <p>
            Subí una imagen o flyer (formatos PNG, JPG o WEBP). Se optimiza
            automáticamente al guardarla.
          </p>
          <GuideScreenshot
            src={`${CLOUD}/docs/eventos-crear/05-imagen.png`}
            width={1024}
            height={836}
            alt="Paso 5 — Imagen del evento"
          />
        </GuideStep>

        <GuideStep number={7} title="Métodos de pago">
          <p>
            Seleccioná los métodos de pago habilitados para este evento. Si
            todavía no configuraste ninguno, podés crear uno sin salir del
            asistente (se agrega y se selecciona automáticamente).
          </p>
          <p>
            Hacé clic en <strong>Crear evento</strong> para finalizar.
          </p>
          <GuideScreenshot
            src={`${CLOUD}/docs/eventos-crear/06-pagos.png`}
            width={1024}
            height={836}
            alt="Paso 6 — Métodos de pago"
          />
        </GuideStep>

        <GuideStep number={8} title="Listo">
          <p>
            Vas a ver un mensaje de confirmación con dos opciones:{" "}
            <strong>Crear tipo de entrada</strong> (para definir ya mismo qué se
            vende) o <strong>Ir al evento</strong>.
          </p>
          {/* <ScreenshotPlaceholder label="Diálogo '¡Evento creado!'" /> */}
        </GuideStep>
      </div>

      <div className="mt-10">
        <DocsNote title="El progreso no se guarda automáticamente">
          Si cerrás o recargás la pestaña con datos cargados, vas a ver una
          advertencia del navegador — es la única protección contra pérdida de
          datos. El asistente no guarda borradores entre sesiones, así que
          conviene completarlo de una sola vez.
        </DocsNote>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Siguiente paso:{" "}
        <Link
          href="/docs/eventos/tipos-de-entrada"
          className="font-medium text-ey-turquoise-dark hover:underline"
        >
          crear los tipos de entrada
        </Link>{" "}
        para tu evento.
      </p>
    </>
  );
}
