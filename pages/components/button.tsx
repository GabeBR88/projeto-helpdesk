import { BotaoPrincipalProps, BotaoEstilizadoProps } from "@/types/interfaces";

export function BotaoEstilizado({
  icon,
  texto,
  id,
  onClick,
  disabled = false,
}: BotaoEstilizadoProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`text-sm px-4 py-2 font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 ${
        disabled
          ? "bg-gray-400 cursor-not-allowed opacity-50"
          : "bg-(--color-monochromatic-1) hover:bg-(--color-monochromatic-3) cursor-pointer"
      }`}
    >
      <span className="text-(--color-monochromatic-5) flex items-center justify-center gap-2">
        <i className={`${icon} mr-1`}></i>
        {texto}
      </span>
    </button>
  );
}

export function BotaoPrincipal({
  icon,
  texto,
  tipo,
  onClick,
}: BotaoPrincipalProps) {
  return (
    <button
      type={tipo}
      onClick={onClick}
      className="cursor-pointer bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-full py-3.5 font-bold text-sm uppercase tracking-widest hover:bg-(--color-monochromatic-2) active:scale-[0.98] transition-all duration-150 mt-2"
    >
      <i className={`${icon} mr-2`}></i>
      {texto}
    </button>
  );
}
