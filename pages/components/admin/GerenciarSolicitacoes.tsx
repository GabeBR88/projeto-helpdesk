import { useState, useEffect } from "react";
import ModalConfirmacao from "./ModalConfirmacao";
import { SolicitacaoItem } from "@/types/interfaces";

export default function GerenciarSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [acaoConfirmar, setAcaoConfirmar] = useState<() => void>(() => {});
  const [modalSucesso, setModalSucesso] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [modalErro, setModalErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const carregar = () => {
    fetch("/api/admin/solicitacoes/listar")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setSolicitacoes(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const atenderSolicitacao = (s: SolicitacaoItem) => {
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/solicitacoes/atender", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_solicitacao: s.id_solicitacao }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            setMensagemErro(d.erro);
            setModalErro(true);
            return;
          }
          carregar();
          setMensagemSucesso(
            `Senha resetada para ${s.nome_user}!\nUsuário: ${s.username}\nNova senha: ${d.novaSenha}\n\nE-mail enviado para: ${s.email_user}`,
          );
          setModalSucesso(true);
        });
    });
    setModalConfirmar(true);
  };

  if (loading)
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto"></div>
      </div>
    );

  const pendentes = solicitacoes.filter((s) => s.status === "pendente");
  const atendidas = solicitacoes.filter((s) => s.status === "atendido");

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
            <i className="bi bi-bell-fill mr-2"></i>Solicitações de Reset
          </h1>
          <p className="text-xs text-(--color-monochromatic-3)">
            Gerencie os pedidos de reset de senha
          </p>
        </div>

        {/* Pendentes */}
        <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
          <div className="p-4 bg-(--color-monochromatic-1) rounded-t-2xl">
            <h2 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <i className="bi bi-exclamation-circle"></i>
              Pendentes ({pendentes.length})
            </h2>
          </div>
          {pendentes.length === 0 ? (
            <div className="p-8 text-center">
              <i className="bi bi-check-circle text-2xl text-green-500 block mb-2"></i>
              <p className="text-xs text-(--color-monochromatic-3)">
                Nenhuma solicitação pendente
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full min-w-150">
                <thead className="bg-(--color-monochromatic-4)/20">
                  <tr>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Usuário
                    </th>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Login
                    </th>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left hidden sm:table-cell">
                      E-mail
                    </th>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Solicitado em
                    </th>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-monochromatic-4)/20">
                  {pendentes.map((s) => (
                    <tr
                      key={s.id_solicitacao}
                      className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-1) font-medium">
                        {s.nome_user} {s.sobrenome_user}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2) font-mono">
                        {s.username}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2) hidden sm:table-cell">
                        {s.email_user}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-3)">
                        {new Date(s.data_solicitacao).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        às{" "}
                        {new Date(s.data_solicitacao).toLocaleTimeString(
                          "pt-BR",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => atenderSolicitacao(s)}
                          className="bg-green-500 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <i className="bi bi-check-lg mr-1"></i>Resetar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Atendidas */}
        {atendidas.length > 0 && (
          <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden opacity-75">
            <div className="p-4 bg-(--color-monochromatic-1) rounded-t-2xl">
              <h2 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <i className="bi bi-check-circle"></i>
                Atendidas ({atendidas.length})
              </h2>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full min-w-150">
                <thead className="bg-(--color-monochromatic-4)/20">
                  <tr>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Usuário
                    </th>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Login
                    </th>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Solicitado em
                    </th>

                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Atendido em
                    </th>
                    <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                      Tratado por
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-monochromatic-4)/20">
                  {atendidas.map((s) => (
                    <tr
                      key={s.id_solicitacao}
                      className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
                        {s.nome_user} {s.sobrenome_user}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2) font-mono">
                        {s.username}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-3)">
                        {new Date(s.data_solicitacao).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        às{" "}
                        {new Date(s.data_solicitacao).toLocaleTimeString(
                          "pt-BR",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-3)">
                        {s.data_atendimento
                          ? `${new Date(s.data_atendimento).toLocaleDateString("pt-BR")} às ${new Date(s.data_atendimento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-3)">
                        {s.admin_nome
                          ? `${s.admin_nome} (${s.admin_username})`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalConfirmar && (
        <ModalConfirmacao
          onCancel={() => setModalConfirmar(false)}
          onOk={() => {
            acaoConfirmar();
            setModalConfirmar(false);
          }}
        />
      )}

      {/* Modal de Sucesso */}
      {modalSucesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalSucesso(false)}
          ></div>
          <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-check-circle text-green-600 text-xl"></i>
            </div>
            <h3 className="text-sm font-bold text-(--color-monochromatic-1) mb-2">
              Senha Resetada!
            </h3>
            <p className="text-xs text-(--color-monochromatic-2) mb-5 whitespace-pre-line">
              {mensagemSucesso}
            </p>
            <button
              onClick={() => setModalSucesso(false)}
              className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
            >
              <i className="bi bi-check-lg mr-1"></i>OK
            </button>
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {modalErro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalErro(false)}
          ></div>
          <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h3 className="text-sm font-bold text-(--color-monochromatic-1) mb-2">
              Atenção!
            </h3>
            <p className="text-xs text-(--color-monochromatic-2) mb-5">
              {mensagemErro}
            </p>
            <button
              onClick={() => setModalErro(false)}
              className="bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-600 transition-colors"
            >
              <i className="bi bi-check-lg mr-1"></i>OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
