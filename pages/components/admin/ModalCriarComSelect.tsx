interface OpcaoSelect {
  value: number;
  label: string;
}

interface ModalCriarComSelectProps {
  titulo: string;
  codigo: string;
  setCodigo: (v: string) => void;
  descricao: string;
  setDescricao: (v: string) => void;
  ativo: number;
  setAtivo: (v: number) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  placeholderCodigo: string;
  placeholderDescricao: string;
  labelSelect: string;
  valorSelect: number;
  setValorSelect: (v: number) => void;
  opcoes: OpcaoSelect[];
}

export default function ModalCriarComSelect({
  titulo,
  codigo,
  setCodigo,
  descricao,
  setDescricao,
  ativo,
  setAtivo,
  onSalvar,
  onCancelar,
  placeholderCodigo,
  placeholderDescricao,
  labelSelect,
  valorSelect,
  setValorSelect,
  opcoes,
}: ModalCriarComSelectProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancelar}></div>
      <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-xl w-full max-w-md">
        <div className="bg-(--color-monochromatic-1) px-5 py-3 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
            <i className="bi bi-plus-circle mr-2"></i>
            {titulo}
          </h2>
          <button
            onClick={onCancelar}
            className="text-white/70 hover:text-white"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
              {labelSelect} <span className="text-red-500">*</span>
            </label>
            <select
              value={valorSelect}
              onChange={(e) => setValorSelect(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) rounded-lg outline-none cursor-pointer"
            >
              <option value={0} disabled>
                Selecione...
              </option>
              {opcoes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder={placeholderCodigo}
              className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={placeholderDescricao}
              className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
              Status Inicial
            </label>
            <select
              value={ativo}
              onChange={(e) => setAtivo(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) rounded-lg outline-none cursor-pointer"
            >
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onCancelar}
              className="px-4 py-2 text-xs font-bold text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSalvar}
              className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
            >
              <i className="bi bi-check-lg mr-1"></i>Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
