import { BotaoEstilizado, BotaoPrincipal } from "../components/button";
import {
  atualizarNomeArquivo,
  botaoLimpar,
  removerArquivo,
  obterArquivosAcumulados,
  limparArquivosAposEnvio,
} from "./script";
import FooterEstilizacao from "../components/footer";
import TituloSite from "../components/title";
import TopBar from "../components/topbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CategoriasUser,
  MeuChamado,
  Setor,
  DetalhesChamado,
  MeusRegistros,
  Comentario,
  Anexo,
} from "@/types/interfaces";

export default function PerfilUsuario() {
  const [setor, setSetor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [meusChamados, setMeusChamados] = useState<MeuChamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [dadosUsuario, setDadosUsuario] = useState({
    nome_user: "",
    sobrenome_user: "",
    email_user: "",
    telefone: "",
    perfil: "",
  });
  const [categorias, setCategorias] = useState<CategoriasUser[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);

  // Modal de consulta
  const [modalConsulta, setModalConsulta] = useState(false);
  const [dadosChamado, setDadosChamado] = useState<DetalhesChamado | null>(
    null,
  );
  const [historicoChamado, setHistoricoChamado] = useState<MeusRegistros[]>([]);
  const [comentariosChamado, setComentariosChamado] = useState<
    Record<number, Comentario[]>
  >({});
  const [anexosChamado, setAnexosChamado] = useState<Anexo[]>([]);

  useEffect(() => {
    fetch("/api/setores/setores")
      .then((res) => res.json())
      .then((data) => setSetores(data));
  }, []);

  useEffect(() => {
    fetch("/api/categorias/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((error) => console.error("Erro ao buscar dados:", error));
  }, []);

  const categoriasPorGrupo = categorias.reduce(
    (acc, cat) => {
      if (!acc[cat.grupo]) acc[cat.grupo] = [];
      acc[cat.grupo].push(cat);
      return acc;
    },
    {} as Record<string, typeof categorias>,
  );

  const carregarDados = async () => {
    try {
      const [perfilRes, chamadosRes] = await Promise.all([
        fetch("/api/my-tickets/profile"),
        fetch("/api/my-tickets/meus-chamados-pendentes"),
      ]);

      if (!perfilRes.ok || !chamadosRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const perfil = await perfilRes.json();
      const chamados = await chamadosRes.json();

      setDadosUsuario({
        nome_user: perfil.nome_user || "",
        sobrenome_user: perfil.sobrenome_user || "",
        email_user: perfil.email_user || "",
        telefone: perfil.telefone || "",
        perfil: perfil.perfil || "",
      });

      setMeusChamados(chamados);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const carregar = async () => {
      await carregarDados();
    };

    carregar();
  }, []);

  const fecharFormularioLocal = () => {
    setMostrarFormulario(false);
  };

  const handleSubmitOcorrencia = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setMensagem("");

    try {
      // 1. Cria o chamado
      const resposta = await fetch("/api/my-tickets/enviar-ocorrencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setor, categoria, descricao }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro);
        return;
      }

      // 2. Se tem arquivos acumulados, faz upload
      const arquivos = obterArquivosAcumulados();
      if (arquivos.length > 0 && dados.id_ocorrencia) {
        const formData = new FormData();
        formData.append("id_ocorrencia", dados.id_ocorrencia.toString());

        for (const file of arquivos) {
          formData.append("anexos", file);
        }

        await fetch("/api/anexos/upload", {
          method: "POST",
          body: formData,
        });
      }

      await carregarDados();
      fecharFormularioLocal();

      setMensagem(`${dados.num_chamado} criado com sucesso!`);

      setTimeout(() => {
        setMensagem("");
      }, 3000);

      setSetor("");
      setCategoria("");
      setDescricao("");
      limparArquivosAposEnvio();
    } catch (error) {
      console.error("Erro:", error);
      setMensagem("Erro ao criar chamado");
    }
  };

  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "usuario=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    await router.push("/");
  };

  // Função para abrir modal de consulta do chamado
  const abrirConsultaChamado = async (chamado: MeuChamado) => {
    try {
      const numLimpo = chamado.num_chamado.replace("#", "");

      const [resDetalhes, resHistorico] = await Promise.all([
        fetch(`/api/desk-tickets/detalhes-chamado?chamado=${numLimpo}`),
        fetch(`/api/desk-tickets/meus-registros?chamado=${numLimpo}`),
      ]);

      const detalhes = await resDetalhes.json();
      const historico = await resHistorico.json();

      // Filtra apenas registros do técnico (não redirecionamento)
      const historicoFiltrado = Array.isArray(historico)
        ? historico.filter((h: MeusRegistros) => h.status !== "redirecionado")
        : [];

      setDadosChamado(detalhes);
      setHistoricoChamado(historicoFiltrado);

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
      setComentariosChamado(comentariosMap);

      // Carrega anexos do chamado
      if (detalhes?.id_ocorrencia) {
        fetch(`/api/anexos/listar?id_ocorrencia=${detalhes.id_ocorrencia}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setAnexosChamado(data);
            else setAnexosChamado([]);
          })
          .catch(() => setAnexosChamado([]));
      } else {
        setAnexosChamado([]);
      }

      setModalConsulta(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-monochromatic-4)">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-(--color-monochromatic-2) text-sm font-medium">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TituloSite titulo="Perfil Usuário" />

      <div className="min-h-screen flex flex-col bg-(--color-monochromatic-4)">
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
          {/* Hero Section - Botão Abrir Chamado */}
          {!mostrarFormulario && (
            <div className="interface py-10 sm:py-16 px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-(--color-monochromatic-1)/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="bi bi-headset text-2xl sm:text-3xl text-(--color-monochromatic-1)"></i>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) mb-2">
                    Central de Atendimento
                  </h1>
                  <p className="text-xs sm:text-sm text-(--color-monochromatic-2) max-w-md mx-auto">
                    Precisa de ajuda? Abra um chamado e nossa equipe irá
                    atendê-lo o mais rápido possível.
                  </p>
                </div>
                <BotaoEstilizado
                  icon="bi bi-plus-circle"
                  texto="Abrir chamado"
                  id="btAbrirChamado"
                  onClick={() => setMostrarFormulario(true)}
                />
              </div>
            </div>
          )}

          {/* Mensagem de feedback */}
          {mensagem && (
            <div className="interface py-4 px-4">
              <div
                className={`max-w-md mx-auto p-4 rounded-xl shadow-sm border ${
                  mensagem.includes("sucesso")
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <p className="text-sm font-medium text-center flex items-center justify-center gap-2">
                  <i
                    className={`bi ${
                      mensagem.includes("sucesso")
                        ? "bi-check-circle-fill"
                        : "bi-exclamation-circle-fill"
                    }`}
                  ></i>
                  {mensagem}
                </p>
              </div>
            </div>
          )}

          {/* Formulário */}
          {mostrarFormulario && (
            <div className="interface mt-4 sm:mt-8 px-2 sm:px-4">
              <div className="max-w-3xl mx-auto">
                <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-lg overflow-hidden border border-(--color-monochromatic-4)/30">
                  {/* Cabeçalho do formulário */}
                  <div className="bg-(--color-monochromatic-1) px-5 sm:px-6 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <i className="bi bi-plus-circle text-white text-sm"></i>
                    </div>
                    <div>
                      <h2 className="text-white font-bold uppercase tracking-wider text-xs sm:text-sm">
                        Novo Chamado
                      </h2>
                      <p className="text-white/70 text-[10px]">
                        Preencha os dados para abrir uma solicitação
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <form
                      id="criarChamado"
                      className="flex flex-col gap-5"
                      onSubmit={handleSubmitOcorrencia}
                    >
                      {/* Nome | Sobrenome */}
                      <div>
                        <label className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block">
                          <i className="bi bi-person-fill mr-2"></i>
                          Nome | Sobrenome
                          <span className="text-red-500 ml-1">*</span>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={dadosUsuario.nome_user}
                            readOnly
                            className="w-full sm:w-1/2 px-4 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) rounded-lg outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm cursor-default"
                            required
                          />

                          <input
                            type="text"
                            value={dadosUsuario.sobrenome_user}
                            readOnly
                            className="w-full sm:w-1/2 px-4 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) rounded-lg outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm cursor-default"
                            required
                          />
                        </div>
                      </div>

                      {/* E-mail e Telefone */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="inEmailUsuario"
                            className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                          >
                            <i className="bi bi-envelope-at-fill mr-2"></i>
                            E-mail
                            <span className="text-red-500 ml-1">*</span>
                          </label>

                          <input
                            type="email"
                            id="inEmailUsuario"
                            value={dadosUsuario.email_user}
                            readOnly
                            className="w-full px-4 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) rounded-lg outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm cursor-default"
                            required
                          />
                        </div>

                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="inTelefoneUsuario"
                            className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                          >
                            <i className="bi bi-telephone-fill mr-2"></i>
                            Telefone
                            <span className="text-red-500 ml-1">*</span>
                          </label>

                          <input
                            type="tel"
                            id="inTelefoneUsuario"
                            value={dadosUsuario.telefone}
                            readOnly
                            className="w-full px-4 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) rounded-lg outline-none transition-all duration-200 text-(--color-monochromatic-1) text-xs sm:text-sm cursor-default"
                            required
                          />
                        </div>
                      </div>

                      {/* Setor e Categoria */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="inSetorUsuario"
                            className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                          >
                            <i className="bi bi-buildings-fill mr-2"></i>
                            Setor
                            <span className="text-red-500 ml-1">*</span>
                          </label>

                          <select
                            value={setor}
                            onChange={(e) => setSetor(e.target.value)}
                            className="w-full px-4 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white rounded-lg outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecione o setor...
                            </option>
                            {setores.map((s) => (
                              <option key={s.id_setor} value={s.codigo}>
                                {s.descricao}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-1/2">
                          <label
                            htmlFor="inCategoria"
                            className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                          >
                            <i className="bi bi-tag-fill mr-1"></i>
                            Categoria
                            <span className="text-red-500 ml-1">*</span>
                          </label>

                          <select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="w-full px-4 py-2.5 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white rounded-lg outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                            required
                          >
                            <option value="" disabled>
                              Selecione a categoria...
                            </option>

                            {Object.entries(categoriasPorGrupo).map(
                              ([grupo, items]) => (
                                <optgroup key={grupo} label={grupo}>
                                  {items.map((cat) => (
                                    <option
                                      key={cat.id_categoria}
                                      value={cat.codigo}
                                    >
                                      {cat.descricao}
                                    </option>
                                  ))}
                                </optgroup>
                              ),
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Anexar arquivo */}
                      <div>
                        <label
                          htmlFor="anexarArquivo"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-paperclip mr-1"></i>
                          Anexar Arquivo
                          <span className="text-(--color-monochromatic-3) text-[10px] ml-2 font-normal normal-case">
                            (opcional - máximo 5 arquivos, 5MB cada)
                          </span>
                        </label>

                        <div className="flex items-center gap-3 flex-wrap">
                          <label
                            htmlFor="anexarArquivo"
                            className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) text-xs px-4 py-2.5 font-bold uppercase tracking-wider cursor-pointer hover:bg-(--color-monochromatic-2) transition-all duration-200 rounded-lg shadow-sm hover:shadow-md active:scale-95 inline-flex items-center gap-2"
                          >
                            <i className="bi bi-folder2-open"></i>
                            Escolher
                          </label>

                          <span
                            id="nomeArquivo"
                            className="text-(--color-monochromatic-3) text-xs truncate max-w-40 sm:max-w-60"
                          >
                            Nenhum arquivo selecionado
                          </span>

                          <button
                            type="button"
                            id="btnRemoverArquivo"
                            className="text-(--color-monochromatic-3) hover:text-red-500 transition-colors hidden"
                            onClick={removerArquivo}
                            title="Remover arquivos"
                          >
                            <i className="bi bi-x-circle-fill text-lg"></i>
                          </button>
                        </div>

                        {/* Lista de arquivos selecionados */}
                        <div
                          id="listaArquivos"
                          className="mt-3 space-y-1.5 hidden"
                        ></div>

                        <input
                          type="file"
                          id="anexarArquivo"
                          className="hidden"
                          onChange={atualizarNomeArquivo}
                          accept="image/*,.pdf"
                          multiple
                        />
                      </div>

                      {/* Descrição */}
                      <div>
                        <label
                          htmlFor="inTextoArea"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-pencil-fill mr-2"></i>
                          Descrição do Problema
                          <span className="text-red-500 ml-1">*</span>
                        </label>

                        <textarea
                          id="inTextoArea"
                          value={descricao}
                          onChange={(e) => setDescricao(e.target.value)}
                          rows={5}
                          placeholder="Descreva detalhadamente o problema que você está enfrentando..."
                          className="w-full px-4 py-3 bg-(--color-monochromatic-4)/10 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white rounded-lg outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm resize-y"
                          required
                        />
                      </div>

                      {/* Botões */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center pt-2">
                        <BotaoPrincipal
                          icon="bi-send-check"
                          texto="Enviar Chamado"
                          tipo="submit"
                        />

                        <BotaoPrincipal
                          icon="bi-eraser"
                          texto="Limpar"
                          tipo="button"
                          onClick={() =>
                            botaoLimpar(setSetor, setCategoria, setDescricao)
                          }
                        />

                        <BotaoPrincipal
                          icon="bi-x-circle-fill"
                          texto="Cancelar"
                          tipo="button"
                          onClick={() => setMostrarFormulario(false)}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Meus Chamados */}
          {!loading && meusChamados.length > 0 && (
            <div className="interface py-6 sm:py-8 px-2 sm:px-0">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-4 flex items-center gap-2">
                  <i className="bi bi-list-check text-(--color-monochromatic-2)"></i>
                  Meus Chamados
                  <span className="text-[10px] font-normal normal-case tracking-normal bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-2 py-0.5 rounded-full ml-2">
                    {meusChamados.length}
                  </span>
                </h2>
                <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-md overflow-hidden border border-(--color-monochromatic-4)/20">
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full min-w-150">
                      <thead className="bg-(--color-monochromatic-1) sticky top-0 z-10">
                        <tr>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2.5 sm:py-3 text-left">
                            <i className="bi bi-hash mr-1"></i>
                            Nº Chamado
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2.5 sm:py-3 text-left">
                            <i className="bi bi-tag mr-1"></i>
                            Categoria
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2.5 sm:py-3 text-left hidden sm:table-cell">
                            <i className="bi bi-building mr-1"></i>
                            Setor
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2.5 sm:py-3 text-left hidden sm:table-cell">
                            <i className="bi bi-calendar mr-1"></i>
                            Data
                          </th>
                          <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                            <i className="bi bi-flag mr-1"></i>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--color-monochromatic-4)/30">
                        {meusChamados.map((chamado) => (
                          <tr
                            key={chamado.num_chamado}
                            onClick={() => abrirConsultaChamado(chamado)}
                            className="hover:bg-(--color-monochromatic-4)/10 transition-colors cursor-pointer group"
                          >
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap group-hover:text-(--color-monochromatic-2) transition-colors">
                              {chamado.num_chamado}
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-(--color-monochromatic-2) text-xs sm:text-sm">
                              {chamado.categoria}
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-(--color-monochromatic-2) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                              {chamado.setor}
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-(--color-monochromatic-2) text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                              {new Date(
                                chamado.data_hora_ocorrencia,
                              ).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                              <span
                                className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap shadow-sm ${
                                  chamado.status_ocorrencia === "Pendente"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    : chamado.status_ocorrencia ===
                                          "Em andamento" ||
                                        chamado.status_ocorrencia ===
                                          "Em tratamento"
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : "bg-green-100 text-green-800 border border-green-200"
                                }`}
                              >
                                {chamado.status_ocorrencia}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estado vazio */}
          {!loading && meusChamados.length === 0 && !mostrarFormulario && (
            <div className="interface py-10 px-4">
              <div className="max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-(--color-monochromatic-4)/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-inbox text-2xl text-(--color-monochromatic-3)"></i>
                </div>
                <h3 className="text-sm font-bold text-(--color-monochromatic-2) mb-2">
                  Nenhum chamado encontrado
                </h3>
                <p className="text-xs text-(--color-monochromatic-3)">
                  Você ainda não possui chamados. Clique em &quot;Abrir
                  chamado&quot; para começar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Consulta do Chamado */}
        {modalConsulta && dadosChamado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setModalConsulta(false)}
            ></div>
            <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Cabeçalho */}
              <div className="sticky top-0 bg-(--color-monochromatic-1) px-5 sm:px-6 py-3 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <i className="bi bi-search text-white text-sm"></i>
                  </div>
                  <div>
                    <h2 className="text-(--color-monochromatic-5) font-bold uppercase tracking-wider text-xs sm:text-sm">
                      Chamado {dadosChamado?.num_chamado}
                    </h2>
                    <p className="text-(--color-monochromatic-4) text-[10px]">
                      Acompanhamento da solicitação
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalConsulta(false)}
                  className="text-(--color-monochromatic-4) hover:text-white transition-colors"
                >
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Status atual */}
                <div className="flex items-center gap-3 bg-(--color-monochromatic-4)/5 rounded-xl p-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      dadosChamado?.status_ocorrencia === "Finalizado"
                        ? "bg-green-500"
                        : dadosChamado?.status_ocorrencia === "Em tratamento" ||
                            dadosChamado?.status_ocorrencia === "Em andamento"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-yellow-500"
                    }`}
                  ></div>
                  <div>
                    <span className="text-xs font-bold text-(--color-monochromatic-1)">
                      Status: {dadosChamado?.status_ocorrencia}
                    </span>
                    {dadosChamado?.data_hora_conclusao && (
                      <p className="text-[10px] text-(--color-monochromatic-3)">
                        Finalizado em:{" "}
                        {new Date(
                          dadosChamado.data_hora_conclusao,
                        ).toLocaleDateString("pt-BR")}{" "}
                        às{" "}
                        {new Date(
                          dadosChamado.data_hora_conclusao,
                        ).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detalhes do chamado */}
                <div className="bg-(--color-monochromatic-4)/5 rounded-lg p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                      Categoria
                    </span>
                    <span className="text-xs text-(--color-monochromatic-1)">
                      {dadosChamado?.categoria}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                      Setor
                    </span>
                    <span className="text-xs text-(--color-monochromatic-1)">
                      {dadosChamado?.setor}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold uppercase text-(--color-monochromatic-3) block">
                      Descrição
                    </span>
                    <p className="text-xs text-(--color-monochromatic-2) mt-1">
                      {dadosChamado?.descricao || "Sem descrição"}
                    </p>
                  </div>
                </div>

                {/* Anexos */}
                {anexosChamado.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 flex items-center gap-2">
                      <i className="bi bi-paperclip text-(--color-monochromatic-2)"></i>
                      Anexos ({anexosChamado.length})
                    </h3>
                    <div className="bg-(--color-monochromatic-4)/5 rounded-lg p-4 space-y-2">
                      {anexosChamado.map((anexo) => (
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

                {/* Timeline de atendimento */}
                <div>
                  <h3 className="text-xs font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-4 flex items-center gap-2">
                    <i className="bi bi-clock-history text-(--color-monochromatic-2)"></i>
                    Histórico de Atendimento
                  </h3>

                  {historicoChamado.length === 0 ? (
                    <div className="text-center py-6 bg-(--color-monochromatic-4)/5 rounded-lg">
                      <i className="bi bi-hourglass-split text-2xl text-(--color-monochromatic-3) block mb-2"></i>
                      <p className="text-xs text-(--color-monochromatic-3)">
                        {dadosChamado?.status_ocorrencia === "Pendente"
                          ? "Chamado aguardando atendimento"
                          : "Nenhum registro de atendimento"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historicoChamado.map((h, index) => (
                        <div
                          key={index}
                          className="relative pl-6 border-l-2 border-(--color-monochromatic-4)"
                        >
                          <div
                            className={`absolute -left-2.25 top-1 w-4 h-4 rounded-full border-2 border-(--color-monochromatic-5) ${
                              h.status === "concluido"
                                ? "bg-green-500"
                                : "bg-amber-500"
                            }`}
                          ></div>
                          <div className="bg-(--color-monochromatic-4)/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-(--color-monochromatic-1)">
                                {h.login_tecnico}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  h.status === "concluido"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {h.status}
                              </span>
                            </div>

                            {/* Comentário original */}
                            <div className="mb-2 bg-(--color-monochromatic-4)/10 rounded p-2">
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
                            {comentariosChamado[h.id_atendimento]?.length >
                              0 && (
                              <div className="space-y-2">
                                {comentariosChamado[h.id_atendimento].map(
                                  (c, i) => (
                                    <div
                                      key={i}
                                      className="bg-(--color-monochromatic-4)/10 rounded p-2 border-l-2 border-(--color-monochromatic-2)"
                                    >
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
                            </div>
                          </div>
                        </div>
                      ))}
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
