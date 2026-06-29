interface ModalConfirmacaoProps {
  onCancel: () => void;
  onOk: () => void;
}

export default function ModalConfirmacao({
  onCancel,
  onOk,
}: ModalConfirmacaoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="bi bi-exclamation-triangle text-amber-600 text-xl"></i>
        </div>
        <h3 className="text-sm font-bold text-(--color-monochromatic-1) mb-2">
          Confirmar Alteração
        </h3>
        <p className="text-xs text-(--color-monochromatic-3) mb-5">
          Tem certeza que deseja realizar esta ação?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onOk}
            className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
          >
            <i className="bi bi-check-lg mr-1"></i>OK
          </button>
        </div>
      </div>
    </div>
  );
}
