'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import styles from './checkoutSuccess.module.css';
import CheckoutSuccessContent from './CheckoutSuccessContent';

function LoadingFallback() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <p>Cargando información del pago...</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
