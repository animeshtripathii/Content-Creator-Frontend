import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import { uploadMedia, createPostApi } from '../api/post.api';

const MIcon = ({ name, size = 20, color = 'currentColor' }) => (
  <span className="material-symbols-outlined"
    style={{ fontSize: size, color, lineHeight: 1, userSelect: 'none', flexShrink: 0 }}>
    {name}
  </span>
);

const CreatePostPage = () => {
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [isVideo, setIsVideo]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [form, setForm]           = useState({
    title: '', description: '', visibility: 'public',
  });

  if (!localStorage.getItem('token')) navigate('/login');

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setIsVideo(f.type.startsWith('video/'));
    setPreview(URL.createObjectURL(f));
    setProgress(0);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file)             return toast.error('Please select a file.');
    if (!form.title.trim()) return toast.error('Title is required.');

    // Step 1 — upload to Cloudinary
    setUploading(true);
    let uploadResult;
    try {
      uploadResult = await uploadMedia(file, setProgress);
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
      setUploading(false);
      return;
    }
    setUploading(false);

    // Step 2 — save post
    setSaving(true);
    try {
      await createPostApi({
        title:       form.title,
        description: form.description,
        visibility:  form.visibility,
        url:         uploadResult.data.url,
        uploadType:  uploadResult.data.uploadType,
      });
      toast.success('Post published! 🎉');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      toast.error(err.message || 'Failed to save post.');
    } finally { setSaving(false); }
  };

  const isLoading = uploading || saving;

  return (
    <div style={S.page}>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius:'10px', fontSize:'13px', fontFamily:"'Be Vietnam Pro',sans-serif",
                 background:'rgba(30,26,46,0.98)', color:'#f1f5f9', border:'1px solid rgba(255,255,255,0.08)' },
        success: { iconTheme: { primary:'#5b13ec', secondary:'#fff' } },
        error:   { iconTheme: { primary:'#ef4444', secondary:'#fff' } },
      }} />

      {/* ── NAVBAR ── */}
      <Navbar user={JSON.parse(localStorage.getItem('user') || '{}')} onCreatePost={null} />

      {/* ── FORM AREA ── */}
      <div style={{ ...S.container, maxWidth: '100%', width: '100%' }}>
        <div style={S.header}>
          <h1 style={S.title}>Create New Post</h1>
          <p style={{ fontSize:14, color:'#64748b', margin:0 }}>Share your content with the world</p>
        </div>

        <form onSubmit={handleSubmit} style={{ ...S.grid, gridTemplateColumns: '1fr 380px', maxWidth: 1200, margin: '0 auto' }}>
          {/* LEFT — file upload */}
          <div style={S.uploadCol}>
            {/* Drop zone */}
            <div
              style={{
                ...S.dropZone,
                borderColor: dragging ? '#5b13ec' : preview ? '#5b13ec' : '#1e1b2e',
                background:  dragging  ? 'rgba(91,19,236,0.08)' : '#0d0b14',
              }}
              onClick={() => !isLoading && fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {preview ? (
                isVideo
                  ? <video src={preview} controls style={S.previewMedia} />
                  : <img src={preview}   alt="preview" style={S.previewMedia} />
              ) : (
                <div style={{ textAlign:'center', pointerEvents:'none' }}>
                  <div style={S.uploadIcon}><MIcon name="cloud_upload" size={40} color="#5b13ec" /></div>
                  <p style={{ fontSize:15, fontWeight:700, color:'#f1f5f9', margin:'12px 0 6px' }}>
                    Drop your file here
                  </p>
                  <p style={{ fontSize:13, color:'#64748b' }}>
                    or click to browse · Images &amp; Videos up to 50 MB
                  </p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file"
              accept="image/*,video/*" style={{ display:'none' }}
              onChange={(e) => pickFile(e.target.files[0])} />

            {/* Change file button */}
            {preview && (
              <button type="button" onClick={() => fileRef.current.click()}
                style={S.changeBtn}>
                <MIcon name="swap_horiz" size={16} color="#a78bfa" /> Change file
              </button>
            )}

            {/* Upload progress bar */}
            {uploading && (
              <div style={{ marginTop:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#94a3b8', marginBottom:6 }}>
                  <span>Uploading to Cloudinary…</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height:6, background:'#1e1b2e', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#5b13ec,#a855f7)', borderRadius:99, transition:'width 0.2s' }} />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — post details */}
          <div style={S.detailsCol}>
            <div style={S.card}>
              <h2 style={S.cardTitle}>Post Details</h2>

              {/* Title */}
              <div style={S.field}>
                <label style={S.label}>Title <span style={{ color:'#ef4444' }}>*</span></label>
                <input name="title" type="text" placeholder="Give your post a title…"
                  value={form.title} maxLength={80}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={S.input} />
                <p style={{ fontSize:11, color:'#334155', textAlign:'right', marginTop:4 }}>{form.title.length}/80</p>
              </div>

              {/* Description */}
              <div style={S.field}>
                <label style={S.label}>Description</label>
                <textarea name="description" placeholder="What's this post about?"
                  value={form.description} maxLength={500} rows={4}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ ...S.input, height:'auto', paddingTop:12, resize:'vertical' }} />
                <p style={{ fontSize:11, color:'#334155', textAlign:'right', marginTop:4 }}>{form.description.length}/500</p>
              </div>

              {/* Visibility */}
              <div style={S.field}>
                <label style={S.label}>Visibility</label>
                <div style={{ display:'flex', gap:10 }}>
                  {['public','private'].map(v => (
                    <button key={v} type="button"
                      onClick={() => setForm({ ...form, visibility: v })}
                      style={{
                        flex:1, height:42, borderRadius:10, border:'1.5px solid',
                        borderColor: form.visibility === v ? '#5b13ec' : '#1e1b2e',
                        background:  form.visibility === v ? 'rgba(91,19,236,0.12)' : '#0d0b14',
                        color:       form.visibility === v ? '#a78bfa' : '#64748b',
                        fontFamily:"'Be Vietnam Pro',sans-serif", fontSize:13, fontWeight:600,
                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        transition:'all 0.15s',
                      }}>
                      <MIcon name={v === 'public' ? 'public' : 'lock'} size={16}
                        color={form.visibility === v ? '#a78bfa' : '#4b5563'} />
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* File info */}
              {file && (
                <div style={S.fileInfo}>
                  <MIcon name={isVideo ? 'videocam' : 'image'} size={18} color="#5b13ec" />
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', margin:0 }}>{file.name}</p>
                    <p style={{ fontSize:11, color:'#64748b', margin:0 }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB · {isVideo ? 'Video' : 'Image'}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                label={uploading ? 'Uploading…' : saving ? 'Publishing…' : 'Publish Post'}
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={!file || !form.title.trim()}
                fullWidth
                icon="publish"
              />

              <Button
                label="Cancel"
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                fullWidth
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Styles ── */
const S = {
  page: { minHeight:'100vh', background:'#100e1a', fontFamily:"'Be Vietnam Pro',sans-serif", color:'#f1f5f9', display:'flex', flexDirection:'column' },
  nav:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:56, background:'#13101e', borderBottom:'1px solid #1e1b2e', flexShrink:0 },
  backBtn: { display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#94a3b8', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:"'Be Vietnam Pro',sans-serif" },
  navLogo:  { width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#5b13ec,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' },
  navBrand: { fontSize:17, fontWeight:800, color:'#fff' },
  container:{ maxWidth:1100, width:'100%', margin:'0 auto', padding:'32px 20px 60px' },
  header:   { marginBottom:28 },
  title:    { fontSize:26, fontWeight:900, color:'#f1f5f9', margin:'0 0 6px', letterSpacing:'-0.5px' },
  grid:     { display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' },
  /* left */
  uploadCol:{ display:'flex', flexDirection:'column', gap:0 },
  dropZone: { border:'2px dashed', borderRadius:18, padding:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s', minHeight:320, overflow:'hidden' },
  previewMedia:{ width:'100%', height:320, objectFit:'contain', borderRadius:12 },
  uploadIcon:{ width:72, height:72, borderRadius:'50%', background:'rgba(91,19,236,0.12)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' },
  changeBtn:{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(91,19,236,0.1)', border:'1px solid rgba(91,19,236,0.25)', borderRadius:8, padding:'8px 16px', color:'#a78bfa', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Be Vietnam Pro',sans-serif", marginTop:12 },
  /* right */
  detailsCol:{ display:'flex', flexDirection:'column', gap:16 },
  card:     { background:'#13101e', border:'1px solid #1e1b2e', borderRadius:16, padding:'24px 24px 20px', display:'flex', flexDirection:'column', gap:16 },
  cardTitle:{ fontSize:16, fontWeight:800, color:'#f1f5f9', margin:0 },
  field:    { display:'flex', flexDirection:'column', gap:6 },
  label:    { fontSize:13, fontWeight:600, color:'#cbd5e1' },
  input:    { width:'100%', height:46, padding:'0 14px', borderRadius:10, border:'1.5px solid #1e1b2e', background:'#0d0b14', color:'#f1f5f9', fontSize:14, fontFamily:"'Be Vietnam Pro',sans-serif", outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' },
  fileInfo: { display:'flex', alignItems:'center', gap:10, background:'rgba(91,19,236,0.08)', border:'1px solid rgba(91,19,236,0.2)', borderRadius:10, padding:'10px 14px' },
};

export default CreatePostPage;
