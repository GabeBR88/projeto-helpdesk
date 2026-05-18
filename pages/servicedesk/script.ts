export function AbrirModal(chamado: {
  numero: string;
  descricao: string;
  solicitante: string;
  status: string;
  statusCor: string;
  setor: string;
}) {
  const modalPopUp = document.getElementById("modalPopUp") as HTMLDivElement;
  const overlay = document.getElementById("overlay") as HTMLDivElement;

  // Preenche os dados do modal
  const elNumero = document.getElementById("modalNumero");
  const elDescricao = document.getElementById("modalDescricao");
  const elSolicitante = document.getElementById("modalSolicitante");
  const elStatus = document.getElementById("modalStatus");
  const elSetor = document.getElementById("modalSetor");

  if (elNumero) elNumero.textContent = chamado.numero;
  if (elDescricao) elDescricao.textContent = chamado.descricao;
  if (elSolicitante) elSolicitante.textContent = chamado.solicitante;
  if (elSetor) elSetor.textContent = chamado.setor;
  if (elStatus) {
    elStatus.textContent = chamado.status;
    elStatus.className = chamado.statusCor;
  }

  // Mostra o overlay e o modal
  if (overlay) overlay.style.display = "block";
  if (modalPopUp) modalPopUp.style.display = "block";

  // Aguarda o DOM atualizar antes de manipular o botoesModal
  setTimeout(() => {
    const botoesModal = document.getElementById(
      "botoesModal",
    ) as HTMLDivElement;

    if (botoesModal) {
      if (chamado.status.includes("Resolvido")) {
        botoesModal.className =
          "flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 opacity-50 pointer-events-none";
      } else {
        botoesModal.className =
          "flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3";
      }
    }
  }, 0);
}

export function FecharModal() {
  const modalPopUp = document.getElementById("modalPopUp") as HTMLDivElement;
  const overlay = document.getElementById("overlay") as HTMLDivElement;
  const redirecionarDiv = document.getElementById(
    "redirecionarFuncionarios",
  ) as HTMLDivElement;
  const selectFuncionarios = document.getElementById(
    "listaFuncionarios",
  ) as HTMLSelectElement;
  const botoesModal = document.getElementById("botoesModal") as HTMLDivElement;

  // Esconde o modal e overlay
  if (modalPopUp) modalPopUp.style.display = "none";
  if (overlay) overlay.style.display = "none";

  // Reseta a div de redirecionamento
  if (redirecionarDiv) redirecionarDiv.style.display = "none";

  // Reseta o select de funcionários
  if (selectFuncionarios) selectFuncionarios.value = "";

  // Restaura os botões principais (remove opacidade)
  if (botoesModal) {
    botoesModal.className =
      "flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3";
  }
}

// Função abre uma lista de funcionários para redirecionamento
export function AbrirListaFuncionarios() {
  const campoListaFuncionarios = document.getElementById(
    "redirecionarFuncionarios",
  ) as HTMLDivElement;

  const selectFuncionarios = document.getElementById(
    "listaFuncionarios",
  ) as HTMLSelectElement;

  if (selectFuncionarios) {
    selectFuncionarios.value = ""; // Se algum nome foi selecione e o for aberto a lista novamente o campo "Selecione..." será acionado
  }

  if (campoListaFuncionarios) campoListaFuncionarios.style.display = "block";
}

export function FecharListaFuncionarios() {
  const campoListaFuncionarios = document.getElementById(
    "redirecionarFuncionarios",
  ) as HTMLDivElement;

  if (campoListaFuncionarios) {
    campoListaFuncionarios.style.display = "none";
  }
}
