import { BotaoEstilizado, BotaoPrincipal } from "../components/button";
import {
  AbrirChamado,
  atualizarNomeArquivo,
  botaoLimpar,
  FecharFormulario,
  removerArquivo,
} from "./script";
import FooterEstilizacao from "../components/footer";
import TituloSite from "../components/title";
import TopBar from "../components/topbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface MeuChamado {
  num_chamado: string;
  categoria: string;
  setor: string;
  status_ocorrencia: string;
  data_hora_ocorrencia: string;
}

export default function PerfilUsuario() {
  const [setor, setSetor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [meusChamados, setMeusChamados] = useState<MeuChamado[]>([]);
  const [dadosUsuario, setDadosUsuario] = useState({
    nome_user: "",
    sobrenome_user: "",
    email_user: "",
    telefone: "",
    perfil: "",
  });

  useEffect(() => {
    // Carregar dados do perfil
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

    // Carregar chamados do usuário
    fetch("/api/my-tickets/meus-chamados-pendentes")
      .then((res) => res.json())
      .then((dados: MeuChamado[]) => setMeusChamados(dados))
      .catch(() => console.log("Erro ao carregar chamados"));
  }, [mensagem]);

  const fecharFormularioLocal = () => {
    const formCard = document.getElementById("formCard");
    const botoesContainer = document.getElementById("botoesContainer");

    if (formCard) formCard.style.display = "none";
    if (botoesContainer) botoesContainer.style.display = "flex";
  };

  const handleSubmitOcorrencia = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setMensagem("");

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

    fecharFormularioLocal();

    setMensagem(`${dados.num_chamado} criado com sucesso!`);

    setSetor("");
    setCategoria("");
    setDescricao("");
  };

  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "usuario=; path=/; max-age=0";
    router.push("/");
  };

  return (
    <>
      <TituloSite titulo="Perfil Usuário" />

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
          <div
            className="interface flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 py-10 sm:py-20 px-4"
            id="botoesContainer"
          >
            <BotaoEstilizado
              icon="bi bi-plus-circle"
              texto="Abrir chamado"
              id="btAbrirChamado"
              onClick={AbrirChamado}
            />

            <BotaoEstilizado
              icon="bi-card-checklist"
              texto="Histórico de chamados"
              id="btHistoricoChamado"
            />
          </div>

          {mensagem && (
            <p
              className={`text-sm font-bold text-center px-4 py-2 rounded-lg ${
                mensagem.includes("sucesso")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {mensagem}
            </p>
          )}

          <div
            className="interface mt-4 sm:mt-10 px-2 sm:px-4"
            id="formCard"
            style={{ display: "none" }}
          >
            <div className="max-w-3xl mx-auto mt-5">
              <div className="bg-(--color-monochromatic-5) rounded-none shadow-2xl overflow-hidden">
                <div className="p-4 sm:p-8">
                  <form
                    id="criarChamado"
                    className="flex flex-col gap-4 sm:gap-5"
                    onSubmit={handleSubmitOcorrencia}
                  >
                    {/* Nome | Sobrenome */}
                    <div>
                      <label className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block">
                        <i className="bi bi-person-fill mr-2"></i>Nome |
                        Sobrenome
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={dadosUsuario.nome_user}
                          readOnly
                          className="w-full sm:w-1/2 px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm"
                          name="nome"
                          id="inNomeUsuario"
                          required
                          autoFocus
                        />
                        <input
                          type="text"
                          value={dadosUsuario.sobrenome_user}
                          readOnly
                          className="w-full sm:w-1/2 px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm"
                          name="sobrenome"
                          id="inSobrenomeUsuario"
                          required
                        />
                      </div>
                    </div>

                    {/* E-mail */}
                    <div>
                      <label
                        htmlFor="inEmailUsuario"
                        className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                      >
                        <i className="bi bi-envelope-at-fill mr-2"></i>E-mail
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        value={dadosUsuario.email_user}
                        readOnly
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm"
                        name="email"
                        id="inEmailUsuario"
                        required
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label
                        htmlFor="inTelefoneUsuario"
                        className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                      >
                        <i className="bi bi-telephone-fill mr-2"></i>Telefone
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        value={dadosUsuario.telefone}
                        readOnly
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm"
                        name="telefone"
                        id="inTelefoneUsuario"
                        required
                      />
                    </div>

                    {/* Setor e Categoria */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-1/2">
                        <label
                          htmlFor="inSetorUsuario"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-buildings-fill mr-2"></i>Setor
                          <span className="text-red-600">*</span>
                        </label>
                        <select
                          name="setor"
                          value={setor}
                          onChange={(e) => setSetor(e.target.value)}
                          id="inSetorUsuario"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                          required
                        >
                          <option value="" disabled>
                            Selecione...
                          </option>
                          <option value="setorAdm">Administrativo</option>
                          <option value="callC">Call Center</option>
                          <option value="processosOp">
                            Processos Operacionais
                          </option>
                          <option value="tesouraria">Tesouraria</option>
                          <option value="diretoria">Diretoria</option>
                          <option value="recepcao">Recepção</option>
                          <option value="rh">Recursos Humanos</option>
                          <option value="segurancaTrab">
                            Segurança do Trabalho
                          </option>
                          <option value="beneficios">Benefícios</option>
                          <option value="emissao">Emissão</option>
                          <option value="atuarial">Atuarial</option>
                          <option value="produtos">Produtos</option>
                          <option value="marketing">Marketing</option>
                          <option value="laboral">Laboral</option>
                          <option value="gerencia">Gerencia</option>
                        </select>
                      </div>

                      <div className="w-full sm:w-1/2">
                        <label
                          htmlFor="inCategoria"
                          className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                        >
                          <i className="bi bi-tag-fill mr-1"></i>Categoria
                          <span className="text-red-600">*</span>
                        </label>
                        <select
                          id="inCategoria"
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          name="categoria"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) cursor-pointer text-xs sm:text-sm"
                          required
                        >
                          <option value="" disabled>
                            Selecione...
                          </option>
                          <optgroup label="Internet e Rede">
                            <option value="internet">Internet</option>
                            <option value="rede">Rede Interna</option>
                            <option value="wifi">Wi-Fi</option>
                          </optgroup>
                          <optgroup label="Impressão">
                            <option value="impressora">Impressora</option>
                            <option value="tonner">
                              Impressora &gt; Tonner
                            </option>
                          </optgroup>
                          <optgroup label="Sistema">
                            <option value="regulacao">
                              Sistema &gt; Regulação
                            </option>
                            <option value="lentidao">
                              Sistema &gt; Lentidão
                            </option>
                            <option value="atualizacao">
                              Sistema &gt; Atualização
                            </option>
                            <option value="sisOutros">
                              Sistema &gt; Outros
                            </option>
                          </optgroup>
                          <optgroup label="Periféricos">
                            <option value="troca">Periférico &gt; Troca</option>
                            <option value="defeito">
                              Periférico &gt; Defeito
                            </option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Anexar arquivo */}
                    <div>
                      <label
                        htmlFor="anexarArquivo"
                        className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                      >
                        <i className="bi bi-paperclip mr-1"></i> Anexar Arquivo
                      </label>
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="anexarArquivo"
                          className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) text-sm px-4 py-2 font-bold uppercase tracking-wider cursor-pointer hover:bg-(--color-monochromatic-2) transition-colors duration-200 rounded-lg"
                        >
                          <i className="bi bi-folder2-open mr-2"></i>Escolher
                        </label>
                        <span
                          id="nomeArquivo"
                          className="text-(--color-monochromatic-3) text-sm truncate max-w-50"
                        >
                          Nenhum arquivo selecionado
                        </span>
                        <button
                          type="button"
                          id="btnRemoverArquivo"
                          className="text-(--color-monochromatic-3) hover:text-red-600 transition-colors hidden"
                          onClick={removerArquivo}
                        >
                          <i className="bi bi-x-circle-fill"></i>
                        </button>
                      </div>
                      <input
                        type="file"
                        id="anexarArquivo"
                        className="hidden"
                        onChange={atualizarNomeArquivo}
                        multiple
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <label
                        htmlFor="inTextoArea"
                        className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 block"
                      >
                        <i className="bi bi-pencil-fill mr-2"></i>Descrição
                      </label>
                      <textarea
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-(--color-monochromatic-4)/20 border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) focus:bg-white outline-none transition-all duration-200 text-(--color-monochromatic-1) placeholder-(--color-monochromatic-3) text-xs sm:text-sm resize-y"
                        name="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        id="inTextoArea"
                        rows={4}
                        placeholder="Escreva detalhes do caso..."
                      ></textarea>
                    </div>

                    {/* Botões */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center mt-2">
                      <BotaoPrincipal
                        icon="bi-send-check"
                        texto="Enviar"
                        tipo="submit"
                      />
                      <BotaoPrincipal
                        icon="bi-eraser"
                        texto="Limpar"
                        tipo="button"
                        onClick={botaoLimpar}
                      />
                      <BotaoPrincipal
                        icon="bi-x-circle-fill"
                        texto="Cancelar"
                        tipo="button"
                        onClick={FecharFormulario}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela chamados */}
        <div className="interface py-4 sm:py-6 px-2 sm:px-0">
          <h2 className="text-base sm:text-lg font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-3 sm:mb-4">
            <i className="bi bi-list-check mr-2"></i> Meus Chamados
          </h2>
          <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full min-w-150">
              <thead className="bg-(--color-monochromatic-1)">
                <tr>
                  <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                    Nº Chamado
                  </th>
                  <th className="text-(--color-monochromatic-5) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 sm:px-4 py-2 sm:py-3 text-left">
                    Categoria
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
                {meusChamados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-(--color-monochromatic-3) text-xs py-8"
                    >
                      Nenhum chamado encontrado
                    </td>
                  </tr>
                ) : (
                  meusChamados.map((chamado, index) => (
                    <tr
                      key={index}
                      className="border-b border-(--color-monochromatic-4) hover:bg-(--color-monochromatic-4)/10 transition-colors cursor-pointer"
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
                        {chamado.num_chamado}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
                        {chamado.categoria}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                        {dadosUsuario.nome_user} {dadosUsuario.sobrenome_user}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
                        {chamado.setor}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <span
                          className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                            chamado.status_ocorrencia === "Pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : chamado.status_ocorrencia === "Em andamento"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {chamado.status_ocorrencia}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <FooterEstilizacao />
      </div>
    </>
  );
}
