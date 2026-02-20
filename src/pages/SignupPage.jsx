import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { initiateSignup, verifySignupOtp } from '../api/auth.api';

/* ─── Responsive hook ─────────────────────────────────────── */
const useIsDesktop = () => {
  const [v, setV] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return v;
};

/* ─── Password strength ─────────────────────────────────────── */
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return [
    { label: '', color: '#1e1b2e' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f97316' },
    { label: 'Good', color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
  ][s];
};

const MIcon = ({ name, size = 20, color = '#64748b', style: extra }) => (
  <span className="material-symbols-outlined"
    style={{ fontSize: size, color, lineHeight: 1, userSelect: 'none', ...extra }}>
    {name}
  </span>
);

const Field = ({ label, icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{label}</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 13, zIndex: 1, display: 'flex', alignItems: 'center' }}>
        <MIcon name={icon} size={18} color="#475569" />
      </span>
      {children}
    </div>
  </div>
);

const INPUT = {
  width: '100%', height: 46, paddingLeft: 42, paddingRight: 40,
  borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.07)',
  background: 'rgba(22,16,34,0.6)', color: '#f1f5f9', fontSize: 14,
  fontFamily: "'Be Vietnam Pro', sans-serif", outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

/* ═══════════════════════════════════════════════════════════ */
const SignupPage = () => {
  const navigate  = useNavigate();
  const isDesktop = useIsDesktop();

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  });
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [isLoading, setLoading] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [step, setStep]         = useState('signup');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const otpRefs                 = useRef([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const strength = getStrength(form.password);
  const isFormFilled = Object.entries(form).every(([, v]) => v.trim());

  /* OTP box handlers */
  const handleOtpChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    setOtp([...digits, ...Array(6 - digits.length).fill('')]);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };
  const fullOtp = otp.join('');

  /* POST /user/signup/initiate */
  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!isFormFilled)                          return toast.error('Please fill in all fields.');
    if (form.password !== form.confirmPassword)  return toast.error('Passwords do not match!');
    if (form.password.length < 6)               return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await initiateSignup(form.email);
      toast.success('OTP sent! Check your inbox 📧');
      setStep('otp');
    } catch (err) { toast.error(err.message || 'Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  /* POST /user/signup/verify */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (fullOtp.length < 6) return toast.error('Enter all 6 digits.');
    setLoading(true);
    try {
      const data = await verifySignupOtp({
        email: form.email, otp: fullOtp,
        name: form.fullName, password: form.password, role: 'user',
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      toast.success('Account created! 🎉');
      setTimeout(() => navigate('/login'), 1400);
    } catch (err) { toast.error(err.message || 'Invalid OTP.'); }
    finally { setLoading(false); }
  };

  /* ─── PAGE BACKGROUNDS (shared ambient blobs) ─── */
  const Blobs = () => (
    <>
      <div style={{ position:'absolute', top:'-10%', right:'-5%',
        width:500, height:500, borderRadius:'50%',
        background:'rgba(91,19,236,0.18)', filter:'blur(120px)',
        pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'absolute', bottom:'-10%', left:'-5%',
        width:400, height:400, borderRadius:'50%',
        background:'rgba(79,70,229,0.1)', filter:'blur(100px)',
        pointerEvents:'none', zIndex:0 }} />
    </>
  );

  /* ─────────────── OTP STEP PAGE ─────────────────────── */
  if (step === 'otp') return (
    <div style={{ ...S.page, flexDirection:'column' }}>
      <Toaster position="top-right" toastOptions={toastOpts} />
      <Blobs />

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}><MIcon name="auto_awesome_mosaic" size={22} color="#fff" /></div>
          <span style={S.logoText}>Creator Studio</span>
        </div>
        <button style={S.helpBtn}>Help &amp; Support</button>
      </header>

      {/* Card */}
      <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:1 }}>
        <div style={S.glassCard}>
          {/* Icon badge */}
          <div style={S.iconBadge}>
            <MIcon name="mark_email_read" size={32} color="#5b13ec" />
          </div>

          <h2 style={{ fontSize:26, fontWeight:900, color:'#f1f5f9', margin:'0 0 8px', textAlign:'center', letterSpacing:'-0.5px' }}>
            Enter Verification Code
          </h2>
          <p style={{ fontSize:14, color:'#94a3b8', textAlign:'center', lineHeight:1.6, margin:'0 0 4px' }}>
            We sent a 6-digit code to your email
          </p>
          <p style={{ fontSize:14, fontWeight:700, color:'#e2e8f0', textAlign:'center', margin:'0 0 28px' }}>
            {form.email}
          </p>

          {/* 6 individual OTP boxes */}
          <form onSubmit={handleVerify} style={{ width:'100%' }}>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:28 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  placeholder="-"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  autoFocus={i === 0}
                  style={{
                    ...S.otpBox,
                    borderColor: digit ? '#5b13ec' : 'rgba(255,255,255,0.08)',
                    color: digit ? '#f1f5f9' : '#475569',
                    boxShadow: digit ? '0 0 0 2px rgba(91,19,236,0.2)' : 'none',
                  }}
                />
              ))}
            </div>

            <Button
              label="Verify Account"
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={fullOtp.length < 6}
              fullWidth
              icon="arrow_forward"
            />

            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#64748b' }}>
              Didn't receive the code?{' '}
              <span
                style={{ color:'#5b13ec', fontWeight:700, cursor:'pointer' }}
                onClick={() => { setOtp(['','','','','','']); handleInitiate({ preventDefault:()=>{} }); }}>
                Resend
              </span>
            </div>
          </form>

          {/* Back link */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', marginTop:28, paddingTop:20, width:'100%', textAlign:'center' }}>
            <button onClick={() => setStep('signup')} style={S.backLink}>
              <MIcon name="arrow_back" size={16} color="#64748b" />
              Back to Sign Up
            </button>
          </div>
        </div>
      </main>

      <footer style={S.footer}>© 2024 Creator Studio Inc. All rights reserved.</footer>
    </div>
  );

  /* ─────────────── SIGNUP STEP PAGE ─────────────────────── */
  return (
    <div style={S.page}>
      <Toaster position="top-right" toastOptions={toastOpts} />
      <Blobs />

      {/* Left hero panel */}
      {isDesktop && (
        <div style={S.left}>
          <div style={S.leftOv1} /><div style={S.leftOv2} />
          <div style={{ ...S.logo, position:'relative', zIndex:2 }}>
            <div style={S.logoIcon}><MIcon name="auto_awesome_mosaic" size={22} color="#fff" /></div>
            <span style={S.logoText}>Creator Studio</span>
          </div>
          <div style={{ position:'relative', zIndex:2 }}>
            <p style={{ fontSize:20, fontWeight:800, color:'#f1f5f9', lineHeight:1.5, marginBottom:20 }}>
              "This platform gave me the tools to turn my weekend hobby into a full-time career.
              It's not just a dashboard; it's a launchpad."
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={S.avatar}>SJ</div>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'#fff', margin:0 }}>Sarah Jenkins</p>
                <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Digital Illustrator · 280k followers</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right form panel */}
      <div style={S.right}>
        {/* Mobile logo */}
        {!isDesktop && (
          <div style={{ ...S.logo, marginBottom:24, alignSelf:'flex-start', position:'relative', zIndex:1 }}>
            <div style={S.logoIcon}><MIcon name="auto_awesome_mosaic" size={18} color="#fff" /></div>
            <span style={{ ...S.logoText, fontSize:18 }}>Creator Studio</span>
          </div>
        )}

        <div style={S.glassCard}>
          <h1 style={{ fontSize:26, fontWeight:900, color:'#f1f5f9', margin:'0 0 6px', letterSpacing:'-0.5px' }}>
            Start creating today
          </h1>
          <p style={{ fontSize:14, color:'#64748b', margin:'0 0 22px' }}>
            Join 100k+ creators monetizing their digital content.
          </p>

          <form onSubmit={handleInitiate} style={{ display:'flex', flexDirection:'column', gap:14 }} noValidate>

            {/* Social */}
            <div style={{ display:'flex', gap:10 }}>
              {[
                { label:'Google', icon:<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
                { label:'Apple',  icon:<MIcon name="ios" size={20} color="#f1f5f9" /> },
              ].map(({ label, icon }) => (
                <button key={label} type="button" style={S.socialBtn}>
                  {icon}<span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
                </button>
              ))}
            </div>

            <div style={S.divRow}>
              <div style={S.divLine} />
              <span style={S.divTxt}>or continue with email</span>
              <div style={S.divLine} />
            </div>

            <Field label="Full Name" icon="person">
              <input name="fullName" type="text" placeholder="Jane Doe"
                value={form.fullName} onChange={handleChange} style={INPUT} autoFocus />
            </Field>

            <Field label="Email Address" icon="mail">
              <input name="email" type="email" placeholder="jane@example.com"
                value={form.email} onChange={handleChange} style={INPUT} />
            </Field>

            <Field label="Create Password" icon="lock">
              <input name="password" type={showPass ? 'text' : 'password'}
                placeholder="••••••••" value={form.password} onChange={handleChange} style={INPUT} />
              <button type="button" onClick={() => setShowPass(p => !p)} style={S.eyeBtn}>
                <MIcon name={showPass ? 'visibility_off' : 'visibility'} size={18} color="#475569" />
              </button>
            </Field>
            {form.password && (
              <div style={{ marginTop:-8 }}>
                <div style={{ display:'flex', gap:4, height:3 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, borderRadius:99,
                      background: i <= (getStrength(form.password).score || 0) ? strength.color : '#1e1b2e',
                      transition:'background 0.3s' }} />
                  ))}
                </div>
                <p style={{ fontSize:11, marginTop:4, color:strength.color, fontWeight:600 }}>{strength.label}</p>
              </div>
            )}

            <Field label="Confirm Password" icon="lock">
              <input name="confirmPassword" type={showConf ? 'text' : 'password'}
                placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} style={INPUT} />
              <button type="button" onClick={() => setShowConf(p => !p)} style={S.eyeBtn}>
                <MIcon name={showConf ? 'visibility_off' : 'visibility'} size={18} color="#475569" />
              </button>
            </Field>

            <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width:15, height:15, accentColor:'#5b13ec', marginTop:2, flexShrink:0 }} />
              <span style={{ fontSize:13, color:'#94a3b8', lineHeight:1.5 }}>
                I agree to the <a href="#" style={S.a}>Terms of Service</a> and <a href="#" style={S.a}>Privacy Policy</a>
              </span>
            </label>

            {agreed
              ? <Button label="Create Account" type="submit" variant="primary"
                  isLoading={isLoading} disabled={!isFormFilled} fullWidth icon="arrow_forward" />
              : <p style={{ textAlign:'center', fontSize:12, color:'#475569' }}>☝️ Agree to the terms to continue</p>}

            <p style={{ textAlign:'center', fontSize:13, color:'#64748b' }}>
              Already have an account?{' '}
              <span style={S.a} onClick={() => navigate('/login')}>Log in</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─── Shared toast options ─────────────────────────────────── */
