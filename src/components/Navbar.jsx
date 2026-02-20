import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onCreatePost }) => {
  const navigate = useNavigate();
  return (
    <nav style={S.nav}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={S.navLogo}><span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>auto_awesome_mosaic</span></div>
        <span style={S.navBrand}>CreatorHub</span>
      </div>
      {/* search */}
      <div style={S.searchBox}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#64748b' }}>search</span>
        <input placeholder="Search assets, posts…" style={S.searchInput} />
      </div>
      {/* nav links */}
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        {['Home','My Assets','Analytics'].map(l => (
          <button key={l} style={{
            ...S.navLink,
            borderBottom: l === 'Home' ? '2px solid #5b13ec' : '2px solid transparent',
            color: l === 'Home' ? '#fff' : '#94a3b8',
          }}>{l}</button>
        ))}
      </div>
      {/* right */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button style={S.iconBtn} title="Notifications">
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#94a3b8' }}>notifications</span>
          <span style={S.notifDot} />
        </button>
        <button style={S.createBtn} onClick={onCreatePost || (() => navigate('/create-post'))}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>add</span>+ Create Post
        </button>
        <div style={S.avatar}>{(user?.name || 'U')[0].toUpperCase()}</div>
      </div>
    </nav>
  );
};

const S = {
  nav: {
    display:'flex', alignItems:'center', gap:16,
    padding:'0 20px', height:58, width:'100%',
    background:'#13101e', borderBottom:'1px solid #1e1b2e',
    position:'sticky', top:0, zIndex:100, flexShrink:0,
  },
  navLogo:  { width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,#5b13ec,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' },
  navBrand: { fontSize:17, fontWeight:800, color:'#fff', whiteSpace:'nowrap' },
  searchBox:{ display:'flex', alignItems:'center', gap:8, background:'#0d0b14', border:'1px solid #1e1b2e', borderRadius:22, padding:'0 14px', height:36, flex:'1 1 200px', maxWidth:340 },
  searchInput:{ background:'transparent', border:'none', outline:'none', color:'#f1f5f9', fontSize:13, fontFamily:"'Be Vietnam Pro', sans-serif", width:'100%' },
  navLink:  { background:'none', border:'none', padding:'0 12px', height:58, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:"'Be Vietnam Pro', sans-serif", transition:'color 0.15s' },
  iconBtn:  { position:'relative', background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 },
  notifDot: { position:'absolute', top:4, right:4, width:8, height:8, borderRadius:'50%', background:'#5b13ec', border:'2px solid #13101e' },
  createBtn:{ display:'flex', alignItems:'center', gap:6, background:'#5b13ec', color:'#fff', border:'none', borderRadius:20, padding:'0 16px', height:36, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Be Vietnam Pro', sans-serif", boxShadow:'0 4px 14px rgba(91,19,236,0.4)', whiteSpace:'nowrap' },
  avatar:   { width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#5b13ec,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 },
};

export default Navbar;
