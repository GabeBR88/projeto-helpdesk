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
          <a href="#">Sair</a>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Meu painel */}
          <div className="interface pt-6 sm:pt-8 pb-4 sm:pb-6">
            <h1 className="text-lg sm:text-2xl text-(--color-monochromatic-1) font-bold uppercase tracking-wider mb-4 sm:mb-6">
              <i className="bi bi-tv-fill mr-2"></i> Meu painel
            </h1>

            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <CardIndicativo quantidade={12} textoIndicativo="Abertos" />
              <CardIndicativo quantidade={5} textoIndicativo="Em fila" />
              <CardIndicativo quantidade={3} textoIndicativo="Urgentes" />
              <CardIndicativo quantidade={8} textoIndicativo="Hoje" />
            </div>
          </div>

          {/* Buscar chamado */}
          <div className="interface pt-2 pb-2 px-2 sm:px-0">
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm p-4 sm:p-6 max-w-lg mx-auto">
              <label
                htmlFor="pesquisaChamado"
                className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 block"
              >
                <i className="bi bi-search mr-2"></i> Buscar Chamado
              </label>
              <div className="flex items-center gap-0">
                <input
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-r-0 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm rounded-l-full"
                  type="text"
                  name="pesquisa"
                  id="pesquisaChamado"
                  placeholder="Insira o número do chamado"
                  required
                />
                <button className="bg-(--color-monochromatic-1) hover:bg-(--color-monochromatic-2) text-(--color-monochromatic-5) px-4 sm:px-5 py-2.5 sm:py-3 rounded-r-full transition-colors duration-200">
                  <i className="bi bi-search text-base sm:text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="interface py-4 sm:py-6 px-2 sm:px-0">
            <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 sm:mb-4">
              <i className="bi bi-list-check mr-2"></i> Chamados Atribuídos
            </h2>

            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full min-w-150">
                <thead className="bg-(--color-monochromatic-1)">
                  <tr>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Nº
                    </th>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Descrição
                    </th>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Solicitante
                    </th>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                      Setor
                    </th>
                    <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center">
                      Status
                    </th>
                  </tr>
                </thead>
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
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                      João
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
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
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                      Pedro
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
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
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                      Ana
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
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
                  <option value="Phc3455">
                    Pedro Henrique da Cunha - Login: Phc3455
                  </option>
                  <option value="Gcf3178">
                    Gabriel Conrado da Fonseca - Login: Gcf3178
                  </option>
                  <option value="Lbs7865">
                    Larissa Borges Schworer - Login: Lbs7865
                  </option>
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
