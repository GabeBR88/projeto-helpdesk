import { useEffect, useState } from "react";
import { BotaoEstilizado } from "../components/button";
import CardIndicativo from "../components/card-indicativo";
import FooterEstilizacao from "../components/footer";
import TituloSite from "../components/title";
import TopBar from "../components/topbar";
import {
  AbrirListaFuncionarios,
  AbrirModal,
  FecharListaFuncionarios,
  FecharModal,
} from "./script";
import { useRouter } from "next/router";
import {
  ChamadoSD,
  Comentario,
  DetalhesChamado,
  MeusRegistros,
  SdSetor,
  Anexo,
} from "@/types/interfaces";

function getStatusCor(status: string): string {
  switch (status) {
    case "Pendente":
      return "bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap";
    case "Em tratamento":
      return "bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap";
    case "Finalizado":
      return "bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap";
    default:
      return "bg-gray-100 text-gray-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap";
  }
}

export default function PerfilServiceDesk() {
  const [dadosUsuario, setDadosUsuario] = useState({
    nome_user: "",
    sobrenome_user: "",
    email_user: "",
    telefone: "",
    perfil: "",
  });

  const router = useRouter();

  const iniciarAtendimento = () => {
    if (chamadoSelecionado) {
      const numeroLimpo = chamadoSelecionado.replace("#", "");
      router.push(`/servicedesk/atendimento-sd?chamado=${numeroLimpo}`);
    }
  };

  const handleLogout = () => {
    document.cookie = "usuario=; path=/; max-age=0";
    router.push("/");
  };

  const [serviceDesk, setServiceDesk] = useState<SdSetor[]>([]);
  const [quantidadePendente, setQuantidadePendente] = useState<number>(0);
  const [foraPrazo, setForaPrazo] = useState<number>(0);
  const [minhasPendentes, setMinhasPendentes] = useState<number>(0);
  const [chamadosHoje, setChamadosHoje] = useState<number>(0);
  const [quantidadeFinalizado, setQuantidadeFinalizado] = useState<number>(0);
  const [chamadosFinalizados, setChamadosFinalizados] = useState<ChamadoSD[]>(
    [],
  );
  const [chamadosAbertos, setChamadosAbertos] = useState<ChamadoSD[]>([]);
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ativarBotaoPesquisar, setAtivarBotaoPesquisar] = useState("");
  const [chamadoSelecionado, setChamadoSelecionado] = useState<string>("");
  const [chamadosAtribuidos, setChamadosAtribuidos] = useState<ChamadoSD[]>([]);
  const [quantidadeRedirecionados, setQuantidadeRedirecionados] =
    useState<number>(0);
  const [podeRedirecionar, setPodeRedirecionar] = useState(true);

  // Modal de overview para finalizados
  const [modalOverview, setModalOverview] = useState(false);
  const [dadosOverview, setDadosOverview] = useState<DetalhesChamado | null>(
    null,
  );
  const [historicoOverview, setHistoricoOverview] = useState<MeusRegistros[]>(
    [],
  );
  const [comentariosOverview, setComentariosOverview] = useState<
    Record<number, Comentario[]>
  >({});
  const [anexosOverview, setAnexosOverview] = useState<Anexo[]>([]);

  useEffect(() => {
    fetch("/api/sd-setor/sd-setor")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServiceDesk(data);
        else setServiceDesk([]);
      })
      .catch(() => setServiceDesk([]));
  }, []);

  // Escuta evento disparado pelo script externo quando anexos são carregados
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent;
      const anexos = ev?.detail?.anexos;
      console.log("📎 sdAnexosLoaded recebido:", anexos?.length, "anexos");
      if (Array.isArray(anexos)) setAnexosOverview(anexos);
      else setAnexosOverview([]);
    };

    window.addEventListener("sdAnexosLoaded", handler as EventListener);
    return () =>
      window.removeEventListener("sdAnexosLoaded", handler as EventListener);
  }, []);

  useEffect(() => {
    let montado = true;
    let primeiraBusca = true;

    const buscarTudo = () => {
      if (!montado) return;

      fetch("/api/my-tickets/profile")
        .then((res) => res.json())
        .then((data) => {
          if (montado) {
            setDadosUsuario({
              nome_user: data.nome_user || "",
              sobrenome_user: data.sobrenome_user || "",
              email_user: data.email_user || "",
              telefone: data.telefone || "",
              perfil: data.perfil || "",
            });
          }
        })
        .catch(() => {});

      fetch("/api/status/pendentes")
        .then((res) => res.json())
        .then((data) => {
          if (montado && typeof data === "number") setQuantidadePendente(data);
        })
        .catch(() => {});

      fetch("/api/status/fora-prazo")
        .then((res) => res.json())
        .then((data) => {
          if (montado && typeof data === "number") setForaPrazo(data);
        })
        .catch(() => {});

      fetch("/api/status/chamados-do-dia")
        .then((res) => res.json())
        .then((data) => {
          if (montado && typeof data === "number") setChamadosHoje(data);
        })
        .catch(() => {});

      fetch("/api/status/chamados-finalizados")
        .then((res) => res.json())
        .then((data) => {
          if (montado && typeof data === "number")
            setQuantidadeFinalizado(data);
        })
        .catch(() => {});

      fetch("/api/desk-tickets/chamados-atribuidos")
        .then((res) => res.json())
        .then((data) => {
          if (montado && Array.isArray(data)) setChamadosAtribuidos(data);
        })
        .catch(() => {});

      fetch("/api/desk-tickets/chamados-abertos")
        .then((res) => res.json())
        .then((data) => {
          if (montado && Array.isArray(data)) setChamadosAbertos(data);
        })
        .catch(() => {});

      fetch("/api/desk-tickets/chamados-finalizados")
        .then((res) => res.json())
        .then((data) => {
          if (montado && Array.isArray(data)) setChamadosFinalizados(data);
        })
        .catch(() => {});

      fetch("/api/status/minhas-demandas-pendentes")
        .then((res) => res.json())
        .then((data) => {
          if (montado && typeof data === "number") setMinhasPendentes(data);
        })
        .catch(() => {});

      fetch("/api/status/chamados-redirecionados")
        .then((res) => res.json())
        .then((data) => {
          if (montado && typeof data === "number")
            setQuantidadeRedirecionados(data);
        })
        .catch(() => {});

      if (primeiraBusca) {
        primeiraBusca = false;
        setTimeout(() => {
          if (montado) setLoading(false);
        }, 800);
      }
    };

    buscarTudo();
    const intervalo = setInterval(buscarTudo, 60000);
    const aoFocar = () => buscarTudo();
    window.addEventListener("focus", aoFocar);

    return () => {
      montado = false;
      clearInterval(intervalo);
      window.removeEventListener("focus", aoFocar);
    };
  }, []);

  const abrirOverview = async (chamado: ChamadoSD) => {
    try {
      const numLimpo = chamado.num_chamado.replace("#", "");

      const [resDetalhes, resHistorico] = await Promise.all([
        fetch(`/api/desk-tickets/detalhes-chamado?chamado=${numLimpo}`),
        fetch(`/api/desk-tickets/meus-registros?chamado=${numLimpo}`),
      ]);

      const detalhes = await resDetalhes.json();
      const historico = await resHistorico.json();

      // Filtra registros de redirecionamento
      const historicoFiltrado = Array.isArray(historico)
        ? historico.filter((h: MeusRegistros) => h.status !== "redirecionado")
        : [];

      setDadosOverview(detalhes);
      setHistoricoOverview(historicoFiltrado);

      // Carrega comentários para cada registro
      const comentariosMap: Record<number, Comentario[]> = {};
      await Promise.all(
        historicoFiltrado.map(async (h: MeusRegistros) => {
          const res = await fetch(
            `/api/desk-tickets/comentarios?id_atendimento=${h.id_atendimento}`,
          );
          const data = await res.json();
          comentariosMap[h.id_atendimento] = Array.isArray(data) ? data : [];
        }),
      );
      setComentariosOverview(comentariosMap);

      // Carrega anexos do chamado
      if (detalhes?.id_ocorrencia) {
        fetch(`/api/anexos/listar?id_ocorrencia=${detalhes.id_ocorrencia}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setAnexosOverview(data);
            else setAnexosOverview([]);
          })
          .catch(() => setAnexosOverview([]));
      } else {
        setAnexosOverview([]);
      }

      setModalOverview(true);
    } catch (error) {
      console.error("Erro ao carregar overview:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-monochromatic-4)">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-(--color-monochromatic-2) text-sm">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  const searchLowerCase = ativarBotaoPesquisar.toLowerCase();

  const pesquisaChamadosPendentes = chamadosAbertos.filter((chamado) => {
    const nomeCompleto =
      `${chamado.nome_user} ${chamado.sobrenome_user}`.toLowerCase();
    return (
      chamado.num_chamado.toLowerCase().includes(searchLowerCase) ||
      nomeCompleto.includes(searchLowerCase) ||
      chamado.setor.toLowerCase().includes(searchLowerCase) ||
      chamado.categoria.toLowerCase().includes(searchLowerCase)
    );
  });

  const pesquisaChamadosAtribuidos = chamadosAtribuidos.filter((chamado) => {
    const nomeCompleto =
      `${chamado.nome_user} ${chamado.sobrenome_user}`.toLowerCase();
    return (
      chamado.num_chamado.toLowerCase().includes(searchLowerCase) ||
      nomeCompleto.includes(searchLowerCase) ||
      chamado.setor.toLowerCase().includes(searchLowerCase) ||
      chamado.categoria.toLowerCase().includes(searchLowerCase)
    );
  });

  const pesquisaChamadosFinalizados = chamadosFinalizados.filter((chamado) => {
    const nomeCompleto =
      `${chamado.nome_user} ${chamado.sobrenome_user}`.toLowerCase();
    return (
      chamado.num_chamado.toLowerCase().includes(searchLowerCase) ||
      nomeCompleto.includes(searchLowerCase) ||
      chamado.setor.toLowerCase().includes(searchLowerCase) ||
      chamado.categoria.toLowerCase().includes(searchLowerCase) ||
      (chamado.concluido_por || "").toLowerCase().includes(searchLowerCase)
    );
  });

  return (
    <>
      <TituloSite titulo="Perfil ServiceDesk" />

      <div className="min-h-screen flex flex-col">
        <TopBar
          nomeUsuario={`${dadosUsuario.nome_user} ${dadosUsuario.sobrenome_user}`}
        />

        <div
          onClick={handleLogout}
          className="flex justify-end mt-2 mr-5 uppercase text-xs text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) underline cursor-pointer transition-colors font-medium"
        >
          <i className="bi bi-box-arrow-right mr-1"></i>
          Sair
        </div>

        <div className="flex-1">
          <div className="interface pt-6 sm:pt-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-2xl text-(--color-monochromatic-1) font-bold uppercase tracking-wider">
                <i className="bi bi-tv-fill mr-2"></i> Meu painel
              </h1>
              <div className="w-full sm:w-72 shrink-0">
                <div className="flex items-center gap-0">
                  <input
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-(--color-monochromatic-5) border-2 border-r-0 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs rounded-l-full"
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      if (e.target.value === "") setAtivarBotaoPesquisar("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setAtivarBotaoPesquisar(search);
                    }}
                    placeholder="Buscar por nº chamado, nome ou técnico..."
                  />
                  <button
                    onClick={() => setAtivarBotaoPesquisar(search)}
                    className="bg-(--color-monochromatic-1) hover:bg-(--color-monochromatic-2) text-(--color-monochromatic-5) px-4 py-2 sm:py-2.5 rounded-r-full transition-colors duration-200"
                  >
                    <i className="bi bi-search text-sm sm:text-base"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Cards Indicativos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <CardIndicativo
                quantidade={quantidadePendente}
                textoIndicativo="Total Pendentes"
                title="Total de Chamados aguardando atendimento"
              />

              <CardIndicativo
                quantidade={minhasPendentes}
                textoIndicativo="Minhas demandas pendentes"
                title="Chamados que você está tratando"
              />

              <CardIndicativo
                quantidade={quantidadeRedirecionados}
                textoIndicativo="Chamados Redirecionados"
                title="Chamados que foram redirecionados para você"
              />

              <CardIndicativo
                quantidade={foraPrazo}
                corNumero="text-red-500"
                textoIndicativo="Fora do Prazo"
                title="Chamados que excederam o prazo de 24h"
              />
              <CardIndicativo
                quantidade={chamadosHoje}
                textoIndicativo="Hoje"
                title="Chamados abertos hoje"
              />
              <CardIndicativo
                quantidade={quantidadeFinalizado}
                textoIndicativo="Finalizados"
                title="Chamados finalizados por você hoje"
              />
            </div>
          </div>

          {/* TABELA PENDENTES */}
          <div className="interface py-4 sm:py-6 px-2 sm:px-0">
            <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 sm:mb-4">
              <i className="bi bi-list-check mr-2"></i> Chamados Pendentes
            </h2>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full min-w-175">
                  <thead className="bg-(--color-monochromatic-1) sticky top-0 z-10">
                    <tr>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left w-22.5">
                        Nº Chamado
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Categoria
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden sm:table-cell">
                        Solicitante
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden md:table-cell">
                        Setor
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center w-25">
                        Status
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Data de abertura
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pesquisaChamadosPendentes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-(--color-monochromatic-3) text-xs py-8"
                        >
                          Nenhum chamado foi aberto
                        </td>
                      </tr>
                    ) : (
                      pesquisaChamadosPendentes.map((chamado) => (
                        <tr
                          key={chamado.num_chamado}
                          className="hover:bg-(--color-monochromatic-4)/20 transition-colors cursor-pointer border-b border-(--color-monochromatic-4)"
                          onClick={() => {
                            setChamadoSelecionado(chamado.num_chamado);
                            setPodeRedirecionar(true);
                            AbrirModal({
                              numero: chamado.num_chamado,
                              descricao: chamado.categoria,
                              solicitante: `${chamado.nome_user} ${chamado.sobrenome_user}`,
                              setor: chamado.setor,
                              status: chamado.status_ocorrencia,
                              statusCor: getStatusCor(
                                chamado.status_ocorrencia,
                              ),
                              comentario:
                                chamado.descricao || "Nenhum comentário",
                            });
                          }}
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
                            {chamado.num_chamado}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
                            {chamado.categoria}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                            {chamado.nome_user} {chamado.sobrenome_user}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                            {chamado.setor}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <span
                              className={getStatusCor(
                                chamado.status_ocorrencia,
                              )}
                            >
                              {chamado.status_ocorrencia}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                            {new Date(
                              chamado.data_hora_ocorrencia,
                            ).toLocaleDateString("pt-BR")}{" "}
                            às{" "}
                            {new Date(
                              chamado.data_hora_ocorrencia,
                            ).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TABELA ATRIBUÍDOS */}
          <div className="interface py-4 sm:py-6 px-2 sm:px-0">
            <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 sm:mb-4">
              <i className="bi bi-list-check mr-2"></i> Chamados Atribuídos
            </h2>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full min-w-175">
                  <thead className="bg-(--color-monochromatic-1) sticky top-0 z-10">
                    <tr>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left w-22.5">
                        Nº Chamado
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Categoria
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden sm:table-cell">
                        Solicitante
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden md:table-cell">
                        Setor
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center w-25">
                        Status
                      </th>
                      <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                        Data de abertura
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pesquisaChamadosAtribuidos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-(--color-monochromatic-3) text-xs py-8"
                        >
                          Nenhum chamado foi aberto
                        </td>
                      </tr>
                    ) : (
                      pesquisaChamadosAtribuidos.map((chamado) => (
                        <tr
                          key={chamado.num_chamado}
                          className="hover:bg-(--color-monochromatic-4)/20 transition-colors cursor-pointer border-b border-(--color-monochromatic-4)"
                          onClick={() => {
                            setChamadoSelecionado(chamado.num_chamado);
                            const bloqueado =
                              chamado.status_ocorrencia === "Em tratamento" ||
                              chamado.status_ocorrencia === "Em andamento";
                            setPodeRedirecionar(!bloqueado);
                            AbrirModal({
                              numero: chamado.num_chamado,
                              descricao: chamado.categoria,
                              solicitante: `${chamado.nome_user} ${chamado.sobrenome_user}`,
                              setor: chamado.setor,
                              status: chamado.status_ocorrencia,
                              statusCor: getStatusCor(
                                chamado.status_ocorrencia,
                              ),
                              comentario:
                                chamado.descricao || "Nenhum comentário",
                            });
                          }}
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
                            {chamado.num_chamado}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
                            {chamado.categoria}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                            {chamado.nome_user} {chamado.sobrenome_user}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                            {chamado.setor}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            <span
                              className={getStatusCor(
                                chamado.status_ocorrencia,
                              )}
                            >
                              {chamado.status_ocorrencia}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                            {new Date(
                              chamado.data_hora_ocorrencia,
                            ).toLocaleDateString("pt-BR")}{" "}
                            às{" "}
                            {new Date(
                              chamado.data_hora_ocorrencia,
                            ).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FINALIZADOS */}
          <div className="interface pb-2 px-2 sm:px-0 mt-6">
            <button
              onClick={() => setMostrarFinalizados(!mostrarFinalizados)}
              className="flex items-center gap-2 text-xs sm:text-sm text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors font-medium"
            >
              <i
                className={`bi ${mostrarFinalizados ? "bi-chevron-down" : "bi-chevron-right"}`}
              ></i>
              Chamados Finalizados ({pesquisaChamadosFinalizados.length})
            </button>
          </div>

          {mostrarFinalizados && (
            <div className="interface pb-6 px-2 sm:px-0">
              {pesquisaChamadosFinalizados.length === 0 ? (
                <p className="text-(--color-monochromatic-3) text-xs text-center py-4">
                  Nenhum chamado finalizado
                </p>
              ) : (
                <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden opacity-85">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full min-w-200">
                      <thead className="bg-(--color-monochromatic-3) sticky top-0 z-10">
                        <tr>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left w-20">
                            Nº
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                            Categoria
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden sm:table-cell">
                            Solicitante
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden md:table-cell">
                            Setor
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                            Concluído por
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center w-25">
                            Status
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                            Abertura
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pesquisaChamadosFinalizados.map((chamado) => (
                          <tr
                            key={chamado.num_chamado}
                            className="hover:bg-(--color-monochromatic-4)/10 transition-colors cursor-pointer border-b border-(--color-monochromatic-4)"
                            onClick={() => abrirOverview(chamado)}
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-2) font-bold text-xs sm:text-sm whitespace-nowrap">
                              {chamado.num_chamado}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-2) text-xs sm:text-sm">
                              {chamado.categoria}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-2) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                              {chamado.nome_user} {chamado.sobrenome_user}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-2) text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                              {chamado.setor}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-2) text-xs sm:text-sm whitespace-nowrap">
                              {chamado.concluido_por || "—"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                              <span
                                className={getStatusCor(
                                  chamado.status_ocorrencia,
                                )}
                              >
                                {chamado.status_ocorrencia}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-2) text-xs whitespace-nowrap">
                              {new Date(
                                chamado.data_hora_ocorrencia,
                              ).toLocaleDateString("pt-BR")}{" "}
                              às{" "}
                              {new Date(
                                chamado.data_hora_ocorrencia,
                              ).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Overlay + Modal */}
        <div
          id="overlay"
          className="fixed inset-0 bg-black/80 z-40"
          style={{ display: "none" }}
          onClick={FecharModal}
        ></div>
        <div
          id="modalPopUp"
          className="fixed inset-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:max-w-3xl w-full sm:h-auto"
          style={{ display: "none" }}
        >
          <div className="bg-(--color-monochromatic-5) rounded-none shadow-2xl overflow-hidden mx-0 sm:mx-4 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-8">
              <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
                <h1 className="text-lg sm:text-2xl text-(--color-monochromatic-1) font-bold uppercase tracking-wider">
                  Chamado{" "}
                  <span
                    className="text-(--color-monochromatic-2)"
                    id="modalNumero"
                  >
                    #0000
                  </span>
                </h1>
                <button onClick={FecharModal} className="group shrink-0">
                  <i
                    className="bi bi-x-square text-red-500 group-hover:text-red-950 transition-colors cursor-pointer text-xl sm:text-2xl"
                    title="Fechar"
                  ></i>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1)">
                    Categoria:
                  </span>
                  <span
                    className="text-(--color-monochromatic-2) text-xs sm:text-sm"
                    id="modalDescricao"
                  >
                    {" "}
                    -{" "}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1)">
                    Solicitante:
                  </span>
                  <span
                    className="text-(--color-monochromatic-2) text-xs sm:text-sm"
                    id="modalSolicitante"
                  >
                    {" "}
                    -{" "}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1)">
                    Setor:
                  </span>
                  <span
                    className="text-(--color-monochromatic-2) text-xs sm:text-sm"
                    id="modalSetor"
                  >
                    {" "}
                    -{" "}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1)">
                  Status:
                </span>
                <span id="modalStatus" className="inline-block ml-2">
                  {" "}
                  -{" "}
                </span>
              </div>
              {/* Anexos */}
              {anexosOverview.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="bi bi-paperclip text-(--color-monochromatic-2)"></i>
                    Anexos ({anexosOverview.length})
                  </h3>
                  <div className="bg-(--color-monochromatic-4)/5 rounded-lg p-4 space-y-2 mb-4">
                    {anexosOverview.map((anexo) => (
                      <div
                        key={anexo.id_anexo}
                        className="flex items-center justify-between gap-3 bg-(--color-monochromatic-4)/10 rounded-lg p-3 hover:bg-(--color-monochromatic-4)/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-(--color-monochromatic-1)/10 rounded-lg flex items-center justify-center shrink-0">
                            <i
                              className={`text-sm ${
                                anexo.tipo_mime.startsWith("image/")
                                  ? "bi bi-file-image text-blue-500"
                                  : "bi bi-file-pdf text-red-500"
                              }`}
                            ></i>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-(--color-monochromatic-1) truncate font-medium">
                              {anexo.nome_original}
                            </p>
                            <p className="text-[10px] text-(--color-monochromatic-3)">
                              {(anexo.tamanho_bytes / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={anexo.caminho}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-(--color-monochromatic-2) hover:text-blue-500 transition-colors"
                            title="Visualizar"
                          >
                            <i className="bi bi-eye text-lg"></i>
                          </a>
                          <a
                            href={anexo.caminho}
                            download={anexo.nome_original}
                            className="text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
                            title="Baixar"
                          >
                            <i className="bi bi-download text-lg"></i>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1) block mb-1">
                  Comentário:
                </span>
                <div className="border border-(--color-monochromatic-4) p-2 sm:p-3 rounded-lg bg-(--color-monochromatic-4)/10">
                  <p
                    id="modalComentario"
                    className="text-xs sm:text-sm text-(--color-monochromatic-1) leading-relaxed"
                  ></p>
                </div>
              </div>
              <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3"
                id="botoesModal"
              >
                <BotaoEstilizado
                  icon="bi-check-circle-fill"
                  texto="Iniciar Atendimento"
                  id="btIniciarAtendimento"
                  onClick={iniciarAtendimento}
                />
                <BotaoEstilizado
                  icon="bi-arrow-down-up"
                  texto="Redirecionar Chamado"
                  id="btRedirecionarChamado"
                  onClick={AbrirListaFuncionarios}
                  disabled={!podeRedirecionar}
                />
              </div>
              <div id="redirecionarFuncionarios" style={{ display: "none" }}>
                <select
                  name="funcionarios"
                  defaultValue=""
                  id="listaFuncionarios"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm mt-4"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {serviceDesk.map((sd) => (
                    <option key={sd.id_user} value={sd.id_user}>
                      {sd.nome_user} {sd.sobrenome_user} - {sd.username}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex justify-end gap-3">
                  <BotaoEstilizado
                    icon="bi-send"
                    texto="Encaminhar"
                    id="btEncaminharChamado"
                    onClick={async () => {
                      const select = document.getElementById(
                        "listaFuncionarios",
                      ) as HTMLSelectElement;
                      const idTecnico = Number(select.value);
                      const textoSelecionado =
                        select.options[select.selectedIndex]?.text || "";
                      const usernameDestino =
                        textoSelecionado.split(" - ")[1] || "";

                      if (!idTecnico || !chamadoSelecionado) {
                        alert("Selecione um técnico");
                        return;
                      }

                      const { EncaminharChamado } = await import("./script");
                      const sucesso = await EncaminharChamado(
                        chamadoSelecionado,
                        idTecnico,
                        usernameDestino,
                      );

                      if (sucesso) {
                        FecharListaFuncionarios();
                        FecharModal();
                        window.location.reload();
                      }
                    }}
                  />

                  <BotaoEstilizado
                    icon="bi-x-circle-fill"
                    texto="Cancelar"
                    id="btCancelarEncaminharChamado"
                    onClick={FecharListaFuncionarios}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL OVERVIEW (FINALIZADOS) */}
        {modalOverview && dadosOverview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setModalOverview(false)}
            ></div>
            <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Cabeçalho */}
              <div className="sticky top-0 bg-(--color-monochromatic-1) px-5 sm:px-6 py-3 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                    <i className="bi bi-check-lg text-white text-sm"></i>
                  </div>
                  <div>
                    <h2 className="text-(--color-monochromatic-5) font-bold uppercase tracking-wider text-xs sm:text-sm">
                      Chamado {dadosOverview?.num_chamado} — Finalizado
                    </h2>
                    <p className="text-(--color-monochromatic-4) text-[10px]">
                      {new Date(
                        dadosOverview?.data_hora_conclusao ||
                          dadosOverview?.data_hora_ocorrencia,
                      ).toLocaleDateString("pt-BR")}{" "}
                      às{" "}
                      {new Date(
                        dadosOverview?.data_hora_conclusao ||
                          dadosOverview?.data_hora_ocorrencia,
                      ).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOverview(false)}
                  className="text-(--color-monochromatic-4) hover:text-white transition-colors"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Seção: Solicitante */}
                <div>
                  <h3 className="text-sm font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="bi bi-person-fill text-(--color-monochromatic-2)"></i>{" "}
                    Solicitante
                  </h3>
                  <div className="bg-(--color-monochromatic-4)/5 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Nome
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {dadosOverview?.nome_user}{" "}
                        {dadosOverview?.sobrenome_user}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Setor
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {dadosOverview?.setor}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Categoria
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {dadosOverview?.categoria}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Descrição do Problema
                      </span>
                      <p className="text-xs text-(--color-monochromatic-2) mt-1">
                        {dadosOverview?.descricao || "Sem descrição"}
                      </p>
                    </div>
                    {/* Anexos */}
                    {anexosOverview.length > 0 && (
                      <div className="col-span-2 sm:col-span-3 mt-2">
                        <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block mb-2">
                          <i className="bi bi-paperclip mr-1"></i>
                          Anexos ({anexosOverview.length})
                        </span>
                        <div className="space-y-2">
                          {anexosOverview.map((anexo) => (
                            <div
                              key={anexo.id_anexo}
                              className="flex items-center justify-between gap-3 bg-(--color-monochromatic-4)/10 rounded-lg p-2.5 hover:bg-(--color-monochromatic-4)/20 transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0 shadow-sm">
                                  <i
                                    className={`text-xs ${
                                      anexo.tipo_mime.startsWith("image/")
                                        ? "bi bi-file-image text-blue-500"
                                        : "bi bi-file-pdf text-red-500"
                                    }`}
                                  ></i>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-(--color-monochromatic-1) truncate font-medium">
                                    {anexo.nome_original}
                                  </p>
                                  <p className="text-[10px] text-(--color-monochromatic-3)">
                                    {(anexo.tamanho_bytes / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={anexo.caminho}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                                  title="Visualizar"
                                >
                                  <i className="bi bi-eye text-xs"></i>
                                </a>
                                <a
                                  href={anexo.caminho}
                                  download={anexo.nome_original}
                                  className="bg-(--color-monochromatic-3) text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-1) transition-colors"
                                  title="Baixar"
                                >
                                  <i className="bi bi-download text-xs"></i>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção: Atendimento */}
                <div>
                  <h3 className="text-sm font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="bi bi-headset text-(--color-monochromatic-2)"></i>{" "}
                    Atendimento
                  </h3>
                  <div className="bg-(--color-monochromatic-4)/5 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Concluído por
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {dadosOverview?.username_tecnico
                          ? `${dadosOverview.username_tecnico} - ${dadosOverview.nome_tecnico} ${dadosOverview.sobrenome_tecnico}`
                          : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Status
                      </span>
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {dadosOverview?.status_ocorrencia}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Concluído em
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {dadosOverview?.data_hora_conclusao
                          ? `${new Date(dadosOverview.data_hora_conclusao).toLocaleDateString("pt-BR")} às ${new Date(dadosOverview.data_hora_conclusao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Linha do tempo dos registros */}
                  <h4 className="text-xs font-bold text-(--color-monochromatic-2) uppercase tracking-wider mb-3">
                    <i className="bi bi-clock-history mr-1"></i> Histórico de
                    Registros ({historicoOverview.length})
                  </h4>
                  {historicoOverview.length === 0 ? (
                    <p className="text-xs text-(--color-monochromatic-3) text-center py-4">
                      Nenhum registro de atendimento
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {historicoOverview.map(
                        (h: MeusRegistros, index: number) => (
                          <div
                            key={index}
                            className="relative pl-6 border-l-2 border-(--color-monochromatic-4)"
                          >
                            <div
                              className={`absolute -left-2.25 top-1 w-4 h-4 rounded-full border-2 border-(--color-monochromatic-5) ${
                                h.status === "concluido"
                                  ? "bg-green-500"
                                  : h.status === "redirecionado"
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                              }`}
                            ></div>
                            <div className="bg-(--color-monochromatic-4)/10 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-(--color-monochromatic-1)">
                                  {h.login_tecnico}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    h.status === "concluido"
                                      ? "bg-green-100 text-green-800"
                                      : h.status === "redirecionado"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {h.status}
                                </span>
                              </div>

                              {/* Comentário original do registro */}
                              <div className="mb-2 bg-(--color-monochromatic-4)/5 rounded p-2 border-l-2 border-(--color-monochromatic-3)">
                                <p className="text-xs text-(--color-monochromatic-2)">
                                  {h.comentario || "Sem comentário"}
                                </p>
                                <p className="text-[10px] text-(--color-monochromatic-3) mt-1">
                                  {new Date(
                                    h.data_hora_atendimento,
                                  ).toLocaleDateString("pt-BR")}{" "}
                                  às{" "}
                                  {new Date(
                                    h.data_hora_atendimento,
                                  ).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>

                              {/* Comentários adicionais */}
                              {comentariosOverview[h.id_atendimento]?.length >
                                0 && (
                                <div className="space-y-2 mt-2">
                                  {comentariosOverview[h.id_atendimento].map(
                                    (c, i) => (
                                      <div
                                        key={i}
                                        className="bg-(--color-monochromatic-4)/5 rounded p-2 border-l-2 border-(--color-monochromatic-2)"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] font-bold text-(--color-monochromatic-1)">
                                            {c.login_tecnico}
                                          </span>
                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                              c.status === "concluido"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                                          >
                                            {c.status}
                                          </span>
                                        </div>
                                        <p className="text-xs text-(--color-monochromatic-2)">
                                          {c.comentario}
                                        </p>
                                        <p className="text-[10px] text-(--color-monochromatic-3) mt-1">
                                          {new Date(
                                            c.data_hora_comentario,
                                          ).toLocaleDateString("pt-BR")}{" "}
                                          às{" "}
                                          {new Date(
                                            c.data_hora_comentario,
                                          ).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-(--color-monochromatic-3) mt-2">
                                <span>
                                  <i className="bi bi-tag mr-1"></i>
                                  {h.manifestacao}
                                </span>
                                <span>
                                  <i className="bi bi-folder mr-1"></i>
                                  {h.grupo_manifestacao}
                                </span>
                                {h.tipo_manifestacao !== "—" && (
                                  <span>
                                    <i className="bi bi-check2-circle mr-1"></i>
                                    {h.tipo_manifestacao}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <FooterEstilizacao />
      </div>
    </>
  );
}
