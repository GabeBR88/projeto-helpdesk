// Nessa parte definimos QUAIS ações cada grupo tem
const acoesPorGrupo: Record<string, string[]> = {
  Internet: [
    "Resolvido no local",
    "Contato com provedor",
    "Configuração ajustada",
    "Reinicialização do servidor",
    "Escalado para infraestrutura",
    "Desconsiderado — resolvido antes da ação",
  ],
  "Rede Interna": [
    "Resolvido no local",
    "Acionado área responsável",
    "Escalado para infraestrutura",
    "Substituído",
    "Reparado",
    "Desconsiderado — resolvido antes da ação",
  ],
  "Wi-Fi": [
    "Resolvido no local",
    "Contato com provedor",
    "Configuração ajustada",
    "Reinicialização do servidor",
    "Escalado para infraestrutura",
  ],
  Impressora: [
    "Resolvido no local",
    "Substituído",
    "Reparado",
    "Enviado para assistência",
    "Emprestado temporário",
    "Indisponível — aguardando compra",
    "Desconsiderado — resolvido antes da ação",
  ],
  "Impressora - Tonner": [
    "Resolvido no local",
    "Substituído",
    "Reparado",
    "Enviado para assistência",
    "Indisponível — aguardando compra",
  ],
  "Sistema - Regulação": [
    "Resolvido via acesso remoto",
    "Configuração ajustada",
    "Acionado área responsável",
    "Escalado para desenvolvimento",
    "Reinstalação necessária",
    "Outros",
  ],
  "Sistema - Lentidão": [
    "Resolvido via acesso remoto",
    "Configuração ajustada",
    "Reinicialização do servidor",
    "Escalado para desenvolvimento",
    "Orientação ao usuário",
  ],
  "Sistema - Atualização": [
    "Resolvido via acesso remoto",
    "Reinstalação necessária",
    "Escalado para desenvolvimento",
    "Acionado área responsável",
  ],
  "Sistema - Outros": [
    "Resolvido via acesso remoto",
    "Acionado área responsável",
    "Escalado para desenvolvimento",
    "Outros",
  ],
  "Periférico - Troca": [
    "Substituído",
    "Emprestado temporário",
    "Indisponível — aguardando compra",
    "Enviado para assistência",
  ],
  "Periférico - Defeito": [
    "Reparado",
    "Substituído",
    "Enviado para assistência",
    "Desconsiderado — resolvido antes da ação",
  ],
};

// Função que carrega as ações conforme o grupo escolhido
export function atualizarTipoManifestacao() {
  const grupo = document.getElementById(
    "grupoManifestacao",
  ) as HTMLSelectElement;
  const tipo = document.getElementById("tipoManifestacao") as HTMLSelectElement;

  const valorGrupo = grupo?.value;

  // Limpa o select de tipo
  if (tipo)
    tipo.innerHTML =
      '<option value="" disabled selected>Escolha uma opção...</option>';

  // Verifica se o valor NÃO é vazio E NÃO é o disabled
  if (valorGrupo && valorGrupo !== "" && acoesPorGrupo[valorGrupo]) {
    acoesPorGrupo[valorGrupo].forEach((acao) => {
      const option = document.createElement("option");
      option.value = acao;
      option.textContent = acao;
      tipo?.appendChild(option);
    });
  }
}

// Defina a interface no topo do arquivo
interface RegistroChamado {
  chamado: string;
  login: string;
  manifestacao: string;
  grupo: string;
  tipo: string;
  status: string;
  statusCor: string;
  dataHora: string;
  comentario: string;
}

// Use no array
const historicoChamados: RegistroChamado[] = [];

