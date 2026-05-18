interface BotaoEstilizadoProps {
  icon: string; // Nome do ícone Bootstrap (ex: "bi bi-headset")
  texto: string; // Texto de dentro do botão (ex: "Abrir chamado")
  id: string;
  onClick?: () => void;
}

export function BotaoEstilizado({
  icon,
  texto,
  id,
  onClick,
}: BotaoEstilizadoProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="bg-(--color-monochromatic-1) text-sm px-4 py-2 font-bold uppercase tracking-wider hover:bg-(--color-monochromatic-3) transition-all duration-200 active:scale-95 cursor-"
    >
      <span className="text-(--color-monochromatic-5) flex items-center justify-center gap-2">
        <i className={`${icon} mr-1`}></i>
        {texto}
      </span>
    </button>
  );
}

interface BotaoPrincipalProps {
  icon: string;
  texto: string;
  tipo?: "submit" | "button" | "reset";
  onClick?: () => void;
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
      <i className={`bi ${icon} mr-2`}></i>
      {texto}
    </button>
  );
}
