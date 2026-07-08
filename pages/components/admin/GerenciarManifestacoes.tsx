import { useState, useEffect } from "react";
import { BotaoEstilizado } from "@/pages/components/button";
import ModalCriar from "./ModalCriar";
import ModalCriarComSelect from "./ModalCriarComSelect";
import ModalConfirmacao from "./ModalConfirmacao";
import { ManifestacaoItem, GrupoItem, TipoItem } from "@/types/interfaces";

export default function GerenciarManifestacoes() {
  const [subAba, setSubAba] = useState<"manifestacao" | "grupo" | "tipo">(
    "manifestacao",
  );
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [acaoConfirmar, setAcaoConfirmar] = useState<() => void>(() => {});
  const [loading, setLoading] = useState(true);

  const [manifestacoes, setManifestacoes] = useState<ManifestacaoItem[]>([]);
  const [editManifestacao, setEditManifestacao] = useState<number | null>(null);
  const [editManCodigo, setEditManCodigo] = useState("");
  const [editManDescricao, setEditManDescricao] = useState("");
  const [editManAtivo, setEditManAtivo] = useState(1);
  const [modalNovaManifestacao, setModalNovaManifestacao] = useState(false);
  const [novaManCodigo, setNovaManCodigo] = useState("");
  const [novaManDescricao, setNovaManDescricao] = useState("");
  const [novaManAtivo, setNovaManAtivo] = useState(1);

  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [editGrupo, setEditGrupo] = useState<number | null>(null);
  const [editGrpCodigo, setEditGrpCodigo] = useState("");
  const [editGrpDescricao, setEditGrpDescricao] = useState("");
  const [editGrpAtivo, setEditGrpAtivo] = useState(1);
  const [modalNovoGrupo, setModalNovoGrupo] = useState(false);
  const [novoGrpCodigo, setNovoGrpCodigo] = useState("");
  const [novoGrpDescricao, setNovoGrpDescricao] = useState("");
  const [novoGrpAtivo, setNovoGrpAtivo] = useState(1);
  const [novoGrpManifestacao, setNovoGrpManifestacao] = useState<number>(0);

  const [tipos, setTipos] = useState<TipoItem[]>([]);
  const [editTipo, setEditTipo] = useState<number | null>(null);
  const [editTipCodigo, setEditTipCodigo] = useState("");
  const [editTipDescricao, setEditTipDescricao] = useState("");
  const [editTipAtivo, setEditTipAtivo] = useState(1);
  const [modalNovoTipo, setModalNovoTipo] = useState(false);
  const [novoTipCodigo, setNovoTipCodigo] = useState("");
  const [novoTipDescricao, setNovoTipDescricao] = useState("");
  const [novoTipAtivo, setNovoTipAtivo] = useState(1);
  const [novoTipGrupo, setNovoTipGrupo] = useState<number>(0);

  const MAN_SISTEMA = ["redirecionado"];
  const GRP_SISTEMA = ["chamado_redirecionado"];
  const TIP_SISTEMA = ["redirecionado_tecnico"];

  const carregarManifestacoes = () =>
    fetch("/api/admin/manifestacao/listar")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setManifestacoes(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  const carregarGrupos = () =>
    fetch("/api/admin/grupo_manifestacao/listar")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setGrupos(d);
      });
  const carregarTipos = () =>
    fetch("/api/admin/tipo_manifestacao/listar")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setTipos(d);
      });

  useEffect(() => {
    carregarManifestacoes();
    carregarGrupos();
    carregarTipos();
  }, []);

  const salvarManifestacao = (id: number) => {
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_manifestacao: id,
            codigo: editManCodigo,
            descricao: editManDescricao,
            ativo: editManAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarManifestacoes();
            setEditManifestacao(null);
          }),
    );
    setModalConfirmar(true);
  };

  const alternarAtivoManifestacao = (m: ManifestacaoItem) => {
    const novo = m.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_manifestacao: m.id_manifestacao,
            codigo: m.codigo,
            descricao: m.descricao,
            ativo: novo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarManifestacoes();
          }),
    );
    setModalConfirmar(true);
  };

  const criarManifestacao = () => {
    if (!novaManCodigo.trim() || !novaManDescricao.trim()) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/manifestacao/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: novaManCodigo,
            descricao: novaManDescricao,
            ativo: novaManAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarManifestacoes();
            setModalNovaManifestacao(false);
            setNovaManCodigo("");
            setNovaManDescricao("");
            setNovaManAtivo(1);
          }),
    );
    setModalConfirmar(true);
  };

  const salvarGrupo = (id: number) => {
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/grupo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_grupo: id,
            codigo: editGrpCodigo,
            descricao: editGrpDescricao,
            ativo: editGrpAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarGrupos();
            setEditGrupo(null);
          }),
    );
    setModalConfirmar(true);
  };

  const alternarAtivoGrupo = (g: GrupoItem) => {
    const novo = g.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/grupo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_grupo: g.id_grupo,
            codigo: g.codigo,
            descricao: g.descricao,
            ativo: novo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarGrupos();
          }),
    );
    setModalConfirmar(true);
  };

  const criarGrupo = () => {
    if (
      !novoGrpManifestacao ||
      !novoGrpCodigo.trim() ||
      !novoGrpDescricao.trim()
    ) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/grupo_manifestacao/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_manifestacao: novoGrpManifestacao,
            codigo: novoGrpCodigo,
            descricao: novoGrpDescricao,
            ativo: novoGrpAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarGrupos();
            setModalNovoGrupo(false);
            setNovoGrpManifestacao(0);
            setNovoGrpCodigo("");
            setNovoGrpDescricao("");
            setNovoGrpAtivo(1);
          }),
    );
    setModalConfirmar(true);
  };

  const salvarTipo = (id: number) => {
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/tipo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_tipo: id,
            codigo: editTipCodigo,
            descricao: editTipDescricao,
            ativo: editTipAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarTipos();
            setEditTipo(null);
          }),
    );
    setModalConfirmar(true);
  };

  const alternarAtivoTipo = (t: TipoItem) => {
    const novo = t.ativo === 1 ? 0 : 1;
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/tipo_manifestacao/atualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_tipo: t.id_tipo,
            codigo: t.codigo,
            descricao: t.descricao,
            ativo: novo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarTipos();
          }),
    );
    setModalConfirmar(true);
  };

  const criarTipo = () => {
    if (!novoTipGrupo || !novoTipCodigo.trim() || !novoTipDescricao.trim()) {
      alert("Preencha todos os campos");
      return;
    }
    setAcaoConfirmar(
      () => () =>
        fetch("/api/admin/tipo_manifestacao/criar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_grupo: novoTipGrupo,
            codigo: novoTipCodigo,
            descricao: novoTipDescricao,
            ativo: novoTipAtivo,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.erro) {
              alert(d.erro);
              return;
            }
            carregarTipos();
            setModalNovoTipo(false);
            setNovoTipGrupo(0);
            setNovoTipCodigo("");
            setNovoTipDescricao("");
            setNovoTipAtivo(1);
          }),
    );
    setModalConfirmar(true);
  };

  if (loading)
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin mx-auto"></div>
      </div>
    );

  return (
    <>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
            <i className="bi bi-diagram-3-fill mr-2"></i>Manifestações
          </h1>
          <p className="text-xs text-(--color-monochromatic-3)">
            Gerencie manifestações, grupos e tipos
          </p>
        </div>
        <div className="flex gap-2 border-b border-(--color-monochromatic-4) pb-2 overflow-x-auto">
          {[
            { id: "manifestacao", icon: "bi-diagram-3", label: "Manifestação" },
            { id: "grupo", icon: "bi-folder", label: "Grupo" },
            { id: "tipo", icon: "bi-check2-circle", label: "Tipo" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubAba(tab.id as typeof subAba)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${subAba === tab.id ? "bg-(--color-monochromatic-1) text-(--color-monochromatic-5) shadow-md" : "text-(--color-monochromatic-2) hover:bg-(--color-monochromatic-4)/20 hover:text-(--color-monochromatic-1)"}`}
            >
              <i className={`bi ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============ MANIFESTAÇÃO ============ */}
        {subAba === "manifestacao" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <BotaoEstilizado
                icon="bi bi-plus-circle"
                texto="Nova Manifestação"
                id="btNovaManifestacao"
                onClick={() => setModalNovaManifestacao(true)}
              />
            </div>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
              <div className="p-4 bg-(--color-monochromatic-1)">
                <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                  Lista de Manifestações ({manifestacoes.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-150">
                  <thead className="bg-(--color-monochromatic-4)/20">
                    <tr>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Código
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Descrição
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                        Status
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--color-monochromatic-4)/20">
                    {manifestacoes.map((m) => (
                      <tr
                        key={m.id_manifestacao}
                        className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                      >
                        {editManifestacao === m.id_manifestacao ? (
                          <>
                            <td className="px-3 py-2">
                              <input
                                value={editManCodigo}
                                onChange={(e) =>
                                  setEditManCodigo(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={editManDescricao}
                                onChange={(e) =>
                                  setEditManDescricao(e.target.value)
                                }
                                className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <select
                                value={editManAtivo}
                                onChange={(e) =>
                                  setEditManAtivo(Number(e.target.value))
                                }
                                className="px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) rounded outline-none cursor-pointer"
                              >
                                <option value={1}>Ativo</option>
                                <option value={0}>Inativo</option>
                              </select>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() =>
                                    salvarManifestacao(m.id_manifestacao)
                                  }
                                  className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                                  title="Salvar"
                                >
                                  <i className="bi bi-check-lg text-xs"></i>
                                </button>
                                <button
                                  onClick={() => setEditManifestacao(null)}
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
                            <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-1) font-mono">
                              {m.codigo}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
                              {m.descricao}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.ativo === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                              >
                                {m.ativo === 1 ? "Ativo" : "Inativo"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {MAN_SISTEMA.includes(m.codigo) ? (
                                  <span
                                    className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                    title="Protegido"
                                  >
                                    <i className="bi bi-lock-fill text-xs"></i>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditManifestacao(m.id_manifestacao);
                                      setEditManCodigo(m.codigo);
                                      setEditManDescricao(m.descricao);
                                      setEditManAtivo(m.ativo);
                                    }}
                                    className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                                    title="Editar"
                                  >
                                    <i className="bi bi-pencil text-xs"></i>
                                  </button>
                                )}
                                {MAN_SISTEMA.includes(m.codigo) ? (
                                  <span
                                    className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                    title="Protegido"
                                  >
                                    <i className="bi bi-lock-fill text-xs"></i>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => alternarAtivoManifestacao(m)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${m.ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                    title={
                                      m.ativo === 1 ? "Inativar" : "Ativar"
                                    }
                                  >
                                    <i
                                      className={`bi ${m.ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
                                    ></i>
                                  </button>
                                )}
                                {/* 🗑️ EXCLUIR MANIFESTAÇÃO */}
                                {!MAN_SISTEMA.includes(m.codigo) && (
                                  <button
                                    onClick={() => {
                                      setAcaoConfirmar(() => () => {
                                        fetch(
                                          "/api/admin/manifestacao/excluir",
                                          {
                                            method: "DELETE",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              id_manifestacao:
                                                m.id_manifestacao,
                                            }),
                                          },
                                        )
                                          .then((r) => r.json())
                                          .then((d) => {
                                            if (d.erro) {
                                              alert(d.erro);
                                              return;
                                            }
                                            carregarManifestacoes();
                                          });
                                      });
                                      setModalConfirmar(true);
                                    }}
                                    className="bg-red-100 text-red-600 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                                    title="Excluir"
                                  >
                                    <i className="bi bi-trash text-xs"></i>
                                  </button>
                                )}
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
        )}

        {/* ============ GRUPO ============ */}
        {subAba === "grupo" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <BotaoEstilizado
                icon="bi bi-plus-circle"
                texto="Novo Grupo"
                id="btNovoGrupo"
                onClick={() => setModalNovoGrupo(true)}
              />
            </div>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
              <div className="p-4 bg-(--color-monochromatic-2)">
                <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                  Lista de Grupos ({grupos.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="bg-(--color-monochromatic-4)/20">
                    <tr>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Código
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Descrição
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Manifestação
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                        Status
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--color-monochromatic-4)/20">
                    {grupos.map((g) => {
                      const manifestacaoNome =
                        manifestacoes.find(
                          (m) => m.id_manifestacao === g.id_manifestacao,
                        )?.descricao || "—";
                      return (
                        <tr
                          key={g.id_grupo}
                          className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                        >
                          {editGrupo === g.id_grupo ? (
                            <>
                              <td className="px-3 py-2">
                                <input
                                  value={editGrpCodigo}
                                  onChange={(e) =>
                                    setEditGrpCodigo(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  value={editGrpDescricao}
                                  onChange={(e) =>
                                    setEditGrpDescricao(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-1) text-(--color-monochromatic-5)">
                                  {manifestacaoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select
                                  value={editGrpAtivo}
                                  onChange={(e) =>
                                    setEditGrpAtivo(Number(e.target.value))
                                  }
                                  className="px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) rounded outline-none cursor-pointer"
                                >
                                  <option value={1}>Ativo</option>
                                  <option value={0}>Inativo</option>
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => salvarGrupo(g.id_grupo)}
                                    className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                                    title="Salvar"
                                  >
                                    <i className="bi bi-check-lg text-xs"></i>
                                  </button>
                                  <button
                                    onClick={() => setEditGrupo(null)}
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
                              <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-1) font-mono">
                                {g.codigo}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
                                {g.descricao}
                              </td>
                              <td>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-1) text-(--color-monochromatic-5)">
                                  {manifestacaoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.ativo === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {g.ativo === 1 ? "Ativo" : "Inativo"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  {GRP_SISTEMA.includes(g.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditGrupo(g.id_grupo);
                                        setEditGrpCodigo(g.codigo);
                                        setEditGrpDescricao(g.descricao);
                                        setEditGrpAtivo(g.ativo);
                                      }}
                                      className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                                      title="Editar"
                                    >
                                      <i className="bi bi-pencil text-xs"></i>
                                    </button>
                                  )}
                                  {GRP_SISTEMA.includes(g.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => alternarAtivoGrupo(g)}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${g.ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                      title={
                                        g.ativo === 1 ? "Inativar" : "Ativar"
                                      }
                                    >
                                      <i
                                        className={`bi ${g.ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
                                      ></i>
                                    </button>
                                  )}
                                  {/* 🗑️ EXCLUIR GRUPO */}
                                  {!GRP_SISTEMA.includes(g.codigo) && (
                                    <button
                                      onClick={() => {
                                        setAcaoConfirmar(() => () => {
                                          fetch(
                                            "/api/admin/grupo_manifestacao/excluir",
                                            {
                                              method: "DELETE",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({
                                                id_grupo: g.id_grupo,
                                              }),
                                            },
                                          )
                                            .then((r) => r.json())
                                            .then((d) => {
                                              if (d.erro) {
                                                alert(d.erro);
                                                return;
                                              }
                                              carregarGrupos();
                                            });
                                        });
                                        setModalConfirmar(true);
                                      }}
                                      className="bg-red-100 text-red-600 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                                      title="Excluir"
                                    >
                                      <i className="bi bi-trash text-xs"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ TIPO ============ */}
        {subAba === "tipo" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <BotaoEstilizado
                icon="bi bi-plus-circle"
                texto="Novo Tipo"
                id="btNovoTipo"
                onClick={() => setModalNovoTipo(true)}
              />
            </div>
            <div className="bg-(--color-monochromatic-5) rounded-2xl shadow-sm border border-(--color-monochromatic-4)/20 overflow-hidden">
              <div className="p-4 bg-(--color-monochromatic-3)">
                <h2 className="text-(--color-monochromatic-5) text-xs font-bold uppercase tracking-wider">
                  Lista de Tipos ({tipos.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="bg-(--color-monochromatic-4)/20">
                    <tr>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Código
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Descrição
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-left">
                        Grupo de Manifestação
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                        Status
                      </th>
                      <th className="text-(--color-monochromatic-1) text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2.5 text-center">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--color-monochromatic-4)/20">
                    {tipos.map((t) => {
                      const grupoNome =
                        grupos.find((g) => g.id_grupo === t.id_grupo)
                          ?.descricao || "—";
                      return (
                        <tr
                          key={t.id_tipo}
                          className="hover:bg-(--color-monochromatic-4)/5 transition-colors"
                        >
                          {editTipo === t.id_tipo ? (
                            <>
                              <td className="px-3 py-2">
                                <input
                                  value={editTipCodigo}
                                  onChange={(e) =>
                                    setEditTipCodigo(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  value={editTipDescricao}
                                  onChange={(e) =>
                                    setEditTipDescricao(e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) focus:border-(--color-monochromatic-1) rounded outline-none transition-all"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-xs">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-2) text-(--color-monochromatic-5)">
                                  {grupoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select
                                  value={editTipAtivo}
                                  onChange={(e) =>
                                    setEditTipAtivo(Number(e.target.value))
                                  }
                                  className="px-2 py-1.5 text-xs border-2 border-(--color-monochromatic-4) rounded outline-none cursor-pointer"
                                >
                                  <option value={1}>Ativo</option>
                                  <option value={0}>Inativo</option>
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => salvarTipo(t.id_tipo)}
                                    className="bg-green-500 text-white w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                                    title="Salvar"
                                  >
                                    <i className="bi bi-check-lg text-xs"></i>
                                  </button>
                                  <button
                                    onClick={() => setEditTipo(null)}
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
                              <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-1) font-mono">
                                {t.codigo}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-(--color-monochromatic-2)">
                                {t.descricao}
                              </td>
                              <td>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-(--color-monochromatic-2) text-(--color-monochromatic-5)">
                                  {grupoNome}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.ativo === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {t.ativo === 1 ? "Ativo" : "Inativo"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  {TIP_SISTEMA.includes(t.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditTipo(t.id_tipo);
                                        setEditTipCodigo(t.codigo);
                                        setEditTipDescricao(t.descricao);
                                        setEditTipAtivo(t.ativo);
                                      }}
                                      className="bg-(--color-monochromatic-1) text-(--color-monochromatic-5) w-7 h-7 rounded-lg flex items-center justify-center hover:bg-(--color-monochromatic-2) transition-colors"
                                      title="Editar"
                                    >
                                      <i className="bi bi-pencil text-xs"></i>
                                    </button>
                                  )}
                                  {TIP_SISTEMA.includes(t.codigo) ? (
                                    <span
                                      className="text-(--color-monochromatic-3) w-7 h-7 rounded-lg flex items-center justify-center"
                                      title="Protegido"
                                    >
                                      <i className="bi bi-lock-fill text-xs"></i>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => alternarAtivoTipo(t)}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${t.ativo === 1 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                      title={
                                        t.ativo === 1 ? "Inativar" : "Ativar"
                                      }
                                    >
                                      <i
                                        className={`bi ${t.ativo === 1 ? "bi-toggle-on" : "bi-toggle-off"} text-xs`}
                                      ></i>
                                    </button>
                                  )}
                                  {/* 🗑️ EXCLUIR TIPO */}
                                  {!TIP_SISTEMA.includes(t.codigo) && (
                                    <button
                                      onClick={() => {
                                        setAcaoConfirmar(() => () => {
                                          fetch(
                                            "/api/admin/tipo_manifestacao/excluir",
                                            {
                                              method: "DELETE",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({
                                                id_tipo: t.id_tipo,
                                              }),
                                            },
                                          )
                                            .then((r) => r.json())
                                            .then((d) => {
                                              if (d.erro) {
                                                alert(d.erro);
                                                return;
                                              }
                                              carregarTipos();
                                            });
                                        });
                                        setModalConfirmar(true);
                                      }}
                                      className="bg-red-100 text-red-600 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                                      title="Excluir"
                                    >
                                      <i className="bi bi-trash text-xs"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalNovaManifestacao && (
        <ModalCriar
          titulo="Nova Manifestação"
          codigo={novaManCodigo}
          setCodigo={setNovaManCodigo}
          descricao={novaManDescricao}
          setDescricao={setNovaManDescricao}
          ativo={novaManAtivo}
          setAtivo={setNovaManAtivo}
          onSalvar={criarManifestacao}
          onCancelar={() => setModalNovaManifestacao(false)}
          placeholderCodigo="Ex: presencial"
          placeholderDescricao="Ex: Atendimento Presencial"
        />
      )}
      {modalNovoGrupo && (
        <ModalCriarComSelect
          titulo="Novo Grupo"
          codigo={novoGrpCodigo}
          setCodigo={setNovoGrpCodigo}
          descricao={novoGrpDescricao}
          setDescricao={setNovoGrpDescricao}
          ativo={novoGrpAtivo}
          setAtivo={setNovoGrpAtivo}
          onSalvar={criarGrupo}
          onCancelar={() => setModalNovoGrupo(false)}
          placeholderCodigo="Ex: internet"
          placeholderDescricao="Ex: Internet"
          labelSelect="Manifestação"
          valorSelect={novoGrpManifestacao}
          setValorSelect={setNovoGrpManifestacao}
          opcoes={manifestacoes
            .filter((m) => m.ativo === 1)
            .map((m) => ({ value: m.id_manifestacao, label: m.descricao }))}
        />
      )}
      {modalNovoTipo && (
        <ModalCriarComSelect
          titulo="Novo Tipo"
          codigo={novoTipCodigo}
          setCodigo={setNovoTipCodigo}
          descricao={novoTipDescricao}
          setDescricao={setNovoTipDescricao}
          ativo={novoTipAtivo}
          setAtivo={setNovoTipAtivo}
          onSalvar={criarTipo}
          onCancelar={() => setModalNovoTipo(false)}
          placeholderCodigo="Ex: troca_cabo"
          placeholderDescricao="Ex: Troca de Cabo"
          labelSelect="Grupo"
          valorSelect={novoTipGrupo}
          setValorSelect={setNovoTipGrupo}
          opcoes={grupos
            .filter((g) => g.ativo === 1)
            .map((g) => ({ value: g.id_grupo, label: g.descricao }))}
        />
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
