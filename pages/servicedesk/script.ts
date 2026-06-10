export function AbrirModal(chamado: {
  numero: string;
  descricao: string;
  solicitante: string;
  status: string;
  statusCor: string;
  setor: string;
  comentario?: string;
}) {
  const modalPopUp = document.getElementById("modalPopUp") as HTMLDivElement;
  const overlay = document.getElementById("overlay") as HTMLDivElement;

  const elNumero = document.getElementById("modalNumero");
  const elDescricao = document.getElementById("modalDescricao");
  const elSolicitante = document.getElementById("modalSolicitante");
  const elStatus = document.getElementById("modalStatus");
  const elSetor = document.getElementById("modalSetor");
  const elComentario = document.getElementById("modalComentario");

  if (elNumero) elNumero.textContent = chamado.numero;
  if (elDescricao) elDescricao.textContent = chamado.descricao;
  if (elSolicitante) elSolicitante.textContent = chamado.solicitante;
  if (elSetor) elSetor.textContent = chamado.setor;
  if (elComentario) elComentario.textContent = chamado.comentario || "";
  if (elStatus) {
    elStatus.textContent = chamado.status;
    elStatus.className = `inline-block ml-2 ${chamado.statusCor}`;
  }

  if (overlay) overlay.style.display = "block";
  if (modalPopUp) modalPopUp.style.display = "block";

  setTimeout(() => {
    const botoesModal = document.getElementById(
      "botoesModal",
    ) as HTMLDivElement;
    if (botoesModal) {
      if (
        chamado.status.includes("Resolvido") ||
        chamado.status.includes("Finalizado")
      ) {
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

  if (modalPopUp) modalPopUp.style.display = "none";
  if (overlay) overlay.style.display = "none";
  if (redirecionarDiv) redirecionarDiv.style.display = "none";
  if (selectFuncionarios) selectFuncionarios.value = "";
  if (botoesModal) {
    botoesModal.className =
      "flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3";
  }
}

export function AbrirListaFuncionarios() {
  const campoListaFuncionarios = document.getElementById(
    "redirecionarFuncionarios",
  ) as HTMLDivElement;
  const selectFuncionarios = document.getElementById(
    "listaFuncionarios",
  ) as HTMLSelectElement;

  if (selectFuncionarios) selectFuncionarios.value = "";
  if (campoListaFuncionarios) campoListaFuncionarios.style.display = "block";
}

export function FecharListaFuncionarios() {
  const campoListaFuncionarios = document.getElementById(
    "redirecionarFuncionarios",
  ) as HTMLDivElement;
  if (campoListaFuncionarios) campoListaFuncionarios.style.display = "none";
}

// Função responsável pelo redirecionamento do chamado para outro técnico
export async function EncaminharChamado(
  numChamado: string,
  idTecnicoDestino: number,
  usernameDestino: string,
) {
  // Pega os dados do cookie
  const usuarioCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("usuario="))
    ?.split("=")[1];

  if (!usuarioCookie) {
    alert("Erro: usuário não autenticado");
    return false;
  }

  const usuario = JSON.parse(decodeURIComponent(usuarioCookie));
  const usernameOrigem = usuario.usuario;

  // Busca o id_ocorrencia pelo número do chamado
  const numLimpo = numChamado.replace("#", "");
  const resDetalhes = await fetch(
    `/api/desk-tickets/detalhes-chamado?chamado=${numLimpo}`,
  );
  const dadosChamado = await resDetalhes.json();

  if (!dadosChamado?.id_ocorrencia) {
    alert("Erro ao identificar o chamado");
    return false;
  }

  const resposta = await fetch("/api/desk-tickets/redirecionar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_ocorrencia: dadosChamado.id_ocorrencia,
      id_tecnico_destino: idTecnicoDestino,
      username_origem: usernameOrigem,
      username_destino: usernameDestino,
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.erro);
    return false;
  }

  alert(dados.mensagem);
  return true;
}
