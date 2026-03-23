import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import LayoutShell from "./LayoutShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://www.ohbasesores.com";
const SITE_NAME = "OHB Inmobiliaria | Asesorías y Consultorías";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0F19",
};

export const metadata: Metadata = {
  // === Core Metadata ===
  title: {
    default: "OHB Inmobiliaria | Bienes Raíces, Inversiones e IA en Ciudad Juárez",
    template: "%s | OHB Inmobiliaria",
  },
  description:
    "Plataforma premium de bienes raíces, finanzas e inversiones en Ciudad Juárez, Chihuahua. Asesoría inmobiliaria personalizada con Inteligencia Artificial, calculadoras de hipoteca, análisis de ROI, portafolio de propiedades exclusivas y cursos especializados en inversión.",
  keywords: [
    "OHB",
    "OHB Inmobiliaria",
    "inmobiliaria Juárez",
    "bienes raíces Ciudad Juárez",
    "inversiones inmobiliarias",
    "asesoría inmobiliaria Juárez",
    "propiedades en venta Ciudad Juárez",
    "Infonavit Juárez",
    "Cofinavit",
    "OHB asesoría",
    "calculadora hipoteca México",
    "compra venta inmuebles",
    "inversión bienes raíces México",
    "ROI inmobiliario",
    "portafolio propiedades premium",
    "cursos inversión inmobiliaria",
    "asesor inmobiliario certificado",
    "crédito hipotecario Juárez",
    "consultoría financiera inmobiliaria",
  ],
  authors: [{ name: "OHB Inmobiliaria", url: SITE_URL }],
  creator: "OHB Inmobiliaria",
  publisher: "OHB Inmobiliaria",

  // === Robots & Indexing ===
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // === Canonical & Alternates ===
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "es-MX": "/",
    },
  },

  // === Open Graph (Facebook, LinkedIn, WhatsApp) ===
  openGraph: {
    title: "OHB Inmobiliaria | Bienes Raíces, Inversiones e IA",
    description:
      "Plataforma premium de bienes raíces e inversiones con IA predictiva en Ciudad Juárez. Portafolio exclusivo, calculadoras financieras y asesoría personalizada.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "es_MX",
    images: [
      {
        url: `${SITE_URL}/ohb-logo.png`,
        width: 1200,
        height: 630,
        alt: "OHB Asesorías y Consultorías - Bienes Raíces e Inversiones en Ciudad Juárez",
        type: "image/png",
      },
    ],
  },

  // === Twitter Card ===
  twitter: {
    card: "summary_large_image",
    title: "OHB Asesorías | Bienes Raíces e Inversiones con IA",
    description:
      "Plataforma premium de bienes raíces e inversiones con IA predictiva en Ciudad Juárez. Asesoría personalizada y portafolio exclusivo.",
    images: [`${SITE_URL}/ohb-logo.png`],
    creator: "@ohbasesores",
    site: "@ohbasesores",
  },

  // === Google Verification (placeholder - replace with actual) ===
  verification: {
    google: "GOOGLE_SITE_VERIFICATION_CODE",
    // yandex: "YANDEX_VERIFICATION_CODE",
    // bing: "BING_VERIFICATION_CODE",
  },

  // === App Info ===
  applicationName: SITE_NAME,
  category: "real estate",
  classification: "Business",

  // === Icons ===
  icons: {
    icon: "/favicon.ico",
    apple: "/ohb-logo.png",
  },

  // === Other ===
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  other: {
    "google": "notranslate",
    "content-language": "es-MX",
    "geo.region": "MX-CHH",
    "geo.placename": "Ciudad Juárez",
    "geo.position": "31.690363;-106.424547",
    "ICBM": "31.690363, -106.424547",
    "rating": "general",
    "distribution": "global",
    "revisit-after": "7 days",
  },
};

// JSON-LD Structured Data for the organization
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["RealEstateAgent", "FinancialService", "LocalBusiness"],
      "@id": `${SITE_URL}/#organization`,
      "name": "OHB Inmobiliaria | Asesorías y Consultorías",
      "alternateName": "OHB Asesores",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/ohb-logo.png`,
        "width": 512,
        "height": 512,
      },
      "image": `${SITE_URL}/ohb-logo.png`,
      "description": "Plataforma premium de bienes raíces, finanzas e inversiones en Ciudad Juárez. Asesoría inmobiliaria con Inteligencia Artificial, calculadoras de hipoteca, ROI y cursos especializados.",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Tomás Fernández #7818, local 19, Col. Buscari",
        "addressLocality": "Ciudad Juárez",
        "addressRegion": "Chihuahua",
        "postalCode": "32460",
        "addressCountry": "MX",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "31.690363",
        "longitude": "-106.424547",
      },
      "telephone": "+526561234567",
      "email": "contacto@ohb.com",
      "priceRange": "$$$",
      "currenciesAccepted": "MXN",
      "paymentAccepted": "Tarjeta de Crédito, Tarjeta de Débito, Transferencia Bancaria",
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "09:00",
          "closes": "14:00",
        },
      ],
      "sameAs": [
        "https://www.facebook.com/ohbasesores",
        "https://www.instagram.com/ohbasesores",
        "https://www.linkedin.com/company/ohbasesores",
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "2000",
        "bestRating": "5",
        "worstRating": "1",
      },
      "areaServed": {
        "@type": "City",
        "name": "Ciudad Juárez",
        "containedInPlace": {
          "@type": "State",
          "name": "Chihuahua",
        },
      },
      "knowsAbout": [
        "Bienes Raíces",
        "Inversiones Inmobiliarias",
        "Créditos Infonavit",
        "Cofinavit",
        "Análisis de ROI",
        "Hipotecas",
        "Asesoría Financiera",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "OHB Asesorías y Consultorías",
      "description": "Plataforma premium de bienes raíces e inversiones con IA en Ciudad Juárez",
      "publisher": {
        "@id": `${SITE_URL}/#organization`,
      },
      "inLanguage": "es-MX",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${SITE_URL}/portfolio?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      "url": SITE_URL,
      "name": "OHB Asesorías y Consultorías | Bienes Raíces, Inversiones e IA en Ciudad Juárez",
      "isPartOf": {
        "@id": `${SITE_URL}/#website`,
      },
      "about": {
        "@id": `${SITE_URL}/#organization`,
      },
      "description": "Plataforma premium de bienes raíces e inversiones con Inteligencia Artificial en Ciudad Juárez, Chihuahua.",
      "breadcrumb": {
        "@id": `${SITE_URL}/#breadcrumb`,
      },
      "inLanguage": "es-MX",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": SITE_URL,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/ohb-logo.png" />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable}`}>
        <AuthProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
