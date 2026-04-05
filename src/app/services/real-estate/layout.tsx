import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compra-Venta Inmobiliaria - Servicios de Bienes Raíces",
  description:
    "Servicios integrales de compra y venta de inmuebles en Ciudad Juárez. Asesoría legal, marketing digital, sesión fotográfica profesional, avalúo y acompañamiento notarial. Comisiones transparentes.",
  keywords: [
    "compra venta inmuebles Ciudad Juárez",
    "vender casa Juárez",
    "comprar propiedad Juárez",
    "servicios inmobiliarios",
    "asesoría legal inmobiliaria",
    "avalúo profesional",
    "comisión inmobiliaria transparente",
    "OHB compra venta",
  ],
  openGraph: {
    title: "Compra-Venta Inmobiliaria | OHB Asesorías",
    description:
      "Servicios integrales de compra y venta de inmuebles con asesoría legal y marketing digital.",
    url: "https://www.ohbasesores.com/services/real-estate",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "https://www.ohbasesores.com/ohb-logo.png",
        width: 1200,
        height: 630,
        alt: "Servicios de Compra-Venta OHB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compra-Venta Inmobiliaria | OHB Asesorías",
    description: "Compra y vende inmuebles con asesoría profesional en Ciudad Juárez.",
    images: ["https://www.ohbasesores.com/ohb-logo.png"],
  },
  alternates: {
    canonical: "https://www.ohbasesores.com/services/real-estate",
  },
};

export default function RealEstateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
