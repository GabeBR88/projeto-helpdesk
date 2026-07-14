import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const usuario = request.cookies.get("usuario")?.value;
  const pathname = request.nextUrl.pathname;

  // Rotas que exigem autenticação
  const rotasProtegidas = [
    "/administrador",
    "/servicedesk",
    "/servicedesk/atendimento-sd",
    "/usuario",
  ];

  if (!rotasProtegidas.includes(pathname)) {
    return NextResponse.next();
  }

  if (!usuario) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const dados = JSON.parse(usuario);
  const perfil = dados.perfil;

  // ADMIN → pode acessar /administrador
  if (perfil === "administrador" && pathname === "/administrador") {
    return NextResponse.next();
  }

  // Admin tentando acessar outras rotas → redireciona
  if (perfil === "administrador") {
    return NextResponse.redirect(new URL("/administrador", request.url));
  }

  // SERVICEDESK → pode acessar /servicedesk e sub-rotas
  if (perfil === "servicedesk" && pathname.startsWith("/servicedesk")) {
    return NextResponse.next();
  }

  // USUARIO → pode acessar /usuario
  if (pathname === "/usuario") {
    return NextResponse.next();
  }

  // Qualquer outra tentativa → login
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/administrador/:path*", "/servicedesk/:path*", "/usuario/:path*"],
};
