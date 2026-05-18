// Função responsável por abrir o formulário de solicitação de suporte
export function AbrirChamado() {
  const botoesContainer = document.getElementById(
    "botoesContainer",
  ) as HTMLDivElement;
  const formCard = document.getElementById("formCard") as HTMLDivElement;

  if (botoesContainer) botoesContainer.style.display = "none"; // Some e não ocupa espaço
  if (formCard) {
    formCard.className = "interface mt-10";
    formCard.style.display = "block"; // Aparece
  }
}

// Função responsável por fechjar o formulário de solicitação de suporte após clicar em cancelar.
export function FecharFormulario() {
  const botoesContainer = document.getElementById(
    "botoesContainer",
  ) as HTMLDivElement;
  const formCard = document.getElementById("formCard") as HTMLDivElement;

  if (botoesContainer) botoesContainer.style.display = "flex"; // Volta
  if (formCard) formCard.style.display = "none"; // Some sem ocupar espaço
}

// Função responsável por limpar os campos preenchidos no formulário
export function botaoLimpar() {
  const frm = document.getElementById("criarChamado") as HTMLFormElement;
  frm?.reset();

  // Limpa também os anexos, caso tenha
  arquivosAcumulados = [];
  const span = document.getElementById("nomeArquivo") as HTMLFormElement;
  const btnRemover = document.getElementById("btnRemoverArquivo");

  if (span) span.textContent = "Nenhum arquivo selecionado";
  btnRemover?.classList.add("hidden");
}

// Array para acumular arquivos
let arquivosAcumulados: File[] = [];

// Função refere a opção anexo do formulário
export function atualizarNomeArquivo() {
  const input = document.getElementById("anexarArquivo") as HTMLInputElement;
  const span = document.getElementById("nomeArquivo") as HTMLSpanElement;
  const btnRemover = document.getElementById("btnRemoverArquivo");

  if (input?.files?.length) {
    // Adiciona os novos arquivos ao array existente
    for (let i = 0; i < input.files.length; i++) {
      arquivosAcumulados.push(input.files[i]);
    }

    btnRemover?.classList.remove("hidden");

    if (arquivosAcumulados.length === 1) {
      span.textContent = arquivosAcumulados[0].name;
    } else {
      span.textContent = `${arquivosAcumulados.length} arquivos selecionados`;
    }
  }
}

// Remove o arquivo anexado, após o usuário confirmar a exclusão
export function removerArquivo() {
  const span = document.getElementById("nomeArquivo") as HTMLSpanElement;
  const btnRemover = document.getElementById("btnRemoverArquivo");

  if (arquivosAcumulados.length > 0) {
    const total = arquivosAcumulados.length;
    const confirmado = confirm(
      `Deseja excluir ${total} arquivo(s) anexado(s)?`,
    );

    if (confirmado) {
      arquivosAcumulados = []; // Limpa o array
      btnRemover?.classList.add("hidden");
      if (span) span.textContent = "Nenhum arquivo selecionado";
    }
  }
}
