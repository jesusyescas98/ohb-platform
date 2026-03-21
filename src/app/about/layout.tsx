import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros - Equipo de Asesores Inmobiliarios Certificados",
  description:
    "Conoce al equipo de OHB Asesorías y Consultorías. +15 años de experiencia en bienes raíces, inversiones y asesoría financiera en Ciudad Juárez, Chihuahua. Misión, visión y valores.",
  keywords: [
    "equipo OHB",
    "asesores inmobiliarios Ciudad Juárez",
    "consultores bienes raíces",
    "asesoría financiera Juárez",
    "OHB equipo profesional",
  ],
  openGraph: {
    title: "Nosotros | OHB Asesorías y Consultorías",
    description:
      "Equipo de asesores inmobiliarios certificados con +15 años de experiencia en Ciudad Juárez.",
    url: "https://www.ohbasesores.com/about",
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: "https://www.ohbasesores.com/ohb-logo.png",
        width: 1200,
        height: 630,
        alt: "Equipo OHB Asesorías y Consultorías",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Equipo OHB | Asesores Inmobiliarios Certificados",
    description: "Conoce al equipo de profesionales de OHB en Ciudad Juárez.",
    images: ["https://www.ohbasesores.com/ohb-logo.png"],
  },
  alternates: {
    canonical: "https://www.ohbasesores.com/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
