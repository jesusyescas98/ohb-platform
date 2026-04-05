import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academia OHB - Cursos de Inversión Inmobiliaria y Finanzas",
  description:
    "Aprende inversión inmobiliaria, Infonavit, Cofinavit, cálculo de ROI y finanzas con cursos prácticos. Academia OHB: formación premium para inversionistas en Ciudad Juárez.",
  keywords: [
    "cursos inversión inmobiliaria",
    "academia bienes raíces",
    "curso Infonavit",
    "aprender inversiones México",
    "educación financiera inmobiliaria",
    "cursos OHB",
    "Cofinavit curso",
    "cap rate ROI",
  ],
  openGraph: {
    title: "Academia OHB | Cursos de Inversión Inmobiliaria",
    description:
      "Formación premium en inversión inmobiliaria, Infonavit y finanzas. Cursos prácticos con certificación.",
    url: "https://www.ohbasesores.com/academy",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "https://www.ohbasesores.com/ohb-logo.png",
        width: 1200,
        height: 630,
        alt: "Academia OHB - Cursos de Inversión Inmobiliaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Academia OHB | Inversión Inmobiliaria y Finanzas",
    description: "Cursos prácticos de inversión inmobiliaria y finanzas en Ciudad Juárez.",
    images: ["https://www.ohbasesores.com/ohb-logo.png"],
  },
  alternates: {
    canonical: "https://www.ohbasesores.com/academy",
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
