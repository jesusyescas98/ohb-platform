'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import styles from './checkoutSuccess.module.css';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
      // Extract invoice number from orderId or generate one
      setInvoiceNumber(`INV-2026-${Math.random().toString(36).substr(2, 5).toUpperCase()}`);
    }
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>

          <h1 className={styles.title}>¡Pago Exitoso!</h1>

          <p className={styles.message}>
            Gracias por tu compra. Tu acceso a los cursos ha sido activado.
          </p>

          <div className={styles.detailsBox}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Número de Orden:</span>
              <span className={styles.detailValue}>{orderId || 'demo-order'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Número de Factura:</span>
              <span className={styles.detailValue}>{invoiceNumber || 'INV-2026-00001'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Fecha:</span>
              <span className={styles.detailValue}>{new Date().toLocaleDateString('es-MX')}</span>
            </div>
          </div>

          <div className={styles.nextSteps}>
            <h2>Próximos Pasos</h2>
            <ul>
              <li>✓ Revisa tu email para la confirmación y factura</li>
              <li>✓ Accede a tus cursos en tu panel de usuario</li>
              <li>✓ Comienza tu aprendizaje cuando estés listo</li>
            </ul>
          </div>

          <div className={styles.actions}>
            <Link href="/my-courses" className={styles.btnPrimary}>
              📚 Ir a Mis Cursos
            </Link>
            <Link href="/academy" className={styles.btnSecondary}>
              Explorar Más Cursos
            </Link>
          </div>

          <p className={styles.support}>
            ¿Tienes preguntas? <Link href="/contacto">Contáctanos</Link> o usa nuestro <a href="#chatbot">chat de soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
}
