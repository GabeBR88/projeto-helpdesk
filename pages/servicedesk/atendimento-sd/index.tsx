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
  MeusRegistros,
  Comentario,
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
          setDadosChamado(data);
        })
        .catch((err) => console.error("Erro ao buscar chamado:", err));
    }
  }, [numeroChamado]);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const [comentario, setComentario] = useState("");

  const handleCancelar = () => {
    setManifestacaoSelecionada("");
    setGrupoSelecionado("");
    setTipoSelecionado("");
    setStatusSelecionado("");
    setComentario("");
  };

  const salvarRegistro = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const resposta = await fetch("/api/desk-tickets/salvar-registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_ocorrencia: dadosChamado?.id_ocorrencia,
        manifestacao: manifestacaoSelecionada,
        grupo: grupoSelecionado,
        tipo: tipoSelecionado,
        comentario: comentario,
        status: statusSelecionado,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro);
      return;
    }

    alert(dados.mensagem);
    handleCancelar();

    // Recarrega histórico
    fetch(`/api/desk-tickets/meus-registros?chamado=${numeroChamado}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistorico(data);
      });

    // Recarrega dados do chamado
    fetch(`/api/desk-tickets/detalhes-chamado?chamado=${numeroChamado}`)
      .then((res) => res.json())
      .then((data) => {
        setDadosChamado(data);
      });
  };

  const [historico, setHistorico] = useState<MeusRegistros[]>([]);

  useEffect(() => {
    if (numeroChamado) {
      fetch(`/api/desk-tickets/meus-registros?chamado=${numeroChamado}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setHistorico(data);
        })
        .catch(() => setHistorico([]));
    }
  }, [numeroChamado]);

  // Filtra registros que NÃO são de redirecionamento
  const registrosTecnico = historico.filter(
    (h) => h.status !== "redirecionado",
  );

  // Tem registro feito por técnico (que não seja redirecionamento)?
  const temRegistroTecnico = registrosTecnico.length > 0;

  // Último registro do técnico (para verificar se está concluído)
  const ultimoRegistroTecnico = registrosTecnico[0];

  // Se tem registro do técnico com status "concluido", bloqueia tudo
  const tecnicoFinalizou = ultimoRegistroTecnico?.status === "concluido";

  // O formulário de Registro de Atendimento só fica ativo se:
  // NÃO tem registro de técnico ainda (independente de ter redirecionamento)
  const formularioAtivo = !temRegistroTecnico;

  // ========== MODAL INDIVIDUAL ==========
  const [modalRegistro, setModalRegistro] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] =
    useState<MeusRegistros | null>(null);
  const [novoComentario, setNovoComentario] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  const abrirModalRegistro = async (registro: MeusRegistros) => {
    setRegistroSelecionado(registro);
    setNovoComentario("");
    setNovoStatus("");
    setModalRegistro(true);

    // Carrega os comentários desse atendimento
    fetch(
      `/api/desk-tickets/comentarios?id_atendimento=${registro.id_atendimento}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setComentarios(data);
      })
      .catch(() => setComentarios([]));
  };

  const salvarNovoComentario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registroSelecionado) return;

    const resposta = await fetch("/api/desk-tickets/salvar-comentario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_atendimento: registroSelecionado.id_atendimento,
        comentario: novoComentario,
        status: novoStatus,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro);
      return;
    }

    alert(dados.mensagem);
    setNovoComentario("");
    setNovoStatus("");

    // Recarrega os comentários do modal
    fetch(
      `/api/desk-tickets/comentarios?id_atendimento=${registroSelecionado.id_atendimento}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setComentarios(data);
      });

    // Recarrega dados do chamado (para atualizar o status)
    fetch(`/api/desk-tickets/detalhes-chamado?chamado=${numeroChamado}`)
      .then((res) => res.json())
      .then((data) => {
        setDadosChamado(data);
      });

    // Recarrega histórico também (pois o status pode ter mudado)
    fetch(`/api/desk-tickets/meus-registros?chamado=${numeroChamado}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setHistorico(data);
      });
  };

  // Verifica se o registro selecionado no modal pode receber novos comentários
  const podeComentar =
    registroSelecionado &&
    registroSelecionado.status !== "redirecionado" &&
    registroSelecionado.status !== "concluido" &&
    !tecnicoFinalizou;

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
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            dadosChamado?.status_ocorrencia === "Finalizado"
                              ? "bg-green-100 text-green-800"
                              : dadosChamado?.status_ocorrencia ===
                                  "Em tratamento"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
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
                <form onSubmit={salvarRegistro}>
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
                          disabled={!formularioAtivo}
                          required
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm ${
                            !formularioAtivo
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
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
                          disabled={!formularioAtivo}
                          onChange={(e) => setGrupoSelecionado(e.target.value)}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm ${
                            !formularioAtivo
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
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
                          disabled={!formularioAtivo}
                          onChange={(e) => setTipoSelecionado(e.target.value)}
                          required
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm ${
                            !formularioAtivo
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
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
                        value={comentario}
                        disabled={!formularioAtivo}
                        onChange={(e) => setComentario(e.target.value)}
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
                          disabled={!formularioAtivo}
                          onChange={(e) => setStatusSelecionado(e.target.value)}
                          id="statusAtendimento"
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm ${
                            !formularioAtivo
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
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
                        <button
                          type="button"
                          disabled={!formularioAtivo}
                          className="flex items-center gap-2 text-xs sm:text-sm text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors font-medium cursor-pointer"
                          onClick={handleCancelar}
                        >
                          <i className="bi bi-arrow-left"></i>
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={!formularioAtivo}
                          className={`bg-(--color-monochromatic-1) text-(--color-monochromatic-5) text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 font-bold uppercase tracking-wider hover:bg-(--color-monochromatic-2) transition-colors duration-200 rounded-lg flex items-center gap-2 ${
                            !formularioAtivo
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <i className="bi bi-check-lg"></i>
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
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
                      Histórico do Chamado
                    </h2>
                    <p className="text-(--color-monochromatic-4) text-[10px] sm:text-xs">
                      Registros de atendimento realizados
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-150">
                    <thead className="bg-(--color-monochromatic-4)/20">
                      <tr>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                          Chamado
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                          Técnico
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden sm:table-cell">
                          Manifestação
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left hidden md:table-cell">
                          Status
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                          Data/Hora
                        </th>
                        <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-center">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center text-(--color-monochromatic-3) text-xs py-8"
                          >
                            Nenhum registro encontrado
                          </td>
                        </tr>
                      ) : (
                        historico.map((registro, index) => (
                          <tr
                            key={index}
                            className="border-b border-(--color-monochromatic-4) hover:bg-(--color-monochromatic-4)/10 transition-colors"
                          >
                            <td className="px-2 sm:px-4 py-3 text-(--color-monochromatic-1) font-bold text-xs whitespace-nowrap">
                              {registro.num_chamado}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-(--color-monochromatic-1) text-xs whitespace-nowrap">
                              {registro.login_tecnico}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-(--color-monochromatic-1) text-xs whitespace-nowrap hidden sm:table-cell">
                              {registro.manifestacao}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-center hidden md:table-cell">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  registro.status === "concluido"
                                    ? "bg-green-100 text-green-800"
                                    : registro.status === "redirecionado"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {registro.status}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-(--color-monochromatic-1) text-xs whitespace-nowrap">
                              {new Date(
                                registro.data_hora_atendimento,
                              ).toLocaleDateString("pt-BR")}{" "}
                              às{" "}
                              {new Date(
                                registro.data_hora_atendimento,
                              ).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-center">
                              <button
                                onClick={() => abrirModalRegistro(registro)}
                                className="text-xs font-bold text-(--color-monochromatic-1) hover:text-(--color-monochromatic-2) underline transition-colors cursor-pointer"
                              >
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Individual do Registro */}
          {/* Modal Individual do Registro */}
          {modalRegistro && registroSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setModalRegistro(false)}
              ></div>

              {/* Modal */}
              <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                {/* Cabeçalho */}
                <div
                  className={`sticky top-0 px-5 sm:px-6 py-3 flex items-center justify-between rounded-t-2xl z-10 ${
                    registroSelecionado.status === "redirecionado"
                      ? "bg-blue-600"
                      : registroSelecionado.status === "concluido"
                        ? "bg-green-600"
                        : "bg-(--color-monochromatic-1)"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <i
                        className={`text-white text-sm ${
                          registroSelecionado.status === "redirecionado"
                            ? "bi bi-arrow-left-right"
                            : registroSelecionado.status === "concluido"
                              ? "bi bi-check-circle-fill"
                              : "bi bi-clock-history"
                        }`}
                      ></i>
                    </div>
                    <div>
                      <h2 className="text-white font-bold uppercase tracking-wider text-xs sm:text-sm">
                        {registroSelecionado.status === "redirecionado"
                          ? "Registro de Redirecionamento"
                          : "Registro de Atendimento"}
                      </h2>
                      <p className="text-white/70 text-[10px]">
                        {registroSelecionado.login_tecnico} •{" "}
                        {new Date(
                          registroSelecionado.data_hora_atendimento,
                        ).toLocaleDateString("pt-BR")}{" "}
                        às{" "}
                        {new Date(
                          registroSelecionado.data_hora_atendimento,
                        ).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalRegistro(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <i className="bi bi-x-lg text-xl"></i>
                  </button>
                </div>

                {/* Corpo */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-(--color-monochromatic-1)">
                      Status:
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        registroSelecionado.status === "concluido"
                          ? "bg-green-100 text-green-800"
                          : registroSelecionado.status === "redirecionado"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {registroSelecionado.status}
                    </span>
                  </div>

                  {/* Detalhes */}
                  <div className="bg-(--color-monochromatic-4)/5 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Técnico Responsável
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {registroSelecionado.login_tecnico}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Manifestação
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {registroSelecionado.manifestacao}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                        Grupo
                      </span>
                      <span className="text-xs text-(--color-monochromatic-1)">
                        {registroSelecionado.grupo_manifestacao}
                      </span>
                    </div>

                    {registroSelecionado.tipo_manifestacao !== "—" && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                          Tipo
                        </span>
                        <span className="text-xs text-(--color-monochromatic-1)">
                          {registroSelecionado.tipo_manifestacao}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ✅ NOVO: Timeline de Comentários */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block mb-2">
                      <i className="bi bi-chat-left-text mr-1"></i> Comentários
                    </span>

                    {/* Comentário original do registro */}
                    <div className="bg-(--color-monochromatic-4)/10 rounded-lg p-3 mb-3 border-l-2 border-(--color-monochromatic-3)">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-(--color-monochromatic-1)">
                          {registroSelecionado.login_tecnico}
                        </span>
                        <span className="text-[10px] text-(--color-monochromatic-3)">
                          {new Date(
                            registroSelecionado.data_hora_atendimento,
                          ).toLocaleDateString("pt-BR")}{" "}
                          às{" "}
                          {new Date(
                            registroSelecionado.data_hora_atendimento,
                          ).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-(--color-monochromatic-2)">
                        {registroSelecionado.comentario || "Sem comentário"}
                      </p>
                    </div>

                    {/* Comentários adicionais */}
                    {comentarios.length > 0 && (
                      <div className="space-y-2">
                        {comentarios.map((c, i) => (
                          <div
                            key={i}
                            className="bg-(--color-monochromatic-4)/5 rounded-lg p-3 border-l-2 border-(--color-monochromatic-2)"
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
                            <p className="text-xs text-(--color-monochromatic-2) mb-1">
                              {c.comentario}
                            </p>
                            <p className="text-[10px] text-(--color-monochromatic-3)">
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
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mensagem de bloqueio para redirecionamento */}
                  {registroSelecionado.status === "redirecionado" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <i className="bi bi-lock-fill text-blue-500 text-2xl block mb-2"></i>
                      <p className="text-sm font-bold text-(--color-monochromatic-1)">
                        Registro Automático
                      </p>
                      <p className="text-xs text-(--color-monochromatic-3) mt-1">
                        Este registro foi gerado automaticamente pelo sistema e
                        não pode ser alterado.
                      </p>
                    </div>
                  )}

                  {/* Mensagem de concluído */}
                  {registroSelecionado.status === "concluido" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <i className="bi bi-check-circle-fill text-green-500 text-2xl block mb-2"></i>
                      <p className="text-sm font-bold text-(--color-monochromatic-1)">
                        Chamado Finalizado
                      </p>
                      <p className="text-xs text-(--color-monochromatic-3) mt-1">
                        Não é possível adicionar novos registros.
                      </p>
                    </div>
                  )}

                  {/* Formulário para novo comentário (só para registros de técnico não concluídos) */}
                  {podeComentar && (
                    <>
                      <div className="border-t border-(--color-monochromatic-4) my-4"></div>

                      <form
                        onSubmit={salvarNovoComentario}
                        className="space-y-4"
                      >
                        <h3 className="text-sm font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
                          <i className="bi bi-plus-circle mr-2"></i>Novo
                          Comentário
                        </h3>

                        <textarea
                          value={novoComentario}
                          onChange={(e) => setNovoComentario(e.target.value)}
                          rows={3}
                          required
                          className="w-full px-3 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs rounded-lg resize-y"
                          placeholder="Descreva a atualização deste chamado..."
                        ></textarea>

                        <div className="flex items-center gap-3">
                          <select
                            value={novoStatus}
                            onChange={(e) => setNovoStatus(e.target.value)}
                            required
                            className="px-3 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs rounded-lg"
                          >
                            <option value="" disabled>
                              Status...
                            </option>
                            {status.map((s) => (
                              <option key={s.id_status} value={s.codigo}>
                                {s.descricao}
                              </option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) text-xs px-5 py-2.5 font-bold uppercase tracking-wider hover:bg-(--color-monochromatic-2) transition-colors duration-200 rounded-lg flex items-center gap-2"
                          >
                            <i className="bi bi-check-lg"></i>
                            Salvar
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <FooterEstilizacao />
      </div>
    </>
  );
}
