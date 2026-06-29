import { useState, useEffect } from "react";
import { BotaoEstilizado } from "@/pages/components/button";
import ModalConfirmacao from "./ModalConfirmacao";
import { UsuarioItem } from "@/types/interfaces";

export default function GerenciarUsuarios() {
  const [usuariosLista, setUsuariosLista] = useState<UsuarioItem[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [modoEdicao, setModoEdicao] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editSobrenome, setEditSobrenome] = useState("");
  const [editGenero, setEditGenero] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editPerfil, setEditPerfil] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editAtivo, setEditAtivo] = useState(1);

  const [modalNovo, setModalNovo] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoSobrenome, setNovoSobrenome] = useState("");
  const [novoGenero, setNovoGenero] = useState("Prefiro não informar");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoPerfil, setNovoPerfil] = useState("usuario");
  const [novoUsername, setNovoUsername] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const [modalSenha, setModalSenha] = useState(false);
  const [resetSenhaId, setResetSenhaId] = useState<number | null>(null);
  const [resetSenhaValor, setResetSenhaValor] = useState("");

  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [acaoConfirmar, setAcaoConfirmar] = useState<() => void>(() => {});

  const formatarTelefone = (valor: string): string => {
    // Remove tudo que não for número
    const numeros = valor.replace(/\D/g, "");

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limitado = numeros.slice(0, 11);

    // Aplica a máscara
    if (limitado.length <= 2) return limitado;
    if (limitado.length <= 7)
      return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
    return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
  };

  const carregarUsuarios = () => {
    fetch("/api/admin/criar_editar_usuario/listar")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsuariosLista(data);
        setLoadingUsuarios(false);
      })
      .catch(() => setLoadingUsuarios(false));
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const iniciarEdicao = (u: UsuarioItem) => {
    setModoEdicao(u.id_user);
    setEditNome(u.nome_user);
    setEditSobrenome(u.sobrenome_user);
    setEditGenero(u.genero);
    setEditEmail(u.email_user);
    setEditTelefone(u.telefone || "");
    setEditPerfil(u.perfil);
    setEditUsername(u.username);
    setEditAtivo(u.ativo);
  };

  const cancelarEdicao = () => {
    setModoEdicao(null);
  };

  const salvarEdicao = (id: number) => {
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/criar_editar_usuario/atualizar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: id,
          nome_user: editNome,
          sobrenome_user: editSobrenome,
          genero: editGenero,
          email_user: editEmail,
          telefone: editTelefone,
          perfil: editPerfil,
          username: editUsername,
          ativo: editAtivo,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            alert(d.erro);
            return;
          }
          carregarUsuarios();
          cancelarEdicao();
        });
    });
    setModalConfirmar(true);
  };

  const criarUsuario = () => {
    if (
      !novoNome.trim() ||
      !novoSobrenome.trim() ||
      !novoEmail.trim() ||
      !novoUsername.trim() ||
      !novaSenha.trim()
    ) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/criar_editar_usuario/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_user: novoNome,
          sobrenome_user: novoSobrenome,
          genero: novoGenero,
          email_user: novoEmail,
          telefone: novoTelefone,
          perfil: novoPerfil,
          username: novoUsername,
          senha: novaSenha,
          ativo: 1,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            alert(d.erro);
            return;
          }
          carregarUsuarios();
          setModalNovo(false);
          setNovoNome("");
          setNovoSobrenome("");
          setNovoGenero("Prefiro não informar");
          setNovoEmail("");
          setNovoTelefone("");
          setNovoPerfil("usuario");
          setNovoUsername("");
          setNovaSenha("");
        });
    });
    setModalConfirmar(true);
  };

  const resetarSenha = () => {
    if (!resetSenhaValor.trim()) {
      alert("Digite a nova senha");
      return;
    }
    setAcaoConfirmar(() => () => {
      fetch("/api/admin/criar_editar_usuario/resetar_senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_user: resetSenhaId,
          nova_senha: resetSenhaValor,
        }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.erro) {
            alert(d.erro);
            return;
          }
          carregarUsuarios();
          setModalSenha(false);
          setResetSenhaId(null);
          setResetSenhaValor("");
        });
    });
    setModalConfirmar(true);
  };

  const getStatusBadge = (ativo: number) => {
    switch (ativo) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 0:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (ativo: number) => {
    switch (ativo) {
      case 1:
        return "Ativo";
      case 2:
        return "Férias";
      case 0:
        return "Desligado";
      default:
        return "—";
    }
  };

  if (loadingUsuarios)
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto"></div>
      </div>
    );

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
              <i className="bi bi-people-fill mr-2"></i>Usuários
            </h1>
            <p className="text-xs text-(--color-monochromatic-3)">
              Gerencie os usuários do sistema
            </p>
          </div>
          <BotaoEstilizado
            icon="bi bi-plus-circle"
            texto="Novo Usuário"
            id="btNovoUsuario"
            onClick={() => setModalNovo(true)}
          />
        </div>
        <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
          <div className="p-4 bg-(--color-monochromatic-1)">
            <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
              Lista de Usuários ({usuariosLista.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="bg-(--color-monochromatic-4)/20">
                <tr>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-2.5 text-left">
                    Nome
                  </th>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-2.5 text-left hidden sm:table-cell">
                    Usuário
                  </th>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-2.5 text-left hidden md:table-cell">
                    Perfil
                  </th>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-2.5 text-center">
                    Status
                  </th>
                  <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-2.5 text-center">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-monochromatic-4)/20">
                {usuariosLista.map((u) => (
                  <tr
                    key={u.id_user}
                    className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                  >
                    {modoEdicao === u.id_user ? (
                      <>
                        <td className="px-2 py-2">
                          <div className="space-y-1.5">
                            <input
                              value={editNome}
                              onChange={(e) => setEditNome(e.target.value)}
                              placeholder="Nome"
                              className="w-full px-2 py-1 text-xs border rounded outline-none"
                            />
                            <input
                              value={editSobrenome}
                              onChange={(e) => setEditSobrenome(e.target.value)}
                              placeholder="Sobrenome"
                              className="w-full px-2 py-1 text-xs border rounded outline-none"
                            />
                          </div>
                        </td>

                        <td className="px-2 py-2 hidden sm:table-cell">
                          <div className="space-y-1.5">
                            <input
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded outline-none"
                            />
                            <input
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="Email"
                              className="w-full px-2 py-1 text-xs border rounded outline-none"
                            />
                            <input
                              value={editTelefone}
                              onChange={(e) =>
                                setEditTelefone(
                                  formatarTelefone(e.target.value),
                                )
                              }
                              placeholder="Telefone"
                              maxLength={15}
                              className="w-full px-2 py-1 text-xs border rounded outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2 hidden md:table-cell">
                          <div className="space-y-1.5">
                            <select
                              value={editPerfil}
                              onChange={(e) => setEditPerfil(e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded outline-none cursor-pointer"
                            >
                              <option value="administrador">
                                Administrador
                              </option>
                              <option value="servicedesk">Service Desk</option>
                              <option value="usuario">Usuário</option>
                            </select>
                            <select
                              value={editGenero}
                              onChange={(e) => setEditGenero(e.target.value)}
                              className="w-full px-2 py-1 text-xs border rounded outline-none cursor-pointer"
                            >
                              <option value="M">M</option>
                              <option value="F">F</option>
                              <option value="Outro">Outro</option>
                              <option value="Prefiro não informar">
                                Prefiro não informar
                              </option>
                            </select>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <select
                            value={editAtivo}
                            onChange={(e) =>
                              setEditAtivo(Number(e.target.value))
                            }
                            className="px-2 py-1 text-xs border rounded outline-none cursor-pointer"
                          >
                            <option value={1}>Ativo</option>
                            <option value={2}>Férias</option>
                            <option value={0}>Desligado</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => salvarEdicao(u.id_user)}
                              className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                              title="Salvar"
                            >
                              <i className="bi bi-check-lg text-xs"></i>
                            </button>
                            <button
                              onClick={cancelarEdicao}
                              className="bg-(--color-monochromatic-3) text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors"
                              title="Cancelar"
                            >
                              <i className="bi bi-x-lg text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-2.5 text-xs text-(--color-monochromatic-1) font-medium">
                          {u.nome_user} {u.sobrenome_user}
                          <p className="text-[10px] text-(--color-monochromatic-3) sm:hidden">
                            {u.username} • {u.perfil}
                          </p>
                        </td>
                        <td className="px-2 py-2.5 text-xs text-(--color-monochromatic-2) hidden sm:table-cell">
                          {u.username}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-(--color-monochromatic-2) hidden md:table-cell">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.perfil === "administrador"
                                ? "bg-purple-100 text-purple-800"
                                : u.perfil === "servicedesk"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {u.perfil}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(u.ativo)}`}
                          >
                            {getStatusLabel(u.ativo)}
                          </span>
                        </td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => iniciarEdicao(u)}
                              className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                              title="Editar"
                            >
                              <i className="bi bi-pencil text-xs"></i>
                            </button>
                            <button
                              onClick={() => {
                                setResetSenhaId(u.id_user);
                                setResetSenhaValor("");
                                setModalSenha(true);
                              }}
                              className="bg-amber-100 text-amber-700 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-amber-200 transition-colors"
                              title="Resetar Senha"
                            >
                              <i className="bi bi-key text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Novo Usuário */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalNovo(false)}
          ></div>
          <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-(--color-monochromatic-1) px-5 py-3 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-plus-circle mr-2"></i>Novo Usuário
              </h2>
              <button
                onClick={() => setModalNovo(false)}
                className="text-white/70 hover:text-white"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Nome"
                    className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                    Sobrenome <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={novoSobrenome}
                    onChange={(e) => setNovoSobrenome(e.target.value)}
                    placeholder="Sobrenome"
                    className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                    Gênero
                  </label>
                  <select
                    value={novoGenero}
                    onChange={(e) => setNovoGenero(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) rounded-lg outline-none cursor-pointer"
                  >
                    <option value="M">M</option>
                    <option value="F">F</option>
                    <option value="Outro">Outro</option>
                    <option value="Prefiro não informar">
                      Prefiro não informar
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                    Telefone
                  </label>
                  <input
                    value={novoTelefone}
                    onChange={(e) =>
                      setNovoTelefone(formatarTelefone(e.target.value))
                    }
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                    Perfil <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={novoPerfil}
                    onChange={(e) => setNovoPerfil(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) rounded-lg outline-none cursor-pointer"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="servicedesk">Service Desk</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                    Usuário <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={novoUsername}
                    onChange={(e) => setNovoUsername(e.target.value)}
                    placeholder="LOGIN"
                    className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Senha inicial"
                  className="w-full px-2.5 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 text-xs font-bold text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarUsuario}
                  className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
                >
                  <i className="bi bi-check-lg mr-1"></i>Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Resetar Senha */}
      {modalSenha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModalSenha(false)}
          ></div>
          <div className="relative bg-(--color-monochromatic-5) rounded-2xl shadow-xl w-full max-w-sm">
            <div className="bg-(--color-monochromatic-1) px-5 py-3 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                <i className="bi bi-key mr-2"></i>Resetar Senha
              </h2>
              <button
                onClick={() => setModalSenha(false)}
                className="text-white/70 hover:text-white"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-(--color-monochromatic-1) block mb-1">
                  Nova Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resetSenhaValor}
                  onChange={(e) => setResetSenhaValor(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full px-3 py-2 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded-lg outline-none transition-all"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setModalSenha(false)}
                  className="px-4 py-2 text-xs font-bold text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={resetarSenha}
                  className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-(--color-monochromatic-2) transition-colors"
                >
                  <i className="bi bi-check-lg mr-1"></i>Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalConfirmar && (
        <ModalConfirmacao
          onCancel={() => setModalConfirmar(false)}
          onOk={() => {
            acaoConfirmar();
            setModalConfirmar(false);
          }}
        />
      )}
    </>
  );
}
