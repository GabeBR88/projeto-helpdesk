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
import { SdSetor } from "@/types/interfaces";

export default function PerfilServiceDesk() {
  const [dadosUsuario, setDadosUsuario] = useState({
    nome_user: "",
    sobrenome_user: "",
    email_user: "",
    telefone: "",
    perfil: "",
  });

  useEffect(() => {
    fetch("/api/my-tickets/profile")
      .then((res) => res.json())
      .then((dados) =>
        setDadosUsuario({
          nome_user: dados.nome_user || "",
          sobrenome_user: dados.sobrenome_user || "",
          email_user: dados.email_user || "",
          telefone: dados.telefone || "",
          perfil: dados.perfil || "",
        }),
      )
      .catch(() => console.log("Erro ao carregar perfil"));
  }, []);

  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "usuario=; path=/; max-age=0";
    router.push("/");
  };

  // Estados
  const [serviceDesk, setServiceDesk] = useState<SdSetor[]>([]);
  const [quantidadePendente, setQuantidadePendente] = useState<number>(0);
  const [foraPrazo, setForaPrazo] = useState<number>(0);
  const [chamadosHoje, setChamadosHoje] = useState<number>(0);
  const [quantidadeFinalizado, setQuantidadeFinalizado] = useState<number>(0);

  // Funcionários SD - carrega só uma vez (select de redirecionamento)
  // No useEffect:
  useEffect(() => {
    fetch("/api/sd-setor/sd-setor")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setServiceDesk(data);
        } else {
          console.error("API não retornou um array:", data);
          setServiceDesk([]);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar funcionários SD:", error);
        setServiceDesk([]);
      });
  }, []);

  useEffect(() => {
    // Evita setState após o componente ser desmontado
    let montado = true;

    const buscarDadosPainel = () => {
      if (!montado) return; // Sinaliza que saiu

      fetch("/api/status/pendentes")
        .then((res) => res.json())
        .then((data) => {
          if (montado) setQuantidadePendente(data);
        })
        .catch(() => {});

      fetch("/api/status/fora-prazo")
        .then((res) => res.json())
        .then((data) => {
          if (montado) setForaPrazo(data);
        })
        .catch(() => {});

      fetch("/api/status/chamados-do-dia")
        .then((res) => res.json())
        .then((data) => {
          if (montado) setChamadosHoje(data);
        })
        .catch(() => {});

      fetch("/api/status/chamados-finalizados")
        .then((res) => res.json())
        .then((data) => {
          if (montado) setQuantidadeFinalizado(data);
        })
        .catch(() => {});
    };

    buscarDadosPainel();

    const intervalo = setInterval(buscarDadosPainel, 300000);

    const aoFocar = () => buscarDadosPainel();
    window.addEventListener("focus", aoFocar);

    return () => {
      montado = false;
      clearInterval(intervalo);
      window.removeEventListener("focus", aoFocar);
    };
  }, []);

  return (
    <>
      <TituloSite titulo="Perfil ServiceDesk" />

      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar
          nomeUsuario={`${dadosUsuario.nome_user} ${dadosUsuario.sobrenome_user}`}
        />

        {/* Opção de sair */}
        <div
          onClick={handleLogout}
          className="flex justify-end mt-2 mr-5 uppercase text-xs text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) underline cursor-pointer transition-colors"
        >
          Sair
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Cabeçalho do painel + Busca */}
          <div className="interface pt-6 sm:pt-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h1 className="text-lg sm:text-2xl text-(--color-monochromatic-1) font-bold uppercase tracking-wider">
                <i className="bi bi-tv-fill mr-2"></i> Meu painel
              </h1>

              {/* Buscar chamado - movido para o topo */}
              <div className="w-full sm:w-72 shrink-0">
                <div className="flex items-center gap-0">
                  <input
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-(--color-monochromatic-5) border-2 border-r-0 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs rounded-l-full"
                    type="text"
                    name="pesquisa"
                    id="pesquisaChamado"
                    placeholder="Insira o número do chamado"
                    required
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

          {/* Tabela */}
          <div className="interface py-4 sm:py-6 px-2 sm:px-0">
            <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 sm:mb-4">
              <i className="bi bi-list-check mr-2"></i> Chamados Atribuídos
            </h2>

            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden">
              {/* Cabeçalho fixo */}
              <table className="w-full min-w-150">
                <thead className="bg-(--color-monochromatic-1)">
                  <tr>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Nº
                    </th>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Descrição
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
                  </tr>
                </thead>
              </table>

              {/* Corpo com scroll */}
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full min-w-150">
                  <tbody>
                    <tr
                      className="border-b border-(--color-monochromatic-4) hover:bg-(--color-monochromatic-4)/10 transition-colors cursor-pointer"
                      onClick={() =>
                        AbrirModal({
                          numero: "#1023",
                          descricao: "Internet lenta",
                          solicitante: "João",
                          setor: "Financeiro",
                          status: "⏳ Em andamento",
                          statusCor:
                            "bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap",
                        })
                      }
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
                        #1023
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
                        Internet lenta
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                        João
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                        Financeiro
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                          ⏳ Em andamento
                        </span>
                      </td>
                    </tr>
                    <tr
                      className="border-b border-(--color-monochromatic-4) hover:bg-(--color-monochromatic-4)/10 transition-colors cursor-pointer"
                      onClick={() =>
                        AbrirModal({
                          numero: "#1024",
                          descricao: "Impressora",
                          solicitante: "Pedro",
                          setor: "Atuarial",
                          status: "🔴 Urgente",
                          statusCor:
                            "bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap",
                        })
                      }
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
                        #1024
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
                        Impressora
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                        Pedro
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                        Atuarial
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className="bg-red-100 text-red-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                          🔴 Urgente
                        </span>
                      </td>
                    </tr>
                    <tr
                      className="hover:bg-(--color-monochromatic-4)/10 transition-colors cursor-pointer"
                      onClick={() =>
                        AbrirModal({
                          numero: "#1025",
                          descricao: "Senha bloqueada",
                          solicitante: "Ana",
                          setor: "Recursos Humanos",
                          status: "🟢 Resolvido",
                          statusCor:
                            "bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap",
                        })
                      }
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
                        #1025
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
                        Senha bloqueada
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                        Ana
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                        Recursos Humanos
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                          🟢 Resolvido
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
              {/* Cabeçalho */}
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

              {/* Informações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1)">
                    Descrição:
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

              {/* Status */}
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
              <div className="mb-4">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1)">
                  Anexos:
                </span>
                <span className="text-(--color-monochromatic-2) text-xs sm:text-sm underline cursor-pointer hover:text-(--color-monochromatic-1)">
                  {" "}
                  nota.pdf
                </span>
              </div>

              {/* Comentário */}
              <div className="mb-4 sm:mb-6">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1) block mb-1">
                  Comentário:
                </span>
                <div className="border border-(--color-monochromatic-4) p-2 sm:p-3 rounded-lg bg-(--color-monochromatic-4)/10">
                  <p className="text-xs sm:text-sm text-(--color-monochromatic-1) leading-relaxed">
                    A impressora do setor B-3 não está funcionando, preciso
                    scannear documentos importantes. O prazo de entrega é hoje
                    às 16h, por favor resolver urgentemente.
                  </p>
                </div>
              </div>

              {/* Botões */}
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

              {/* Redirecionar */}
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

        {/* Footer */}
        <FooterEstilizacao />
      </div>
    </>
  );
}
