// Limpa os campos preenchidos no formulário
export function botaoLimpar(
  setSetor: (valor: string) => void,
  setCategoria: (valor: string) => void,
  setDescricao: (valor: string) => void,
) {
  setSetor("");
  setCategoria("");
  setDescricao("");

  // Limpa anexos
  arquivosAcumulados = [];

  const input = document.getElementById("anexarArquivo") as HTMLInputElement;
  const span = document.getElementById("nomeArquivo") as HTMLSpanElement;
  const btnRemover = document.getElementById("btnRemoverArquivo");

  if (input) {
    input.value = "";
  }

  if (span) {
    span.textContent = "Nenhum arquivo selecionado";
  }

  btnRemover?.classList.add("hidden");
}

// Array para acumular arquivos
let arquivosAcumulados: File[] = [];

// Atualiza nome do(s) arquivo(s) anexado(s)
export function atualizarNomeArquivo() {
  const input = document.getElementById("anexarArquivo") as HTMLInputElement;

  const span = document.getElementById("nomeArquivo") as HTMLSpanElement;

  const btnRemover = document.getElementById("btnRemoverArquivo");

  if (!input?.files?.length) return;

  // Adiciona novos arquivos
  for (let i = 0; i < input.files.length; i++) {
    arquivosAcumulados.push(input.files[i]);
  }

  btnRemover?.classList.remove("hidden");

  if (span) {
    span.textContent =
      arquivosAcumulados.length === 1
        ? arquivosAcumulados[0].name
        : `${arquivosAcumulados.length} arquivos selecionados`;
  }
}

// Remove arquivos anexados
export function removerArquivo() {
  const span = document.getElementById("nomeArquivo") as HTMLSpanElement;

  const btnRemover = document.getElementById("btnRemoverArquivo");

  const input = document.getElementById("anexarArquivo") as HTMLInputElement;

  if (arquivosAcumulados.length === 0) return;

  const confirmado = confirm(
    `Deseja excluir ${arquivosAcumulados.length} arquivo(s) anexado(s)?`,
  );

  if (!confirmado) return;

  arquivosAcumulados = [];

  if (input) {
    input.value = "";
  }

  if (span) {
    span.textContent = "Nenhum arquivo selecionado";
  }

  btnRemover?.classList.add("hidden");
}
