import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TituloSite from "@/pages/components/title";
import TopBar from "@/pages/components/topbar";
import FooterEstilizacao from "@/pages/components/footer";
import { BotaoEstilizado } from "@/pages/components/button";
import {
  DadosAdmin,
  StatusItem,
  ManifestacaoItem,
  GrupoItem,
  TipoItem,
  SetorItem,
} from "@/types/interfaces";

// ========== COMPONENTE GERENCIAR STATUS ==========
function GerenciarStatus() {
  const [statusLista, setStatusLista] = useState<StatusItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
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
  const STATUS_SISTEMA = ["concluido", "redirecionado"];
  const isStatusSistema = (codigo: string) => STATUS_SISTEMA.includes(codigo);

  const carregarStatus = () => {
    fetch("/api/admin/status/listar")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStatusLista(data);
        setLoadingStatus(false);
      })
      .catch(() => setLoadingStatus(false));
  };

  useEffect(() => {
    carregarStatus();
  }, []);

  const iniciarEdicao = (status: StatusItem) => {
    setModoEdicao(status.id_status);
    setEditCodigo(status.codigo);
    setEditDescricao(status.descricao);
    setEditAtivo(status.ativo);
  };
  const cancelarEdicao = () => {
    setModoEdicao(null);
    setEditCodigo("");
    setEditDescricao("");
    setEditAtivo(1);
  };

  const salvarEdicao = (id: number) => {
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/status/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_status: id,
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
          carregarStatus();
          cancelarEdicao();
        });
    });
    setModalConfirmar(true);
  };

  const alternarAtivo = (status: StatusItem) => {
    const novo = status.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/status/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_status: status.id_status,
          codigo: status.codigo,
          descricao: status.descricao,
          ativo: novo,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            alert(d.erro);
            return;
          }
          carregarStatus();
        });
    });
    setModalConfirmar(true);
  };

  const criarStatus = () => {
    if (!novoCodigo.trim() || !novaDescricao.trim()) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/status/criar", {
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
          carregarStatus();
          setModalNovo(false);
          setNovoCodigo("");
          setNovaDescricao("");
          setNovoAtivo(1);
        });
    });
    setModalConfirmar(true);
  };

  if (loadingStatus)
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
              <i className="bi bi-flag-fill mr-2"></i>Status de Atendimento
            </h1>
            <p className="text-xs text-(--color-monochromatic-3)">
              Gerencie os status utilizados nos registros
            </p>
          </div>
          <BotaoEstilizado
            icon="bi bi-plus-circle"
            texto="Novo Status"
            id="btNovoStatus"
            onClick={() => setModalNovo(true)}
          />
        </div>
        <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
          <div className="p-4 bg-(--color-monochromatic-1)">
            <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
              Lista de Status ({statusLista.length})
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
                {statusLista.map((s) => (
                  <tr
                    key={s.id_status}
                    className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                  >
                    {modoEdicao === s.id_status ? (
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
                              onClick={() => salvarEdicao(s.id_status)}
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
                            {isStatusSistema(s.codigo) ? (
                              <span
                                className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                title="Protegido"
                              >
                                <i className="bi bi-lock-fill text-xs"></i>
                              </span>
                            ) : (
                              <button
                                onClick={() => iniciarEdicao(s)}
                                className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                                title="Editar"
                              >
                                <i className="bi bi-pencil text-xs"></i>
                              </button>
                            )}
                            {isStatusSistema(s.codigo) ? (
                              <span
                                className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                title="Protegido"
                              >
                                <i className="bi bi-lock-fill text-xs"></i>
                              </span>
                            ) : (
                              <button
                                onClick={() => alternarAtivo(s)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${s.ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                title={s.ativo === 1 ? "Inativar" : "Ativar"}
                              >
                                <i
                                  className={`bi ${s.ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
                                ></i>
                              </button>
                            )}
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
          titulo="Novo Status"
          codigo={novoCodigo}
          setCodigo={setNovoCodigo}
          descricao={novaDescricao}
          setDescricao={setNovaDescricao}
          ativo={novoAtivo}
          setAtivo={setNovoAtivo}
          onSalvar={criarStatus}
          onCancelar={() => setModalNovo(false)}
          placeholderCodigo="Ex: aguardando_tecnico"
          placeholderDescricao="Ex: Aguardando Técnico"
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

// ========== COMPONENTE GERENCIAR SETORES ==========
function GerenciarSetores() {
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

  const iniciarEdicao = (setor: SetorItem) => {
    setModoEdicao(setor.id_setor);
    setEditCodigo(setor.codigo);
    setEditDescricao(setor.descricao);
    setEditAtivo(setor.ativo);
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

  const alternarAtivo = (setor: SetorItem) => {
    const novo = setor.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/setores/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_setor: setor.id_setor,
          codigo: setor.codigo,
          descricao: setor.descricao,
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

// ========== COMPONENTE GERENCIAR MANIFESTAÇÕES ==========
function GerenciarManifestacoes() {
  const [subAba, setSubAba] = useState<"manifestacao" | "grupo" | "tipo">(
    "manifestacao",
  );
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [acaoConfirmar, setAcaoConfirmar] = useState<() => void>(() => {});
  const [loading, setLoading] = useState(true);

  const [manifestacoes, setManifestacoes] = useState<ManifestacaoItem[]>([]);
  const [editManifestacao, setEditManifestacao] = useState<number | null>(null);
  const [editManCodigo, setEditManCodigo] = useState("");
  const [editManDescricao, setEditManDescricao] = useState("");
  const [editManAtivo, setEditManAtivo] = useState(1);
  const [modalNovaManifestacao, setModalNovaManifestacao] = useState(false);
  const [novaManCodigo, setNovaManCodigo] = useState("");
  const [novaManDescricao, setNovaManDescricao] = useState("");
  const [novaManAtivo, setNovaManAtivo] = useState(1);

  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [editGrupo, setEditGrupo] = useState<number | null>(null);
  const [editGrpCodigo, setEditGrpCodigo] = useState("");
  const [editGrpDescricao, setEditGrpDescricao] = useState("");
  const [editGrpAtivo, setEditGrpAtivo] = useState(1);
  const [modalNovoGrupo, setModalNovoGrupo] = useState(false);
  const [novoGrpCodigo, setNovoGrpCodigo] = useState("");
  const [novoGrpDescricao, setNovoGrpDescricao] = useState("");
  const [novoGrpAtivo, setNovoGrpAtivo] = useState(1);
  const [novoGrpManifestacao, setNovoGrpManifestacao] = useState<number>(0);

  const [tipos, setTipos] = useState<TipoItem[]>([]);
  const [editTipo, setEditTipo] = useState<number | null>(null);
  const [editTipCodigo, setEditTipCodigo] = useState("");
  const [editTipDescricao, setEditTipDescricao] = useState("");
  const [editTipAtivo, setEditTipAtivo] = useState(1);
  const [modalNovoTipo, setModalNovoTipo] = useState(false);
  const [novoTipCodigo, setNovoTipCodigo] = useState("");
  const [novoTipDescricao, setNovoTipDescricao] = useState("");
  const [novoTipAtivo, setNovoTipAtivo] = useState(1);
  const [novoTipGrupo, setNovoTipGrupo] = useState<number>(0);

  const MAN_SISTEMA = ["redirecionado"];
  const GRP_SISTEMA = ["chamado_redirecionado"];
  const TIP_SISTEMA = ["redirecionado_tecnico"];

  const carregarManifestacoes = () =>
    fetch("/api/admin/manifestacao/listar")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setManifestacoes(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  const carregarGrupos = () =>
    fetch("/api/admin/grupo_manifestacao/listar")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setGrupos(d);
      });
  const carregarTipos = () =>
    fetch("/api/admin/tipo_manifestacao/listar")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setTipos(d);
      });

  useEffect(() => {
    carregarManifestacoes();
    carregarGrupos();
    carregarTipos();
  }, []);

  const salvarManifestacao = (id: number) => {
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_manifestacao: id,
            codigo: editManCodigo,
            descricao: editManDescricao,
            ativo: editManAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarManifestacoes();
            setEditManifestacao(null);
          }),
    );
    setModalConfirmar(true);
  };

  const alternarAtivoManifestacao = (m: ManifestacaoItem) => {
    const novo = m.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_manifestacao: m.id_manifestacao,
            codigo: m.codigo,
            descricao: m.descricao,
            ativo: novo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarManifestacoes();
          }),
    );
    setModalConfirmar(true);
  };

  const criarManifestacao = () => {
    if (!novaManCodigo.trim() || !novaManDescricao.trim()) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/manifestacao/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: novaManCodigo,
            descricao: novaManDescricao,
            ativo: novaManAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarManifestacoes();
            setModalNovaManifestacao(false);
            setNovaManCodigo("");
            setNovaManDescricao("");
            setNovaManAtivo(1);
          }),
    );
    setModalConfirmar(true);
  };

  const salvarGrupo = (id: number) => {
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/grupo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_grupo: id,
            codigo: editGrpCodigo,
            descricao: editGrpDescricao,
            ativo: editGrpAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarGrupos();
            setEditGrupo(null);
          }),
    );
    setModalConfirmar(true);
  };

  const alternarAtivoGrupo = (g: GrupoItem) => {
    const novo = g.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/grupo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_grupo: g.id_grupo,
            codigo: g.codigo,
            descricao: g.descricao,
            ativo: novo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarGrupos();
          }),
    );
    setModalConfirmar(true);
  };

  const criarGrupo = () => {
    if (
      !novoGrpManifestacao ||
      !novoGrpCodigo.trim() ||
      !novoGrpDescricao.trim()
    ) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/grupo_manifestacao/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_manifestacao: novoGrpManifestacao,
            codigo: novoGrpCodigo,
            descricao: novoGrpDescricao,
            ativo: novoGrpAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarGrupos();
            setModalNovoGrupo(false);
            setNovoGrpManifestacao(0);
            setNovoGrpCodigo("");
            setNovoGrpDescricao("");
            setNovoGrpAtivo(1);
          }),
    );
    setModalConfirmar(true);
  };

  const salvarTipo = (id: number) => {
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/tipo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_tipo: id,
            codigo: editTipCodigo,
            descricao: editTipDescricao,
            ativo: editTipAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarTipos();
            setEditTipo(null);
          }),
    );
    setModalConfirmar(true);
  };

  const alternarAtivoTipo = (t: TipoItem) => {
    const novo = t.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/tipo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_tipo: t.id_tipo,
            codigo: t.codigo,
            descricao: t.descricao,
            ativo: novo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarTipos();
          }),
    );
    setModalConfirmar(true);
  };

  const criarTipo = () => {
    if (!novoTipGrupo || !novoTipCodigo.trim() || !novoTipDescricao.trim()) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/tipo_manifestacao/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_grupo: novoTipGrupo,
            codigo: novoTipCodigo,
            descricao: novoTipDescricao,
            ativo: novoTipAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarTipos();
            setModalNovoTipo(false);
            setNovoTipGrupo(0);
            setNovoTipCodigo("");
            setNovoTipDescricao("");
            setNovoTipAtivo(1);
          }),
    );
    setModalConfirmar(true);
  };

  if (loading)
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto"></div>
      </div>
    );

  const renderLinha = (
    codigo: string,
    descricao: string,
    ativo: number,
    onEditar: () => void,
    onToggle: () => void,
    bloqueado: boolean,
  ) => (
    <>
      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-1) font-mono">
        {codigo}
      </td>
      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
        {descricao}
      </td>
      <td className="px-3 py-2.5 text-center">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ativo === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {ativo === 1 ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center justify-center gap-1.5">
          {bloqueado ? (
            <span
              className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
              title="Protegido"
            >
              <i className="bi bi-lock-fill text-xs"></i>
            </span>
          ) : (
            <button
              onClick={onEditar}
              className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
              title="Editar"
            >
              <i className="bi bi-pencil text-xs"></i>
            </button>
          )}
          {bloqueado ? (
            <span
              className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
              title="Protegido"
            >
              <i className="bi bi-lock-fill text-xs"></i>
            </span>
          ) : (
            <button
              onClick={onToggle}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
              title={ativo === 1 ? "Inativar" : "Ativar"}
            >
              <i
                className={`bi ${ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
              ></i>
            </button>
          )}
        </div>
      </td>
    </>
  );

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
            <i className="bi bi-diagram-3-fill mr-2"></i>Manifestações
          </h1>
          <p className="text-xs text-(--color-monochromatic-3)">
            Gerencie manifestações, grupos e tipos
          </p>
        </div>
        <div className="flex gap-2 border-b border-(--color-monochromatic-4) pb-2 overflow-x-auto">
          {[
            { id: "manifestacao", icon: "bi-diagram-3", label: "Manifestação" },
            { id: "grupo", icon: "bi-folder", label: "Grupo" },
            { id: "tipo", icon: "bi-check2-circle", label: "Tipo" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubAba(tab.id as typeof subAba)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${subAba === tab.id ? "bg-(--color-monochromatic-1) text-(--color-monochromatic-5) shadow-md" : "text-(--color-monochromatic-2) hover:bg-(--color-monochromatic-4)/20 hover:text-(--color-monochromatic-1)"}`}
            >
              <i className={`bi ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {subAba === "manifestacao" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <BotaoEstilizado
                icon="bi bi-plus-circle"
                texto="Nova Manifestação"
                id="btNovaManifestacao"
                onClick={() => setModalNovaManifestacao(true)}
              />
            </div>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
              <div className="p-4 bg-(--color-monochromatic-1)">
                <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                  Lista de Manifestações ({manifestacoes.length})
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
                    {manifestacoes.map((m) => (
                      <tr
                        key={m.id_manifestacao}
                        className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                      >
                        {editManifestacao === m.id_manifestacao ? (
                          <>
                            <td className="px-3 py-2">
                              <input
                                value={editManCodigo}
                                onChange={(e) =>
                                  setEditManCodigo(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={editManDescricao}
                                onChange={(e) =>
                                  setEditManDescricao(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <select
                                value={editManAtivo}
                                onChange={(e) =>
                                  setEditManAtivo(Number(e.target.value))
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
                                  onClick={() =>
                                    salvarManifestacao(m.id_manifestacao)
                                  }
                                  className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                                  title="Salvar"
                                >
                                  <i className="bi bi-check-lg text-xs"></i>
                                </button>
                                <button
                                  onClick={() => setEditManifestacao(null)}
                                  className="bg-(--color-monochromatic-3) text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                                  title="Cancelar"
                                >
                                  <i className="bi bi-x-lg text-xs"></i>
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          renderLinha(
                            m.codigo,
                            m.descricao,
                            m.ativo,
                            () => {
                              setEditManifestacao(m.id_manifestacao);
                              setEditManCodigo(m.codigo);
                              setEditManDescricao(m.descricao);
                              setEditManAtivo(m.ativo);
                            },
                            () => alternarAtivoManifestacao(m),
                            MAN_SISTEMA.includes(m.codigo),
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {subAba === "grupo" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <BotaoEstilizado
                icon="bi bi-plus-circle"
                texto="Novo Grupo"
                id="btNovoGrupo"
                onClick={() => setModalNovoGrupo(true)}
              />
            </div>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
              <div className="p-4 bg-(--color-monochromatic-2)">
                <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                  Lista de Grupos ({grupos.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="bg-(--color-monochromatic-4)/20">
                    <tr>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Código
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Descrição
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Manifestação
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
                    {grupos.map((g) => {
                      const manifestacaoNome =
                        manifestacoes.find(
                          (m) => m.id_manifestacao === g.id_manifestacao,
                        )?.descricao || "—";
                      return (
                        <tr
                          key={g.id_grupo}
                          className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                        >
                          {editGrupo === g.id_grupo ? (
                            <>
                              <td className="px-3 py-2">
                                <input
                                  value={editGrpCodigo}
                                  onChange={(e) =>
                                    setEditGrpCodigo(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  value={editGrpDescricao}
                                  onChange={(e) =>
                                    setEditGrpDescricao(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-1) text-(--color-monochromatic-5)">
                                  {manifestacaoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select
                                  value={editGrpAtivo}
                                  onChange={(e) =>
                                    setEditGrpAtivo(Number(e.target.value))
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
                                    onClick={() => salvarGrupo(g.id_grupo)}
                                    className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                                    title="Salvar"
                                  >
                                    <i className="bi bi-check-lg text-xs"></i>
                                  </button>
                                  <button
                                    onClick={() => setEditGrupo(null)}
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
                                {g.codigo}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
                                {g.descricao}
                              </td>
                              <td>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-1) text-(--color-monochromatic-5)">
                                  {manifestacaoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.ativo === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {g.ativo === 1 ? "Ativo" : "Inativo"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  {GRP_SISTEMA.includes(g.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditGrupo(g.id_grupo);
                                        setEditGrpCodigo(g.codigo);
                                        setEditGrpDescricao(g.descricao);
                                        setEditGrpAtivo(g.ativo);
                                      }}
                                      className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                                      title="Editar"
                                    >
                                      <i className="bi bi-pencil text-xs"></i>
                                    </button>
                                  )}
                                  {GRP_SISTEMA.includes(g.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => alternarAtivoGrupo(g)}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${g.ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                      title={
                                        g.ativo === 1 ? "Inativar" : "Ativar"
                                      }
                                    >
                                      <i
                                        className={`bi ${g.ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
                                      ></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {subAba === "tipo" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <BotaoEstilizado
                icon="bi bi-plus-circle"
                texto="Novo Tipo"
                id="btNovoTipo"
                onClick={() => setModalNovoTipo(true)}
              />
            </div>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
              <div className="p-4 bg-(--color-monochromatic-3)">
                <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                  Lista de Tipos ({tipos.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="bg-(--color-monochromatic-4)/20">
                    <tr>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Código
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Descrição
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Grupo de Manifestação
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
                    {tipos.map((t) => {
                      const grupoNome =
                        grupos.find((g) => g.id_grupo === t.id_grupo)
                          ?.descricao || "—";
                      return (
                        <tr
                          key={t.id_tipo}
                          className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                        >
                          {editTipo === t.id_tipo ? (
                            <>
                              <td className="px-3 py-2">
                                <input
                                  value={editTipCodigo}
                                  onChange={(e) =>
                                    setEditTipCodigo(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  value={editTipDescricao}
                                  onChange={(e) =>
                                    setEditTipDescricao(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-xs">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-2) text-(--color-monochromatic-5)">
                                  {grupoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select
                                  value={editTipAtivo}
                                  onChange={(e) =>
                                    setEditTipAtivo(Number(e.target.value))
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
                                    onClick={() => salvarTipo(t.id_tipo)}
                                    className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                                    title="Salvar"
                                  >
                                    <i className="bi bi-check-lg text-xs"></i>
                                  </button>
                                  <button
                                    onClick={() => setEditTipo(null)}
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
                                {t.codigo}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
                                {t.descricao}
                              </td>
                              <td>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-2) text-(--color-monochromatic-5)">
                                  {grupoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.ativo === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {t.ativo === 1 ? "Ativo" : "Inativo"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  {TIP_SISTEMA.includes(t.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditTipo(t.id_tipo);
                                        setEditTipCodigo(t.codigo);
                                        setEditTipDescricao(t.descricao);
                                        setEditTipAtivo(t.ativo);
                                      }}
                                      className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                                      title="Editar"
                                    >
                                      <i className="bi bi-pencil text-xs"></i>
                                    </button>
                                  )}
                                  {TIP_SISTEMA.includes(t.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => alternarAtivoTipo(t)}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${t.ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                      title={
                                        t.ativo === 1 ? "Inativar" : "Ativar"
                                      }
                                    >
                                      <i
                                        className={`bi ${t.ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
                                      ></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalNovaManifestacao && (
        <ModalCriar
          titulo="Nova Manifestação"
          codigo={novaManCodigo}
          setCodigo={setNovaManCodigo}
          descricao={novaManDescricao}
          setDescricao={setNovaManDescricao}
          ativo={novaManAtivo}
          setAtivo={setNovaManAtivo}
          onSalvar={criarManifestacao}
          onCancelar={() => setModalNovaManifestacao(false)}
          placeholderCodigo="Ex: presencial"
          placeholderDescricao="Ex: Atendimento Presencial"
        />
      )}
      {modalNovoGrupo && (
        <ModalCriarComSelect
          titulo="Novo Grupo"
          codigo={novoGrpCodigo}
          setCodigo={setNovoGrpCodigo}
          descricao={novoGrpDescricao}
          setDescricao={setNovoGrpDescricao}
          ativo={novoGrpAtivo}
          setAtivo={setNovoGrpAtivo}
          onSalvar={criarGrupo}
          onCancelar={() => setModalNovoGrupo(false)}
          placeholderCodigo="Ex: internet"
          placeholderDescricao="Ex: Internet"
          labelSelect="Manifestação"
          valorSelect={novoGrpManifestacao}
          setValorSelect={setNovoGrpManifestacao}
          opcoes={manifestacoes
            .filter((m) => m.ativo === 1)
            .map((m) => ({ value: m.id_manifestacao, label: m.descricao }))}
        />
      )}
      {modalNovoTipo && (
        <ModalCriarComSelect
          titulo="Novo Tipo"
          codigo={novoTipCodigo}
          setCodigo={setNovoTipCodigo}
          descricao={novoTipDescricao}
          setDescricao={setNovoTipDescricao}
          ativo={novoTipAtivo}
          setAtivo={setNovoTipAtivo}
          onSalvar={criarTipo}
          onCancelar={() => setModalNovoTipo(false)}
          placeholderCodigo="Ex: troca_cabo"
          placeholderDescricao="Ex: Troca de Cabo"
          labelSelect="Grupo"
          valorSelect={novoTipGrupo}
          setValorSelect={setNovoTipGrupo}
          opcoes={grupos
            .filter((g) => g.ativo === 1)
            .map((g) => ({ value: g.id_grupo, label: g.descricao }))}
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

// ========== COMPONENTES AUXILIARES ==========
function ModalCriar({
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
}: {
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
}) {
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

function ModalCriarComSelect({
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
}: {
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
  opcoes: { value: number; label: string }[];
}) {
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

function ModalConfirmacao({
  onCancel,
  onOk,
}: {
  onCancel: () => void;
  onOk: () => void;
}) {
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

// ========== COMPONENTE PRINCIPAL ==========
export default function PainelAdmin() {
  const router = useRouter();
  const [dadosUsuario, setDadosUsuario] = useState<DadosAdmin>({
    nome_user: "",
    sobrenome_user: "",
    perfil: "",
  });
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  useEffect(() => {
    fetch("/api/my-tickets/profile")
      .then((r) => {
        if (r.status === 401) {
          router.push("/");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && d.perfil !== "administrador") {
          router.push("/");
          return;
        }
        if (d)
          setDadosUsuario({
            nome_user: d.nome_user || "",
            sobrenome_user: d.sobrenome_user || "",
            perfil: d.perfil || "",
          });
        setLoading(false);
      })
      .catch(() => router.push("/"));
  }, [router]);

  const handleLogout = () => {
    document.cookie = "usuario=; path=/; max-age=0";
    router.push("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-monochromatic-4)">
        <div className="w-10 h-10 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin"></div>
      </div>
    );

  const menuItems = [
    {
      id: "dashboard",
      icon: "bi-speedometer2",
      label: "Dashboard",
      desc: "Visão geral do sistema",
    },
    {
      id: "usuarios",
      icon: "bi-people-fill",
      label: "Usuários",
      desc: "Criar, editar e desativar usuários",
    },
    {
      id: "setores",
      icon: "bi-building",
      label: "Setores",
      desc: "Gerenciar setores da empresa",
    },
    {
      id: "manifestacoes",
      icon: "bi-diagram-3-fill",
      label: "Manifestações",
      desc: "Manifestação, Grupo e Tipo",
    },
    {
      id: "status",
      icon: "bi-flag-fill",
      label: "Status",
      desc: "Status de atendimento",
    },
  ];

  return (
    <>
      <TituloSite titulo="Painel Administrativo" />
      <div className="min-h-screen flex flex-col bg-(--color-monochromatic-4)">
        <TopBar
          nomeUsuario={`${dadosUsuario.nome_user} ${dadosUsuario.sobrenome_user}`}
        />
        <div
          onClick={handleLogout}
          className="flex justify-end mt-2 mr-5 uppercase text-xs text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) underline cursor-pointer transition-colors font-medium"
        >
          <i className="bi bi-box-arrow-right mr-1"></i>Sair
        </div>
        <div className="flex-1 flex flex-col lg:flex-row">
          <aside className="w-full lg:w-64 bg-(--color-monochromatic-5) border-b lg:border-b-0 lg:border-r border-(--color-monochromatic-4) shrink-0">
            <div className="p-4 lg:p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-(--color-monochromatic-1) rounded-lg flex items-center justify-center">
                  <i className="bi bi-shield-lock-fill text-white text-sm"></i>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
                    Administração
                  </h2>
                  <p className="text-[10px] text-(--color-monochromatic-3)">
                    Painel de Controle
                  </p>
                </div>
              </div>
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAbaAtiva(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 shrink-0 lg:shrink ${abaAtiva === item.id ? "bg-(--color-monochromatic-1) text-(--color-monochromatic-5) shadow-md" : "text-(--color-monochromatic-2) hover:bg-(--color-monochromatic-4)/20 hover:text-(--color-monochromatic-1)"}`}
                  >
                    <i className={`bi ${item.icon} text-sm`}></i>
                    <div className="hidden lg:block">
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] opacity-70">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {abaAtiva === "dashboard" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-2">
                    <i className="bi bi-speedometer2 mr-2"></i>Dashboard
                  </h1>
                  <p className="text-xs text-(--color-monochromatic-2)">
                    Bem-vindo ao painel administrativo.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems
                    .filter((m) => m.id !== "dashboard")
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAbaAtiva(item.id)}
                        className="bg-(--color-monochromatic-5) rounded-xl p-5 border border-(--color-monochromatic-4)/30 hover:border-(--color-monochromatic-1) hover:shadow-md transition-all duration-200 text-left group"
                      >
                        <div className="w-10 h-10 bg-(--color-monochromatic-1)/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-(--color-monochromatic-1) transition-colors">
                          <i
                            className={`bi ${item.icon} text-lg text-(--color-monochromatic-1) group-hover:text-white transition-colors`}
                          ></i>
                        </div>
                        <h3 className="text-sm font-bold text-(--color-monochromatic-1) mb-1">
                          {item.label}
                        </h3>
                        <p className="text-xs text-(--color-monochromatic-3)">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}
            {abaAtiva === "usuarios" && (
              <Placeholder titulo="Usuários" icone="bi-people-fill" />
            )}
            {abaAtiva === "setores" && <GerenciarSetores />}
            {abaAtiva === "manifestacoes" && <GerenciarManifestacoes />}
            {abaAtiva === "status" && <GerenciarStatus />}
          </main>
        </div>
        <FooterEstilizacao />
      </div>
    </>
  );
}

function Placeholder({ titulo, icone }: { titulo: string; icone: string }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
            <i className={`bi ${icone} mr-2`}></i>
            {titulo}
          </h1>
          <p className="text-xs text-(--color-monochromatic-3)">
            Gerencie os {titulo.toLowerCase()} do sistema
          </p>
        </div>
        <BotaoEstilizado
          icon="bi bi-plus-circle"
          texto={`Novo ${titulo.slice(0, -1)}`}
          id={`btNovo${titulo}`}
          onClick={() => {}}
        />
      </div>
      <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
        <div className="p-4 bg-(--color-monochromatic-1)">
          <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
            Lista de {titulo}
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-(--color-monochromatic-4)/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i
              className={`bi ${icone} text-2xl text-(--color-monochromatic-3)`}
            ></i>
          </div>
          <p className="text-sm font-bold text-(--color-monochromatic-2) mb-2">
            Módulo em desenvolvimento
          </p>
          <p className="text-xs text-(--color-monochromatic-3)">
            A tabela de {titulo.toLowerCase()} será implementada aqui.
          </p>
        </div>
      </div>
    </div>
  );
}
