"use client";

import { usePathname } from 'next/navigation';
import Footer from '../components/Footer';
import ChatbotAI from '../components/ChatbotAI';
import CookieConsent from '../components/CookieConsent';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <>
      {children}
      {!isDashboard && <Footer />}
      {!isDashboard && <ChatbotAI />}
      <CookieConsent />
    </>
  );
}
