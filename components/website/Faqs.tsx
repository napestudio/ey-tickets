
import FaqButton from "./FaqButton";

export const faqs: any[] = [
  {
    question: "¿Cómo abono el servicio?",
    answer: "Para abonar el servicio, puedes utilizar cualquiera de nuestros métodos de pago disponibles en la sección de pagos.",
  },
  {
    question: "¿Cómo cobro cuando vendo?",
    answer: "Para cobrar cuando vendas, debes asegurarte de que tu cuenta esté configurada correctamente y de que hayas proporcionado toda la información necesaria para el pago.",
  },
  {
    question: "¿Cómo escaneo los qrs?",
    answer: "Para escanear los códigos QR, puedes utilizar la cámara de tu dispositivo móvil y una aplicación de escaneo de códigos QR.",
  },
  {
    question: "¿Puedo agregar personas que trabajan conmigo?",
    answer: "Si, puedes agregar personas a tu cuenta desde la sección de configuración de usuarios.",
  },
  {
    question: "¿Tienen una página con todos los eventos?",
    answer: "Sí, puedes encontrar todos los eventos en nuestra sección de eventos.",
  },
];

export default function Faqs() {
  return (
    <div className="container mx-auto py-20">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-10 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase">
            <span className="text-primary">Preguntas</span> Frecuentes
          </h2>
          <p className="text-white text-balance">
            No te quedes con la duda. Hablá con nosotros que respondemos rápido
            y estamos de lunes a lunes.
          </p>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-36 w-36"
          >
            <path
              d="M8.00067 1.33398C11.6825 1.33398 14.6673 4.31875 14.6673 8.00065C14.6673 11.6825 11.6825 14.6673 8.00067 14.6673C6.77807 14.6673 5.63234 14.3382 4.64724 13.7638L1.33677 14.6673L2.23808 11.355C1.66329 10.3697 1.33398 9.22365 1.33398 8.00065C1.33398 4.31875 4.31875 1.33398 8.00067 1.33398ZM5.59488 4.87287C5.50862 4.87893 5.42404 4.9 5.34704 4.93939C5.28928 4.96894 5.23565 5.01166 5.15139 5.09122C5.07182 5.16635 5.02571 5.23196 4.97712 5.29522C4.73066 5.61612 4.59819 6.01002 4.60065 6.41464C4.60199 6.74172 4.68695 7.05958 4.82112 7.35638C5.09321 7.95825 5.54192 8.59452 6.13462 9.18458C6.277 9.32632 6.41648 9.46958 6.56689 9.60198C7.30253 10.2497 8.1792 10.7168 9.12713 10.9661C9.12713 10.9661 9.50046 11.0235 9.50593 11.0238C9.6296 11.0305 9.75306 11.0215 9.87686 11.0152C10.0711 11.0052 10.2607 10.9526 10.4323 10.8612C10.5426 10.8025 10.5948 10.7733 10.6874 10.7149C10.6874 10.7149 10.7158 10.6957 10.7706 10.6549C10.8606 10.5879 10.9162 10.5407 10.9911 10.4629C11.0463 10.4056 11.0937 10.3379 11.1304 10.2615C11.1825 10.1527 11.235 9.94505 11.2559 9.77258C11.2718 9.64085 11.267 9.56885 11.2653 9.52425C11.2624 9.45252 11.2031 9.37872 11.1382 9.34738L10.7505 9.17312C10.7505 9.17312 10.1709 8.92085 9.81633 8.75912C9.7794 8.74225 9.739 8.73445 9.6984 8.73198C9.60946 8.72652 9.5098 8.74972 9.4464 8.81652C9.44306 8.81518 9.39893 8.85332 8.9166 9.43765C8.89 9.46945 8.82766 9.53858 8.71986 9.53212C8.7036 9.53098 8.6874 9.52865 8.6716 9.52452C8.62793 9.51298 8.5854 9.49778 8.5438 9.48018C8.46133 9.44518 8.4324 9.43192 8.37606 9.40765C7.9912 9.23952 7.638 9.01458 7.3258 8.73932C7.24206 8.66558 7.1642 8.58618 7.08393 8.50838C6.8038 8.23685 6.57446 7.94805 6.40384 7.66318C6.39453 7.64765 6.38018 7.62518 6.36472 7.60005C6.3368 7.55465 6.30602 7.50065 6.29636 7.46358C6.27158 7.36552 6.33732 7.28672 6.33732 7.28672C6.33732 7.28672 6.49959 7.10932 6.57498 7.01285C6.64752 6.91998 6.71013 6.82918 6.75 6.76445C6.82853 6.6382 6.8534 6.50773 6.81213 6.40707C6.62509 5.95108 6.43212 5.49756 6.23324 5.04661C6.19398 4.95762 6.07723 4.89296 5.97106 4.8807C5.9351 4.87654 5.89916 4.87237 5.86306 4.87C5.77368 4.86564 5.68413 4.8666 5.59488 4.87287Z"
              fill="#DFD8CF"
            ></path>
          </svg>
          <p className="text-3xl md:text-4xl font-black uppercase text-primary">
            +543413561987
          </p>
        </div>
        <div className="w-full md:w-1/2 p-10 ">
          <ul className="w-full space-y-12 text-primary">
            {faqs.map((faq, index) => (
              <li
                key={index}
                className="w-full border-b-2 border-gray-600 pb-2"
              >
                <FaqButton
                  header={
                    <h3 className="text-primary uppercase font-bold">
                      {faq.question}
                    </h3>
                  }
                >
                  <p className="text-white text-balance">{faq.answer}</p>
                </FaqButton>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
