// Topo contendo dados de login
import VersaoCabecalho from "./versionamento-header";

interface TopBarProps {
  nomeUsuario: string;
}

export default function TopBar({ nomeUsuario }: TopBarProps) {
  return (
    <div className="bg-(--color-monochromatic-1) border-b border-(--color-monochromatic-3)">
      <div className="interface py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-(--color-monochromatic-4) rounded flex items-center justify-center shrink-0">
            <i className="bi bi-headset text-(--color-monochromatic-1) text-sm sm:text-lg"></i>
          </div>
          <span className="text-(--color-monochromatic-5) font-semibold tracking-wide text-xs sm:text-base">
            HELPDESK - Bem-vindo(a){" "}
            <span className="text-emerald-300 block sm:inline">
              {nomeUsuario}
            </span>
          </span>
        </div>
        <div className="hidden sm:block">
          {/* Chama função do versionamento em Components */}
          <VersaoCabecalho />
        </div>
      </div>
    </div>
  );
}