const toastOpts = {
  duration: 3500,
  style: {
    borderRadius:'10px', fontSize:'13px', fontWeight:'500',
    fontFamily:"'Be Vietnam Pro', sans-serif",
    background:'rgba(30,26,46,0.95)', color:'#f1f5f9',
    border:'1px solid rgba(255,255,255,0.08)',
    backdropFilter:'blur(12px)',
  },
  success: { iconTheme: { primary:'#5b13ec', secondary:'#fff' } },
  error:   { iconTheme: { primary:'#ef4444', secondary:'#fff' } },
};

/* ─── Styles ───────────────────────────────────────────────── */
const S = {
  page: {
    display:'flex', minHeight:'100vh',
    fontFamily:"'Be Vietnam Pro', sans-serif",
    background:'#161022',
    position:'relative', overflow:'hidden',
  },
  header: {
    position:'relative', zIndex:10,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'18px 32px',
    borderBottom:'1px solid rgba(255,255,255,0.05)',
    background:'rgba(22,16,34,0.6)', backdropFilter:'blur(12px)',
  },
  logo: { display:'flex', alignItems:'center', gap:10 },
  logoIcon: {
    width:40, height:40, borderRadius:12,
    background:'linear-gradient(135deg,#5b13ec,#7c3aed)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 4px 12px rgba(91,19,236,0.35)',
  },
  logoText: { fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'-0.3px' },
  helpBtn: {
    background:'none', border:'none', cursor:'pointer',
    color:'#64748b', fontSize:13, fontWeight:500,
    fontFamily:"'Be Vietnam Pro', sans-serif",
  },
  footer: {
    position:'relative', zIndex:10,
    textAlign:'center', padding:'18px', fontSize:11,
    color:'#334155', borderTop:'1px solid rgba(255,255,255,0.03)',
  },

  /* Glassmorphism card — used for both OTP page and from a standalone card on right */
  glassCard: {
    width:'100%', maxWidth:448,
    background:'rgba(46,40,57,0.45)',
    backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
    border:'1px solid rgba(255,255,255,0.08)',
    borderRadius:24, padding:'36px 36px 32px',
    boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(91,19,236,0.07)',
    display:'flex', flexDirection:'column', alignItems:'center',
  },
  iconBadge: {
    width:72, height:72, borderRadius:'50%',
    background:'rgba(91,19,236,0.12)',
    border:'1px solid rgba(91,19,236,0.2)',
    display:'flex', alignItems:'center', justifyContent:'center',
    marginBottom:20,
  },

  /* OTP individual digit boxes */
  otpBox: {
    width:52, height:56, textAlign:'center',
    fontSize:22, fontWeight:800, color:'#f1f5f9',
    background:'rgba(22,16,34,0.6)',
    border:'1.5px solid rgba(255,255,255,0.08)',
    borderRadius:12, outline:'none',
    fontFamily:"'Be Vietnam Pro', sans-serif",
    transition:'border-color 0.15s, box-shadow 0.15s',
    caretColor:'transparent',
  },
  backLink: {
    background:'none', border:'none', cursor:'pointer',
    display:'inline-flex', alignItems:'center', gap:6,
    color:'#64748b', fontSize:13, fontWeight:500,
    fontFamily:"'Be Vietnam Pro', sans-serif",
    transition:'color 0.2s',
  },

  /* Left hero */
  left: {
    width:'42%', flexShrink:0, position:'relative',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    padding:'44px 48px', overflow:'hidden',
    backgroundImage:"url('https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&auto=format&fit=crop&q=80')",
    backgroundSize:'cover', backgroundPosition:'center top',
  },
  leftOv1: {
    position:'absolute', inset:0,
    background:'linear-gradient(to bottom, rgba(22,16,34,0.5) 0%, rgba(22,16,34,0.92) 70%, rgba(22,16,34,1) 100%)',
  },
  leftOv2: { position:'absolute', inset:0, background:'rgba(91,19,236,0.06)' },
  avatar: {
    width:44, height:44, borderRadius:'50%',
    background:'linear-gradient(135deg,#5b13ec,#7c3aed)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:14, fontWeight:800, color:'#fff', flexShrink:0,
  },

  /* Right */
  right: {
    flex:1, display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center',
    padding:'40px 24px', overflowY:'auto',
    position:'relative', zIndex:1,
  },

  /* Form atoms */
  socialBtn: {
    flex:1, height:44, borderRadius:10,
    border:'1px solid rgba(255,255,255,0.07)',
    background:'rgba(22,16,34,0.5)', backdropFilter:'blur(8px)',
    color:'#f1f5f9', fontSize:13, fontWeight:600,
    fontFamily:"'Be Vietnam Pro', sans-serif",
    display:'flex', alignItems:'center', justifyContent:'center', gap:8,
    cursor:'pointer',
  },
  divRow: { display:'flex', alignItems:'center', gap:10 },
  divLine: { flex:1, height:1, background:'rgba(255,255,255,0.06)' },
  divTxt: { fontSize:11, color:'#475569', fontWeight:500, whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.07em' },
  eyeBtn: {
    position:'absolute', right:12, background:'none', border:'none',
    cursor:'pointer', display:'flex', alignItems:'center', padding:0,
  },
  a: { color:'#5b13ec', fontWeight:700, cursor:'pointer', textDecoration:'none' },
};

export default SignupPage;
