import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPosts, getMyPosts } from '../api/post.api';
import Navbar from '../components/Navbar';

const MIcon = ({ name, size = 20, color = 'currentColor', style: ext }) => (
  <span className="material-symbols-outlined"
    style={{ fontSize: size, color, lineHeight: 1, userSelect: 'none', flexShrink: 0, ...ext }}>
    {name}
  </span>
);

const Trend = ({ value, positive }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:2,
    fontSize:12, fontWeight:700,
    color: positive ? '#22c55e' : '#ef4444' }}>
    <MIcon name={positive ? 'trending_up' : 'trending_down'} size={14}
      color={positive ? '#22c55e' : '#ef4444'} />
    {value}
  </span>
);

/* ── post type badge ── */
const Badge = ({ type }) => {
  const map = {
    image:   { label:'Image',   bg:'#1e3a5f', color:'#60a5fa' },
    video:   { label:'Video',   bg:'#1c3a2e', color:'#34d399' },
    article: { label:'Article', bg:'#3a2a1c', color:'#fb923c' },
    audio:   { label:'Audio',   bg:'#3a1c2e', color:'#e879f9' },
    design:  { label:'Design',  bg:'#2a1c3a', color:'#a78bfa' },
    draft:   { label:'DRAFT',   bg:'#854d0e', color:'#fef08a' },
  };
  const s = map[type?.toLowerCase()] || map.image;
  return (
    <span style={{
      fontSize:11, fontWeight:700, letterSpacing:'0.05em',
      background: s.bg, color: s.color,
      padding:'3px 8px', borderRadius:6,
    }}>{s.label}</span>
  );
};

