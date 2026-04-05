'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Header from '@/components/Header';
import styles from './checkout.module.css';

export default function CheckoutContent() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // In production, this would call the Stripe API to create a checkout session
      // For now, redirect to success page after a short delay
      setTimeout(() => {
        router.push('/checkout-success?orderId=demo-order');
      }, 1000);
    } catch (error) {
      console.error('Checkout error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.header}>
        <div className={styles.container}>
          <h1>🛒 Carrito de Compra</h1>
          <p>Completa tu compra de cursos</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.checkoutGrid}>
          {/* Cart Summary */}
          <div className={styles.cartSection}>
            <h2>Resumen del Carrito</h2>
            <div className={styles.cartItems}>
              <div className={styles.cartItem}>
                <span>Cursos Seleccionados</span>
                <span>Precio Variable</span>
              </div>
            </div>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Subtotal:</span>
                <span>$0 MXN</span>
              </div>
              <div className={styles.totalRow}>
                <span>IVA (16%):</span>
                <span>$0 MXN</span>
              </div>
              <div className={styles.totalRowFinal}>
                <span>Total:</span>
                <span>$0 MXN</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className={styles.paymentSection}>
            <h2>Información de Pago</h2>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="tu@email.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Nombre Completo</label>
              <input
                type="text"
                id="name"
                placeholder="Tu Nombre"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="card">Número de Tarjeta</label>
              <input
                type="text"
                id="card"
                placeholder="4242 4242 4242 4242"
                className={styles.input}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="expiry">Vencimiento</label>
                <input
                  type="text"
                  id="expiry"
                  placeholder="MM/AA"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cvc">CVC</label>
                <input
                  type="text"
                  id="cvc"
                  placeholder="123"
                  className={styles.input}
                />
              </div>
            </div>

            <button
              className={styles.btnCheckout}
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : '💳 Realizar Pago'}
            </button>

            <p className={styles.disclaimer}>
              Tu pago es seguro y encriptado. No guardamos información de tu tarjeta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
