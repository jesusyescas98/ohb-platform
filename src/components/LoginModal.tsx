"use client";

import { useState, useEffect, useCallback } from 'react';
import styles from './LoginModal.module.css';
import { useAuth, validatePasswordStrength, validateEmail } from '../context/AuthContext';
import { UsersDB } from '../lib/database';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithPassword, register, checkLoginAttempts, incrementLoginAttempts } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'success' | 'error' | 'locked'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Password strength
  const passwordStrength = validatePasswordStrength(password);
  const isEmailValid = validateEmail(email);

  // Pre-fill remembered email
  useEffect(() => {
    const remembered = UsersDB.getRememberedEmail();
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Phone mask
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    let formatted = cleaned;
    if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length > 3) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    setPhone(formatted);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('form');
        setErrorMessage('');
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check login attempts
    if (!checkLoginAttempts()) {
      setStep('locked');
      setErrorMessage('Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente por 15 minutos por seguridad.');
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    // Validate password
    if (!password || password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Register-specific validations
    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('El nombre completo es requerido.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
      if (passwordStrength.score < 3) {
        setErrorMessage('Tu contraseña es demasiado débil. Necesita al menos: mayúsculas, minúsculas y números.');
        return;
      }
      if (!acceptTerms) {
        setErrorMessage('Debes aceptar los Términos y Condiciones para continuar.');
        return;
      }
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        setErrorMessage('El número de teléfono debe tener 10 dígitos.');
        return;
      }
    }

    setIsLoading(true);

    // Simulated delay for UX
    setTimeout(() => {
      if (mode === 'register') {
        // ===== REGISTER =====
        const result = register(email, password, 'cliente', fullName, phone);
        setIsLoading(false);

        if (!result.success) {
          setErrorMessage(result.error || 'Error al registrar. Intenta de nuevo.');
          setStep('form');
          return;
        }

        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('form');
          resetForm();
        }, 2000);

      } else if (mode === 'login') {
        // ===== LOGIN =====
        const result = loginWithPassword(email, password, rememberMe);
        setIsLoading(false);

        if (!result.success) {
          setErrorMessage(result.error || 'Credenciales inválidas.');
          setStep('form');
          incrementLoginAttempts();
          return;
        }

        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('form');
          resetForm();
          // Get the role from DB to redirect properly
          const user = UsersDB.getByEmail(email);
          if (user && (user.role === 'asesor' || user.role === 'admin')) {
            window.location.href = '/dashboard';
          }
        }, 2000);

      } else {
        // Recovery mode
        setIsLoading(false);
        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('form');
        }, 2000);
      }
    }, 1200);
  }, [email, password, confirmPassword, fullName, phone, mode, acceptTerms, rememberMe, passwordStrength.score, loginWithPassword, register, onClose, checkLoginAttempts, incrementLoginAttempts]);

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setAcceptTerms(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    // Don't reset email if rememberMe is on
    if (!rememberMe) setEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`glass-panel ${styles.modal}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">&times;</button>
        
        {step === 'form' && (
          <>
            {/* Tab Navigation */}
            <div className={styles.tabContainer}>
              <button 
                className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
                onClick={() => { setMode('login'); setErrorMessage(''); }}
              >
                🔑 Ingresar
              </button>
              <button 
                className={`${styles.tab} ${mode === 'register' ? styles.activeTab : ''}`}
                onClick={() => { setMode('register'); setErrorMessage(''); }}
              >
                ✨ Registrarse
              </button>
            </div>

            <h2 className={styles.title}>
              {mode === 'login' ? 'Bienvenido a ' : mode === 'register' ? 'Únete a ' : 'Recuperar Acceso '}
              <span className="text-gradient-silver">OHB</span>
            </h2>
            <p className={styles.subtitle}>
              {mode === 'login' 
                ? 'Ingresa con tu correo y contraseña registrados.' 
                : mode === 'register'
                ? 'Crea tu cuenta para acceder a métricas, CRM y herramientas IA.'
                : 'Ingresa tu correo para recibir instrucciones de recuperación.'}
            </p>

            {/* Security Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
              <span style={{ fontSize: '0.8rem' }}>🔒</span>
              <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>Conexión segura • Datos encriptados • Sesión protegida</span>
            </div>
            
            {/* Error Message */}
            {errorMessage && (
              <div style={{ 
                padding: '0.8rem 1rem', 
                background: 'rgba(239, 68, 68, 0.15)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                <span>⚠️</span>
                <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>{errorMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
              {mode === 'recovery' ? (
                <>
                  <div className={styles.inputGroup}>
                    <label>Correo Electrónico <span style={{ color: '#f87171' }}>*</span></label>
                    <input 
                      type="email" 
                      required 
                      placeholder="tu-correo@ejemplo.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={styles.input}
                      autoComplete="off"
                    />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                    {isLoading ? '⏳ Enviando...' : '📧 Enviar Enlace de Recuperación'}
                  </button>
                  <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--accent-silver)', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    ← Volver al Login
                  </button>
                </>
              ) : (
                <>
                  {mode === 'register' && (
                    <>
                      <div className={styles.inputGroup}>
                        <label>Nombre Completo <span style={{ color: '#f87171' }}>*</span></label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Juan Carlos Pérez" 
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className={styles.input}
                          autoComplete="off"
                          maxLength={80}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>Teléfono <span style={{ color: '#f87171' }}>*</span></label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="656-123-4567" 
                          value={phone}
                          onChange={e => handlePhoneChange(e.target.value)}
                          className={styles.input}
                          autoComplete="off"
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.inputGroup}>
                    <label>Correo Electrónico <span style={{ color: '#f87171' }}>*</span></label>
                    <input 
                      type="email" 
                      required 
                      placeholder="ejemplo@ohb.com" 
                      value={email}
                      onChange={e => { setEmail(e.target.value); if (!emailTouched) setEmailTouched(true); }}
                      onBlur={() => setEmailTouched(true)}
                      className={styles.input}
                      autoComplete="email"
                      style={emailTouched && email && !isEmailValid ? { borderColor: '#f87171' } : emailTouched && isEmailValid ? { borderColor: '#4ade80' } : {}}
                    />
                    {emailTouched && email && !isEmailValid && (
                      <span style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.3rem' }}>Formato de correo inválido</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Contraseña <span style={{ color: '#f87171' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        placeholder="••••••••" 
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (!passwordTouched) setPasswordTouched(true); }}
                        className={styles.input}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        minLength={6}
                        style={{ paddingRight: '3rem' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {mode === 'register' && passwordTouched && password && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ 
                              flex: 1, 
                              height: '4px', 
                              borderRadius: '2px', 
                              background: i <= passwordStrength.score ? passwordStrength.color : 'rgba(255,255,255,0.1)',
                              transition: 'all 0.3s ease'
                            }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: 'bold' }}>
                          {passwordStrength.label}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
                          {passwordStrength.requirements.map((req, i) => (
                            <span key={i} style={{ fontSize: '0.7rem', color: req.met ? '#4ade80' : 'var(--text-secondary)' }}>
                              {req.met ? '✓' : '○'} {req.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  {mode === 'register' && (
                    <div className={styles.inputGroup}>
                      <label>Confirmar Contraseña <span style={{ color: '#f87171' }}>*</span></label>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        autoComplete="new-password"
                        style={confirmPassword && password !== confirmPassword ? { borderColor: '#f87171' } : confirmPassword && password === confirmPassword ? { borderColor: '#4ade80' } : {}}
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <span style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.3rem' }}>Las contraseñas no coinciden</span>
                      )}
                    </div>
                  )}

                  {/* Terms & Remember Me */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {mode === 'register' && (
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <input 
                          type="checkbox" 
                          checked={acceptTerms} 
                          onChange={e => setAcceptTerms(e.target.checked)}
                          style={{ marginTop: '3px', accentColor: 'var(--accent-silver)' }}
                        />
                        <span>
                          Acepto los <a href="/terms" style={{ color: 'var(--accent-silver)', textDecoration: 'underline' }}>Términos y Condiciones</a> y el <a href="/privacy" style={{ color: 'var(--accent-silver)', textDecoration: 'underline' }}>Aviso de Privacidad</a> <span style={{ color: '#f87171' }}>*</span>
                        </span>
                      </label>
                    )}
                    {mode === 'login' && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <input 
                          type="checkbox" 
                          checked={rememberMe} 
                          onChange={e => setRememberMe(e.target.checked)}
                          style={{ accentColor: 'var(--accent-silver)' }}
                        />
                        Recordar mi usuario
                      </label>
                    )}
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                    {isLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span className={styles.spinner}></span>
                        Verificando...
                      </span>
                    ) : (
                      mode === 'login' ? '🔐 Iniciar Sesión Segura' : '✨ Crear Cuenta Premium'
                    )}
                  </button>

                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => { setMode('recovery'); setErrorMessage(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-silver)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.3rem', textDecoration: 'underline' }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </>
              )}
            </form>

            <div className={styles.divider}>o</div>
            <div className={styles.socialLogins}>
              <button className={styles.socialBtn} onClick={onClose}>Continuar Explorando como Invitado</button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className={styles.successState}>
            <div className={styles.aiVerification}></div>
            <h3>✅ {mode === 'register' ? 'Registro Exitoso' : mode === 'login' ? 'Bienvenido de Vuelta' : 'Enlace Enviado'}</h3>
            <p>{mode === 'register' 
              ? `Tu cuenta ha sido creada exitosamente.`
              : mode === 'login'
              ? 'Verificación completada. Redirigiendo...'
              : 'Revisa tu correo para el enlace de recuperación.'
            }</p>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
              <p style={{ fontSize: '0.8rem', color: '#4ade80' }}>
                🔒 Sesión segura establecida • Token generado • Encriptación activa
              </p>
            </div>
          </div>
        )}

        {step === 'locked' && (
          <div className={styles.successState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ color: '#f87171' }}>Cuenta Bloqueada Temporalmente</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{errorMessage}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              Si crees que esto es un error, contacta al administrador.
            </p>
            <button 
              onClick={onClose} 
              style={{ marginTop: '1.5rem', padding: '0.8rem 2rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className={styles.successState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h3 style={{ color: '#f87171' }}>Error de Autenticación</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{errorMessage}</p>
            <button 
              onClick={() => setStep('form')} 
              style={{ marginTop: '1.5rem', padding: '0.8rem 2rem', background: 'var(--accent-silver)', color: '#0B0F19', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Intentar de Nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
