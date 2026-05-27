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
import { ChamadoSD, SdSetor } from "@/types/interfaces";

function getStatusCor(status: string): string {
  switch (status) {
    case "Pendente":
      return "bg-yellow-100 text-yellow-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap";
    case "Em andamento":
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

  const handleLogout = () => {
    document.cookie = "usuario=; path=/; max-age=0";
    router.push("/");
  };

  const [serviceDesk, setServiceDesk] = useState<SdSetor[]>([]);
  const [quantidadePendente, setQuantidadePendente] = useState<number>(0);
  const [foraPrazo, setForaPrazo] = useState<number>(0);
  const [chamadosHoje, setChamadosHoje] = useState<number>(0);
  const [quantidadeFinalizado, setQuantidadeFinalizado] = useState<number>(0);
  const [todosChamados, setTodosChamados] = useState<ChamadoSD[]>([]);
  const [chamadosFinalizados, setChamadosFinalizados] = useState<ChamadoSD[]>(
    [],
  );
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState("");

  useEffect(() => {
    fetch("/api/sd-setor/sd-setor")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServiceDesk(data);
        else setServiceDesk([]);
      })
      .catch(() => setServiceDesk([]));
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
          if (montado && Array.isArray(data)) setTodosChamados(data);
        })
        .catch(() => {});

      fetch("/api/desk-tickets/chamados-finalizados")
        .then((res) => res.json())
        .then((data) => {
          if (montado && Array.isArray(data)) setChamadosFinalizados(data);
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

  // Função que verifica se a linha corresponde à busca
  const linhaCorresponde = (chamado: ChamadoSD) => {
    if (!termoBusca.trim()) return false;
    const termo = termoBusca.toLowerCase();
    const nomeCompleto =
      `${chamado.nome_user} ${chamado.sobrenome_user}`.toLowerCase();
    return (
      chamado.num_chamado.toLowerCase().includes(termo) ||
      nomeCompleto.includes(termo) ||
      (chamado.concluido_por || "").toLowerCase().includes(termo) ||
      chamado.setor.toLowerCase().includes(termo) ||
      chamado.categoria.toLowerCase().includes(termo)
    );
  };

  // Função que retorna a classe do <tr> conforme a busca
  const getLinhaClasse = (chamado: ChamadoSD, ehFinalizado: boolean) => {
    const base =
      "transition-all duration-300 cursor-pointer border-b border-(--color-monochromatic-4)";
    if (!termoBusca.trim()) {
      return `${base} ${ehFinalizado ? "hover:bg-(--color-monochromatic-4)/10" : "hover:bg-(--color-monochromatic-4)/20"}`;
    }
    if (linhaCorresponde(chamado)) {
      return `${base} bg-amber-100/80 ring-2 ring-amber-400 shadow-md scale-[1.01] z-10 relative`;
    }
    return `${base} opacity-40`;
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

  return (
    <>
      <TituloSite titulo="Perfil ServiceDesk" />

      <div className="min-h-screen flex flex-col">
        <TopBar
          nomeUsuario={`${dadosUsuario.nome_user} ${dadosUsuario.sobrenome_user}`}
        />

        <div
          onClick={handleLogout}
          className="flex justify-end mt-2 mr-5 uppercase text-xs text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) underline cursor-pointer transition-colors"
        >
          Sair
        </div>

        <div className="flex-1">
          {/* Cabeçalho + Busca */}
          <div className="interface pt-6 sm:pt-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-2xl text-(--color-monochromatic-1) font-bold uppercase tracking-wider">
                <i className="bi bi-tv-fill mr-2"></i> Meu painel
              </h1>
              <div className="w-full sm:w-72 shrink-0">
                <div className="flex items-center gap-0">
                  <input
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-(--color-monochromatic-5) border-2 border-r-0 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs rounded-l-full"
                    type="text"
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Buscar por nº, nome ou técnico..."
                  />
                  <button className="bg-(--color-monochromatic-1) hover:bg-(--color-monochromatic-2) text-(--color-monochromatic-5) px-4 py-2 sm:py-2.5 rounded-r-full transition-colors duration-200">
                    <i className="bi bi-search text-sm sm:text-base"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <CardIndicativo
                quantidade={quantidadePendente}
                textoIndicativo="Pendentes"
                title="Chamados aguardando atendimento"
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
                title="Chamados finalizados hoje"
              />
            </div>
          </div>

          {/* Tabela Pendentes */}
          <div className="interface py-4 sm:py-6 px-2 sm:px-0">
            <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 sm:mb-4">
              <i className="bi bi-list-check mr-2"></i> Chamados Atribuídos
            </h2>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full min-w-150">
                <thead className="bg-(--color-monochromatic-1)">
                  <tr>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
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
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center">
                      Status
                    </th>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center">
                      Data de abertura
                    </th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full min-w-150">
                  <tbody>
                    {todosChamados.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-(--color-monochromatic-3) text-xs py-8"
                        >
                          Nenhum chamado foi aberto
                        </td>
                      </tr>
                    ) : (
                      todosChamados.map((chamado) => (
                        <tr
                          key={chamado.num_chamado}
                          className={getLinhaClasse(chamado, false)}
                          onClick={() =>
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
                            })
                          }
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

          {/* Finalizados */}
          <div className="interface pb-2 px-2 sm:px-0 mt-6">
            <button
              onClick={() => setMostrarFinalizados(!mostrarFinalizados)}
              className="flex items-center gap-2 text-xs sm:text-sm text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors font-medium"
            >
              <i
                className={`bi ${mostrarFinalizados ? "bi-chevron-down" : "bi-chevron-right"}`}
              ></i>
              Chamados Finalizados ({chamadosFinalizados.length})
            </button>
          </div>

          {mostrarFinalizados && (
            <div className="interface pb-6 px-2 sm:px-0">
              {chamadosFinalizados.length === 0 ? (
                <p className="text-(--color-monochromatic-3) text-xs text-center py-4">
                  Nenhum chamado finalizado
                </p>
              ) : (
                <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden opacity-85">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full min-w-150">
                      <thead className="bg-(--color-monochromatic-3) sticky top-0 z-10">
                        <tr>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
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
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center">
                            Status
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center">
                            Abertura
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {chamadosFinalizados.map((chamado) => (
                          <tr
                            key={chamado.num_chamado}
                            className={getLinhaClasse(chamado, true)}
                            onClick={() =>
                              AbrirModal({
                                numero: chamado.num_chamado,
                                descricao: chamado.categoria,
                                solicitante: `${chamado.nome_user} ${chamado.sobrenome_user}`,
                                setor: chamado.setor,
                                status: chamado.status_ocorrencia,
                                statusCor: getStatusCor(
                                  chamado.status_ocorrencia,
                                ),
                                comentario: chamado.descricao || "",
                              })
                            }
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

        {/* Overlay */}
        <div
          id="overlay"
          className="fixed inset-0 bg-black/80 z-40"
          style={{ display: "none" }}
          onClick={FecharModal}
        ></div>

        {/* Modal */}
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

              <div className="mb-4">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1)">
                  Anexos:
                </span>
                <span className="text-(--color-monochromatic-2) text-xs sm:text-sm underline cursor-pointer hover:text-(--color-monochromatic-1)">
                  {" "}
                  nota.pdf
                </span>
              </div>

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
                />
                <BotaoEstilizado
                  icon="bi-arrow-down-up"
                  texto="Redirecionar Chamado"
                  id="btRedirecionarChamado"
                  onClick={AbrirListaFuncionarios}
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
                    <option key={sd.id_user} value={sd.username}>
                      {sd.nome_user} {sd.sobrenome_user} - {sd.username}
                    </option>
                  ))}
                </select>

                <div className="mt-3 flex justify-end gap-3">
                  <BotaoEstilizado
                    icon="bi-send"
                    texto="Encaminhar"
                    id="btEncaminharChamado"
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

        <FooterEstilizacao />
      </div>
    </>
  );
}
