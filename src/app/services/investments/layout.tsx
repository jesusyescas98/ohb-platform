import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel de Inversiones - Rendimientos y Planes de Inversión",
  description:
    "Conoce los planes de inversión inmobiliaria de OHB: rendimientos de hasta 17% anual, respaldados por bienes raíces. Capital protegido con contrato notarial y asesor personal.",
  keywords: [
    "inversión inmobiliaria México",
    "rendimientos bienes raíces",
    "plan inversión alto rendimiento",
    "inversión segura México",
    "OHB inversiones",
    "rendimiento anual propiedades",
    "inversión con contrato notarial",
  ],
  openGraph: {
    title: "Inversiones | OHB Asesorías y Consultorías",
    description:
      "Planes de inversión inmobiliaria con rendimientos de hasta 17% anual, respaldados por bienes raíces.",
    url: "https://www.ohbasesores.com/services/investments",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "https://www.ohbasesores.com/ohb-logo.png",
        width: 1200,
        height: 630,
        alt: "Planes de Inversión OHB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inversiones OHB | Hasta 17% Rendimiento Anual",
    description: "Planes de inversión inmobiliaria con rendimientos premium en Ciudad Juárez.",
    images: ["https://www.ohbasesores.com/ohb-logo.png"],
  },
  alternates: {
    canonical: "https://www.ohbasesores.com/services/investments",
  },
};

export default function InvestmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