/* ── single post card ── */
const PostCard = ({ post }) => {
  const nav = useNavigate();
  const isVideo = post.uploadType === 'video';
  const ago = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div style={cs.card} onClick={() => {}}>
      {/* thumbnail */}
      <div style={cs.thumb}>
        {post.url
          ? isVideo
            ? <video src={post.url} style={cs.media} />
            : <img src={post.url} alt={post.title} style={cs.media} />
          : <div style={{ ...cs.media, background:'#1e1b2e', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <MIcon name="image" size={36} color="#334155" />
            </div>}
        <div style={cs.badgeOverlay}><Badge type={post.uploadType || 'image'} /></div>
        {isVideo && <div style={cs.playBadge}><MIcon name="play_circle" size={32} color="#fff" /></div>}
      </div>
      {/* body */}
      <div style={cs.cardBody}>
        <p style={cs.cardTitle}>{post.title}</p>
        <p style={cs.cardDesc}>{post.description}</p>
        <div style={cs.cardMeta}>
          <span style={cs.metaItem}><MIcon name="visibility" size={14} color="#64748b" /> {post.views ?? 0}</span>
          <span style={cs.metaItem}><MIcon name="favorite" size={14} color="#64748b" /> {post.likes?.length ?? 0}</span>
          <span style={{ fontSize:12, color:'#475569', marginLeft:'auto' }}>{ago(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════ HOME PAGE ═══════════ */
const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All Posts');
  const [sideActive, setSide]   = useState('Dashboard');
  const [showMyPosts, setShowMyPosts] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Redirect if not logged in
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    setLoading(true);
    const fetchPosts = showMyPosts ? getMyPosts : getAllPosts;
    fetchPosts().then(r => {
      // getMyPosts returns data.data, getAllPosts returns data.posts
      setPosts(r.data?.posts || r.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [showMyPosts]);

  const filters = ['All Posts', 'Videos', 'Images', 'Articles'];
  const filtered = filter === 'All Posts' ? posts
    : posts.filter(p => {
        if (filter === 'Videos')   return p.uploadType === 'video';
        if (filter === 'Images')   return p.uploadType === 'image';
        if (filter === 'Articles') return p.uploadType === 'article';
        return true;
      });

  const sideMenu = [
    { section:'MENU', items:[
      { label:'Dashboard',   icon:'dashboard' },
      { label:'All Content', icon:'grid_view' },
      { label:'Performance', icon:'bar_chart' },
      { label:'Earnings',    icon:'paid' },
    ]},
    { section:'COMMUNITY', items:[
      { label:'Subscribers', icon:'group' },
      { label:'Comments',    icon:'chat_bubble' },
    ]},
  ];

  return (
    <div style={S.root}>
      <Navbar user={user} />

      <div style={S.body}>
        {/* ── SIDEBAR ── */}
        <aside style={S.sidebar}>
          {sideMenu.map(({ section, items }) => (
            <div key={section}>
              <p style={S.sideSection}>{section}</p>
              {items.map(({ label, icon }) => (
                <button key={label}
                  onClick={() => setSide(label)}
                  style={{
                    ...S.sideItem,
                    background: sideActive === label ? 'rgba(91,19,236,0.2)' : 'transparent',
                    color:      sideActive === label ? '#a78bfa' : '#94a3b8',
                  }}>
                  <MIcon name={icon} size={20}
                    color={sideActive === label ? '#a78bfa' : '#64748b'} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* ── MAIN ── */}
        <main style={S.main}>
          {/* Toggle My Posts / All Posts */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom: 16 }}>
            <button
              style={{
                ...S.createBtn,
                background: showMyPosts ? '#a78bfa' : '#5b13ec',
                color: '#fff',
                marginRight: 8,
                minWidth: 120,
              }}
              onClick={() => setShowMyPosts(v => !v)}
            >
              {showMyPosts ? 'Show All Posts' : 'Show My Posts'}
            </button>
          </div>
          {/* Welcome */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
            <div>
              <h1 style={S.welcomeH}>Welcome back, {user.name?.split(' ')[0] || 'Creator'}</h1>
              <p style={{ fontSize:14, color:'#64748b' }}>Here is an overview of your recent content performance.</p>
            </div>
            <button style={S.dateBadge}>
              <MIcon name="calendar_today" size={16} color="#94a3b8" /> Last 7 Days
            </button>
          </div>

          {/* Stat cards */}
          <div style={S.statsRow}>
            {[
              { label:'TOTAL VIEWS',      value:'12.5k', trend:'+12%', pos:true,  sub:'+1.2k since last week', icon:'visibility',   iconBg:'rgba(99,102,241,0.15)', iconCol:'#818cf8' },
              { label:'FOLLOWERS',        value:'3.2k',  trend:'+5%',  pos:true,  sub:'+150 new followers',    icon:'group',        iconBg:'rgba(20,184,166,0.15)',  iconCol:'#2dd4bf' },
              { label:'ENGAGEMENT RATE',  value:'4.8%',  trend:'+1.2%',pos:true,  sub:'Top 5% of creators',   icon:'favorite',     iconBg:'rgba(236,72,153,0.15)', iconCol:'#f472b6' },
            ].map(({ label, value, trend, pos, sub, icon, iconBg, iconCol }) => (
              <div key={label} style={S.statCard}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <p style={S.statLabel}>{label}</p>
                  <div style={{ ...S.statIcon, background: iconBg }}>
                    <MIcon name={icon} size={22} color={iconCol} />
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <span style={S.statValue}>{value}</span>
                  <Trend value={trend} positive={pos} />
                </div>
                <p style={{ fontSize:12, color:'#475569' }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs + sort */}
          <div style={S.tabRow}>
            <div style={{ display:'flex', gap:4 }}>
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  ...S.tab,
                  background: filter === f ? '#5b13ec' : 'transparent',
                  color:      filter === f ? '#fff'    : '#94a3b8',
                  border:     filter === f ? 'none'    : '1.5px solid transparent',
                }}>{f}</button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#64748b' }}>
              Sort by: <span style={{ color:'#f1f5f9', fontWeight:600 }}>Recent</span>
              <MIcon name="sort" size={18} color="#94a3b8" />
            </div>
          </div>

          {/* Post grid */}
          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:'#475569' }}>
              <MIcon name="hourglass_top" size={36} color="#5b13ec" />
              <p style={{ marginTop:12 }}>Loading posts…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>
              <MIcon name="video_library" size={48} color="#334155" />
              <p style={{ marginTop:12, color:'#475569', fontSize:14 }}>No posts yet. Create your first one!</p>
              <button style={{ ...S.createBtn, marginTop:16 }} onClick={() => navigate('/create-post')}>
                + Create Post
              </button>
            </div>
          ) : (
            <div style={S.grid}>
              {filtered.map(p => <PostCard key={p._id} post={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

/* ── Card sub-styles ── */
const cs = {
  card: {
    background: '#1a1625', border:'1px solid #1e1b2e',
    borderRadius:14, overflow:'hidden', cursor:'pointer',
    transition:'transform 0.2s, box-shadow 0.2s',
    display:'flex', flexDirection:'column',
  },
  thumb:  { position:'relative', aspectRatio:'16/9', overflow:'hidden', background:'#0d0b14' },
  media:  { width:'100%', height:'100%', objectFit:'cover' },
  badgeOverlay: { position:'absolute', top:8, right:8 },
  playBadge:    { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)' },
  cardBody:  { padding:'14px 14px 12px', flex:1, display:'flex', flexDirection:'column', gap:6 },
  cardTitle: { fontSize:15, fontWeight:700, color:'#f1f5f9', margin:0, lineHeight:1.35,
               display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  cardDesc:  { fontSize:12, color:'#64748b', margin:0, lineHeight:1.5,
               display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', flex:1 },
  cardMeta:  { display:'flex', alignItems:'center', gap:10, marginTop:'auto' },
  metaItem:  { display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#64748b' },
};

/* ── Page styles ── */
const S = {
  root: { display:'flex', flexDirection:'column', minHeight:'100vh', width:'100vw', background:'#100e1a', fontFamily:"'Be Vietnam Pro', sans-serif", color:'#f1f5f9' },

  /* navbar */
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

  /* body */
  body: { display:'flex', flex:1, width:'100%', overflow:'hidden' },

  /* sidebar */
  sidebar: { width:240, flexShrink:0, background:'#13101e', borderRight:'1px solid #1e1b2e', padding:'20px 12px', display:'flex', flexDirection:'column', gap:4, overflowY:'auto' },
  sideSection: { fontSize:10, fontWeight:700, color:'#334155', letterSpacing:'0.1em', textTransform:'uppercase', padding:'12px 8px 4px' },
  sideItem: { display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:'none', cursor:'pointer', width:'100%', textAlign:'left', fontSize:14, fontWeight:500, fontFamily:"'Be Vietnam Pro', sans-serif", transition:'all 0.15s' },

  /* main */
  main: { flex:1, width:'100%', padding:'28px 40px', overflowY:'auto', background:'#100e1a' },
  welcomeH: { fontSize:28, fontWeight:900, color:'#f1f5f9', margin:'0 0 4px', letterSpacing:'-0.5px' },
  dateBadge:{ display:'flex', alignItems:'center', gap:6, background:'#1a1625', border:'1px solid #1e1b2e', borderRadius:8, padding:'6px 14px', fontSize:13, color:'#94a3b8', cursor:'pointer', fontFamily:"'Be Vietnam Pro', sans-serif" },

  /* stats */
  statsRow: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 },
  statCard: { background:'#13101e', border:'1px solid #1e1b2e', borderRadius:14, padding:'20px 22px' },
  statLabel: { fontSize:11, fontWeight:700, color:'#475569', letterSpacing:'0.08em', textTransform:'uppercase', margin:0 },
  statIcon:  { width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' },
  statValue: { fontSize:26, fontWeight:900, color:'#f1f5f9', letterSpacing:'-0.5px' },

  /* tabs */
  tabRow: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 },
  tab:    { padding:'7px 16px', borderRadius:20, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Be Vietnam Pro', sans-serif", transition:'all 0.15s' },

  /* grid */
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px, 1fr))', gap:18 },

  /* empty */
  empty: { textAlign:'center', padding:'60px 20px', color:'#334155' },
};

export default HomePage;
