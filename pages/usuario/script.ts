// Array para acumular arquivos (múltiplas seleções)
let arquivosAcumulados: File[] = [];

// Atualiza o nome dos arquivos selecionados (com acúmulo)
export function atualizarNomeArquivo(): void {
  const input = document.getElementById("anexarArquivo") as HTMLInputElement;
  const span = document.getElementById("nomeArquivo");
  const btnRemover = document.getElementById("btnRemoverArquivo");
  const listaArquivos = document.getElementById("listaArquivos");

  if (!input?.files?.length) return;

  // Acumula os novos arquivos
  for (let i = 0; i < input.files.length; i++) {
    arquivosAcumulados.push(input.files[i]);
  }

  if (span) {
    if (arquivosAcumulados.length === 1) {
      span.textContent = arquivosAcumulados[0].name;
    } else {
      span.textContent = `${arquivosAcumulados.length} arquivos selecionados`;
    }
  }

  btnRemover?.classList.remove("hidden");

  // Mostra lista de arquivos acumulados
  if (listaArquivos) {
    listaArquivos.innerHTML = arquivosAcumulados
      .map(
        (file) => `
        <div class="flex items-center justify-between gap-2 text-xs text-(--color-monochromatic-2) py-1 px-2 bg-(--color-monochromatic-4)/5 rounded">
          <span class="truncate">
            <i class="bi bi-file-earmark mr-1"></i>${file.name}
          </span>
          <span class="text-[10px] text-(--color-monochromatic-3) shrink-0">
            ${(file.size / 1024).toFixed(1)} KB
          </span>
        </div>
      `,
      )
      .join("");
    listaArquivos.classList.remove("hidden");
  }

  // Limpa o input para permitir selecionar os mesmos arquivos novamente
  input.value = "";
}

// Remove todos os arquivos selecionados
export function removerArquivo(): void {
  const input = document.getElementById("anexarArquivo") as HTMLInputElement;
  const span = document.getElementById("nomeArquivo");
  const btnRemover = document.getElementById("btnRemoverArquivo");
  const listaArquivos = document.getElementById("listaArquivos");

  if (arquivosAcumulados.length === 0) return;

  const confirmado = confirm(
    `Deseja excluir ${arquivosAcumulados.length} arquivo(s) anexado(s)?`,
  );

  if (!confirmado) return;

  arquivosAcumulados = [];

  if (input) input.value = "";
  if (span) span.textContent = "Nenhum arquivo selecionado";
  if (btnRemover) btnRemover.classList.add("hidden");
  if (listaArquivos) {
    listaArquivos.innerHTML = "";
    listaArquivos.classList.add("hidden");
  }
}

// Retorna os arquivos acumulados para upload
export function obterArquivosAcumulados(): File[] {
  return arquivosAcumulados;
}

// Limpa o formulário
export function botaoLimpar(
  setSetor: (v: string) => void,
  setCategoria: (v: string) => void,
  setDescricao: (v: string) => void,
): void {
  setSetor("");
  setCategoria("");
  setDescricao("");

  arquivosAcumulados = [];

  const input = document.getElementById("anexarArquivo") as HTMLInputElement;
  const span = document.getElementById("nomeArquivo");
  const btnRemover = document.getElementById("btnRemoverArquivo");
  const listaArquivos = document.getElementById("listaArquivos");

  if (input) input.value = "";
  if (span) span.textContent = "Nenhum arquivo selecionado";
  if (btnRemover) btnRemover.classList.add("hidden");
  if (listaArquivos) {
    listaArquivos.innerHTML = "";
    listaArquivos.classList.add("hidden");
  }
}

// Limpa os arquivos sem pedir confirmação (após envio bem-sucedido)
export function limparArquivosAposEnvio(): void {
  arquivosAcumulados = [];

  const input = document.getElementById("anexarArquivo") as HTMLInputElement;
  const span = document.getElementById("nomeArquivo");
  const btnRemover = document.getElementById("btnRemoverArquivo");
  const listaArquivos = document.getElementById("listaArquivos");

  if (input) input.value = "";
  if (span) span.textContent = "Nenhum arquivo selecionado";
  if (btnRemover) btnRemover.classList.add("hidden");
  if (listaArquivos) {
    listaArquivos.innerHTML = "";
    listaArquivos.classList.add("hidden");
  }
}
