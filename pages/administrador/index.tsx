import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TituloSite from "@/pages/components/title";
import TopBar from "@/pages/components/topbar";
import FooterEstilizacao from "@/pages/components/footer";
import { BotaoEstilizado } from "@/pages/components/button";

interface DadosAdmin {
  nome_user: string;
  sobrenome_user: string;
  perfil: string;
}

interface StatusItem {
  id_status: number;
  codigo: string;
  descricao: string;
  ativo: number;
}

// COMPONENTE GERENCIAR STATUS
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
  // Status que NÃO podem ser editados (usados pelo sistema)
  const STATUS_SISTEMA = ["concluido", "redirecionado"];

  // Verifica se é um status do sistema
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
        .then((res) => res.json())
        .then((data) => {
          if (data.erro) {
            alert(data.erro);
            return;
          }
          carregarStatus();
          cancelarEdicao();
        })
        .catch(() => alert("Erro ao atualizar"));
    });
    setModalConfirmar(true);
  };

  const alternarAtivo = (status: StatusItem) => {
    const novoEstado = status.ativo === 1 ? 0 : 1;
    const acao = novoEstado === 0 ? "inativar" : "ativar";

    setAcaoConfirmar(() => () => {
      fetch("/api/admin/status/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_status: status.id_status,
          codigo: status.codigo,
          descricao: status.descricao,
          ativo: novoEstado,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.erro) {
            alert(data.erro);
            return;
          }
          carregarStatus();
        })
        .catch(() => alert(`Erro ao ${acao}`));
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
        .then((res) => res.json())
        .then((data) => {
          if (data.erro) {
            alert(data.erro);
            return;
          }
          carregarStatus();
          setModalNovo(false);
          setNovoCodigo("");
          setNovaDescricao("");
          setNovoAtivo(1);
        })
        .catch(() => alert("Erro ao criar"));
    });
    setModalConfirmar(true);
  };

  if (loadingStatus) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
              <i className="bi bi-flag-fill mr-2"></i>
              Status de Atendimento
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

        {/* Tabela */}
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
                                title="Status do sistema - não pode ser alterado"
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
                                title="Status do sistema - não pode ser alterado"
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

      {/* Modal Novo Status */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalNovo(false)}
          ></div>
          <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-xl w-full max-w-md">
            <div className="bg-(--color-monochromatic-1) px-5 py-3 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-plus-circle mr-2"></i>Novo Status
              </h2>
              <button
                onClick={() => setModalNovo(false)}
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
                  value={novoCodigo}
                  onChange={(e) => setNovoCodigo(e.target.value)}
                  placeholder="Ex: aguardando_tecnico"
                  className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <input
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Ex: Aguardando Técnico"
                  className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                  Status Inicial
                </label>
                <select
                  value={novoAtivo}
                  onChange={(e) => setNovoAtivo(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) rounded-lg outline-none cursor-pointer"
                >
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 text-xs font-bold text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarStatus}
                  className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
                >
                  <i className="bi bi-check-lg mr-1"></i>Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {modalConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalConfirmar(false)}
          ></div>
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
                onClick={() => setModalConfirmar(false)}
                className="px-4 py-2 text-xs font-bold text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  acaoConfirmar();
                  setModalConfirmar(false);
                }}
                className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
              >
                <i className="bi bi-check-lg mr-1"></i>OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// COMPONENTE PRINCIPAL
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
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.perfil !== "administrador") {
          router.push("/");
          return;
        }
        if (data) {
          setDadosUsuario({
            nome_user: data.nome_user || "",
            sobrenome_user: data.sobrenome_user || "",
            perfil: data.perfil || "",
          });
        }
        setLoading(false);
      })
      .catch(() => router.push("/"));
  }, [router]);

  const handleLogout = () => {
    document.cookie = "usuario=; path=/; max-age=0";
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-monochromatic-4)">
        <div className="w-10 h-10 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin"></div>
      </div>
    );
  }

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
          {/* Sidebar */}
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

          {/* Conteúdo Principal */}
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
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
                      <i className="bi bi-people-fill mr-2"></i>Usuários
                    </h1>
                    <p className="text-xs text-(--color-monochromatic-3)">
                      Gerencie os usuários do sistema
                    </p>
                  </div>
                  <BotaoEstilizado
                    icon="bi bi-plus-circle"
                    texto="Novo Usuário"
                    id="btNovoUsuario"
                    onClick={() => {}}
                  />
                </div>
                <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
                  <div className="p-4 bg-(--color-monochromatic-1)">
                    <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                      Lista de Usuários
                    </h2>
                  </div>
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-(--color-monochromatic-4)/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="bi bi-people text-2xl text-(--color-monochromatic-3)"></i>
                    </div>
                    <p className="text-sm font-bold text-(--color-monochromatic-2) mb-2">
                      Módulo em desenvolvimento
                    </p>
                    <p className="text-xs text-(--color-monochromatic-3)">
                      A tabela de usuários será implementada aqui.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === "setores" && (
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
                    onClick={() => {}}
                  />
                </div>
                <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
                  <div className="p-4 bg-(--color-monochromatic-1)">
                    <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                      Lista de Setores
                    </h2>
                  </div>
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-(--color-monochromatic-4)/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="bi bi-building text-2xl text-(--color-monochromatic-3)"></i>
                    </div>
                    <p className="text-sm font-bold text-(--color-monochromatic-2) mb-2">
                      Módulo em desenvolvimento
                    </p>
                    <p className="text-xs text-(--color-monochromatic-3)">
                      A tabela de setores será implementada aqui.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {abaAtiva === "manifestacoes" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
                    <i className="bi bi-diagram-3-fill mr-2"></i>Manifestações
                  </h1>
                  <p className="text-xs text-(--color-monochromatic-3)">
                    Gerencie manifestações, grupos e tipos
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
                    <div className="p-4 bg-(--color-monochromatic-1)">
                      <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <i className="bi bi-diagram-3"></i>Manifestação
                      </h2>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-xs text-(--color-monochromatic-3)">
                        Em breve
                      </p>
                    </div>
                  </div>
                  <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
                    <div className="p-4 bg-(--color-monochromatic-2) rounded-t-2xl">
                      <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <i className="bi bi-folder"></i>Grupo de Manifestação
                      </h2>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-xs text-(--color-monochromatic-3)">
                        Em breve
                      </p>
                    </div>
                  </div>
                  <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
                    <div className="p-4 bg-(--color-monochromatic-3) rounded-t-2xl">
                      <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <i className="bi bi-check2-circle"></i>Tipo de
                        Manifestação
                      </h2>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-xs text-(--color-monochromatic-3)">
                        Em breve
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATUS - CHAMA O COMPONENTE */}
            {abaAtiva === "status" && <GerenciarStatus />}
          </main>
        </div>

        <FooterEstilizacao />
      </div>
    </>
  );
}
