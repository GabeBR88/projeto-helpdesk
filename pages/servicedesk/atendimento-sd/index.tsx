import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FooterEstilizacao from "@/pages/components/footer";
import TituloSite from "@/pages/components/title";
import TopBar from "@/pages/components/topbar";
import {
  DetalhesChamado,
  Manifestacao,
  GrupoManifestacao,
  TipoManifestacao,
  StatusSD,
} from "@/types/interfaces";

export default function PainelAtendimentoSD() {
  const router = useRouter();
  const { chamado } = router.query;

  const [dadosUsuario, setDadosUsuario] = useState({
    nome_user: "",
    sobrenome_user: "",
  });

  const [loading, setLoading] = useState(true);
  const numeroChamado =
    router.isReady && typeof chamado === "string" ? (chamado as string) : "";

  // Perfil
  useEffect(() => {
    let montado = true;
    fetch("/api/my-tickets/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push("/");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (montado && data) {
          setDadosUsuario({
            nome_user: data.nome_user || "",
            sobrenome_user: data.sobrenome_user || "",
          });
          setLoading(false);
        }
      })
      .catch(() => {
        router.push("/");
      });
    return () => {
      montado = false;
    };
  }, [router]);

  const handleVoltar = () => router.push("/servicedesk");
  const [dadosChamado, setDadosChamado] = useState<DetalhesChamado | null>(
    null,
  );

  useEffect(() => {
    if (numeroChamado) {
      fetch(`/api/desk-tickets/detalhes-chamado?chamado=${numeroChamado}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📦 Dados do chamado:", data);
          setDadosChamado(data);
        })
        .catch((err) => console.error("Erro ao buscar chamado:", err));
    }
  }, [numeroChamado]);

  // Aqui as informações da Manifestação serão inseridas
  // Manifestação
  const [manifestacao, setManifestacao] = useState<Manifestacao[]>([]);
  const [manifestacaoSelecionada, setManifestacaoSelecionada] = useState("");

  useEffect(() => {
    fetch("/api/registro-sd/manifestacao/manifestacao")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setManifestacao(data);
      })
      .catch((err) => console.error("Erro manifestacao:", err));
  }, []);

  // Grupo de Manifestação
  const [grupoManifestacao, setGrupoManifestacao] = useState<
    GrupoManifestacao[]
  >([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState("");

  useEffect(() => {
    fetch("/api/registro-sd/grupo-manifestacao/grupo-manifestacao")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setGrupoManifestacao(data);
        } else {
          console.error("API não retornou um array: ", data);
          setGrupoManifestacao([]);
        }
      })
      .catch((err) => {
        console.error("Erro grupo manifestação: ", err);
        setGrupoManifestacao([]);
      });
  }, []);

  // Tipo de Manifestação
  const [tipoManifestacao, setTipoManifestacao] = useState<TipoManifestacao[]>(
    [],
  );
  const [tipoSelecionado, setTipoSelecionado] = useState("");

  useEffect(() => {
    if (grupoSelecionado) {
      fetch(
        `/api/registro-sd/tipo-manifestacao/tipo-manifestacao?grupo=${grupoSelecionado}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTipoManifestacao(data);
          } else {
            setTipoManifestacao([]);
          }
          setTipoSelecionado("");
        })
        .catch(() => {
          setTipoManifestacao([]);
          setTipoSelecionado("");
        });
    } else {
      // eslint-disable-next-line
      setTipoManifestacao([]);
      setTipoSelecionado("");
    }
  }, [grupoSelecionado]);

  // Status SD
  const [status, setStatus] = useState<StatusSD[]>([]);
  const [statusSelecionado, setStatusSelecionado] = useState("");

  useEffect(() => {
    fetch("/api/registro-sd/status-sd/status-sd")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStatus(data);
        } else {
          console.error("API não retornou um array: ", data);
          setStatus([]);
        }
      })
      .catch((err) => {
        console.error("Erro status: ", err);
        setStatus([]);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-monochromatic-4)">
        <div className="w-10 h-10 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <TituloSite titulo="Painel de Atendimento" />

      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar
          nomeUsuario={`${dadosUsuario.nome_user} ${dadosUsuario.sobrenome_user}`}
        />

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Cabeçalho */}
          <div className="interface pt-6 sm:pt-8 pb-2">
            <h1 className="text-lg sm:text-2xl text-(--color-monochromatic-1) font-bold uppercase tracking-wider mb-2">
              <i className="bi bi-headset mr-2"></i> Painel de Atendimento
            </h1>
            <p className="text-xs text-(--color-monochromatic-2) font-bold mb-4">
              Nº do chamado: #{numeroChamado}
            </p>
          </div>

          {/* Card: Dados do Solicitante */}
          <div className="interface pb-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden">
                {/* Cabeçalho do card */}
                <div className="bg-(--color-monochromatic-1) px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--color-monochromatic-2) rounded-full flex items-center justify-center shrink-0">
                    <i className="bi bi-person-fill text-(--color-monochromatic-5) text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-(--color-monochromatic-5) font-bold uppercase tracking-wider text-xs sm:text-sm">
                      Dados do Solicitante
                    </h2>
                    <p className="text-(--color-monochromatic-4) text-[10px] sm:text-xs">
                      Informações de contato e detalhes da solicitação
                    </p>
                  </div>
                </div>

                {/* Corpo do card */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-5 mb-6">
                    {/* Solicitante */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="bi bi-person-badge text-(--color-monochromatic-3) text-base sm:text-lg mt-0.5"></i>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block">
                          Solicitante
                        </span>
                        <span className="text-(--color-monochromatic-1) text-xs sm:text-sm font-medium">
                          {dadosChamado?.nome_user}{" "}
                          {dadosChamado?.sobrenome_user}
                        </span>
                      </div>
                    </div>

                    {/* Setor */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="bi bi-building text-(--color-monochromatic-3) text-base sm:text-lg mt-0.5"></i>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block">
                          Setor
                        </span>
                        <span className="text-(--color-monochromatic-1) text-xs sm:text-sm font-medium">
                          {dadosChamado?.setor}
                        </span>
                      </div>
                    </div>

                    {/* Login */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="bi bi-person-circle text-(--color-monochromatic-3) text-base sm:text-lg mt-0.5"></i>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block">
                          Login
                        </span>
                        <span className="text-(--color-monochromatic-1) text-xs sm:text-sm font-medium">
                          {dadosChamado?.username}
                        </span>
                      </div>
                    </div>

                    {/* Telefone */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="bi bi-telephone text-(--color-monochromatic-3) text-base sm:text-lg mt-0.5"></i>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block">
                          Telefone
                        </span>
                        <span className="text-(--color-monochromatic-1) text-xs sm:text-sm font-medium">
                          {dadosChamado?.telefone}
                        </span>
                      </div>
                    </div>

                    {/* E-mail */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="bi bi-envelope text-(--color-monochromatic-3) text-base sm:text-lg mt-0.5"></i>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block">
                          E-mail
                        </span>
                        <span className="text-(--color-monochromatic-1) text-xs sm:text-sm font-medium break-all">
                          {dadosChamado?.email_user}
                        </span>
                      </div>
                    </div>

                    {/* Problema */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="bi bi-exclamation-triangle-fill text-(--color-monochromatic-3) text-base sm:text-lg mt-0.5"></i>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block">
                          Problema
                        </span>
                        <span className="text-(--color-monochromatic-1) text-xs sm:text-sm font-medium break-all">
                          {dadosChamado?.categoria}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-2 sm:gap-3">
                      <i className="bi bi-flag text-(--color-monochromatic-3) text-base sm:text-lg mt-0.5"></i>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block">
                          Status
                        </span>
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                          {dadosChamado?.status_ocorrencia}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-(--color-monochromatic-4) my-4 sm:my-5"></div>

                  <div className="mb-4 sm:mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block mb-2">
                      <i className="bi bi-exclamation-triangle mr-1"></i>{" "}
                      Descrição do Problema
                    </span>
                    <p className="text-xs sm:text-sm text-(--color-monochromatic-1) leading-relaxed">
                      {dadosChamado?.descricao}
                    </p>
                  </div>

                  <div className="mb-4 sm:mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-(--color-monochromatic-3) block mb-2">
                      <i className="bi bi-paperclip mr-1"></i> Anexos
                    </span>
                    <div className="flex items-center gap-2 bg-(--color-monochromatic-4)/10 border border-(--color-monochromatic-4) rounded-lg px-3 py-2 w-fit cursor-pointer hover:bg-(--color-monochromatic-4)/20 transition-colors">
                      <i className="bi bi-file-pdf text-red-500"></i>
                      <span className="text-xs sm:text-sm text-(--color-monochromatic-1) underline">
                        nota.pdf
                      </span>
                      <i className="bi bi-download text-(--color-monochromatic-3) text-xs"></i>
                    </div>
                  </div>

                  <div className="flex justify-start mt-4 sm:mt-6">
                    <button
                      onClick={handleVoltar}
                      className="flex items-center gap-2 text-xs sm:text-sm text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors font-medium cursor-pointer"
                    >
                      <i className="bi bi-arrow-left"></i>
                      Voltar para Chamados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registro de Atendimento */}
          <div className="interface pb-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden">
                {/* Cabeçalho do card */}
                <div className="bg-(--color-monochromatic-1) px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--color-monochromatic-2) rounded-full flex items-center justify-center shrink-0">
                    <i className="bi bi-clipboard-check text-(--color-monochromatic-5) text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-(--color-monochromatic-5) font-bold uppercase tracking-wider text-xs sm:text-sm">
                      Registro de Atendimento
                    </h2>
                    <p className="text-(--color-monochromatic-4) text-[10px] sm:text-xs">
                      Registre as ações realizadas neste chamado
                    </p>
                  </div>
                </div>

                {/* Corpo do card */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
                    {/* Manifestação */}
                    <div>
                      <label
                        htmlFor="categoria"
                        className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1) mb-2 block"
                      >
                        <i className="bi bi-diagram-3 mr-1"></i> Manifestação
                      </label>
                      <select
                        value={manifestacaoSelecionada}
                        onChange={(e) =>
                          setManifestacaoSelecionada(e.target.value)
                        }
                        id="categoria"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                      >
                        <option value="" disabled>
                          Escolha uma opção...
                        </option>
                        {manifestacao.map((m) => (
                          <option key={m.id_manifestacao} value={m.codigo}>
                            {m.descricao}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grupo de Manifestação */}
                    <div>
                      <label
                        htmlFor="grupoManifestacao"
                        className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1) mb-2 block"
                      >
                        <i className="bi bi-folder mr-1"></i> Grupo de
                        Manifestação
                      </label>
                      <select
                        value={grupoSelecionado}
                        onChange={(e) => setGrupoSelecionado(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                      >
                        <option value="" disabled>
                          Escolha uma opção...
                        </option>
                        {grupoManifestacao.map((g) => (
                          <option key={g.id_grupo} value={g.codigo}>
                            {g.descricao}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo de Manifestação */}
                    <div>
                      <label
                        htmlFor="tipoManifestacao"
                        className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1) mb-2 block"
                      >
                        <i className="bi bi-check2-circle mr-1"></i> Tipo de
                        Manifestação
                      </label>
                      <select
                        value={tipoSelecionado}
                        onChange={(e) => setTipoSelecionado(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                      >
                        <option value="" disabled>
                          Escolha uma opção...
                        </option>
                        {tipoManifestacao.map((t) => (
                          <option key={t.id_tipo} value={t.codigo}>
                            {t.descricao}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-(--color-monochromatic-4) my-4 sm:my-5"></div>

                  <div className="mb-4 sm:mb-5">
                    <label
                      htmlFor="comentarioAtendimento"
                      className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1) block mb-2"
                    >
                      <i className="bi bi-chat-left-text mr-1"></i> Comentário
                    </label>
                    <textarea
                      id="comentarioAtendimento"
                      name="comentario"
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm resize-y"
                      placeholder="Descreva o que foi feito neste atendimento..."
                    ></textarea>
                  </div>
                  {/* Status atendimento SD */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4">
                    <div className="w-full sm:w-48">
                      <label
                        htmlFor="statusAtendimento"
                        className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-(--color-monochromatic-1) mb-2 block"
                      >
                        <i className="bi bi-flag mr-1"></i> Status
                      </label>
                      <select
                        value={statusSelecionado}
                        onChange={(e) => setStatusSelecionado(e.target.value)}
                        id="statusAtendimento"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                      >
                        <option value="" disabled>
                          Escolha uma opção...
                        </option>
                        {status.map((s) => (
                          <option key={s.id_status} value={s.codigo}>
                            {s.descricao}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 text-xs sm:text-sm text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors font-medium cursor-pointer">
                        <i className="bi bi-arrow-left"></i>
                        Cancelar
                      </button>
                      <button className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 font-bold uppercase tracking-wider hover:bg-(--color-monochromatic-2) transition-colors duration-200 rounded-lg flex items-center gap-2">
                        <i className="bi bi-check-lg"></i>
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico de Chamados */}
          <div className="interface pb-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-(--color-monochromatic-1) px-4 sm:px-6 py-3 flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-(--color-monochromatic-2) rounded-full flex items-center justify-center shrink-0">
                    <i className="bi bi-clock-history text-(--color-monochromatic-5) text-sm sm:text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-(--color-monochromatic-5) font-bold uppercase tracking-wider text-xs sm:text-sm">
                      Histórico de Chamados
                    </h2>
                    <p className="text-(--color-monochromatic-4) text-[10px] sm:text-xs">
                      Registros de atendimento realizados
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-175">
                    <thead className="bg-(--color-monochromatic-4)/20">
                      <tr>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap">
                          Chamado
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap">
                          Login
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap">
                          Manifestação
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap">
                          Grupo
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap">
                          Tipo
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center whitespace-nowrap">
                          Status
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left whitespace-nowrap">
                          Data/Hora
                        </th>
                      </tr>
                    </thead>
                    <tbody id="historicoBody">
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center text-(--color-monochromatic-3) text-xs py-8"
                        >
                          Nenhum registro encontrado
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
