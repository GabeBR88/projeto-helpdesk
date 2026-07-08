import { useState, useEffect } from "react";
import { BotaoEstilizado } from "@/pages/components/button";
import ModalCriar from "./ModalCriar";
import ModalConfirmacao from "./ModalConfirmacao";
import { SetorItem } from "@/types/interfaces";

export default function GerenciarSetores() {
  const [setoresLista, setSetoresLista] = useState<SetorItem[]>([]);
  const [loadingSetores, setLoadingSetores] = useState(true);
  const [modoEdicao, setModoEdicao] = useState<number | null>(null);
  const [editCodigo, setEditCodigo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editAtivo, setEditAtivo] = useState(1);
  const [modalNovo, setModalNovo] = useState(false);
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoAtivo, setNovoAtivo] = useState(1);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [acaoConfirmar, setAcaoConfirmar] = useState<() => void>(() => {});

  const carregarSetores = () => {
    fetch("/api/admin/setores/listar")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSetoresLista(data);
        setLoadingSetores(false);
      })
      .catch(() => setLoadingSetores(false));
  };

  useEffect(() => {
    carregarSetores();
  }, []);

  const iniciarEdicao = (s: SetorItem) => {
    setModoEdicao(s.id_setor);
    setEditCodigo(s.codigo);
    setEditDescricao(s.descricao);
    setEditAtivo(s.ativo);
  };
  const cancelarEdicao = () => {
    setModoEdicao(null);
    setEditCodigo("");
    setEditDescricao("");
    setEditAtivo(1);
  };

  const salvarEdicao = (id: number) => {
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/setores/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_setor: id,
          codigo: editCodigo,
          descricao: editDescricao,
          ativo: editAtivo,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            alert(d.erro);
            return;
          }
          carregarSetores();
          cancelarEdicao();
        });
    });
    setModalConfirmar(true);
  };

  const alternarAtivo = (s: SetorItem) => {
    const novo = s.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/setores/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_setor: s.id_setor,
          codigo: s.codigo,
          descricao: s.descricao,
          ativo: novo,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            alert(d.erro);
            return;
          }
          carregarSetores();
        });
    });
    setModalConfirmar(true);
  };

  const criarSetor = () => {
    if (!novoCodigo.trim() || !novaDescricao.trim()) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/setores/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: novoCodigo,
          descricao: novaDescricao,
          ativo: novoAtivo,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            alert(d.erro);
            return;
          }
          carregarSetores();
          setModalNovo(false);
          setNovoCodigo("");
          setNovaDescricao("");
          setNovoAtivo(1);
        });
    });
    setModalConfirmar(true);
  };

  if (loadingSetores)
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto"></div>
      </div>
    );

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
              <i className="bi bi-building mr-2"></i>Setores
            </h1>
            <p className="text-xs text-(--color-monochromatic-3)">
              Gerencie os setores da empresa
            </p>
          </div>
          <BotaoEstilizado
            icon="bi bi-plus-circle"
            texto="Novo Setor"
            id="btNovoSetor"
            onClick={() => setModalNovo(true)}
          />
        </div>
        <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
          <div className="p-4 bg-(--color-monochromatic-1)">
            <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
              Lista de Setores ({setoresLista.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150">
              <thead className="bg-(--color-monochromatic-4)/20">
                <tr>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                    Código
                  </th>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                    Descrição
                  </th>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                    Status
                  </th>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-monochromatic-4)/20">
                {setoresLista.map((s) => (
                  <tr
                    key={s.id_setor}
                    className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                  >
                    {modoEdicao === s.id_setor ? (
                      <>
                        <td className="px-3 py-2">
                          <input
                            value={editCodigo}
                            onChange={(e) => setEditCodigo(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={editDescricao}
                            onChange={(e) => setEditDescricao(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <select
                            value={editAtivo}
                            onChange={(e) =>
                              setEditAtivo(Number(e.target.value))
                            }
                            className="px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) rounded outline-none cursor-pointer"
                          >
                            <option value={1}>Ativo</option>
                            <option value={0}>Inativo</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => salvarEdicao(s.id_setor)}
                              className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                              title="Salvar"
                            >
                              <i className="bi bi-check-lg text-xs"></i>
                            </button>
                            <button
                              onClick={cancelarEdicao}
                              className="bg-(--color-monochromatic-3) text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                              title="Cancelar"
                            >
                              <i className="bi bi-x-lg text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-1) font-mono">
                          {s.codigo}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
                          {s.descricao}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.ativo === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {s.ativo === 1 ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => iniciarEdicao(s)}
                              className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                              title="Editar"
                            >
                              <i className="bi bi-pencil text-xs"></i>
                            </button>
                            <button
                              onClick={() => alternarAtivo(s)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${s.ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                              title={s.ativo === 1 ? "Inativar" : "Ativar"}
                            >
                              <i
                                className={`bi ${s.ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
                              ></i>
                            </button>
                            <button
                              onClick={() => {
                                setAcaoConfirmar(() => () => {
                                  fetch("/api/admin/setores/excluir", {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      id_setor: s.id_setor,
                                    }),
                                  })
                                    .then((r) => r.json())
                                    .then((d) => {
                                      if (d.erro) {
                                        alert(d.erro); // ✅ Mais simples
                                        return;
                                      }
                                      carregarSetores();
                                    });
                                });
                                setModalConfirmar(true);
                              }}
                              className="bg-red-100 text-red-600 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                              title="Excluir"
                            >
                              <i className="bi bi-trash text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modalNovo && (
        <ModalCriar
          titulo="Novo Setor"
          codigo={novoCodigo}
          setCodigo={setNovoCodigo}
          descricao={novaDescricao}
          setDescricao={setNovaDescricao}
          ativo={novoAtivo}
          setAtivo={setNovoAtivo}
          onSalvar={criarSetor}
          onCancelar={() => setModalNovo(false)}
          placeholderCodigo="Ex: ti"
          placeholderDescricao="Ex: Tecnologia da Informação"
        />
      )}
      {modalConfirmar && (
        <ModalConfirmacao
          onCancel={() => setModalConfirmar(false)}
          onOk={() => {
            acaoConfirmar();
            setModalConfirmar(false);
          }}
        />
      )}
    </>
  );
}
