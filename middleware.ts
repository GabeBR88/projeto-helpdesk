import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("🛡️ MIDDLEWARE EXECUTADO - Rota:", request.nextUrl.pathname);
  console.log("🛡️ Cookie:", request.cookies.get("usuario")?.value);
  const usuario = request.cookies.get("usuario")?.value;
  const pathname = request.nextUrl.pathname;

  const rotasProtegidas = ["/administrador", "/servicedesk", "/usuario"];

  // Não é rota protegida? Passa direto
  if (!rotasProtegidas.includes(pathname)) {
    return NextResponse.next();
  }

  // Sem cookie = barrado
  if (!usuario) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const dados = JSON.parse(usuario);
  const perfil = dados.perfil;

  // ADMIN → Só /administrador
  if (perfil === "administrador" && pathname !== "/administrador") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // SERVICEDESK → Só /servicedesk
  if (perfil === "servicedesk" && pathname !== "/servicedesk") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // USUARIO → Só /usuario
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
