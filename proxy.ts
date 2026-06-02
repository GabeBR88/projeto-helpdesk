import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const usuario = request.cookies.get("usuario")?.value;
  const pathname = request.nextUrl.pathname;

  const rotasProtegidas = [
    "/administrador",
    "/servicedesk",
    "/servicedesk/atendimento-sd", // ← Ajustado
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

  if (perfil === "administrador" && pathname !== "/administrador") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // SERVICEDESK → /servicedesk e /servicedesk/atendimento-sd
  if (perfil === "servicedesk") {
    if (
      pathname !== "/servicedesk" &&
      pathname !== "/servicedesk/atendimento-sd"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (
    perfil !== "administrador" &&
    perfil !== "servicedesk" &&
    pathname !== "/usuario"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/administrador/:path*", "/servicedesk/:path*", "/usuario/:path*"],
};
