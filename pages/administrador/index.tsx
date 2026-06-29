import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import TituloSite from "@/pages/components/title";
import TopBar from "@/pages/components/topbar";
import FooterEstilizacao from "@/pages/components/footer";
import GerenciarStatus from "../components/admin/GerenciarStatus";
import GerenciarSetores from "../components/admin/GerenciarSetores";
import GerenciarUsuarios from "../components/admin/GerenciarUsuarios";
import GerenciarManifestacoes from "../components/admin/GerenciarManifestacoes";
import { DadosAdmin } from "@/types/interfaces";

export default function PainelAdmin() {
  const router = useRouter();
  const [dadosUsuario, setDadosUsuario] = useState<DadosAdmin>({
    nome_user: "",
    sobrenome_user: "",
    perfil: "",
  });
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("dashboard");

  useEffect(() => {
    fetch("/api/my-tickets/profile")
      .then((r) => {
        if (r.status === 401) {
          router.push("/");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && d.perfil !== "administrador") {
          router.push("/");
          return;
        }
        if (d)
          setDadosUsuario({
            nome_user: d.nome_user || "",
            sobrenome_user: d.sobrenome_user || "",
            perfil: d.perfil || "",
          });
        setLoading(false);
      })
      .catch(() => router.push("/"));
  }, [router]);

  const handleLogout = () => {
    document.cookie = "usuario=; path=/; max-age=0";
    router.push("/");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-monochromatic-4)">
        <div className="w-10 h-10 border-4 border-(--color-monochromatic-3) border-t-(--color-monochromatic-1) rounded-full animate-spin"></div>
      </div>
    );

  const menuItems = [
    {
      id: "dashboard",
      icon: "bi-speedometer2",
      label: "Dashboard",
      desc: "Visão geral do sistema",
    },
    {
      id: "usuarios",
      icon: "bi-people-fill",
      label: "Usuários",
      desc: "Criar, editar e desativar usuários",
    },
    {
      id: "setores",
      icon: "bi-building",
      label: "Setores",
      desc: "Gerenciar setores da empresa",
    },
    {
      id: "manifestacoes",
      icon: "bi-diagram-3-fill",
      label: "Manifestações",
      desc: "Manifestação, Grupo e Tipo",
    },
    {
      id: "status",
      icon: "bi-flag-fill",
      label: "Status",
      desc: "Status de atendimento",
    },
  ];

  return (
    <>
      <TituloSite titulo="Painel Administrativo" />
      <div className="min-h-screen flex flex-col bg-(--color-monochromatic-4)">
        <TopBar
          nomeUsuario={`${dadosUsuario.nome_user} ${dadosUsuario.sobrenome_user}`}
        />
        <div
          onClick={handleLogout}
          className="flex justify-end mt-2 mr-5 uppercase text-xs text-(--color-monochromatic-2) hover:text-(--color-monochromatic-1) underline cursor-pointer transition-colors font-medium"
        >
          <i className="bi bi-box-arrow-right mr-1"></i>Sair
        </div>
        <div className="flex-1 flex flex-col lg:flex-row">
          <aside className="w-full lg:w-64 bg-(--color-monochromatic-5) border-b lg:border-b-0 lg:border-r border-(--color-monochromatic-4) shrink-0">
            <div className="p-4 lg:p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-(--color-monochromatic-1) rounded-lg flex items-center justify-center">
                  <i className="bi bi-shield-lock-fill text-white text-sm"></i>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-(--color-monochromatic-1) uppercase tracking-wider">
                    Administração
                  </h2>
                  <p className="text-[10px] text-(--color-monochromatic-3)">
                    Painel de Controle
                  </p>
                </div>
              </div>
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAbaAtiva(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 shrink-0 lg:shrink ${abaAtiva === item.id ? "bg-(--color-monochromatic-1) text-(--color-monochromatic-5) shadow-md" : "text-(--color-monochromatic-2) hover:bg-(--color-monochromatic-4)/20 hover:text-(--color-monochromatic-1)"}`}
                  >
                    <i className={`bi ${item.icon} text-sm`}></i>
                    <div className="hidden lg:block">
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] opacity-70">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {abaAtiva === "dashboard" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-(--color-monochromatic-1) uppercase tracking-wider mb-2">
                    <i className="bi bi-speedometer2 mr-2"></i>Dashboard
                  </h1>
                  <p className="text-xs text-(--color-monochromatic-2)">
                    Bem-vindo ao painel administrativo.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems
                    .filter((m) => m.id !== "dashboard")
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAbaAtiva(item.id)}
                        className="bg-(--color-monochromatic-5) rounded-xl p-5 border border-(--color-monochromatic-4)/30 hover:border-(--color-monochromatic-1) hover:shadow-md transition-all duration-200 text-left group"
                      >
                        <div className="w-10 h-10 bg-(--color-monochromatic-1)/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-(--color-monochromatic-1) transition-colors">
                          <i
                            className={`bi ${item.icon} text-lg text-(--color-monochromatic-1) group-hover:text-white transition-colors`}
                          ></i>
                        </div>
                        <h3 className="text-sm font-bold text-(--color-monochromatic-1) mb-1">
                          {item.label}
                        </h3>
                        <p className="text-xs text-(--color-monochromatic-3)">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}
            {abaAtiva === "usuarios" && <GerenciarUsuarios />}
            {abaAtiva === "setores" && <GerenciarSetores />}
            {abaAtiva === "manifestacoes" && <GerenciarManifestacoes />}
            {abaAtiva === "status" && <GerenciarStatus />}
          </main>
        </div>
        <FooterEstilizacao />
      </div>
    </>
  );
}
