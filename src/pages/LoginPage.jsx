import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { loginUser } from '../api/auth.api';

const MIcon = ({ name, size = 20, color = '#64748b' }) => (
  <span className="material-symbols-outlined"
    style={{ fontSize: size, color, lineHeight: 1, userSelect: 'none' }}>
    {name}
  </span>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [isLoading, setLoad] = useState(false);
  const [showPass, setShow]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const isReady = form.email.trim() && form.password.trim();

  /* POST /user/login → { email, password } */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady) return toast.error('Please enter email and password.');
    setLoad(true);
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      const { token, user } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.name || 'Creator'}! 🎉`);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally { setLoad(false); }
  };

  return (
    <div style={s.root}>
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '10px', fontSize: '13px', fontWeight: '500',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          background: 'rgba(30,26,46,0.98)', color: '#f1f5f9',
          border: '1px solid rgba(255,255,255,0.08)',
        },
        success: { iconTheme: { primary: '#5b13ec', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />

      {/* ── Ambient blobs ── */}
      <div style={{ position:'fixed', top:'-15%', right:'-5%', width:600, height:600,
        borderRadius:'50%', background:'rgba(91,19,236,0.2)', filter:'blur(130px)',
        pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-15%', left:'-5%', width:500, height:500,
        borderRadius:'50%', background:'rgba(79,70,229,0.12)', filter:'blur(110px)',
        pointerEvents:'none', zIndex:0 }} />

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <MIcon name="auto_awesome_mosaic" size={20} color="#fff" />
          </div>
          <span style={s.brandName}>Creator Studio</span>
        </div>
        <span style={s.helpTxt}>Help &amp; Support</span>
      </header>

      {/* ── Centered content ── */}
      <main style={s.main}>
        <div style={s.card}>

          {/* Top icon */}
          <div style={s.iconRing}>
            <MIcon name="lock_open" size={28} color="#5b13ec" />
          </div>

          <h1 style={s.title}>Welcome back</h1>
          <p style={s.subtitle}>Sign in to your Creator Studio account</p>

          {/* Social buttons */}
          <div style={s.socialRow}>
            <button type="button" style={s.socialBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" style={s.socialBtn}>
              <MIcon name="ios" size={18} color="#f1f5f9" />
              <span>Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div style={s.divRow}>
            <div style={s.divLine} />
            <span style={s.divTxt}>or continue with email</span>
            <div style={s.divLine} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={s.form} noValidate>

            {/* Email */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Email Address</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><MIcon name="mail" size={17} color="#475569" /></span>
                <input name="email" type="email" placeholder="jane@example.com"
                  value={form.email} onChange={handleChange}
                  style={s.input} autoFocus autoComplete="email" />
              </div>
            </div>

            {/* Password */}
            <div style={s.fieldWrap}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label style={s.label}>Password</label>
                <span style={s.forgotLink}>Forgot password?</span>
              </div>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}><MIcon name="lock" size={17} color="#475569" /></span>
                <input name="password" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password} onChange={handleChange}
                  style={s.input} autoComplete="current-password" />
                <button type="button" onClick={() => setShow(p => !p)} style={s.eyeBtn}>
                  <MIcon name={showPass ? 'visibility_off' : 'visibility'} size={17} color="#475569" />
                </button>
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: 4 }}>
              <Button
                label="Sign In"
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!isReady}
                fullWidth
                icon="arrow_forward"
              />
            </div>

          </form>

          {/* Footer link */}
          <div style={s.footerRow}>
            <p style={s.footerTxt}>
              Don't have an account?{' '}
              <span style={s.link} onClick={() => navigate('/signup')}>Create one free</span>
            </p>
          </div>
        </div>
      </main>

      <footer style={s.footer}>
        © 2024 Creator Studio Inc. All rights reserved.
      </footer>
    </div>
  );
};

/* ─── Styles ───────────────────────────────────────────────── */
const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100vw',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    background: '#161022',
    color: '#f1f5f9',
    position: 'relative',
    overflowX: 'hidden',
  },
  header: {
    position: 'relative', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(22,16,34,0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  brand:    { display: 'flex', alignItems: 'center', gap: 10 },
  brandIcon:{
    width: 38, height: 38, borderRadius: 10,
    background: 'linear-gradient(135deg,#5b13ec,#7c3aed)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(91,19,236,0.4)',
  },
  brandName:{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' },
  helpTxt:  { fontSize: 13, color: '#475569', cursor: 'pointer' },

  /* ── Centered area ── */
  main: {
    minHeight: 'calc(100vh - 130px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    position: 'relative',
    zIndex: 1,
  },

  /* ── Glass card ── */
  card: {
    width: '100%',
    maxWidth: 440,
    background: 'rgba(46,40,57,0.5)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 24,
    padding: '40px 36px 32px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(91,19,236,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  iconRing: {
    width: 68, height: 68, borderRadius: '50%',
    background: 'rgba(91,19,236,0.13)',
    border: '1.5px solid rgba(91,19,236,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title:   { fontSize: 26, fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.5px', textAlign: 'center' },
  subtitle:{ fontSize: 14, color: '#94a3b8', margin: '0 0 24px', textAlign: 'center' },

  /* Social */
  socialRow:{ display: 'flex', gap: 10, width: '100%' },
  socialBtn:{
    flex: 1, height: 44, borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#e2e8f0', fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', transition: 'background 0.2s',
  },

  /* Divider */
  divRow: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', margin: '16px 0' },
  divLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' },
  divTxt:  { fontSize: 11, color: '#475569', fontWeight: 500, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.08em' },

  /* Form */
  form: { display: 'flex', flexDirection: 'column', gap: 14, width: '100%' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 6 },
  label:     { fontSize: 13, fontWeight: 600, color: '#cbd5e1' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 13, display: 'flex', alignItems: 'center', zIndex: 1, pointerEvents: 'none' },
  input: {
    width: '100%', height: 46,
    paddingLeft: 42, paddingRight: 44,
    borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.08)',
    background: 'rgba(22,16,34,0.7)',
    color: '#f1f5f9', fontSize: 14,
    fontFamily: "'Be Vietnam Pro', sans-serif",
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: 12,
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: 0,
  },
  forgotLink: { fontSize: 12, color: '#5b13ec', fontWeight: 600, cursor: 'pointer' },

  /* Footer */
  footerRow: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    marginTop: 24, paddingTop: 20, width: '100%', textAlign: 'center',
  },
  footerTxt: { fontSize: 13, color: '#64748b', margin: 0 },
  link:      { color: '#5b13ec', fontWeight: 700, cursor: 'pointer' },

  footer: {
    position: 'relative', zIndex: 10,
    textAlign: 'center', padding: '16px',
    fontSize: 11, color: '#334155',
    borderTop: '1px solid rgba(255,255,255,0.03)',
  },
};

export default LoginPage;
