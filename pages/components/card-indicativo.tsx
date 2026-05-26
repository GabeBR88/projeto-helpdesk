interface CardIndicativoProps {
  quantidade: number;
  textoIndicativo: string;
  corNumero?: string;
  title?: string;
}

export default function CardIndicativo({
  quantidade,
  textoIndicativo,
  corNumero = "text-(--color-monochromatic-1)",
  title,
}: CardIndicativoProps) {
  return (
    <div
      title={title}
      className="interface w-36 sm:w-40 bg-(--color-monochromatic-5) rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      <div className="bg-(--color-monochromatic-2) w-20 h-2 rounded-full mx-auto mt-2"></div>

      <div className="flex flex-col items-center justify-center py-6 px-4 gap-3">
        <span className={`${corNumero} font-bold text-5xl leading-none`}>
          {quantidade}
        </span>

        <div className="w-10 h-1 bg-(--color-monochromatic-3) rounded-full"></div>

        <span className="text-(--color-monochromatic-2) text-center uppercase tracking-widest font-bold text-xs">
          {textoIndicativo}
        </span>
      </div>
    </div>
  );
}