// Função para salvar e adicionar na tabela
export function salvarRegistro() {
  const grupo = document.getElementById(
    "grupoManifestacao",
  ) as HTMLSelectElement;
  const tipo = document.getElementById("tipoManifestacao") as HTMLSelectElement;
  const categoria = document.getElementById("categoria") as HTMLSelectElement;
  const status = document.getElementById(
    "statusAtendimento",
  ) as HTMLSelectElement;
  const comentario = document.getElementById(
    "comentarioAtendimento",
  ) as HTMLTextAreaElement;

  // ⬇️ VALIDAÇÃO: Campos obrigatórios (comentário NÃO é obrigatório)
  if (!categoria?.value) {
    alert("Por favor, selecione a Manifestação.");
    categoria?.focus();
    return;
  }
  if (!grupo?.value) {
    alert("Por favor, selecione o Grupo de Manifestação.");
    grupo?.focus();
    return;
  }
  if (!tipo?.value) {
    alert("Por favor, selecione o Tipo de Manifestação.");
    tipo?.focus();
    return;
  }
  if (!status?.value) {
    alert("Por favor, selecione o Status.");
    status?.focus();
    return;
  }

  const agora = new Date();
  const dataHora =
    agora.toLocaleDateString("pt-BR") + " " + agora.toLocaleTimeString("pt-BR");

  // Pega o texto da opção selecionada (não o value)
  const categoriaTexto = categoria?.selectedOptions[0]?.textContent || "—";
  const grupoTexto = grupo?.selectedOptions[0]?.textContent || "—";
  const tipoTexto = tipo?.selectedOptions[0]?.textContent || "—";
  const statusTexto = status?.selectedOptions[0]?.textContent || "—";
  const statusValor = status?.value || "";

  // Define cor do status
  let statusCor = "";
  if (statusValor === "em_atendimento") {
    statusCor = "bg-amber-100 text-amber-800";
  } else if (statusValor === "concluido") {
    statusCor = "bg-green-100 text-green-800";
  } else if (
    statusValor === "aguardando_fornecedor" ||
    statusValor === "aguardando_usuario" ||
    statusValor === "pausado"
  ) {
    statusCor = "bg-blue-100 text-blue-800";
  }

  const novoRegistro: RegistroChamado = {
    chamado: "#1024",
    login: "GOL005",
    manifestacao: categoriaTexto,
    grupo: grupoTexto,
    tipo: tipoTexto,
    status: statusTexto,
    statusCor: statusCor,
    dataHora: dataHora,
    comentario: comentario?.value || "",
  };

  historicoChamados.push(novoRegistro);
  atualizarTabelaHistorico();

  // Reseta os campos SEM destruir as opções
  if (categoria) categoria.value = "";
  if (grupo) grupo.value = "";
  if (tipo)
    tipo.innerHTML =
      '<option value="" disabled selected>Escolha uma opção...</option>';
  if (status) status.value = "";
  if (comentario) comentario.value = "";

  alert("Registro salvo com sucesso!");
}

// Função que atualiza a tabela no HTML
function atualizarTabelaHistorico() {
  const tbody = document.getElementById(
    "historicoBody",
  ) as HTMLTableSectionElement;
  if (!tbody) return;

  let linhasHTML = "";

  historicoChamados.forEach((registro) => {
    linhasHTML += `
      <tr class="border-b border-(--color-monochromatic-4) hover:bg-(--color-monochromatic-4)/10 transition-colors">
        <td class="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) font-bold text-xs sm:text-sm whitespace-nowrap">
          ${registro.chamado}
        </td>
        <td class="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm whitespace-nowrap">
          ${registro.login}
        </td>
        <td class="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
          ${registro.manifestacao}
        </td>
        <td class="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
          ${registro.grupo}
        </td>
        <td class="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs sm:text-sm">
          ${registro.tipo}
        </td>
        <td class="px-2 sm:px-4 py-2 sm:py-3 text-center">
          <span class="${registro.statusCor} text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
            ${registro.status}
          </span>
        </td>
        <td class="px-2 sm:px-4 py-2 sm:py-3 text-(--color-monochromatic-1) text-xs whitespace-nowrap">
          ${registro.dataHora}
        </td>
      </tr>
    `;
  });

  tbody.innerHTML =
    linhasHTML ||
    '<tr><td colspan="7" class="text-center text-(--color-monochromatic-3) text-xs py-8">Nenhum registro encontrado</td></tr>';
}
