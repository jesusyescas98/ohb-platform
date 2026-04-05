import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portafolio de Propiedades Premium en Venta",
  description:
    "Explora propiedades exclusivas en venta: villas, departamentos, mansiones y oficinas en Ciudad Juárez, CDMX, Tulum y más. Análisis de ROI, métricas en tiempo real y herramientas de comparación.",
  keywords: [
    "propiedades en venta Ciudad Juárez",
    "villas en venta México",
    "departamentos premium",
    "inversión inmobiliaria Tulum",
    "portafolio propiedades",
    "bienes raíces premium",
    "oficinas comerciales venta",
    "ROI propiedades",
  ],
  openGraph: {
    title: "Portafolio Premium | OHB Asesorías y Consultorías",
    description:
      "Propiedades exclusivas en venta con análisis de ROI y métricas en tiempo real.",
    url: "https://www.ohbasesores.com/portfolio",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "https://www.ohbasesores.com/hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Portafolio de Propiedades Premium OHB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portafolio Premium | Propiedades en Venta",
    description: "Propiedades exclusivas con análisis de ROI en Ciudad Juárez y todo México.",
    images: ["https://www.ohbasesores.com/hero-bg.png"],
  },
  alternates: {
    canonical: "https://www.ohbasesores.com/portfolio",
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
