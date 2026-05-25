// Título da página que aparece nas abas do navegador
import Head from "next/head";
interface TituloSiteProps {
  titulo: string;
}

export default function TituloSite({ titulo }: TituloSiteProps) {
  return (
    <Head>
      <title>{`HelpDesk | ${titulo}`}</title>
    </Head>
  );
}
