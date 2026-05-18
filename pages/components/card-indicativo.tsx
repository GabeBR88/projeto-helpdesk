// Card indicativo do arquivo servicedesk

interface CardIndicativoProps {
  quantidade: number;
  textoIndicativo: string;
}

export default function CardIndicativo({
  quantidade, // Ex.: 12
  textoIndicativo, //  Ex.: "Na fila" - "Em espera"...
}: CardIndicativoProps) {
  return (
    <div className="interface w-36 sm:w-40 bg-(--color-monochromatic-5) rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Faixa superior colorida */}
      <div className="bg-(--color-monochromatic-2) w-20 h-2 rounded-full mx-auto mt-2"></div>

      <div className="flex flex-col items-center justify-center py-6 px-4 gap-3">
        {/* Número grande */}
        <span className="text-(--color-monochromatic-1) font-bold text-5xl leading-none">
          {quantidade}
        </span>

        {/* Linha decorativa */}
        <div className="w-10 h-1 bg-(--color-monochromatic-3) rounded-full"></div>

        {/* Label */}
        <span className="text-(--color-monochromatic-2) uppercase tracking-widest font-bold text-xs">
          {textoIndicativo}
        </span>
      </div>
    </div>
  );
}
