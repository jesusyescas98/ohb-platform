'use client';

import { Suspense } from 'react';
import Header from '@/components/Header';
import styles from './checkout.module.css';
import CheckoutContent from './CheckoutContent';

function CheckoutLoadingFallback() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <p>Cargando carrito...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoadingFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}

