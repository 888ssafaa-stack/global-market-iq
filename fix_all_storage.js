const fs=require('fs');
console.log('Applying robust storage fix...');

// 1. Fix App.jsx login/session persistence
const appPath = 'src/App.jsx';
if(fs.existsSync(appPath)){
  let c = fs.readFileSync(appPath, 'utf8');
  c = c.replace(/const\s*\[currentUser,\s*setCurrentUser\]\s*=\s*useState\([^)]*\);/g, 'const [currentUser, setCurrentUser] = useState(() => { try { const saved = localStorage.getItem("currentUser"); return saved ? JSON.parse(saved) : null; } catch(e){ return null; } });');
  // Ensure login functions save to localStorage
  c = c.replace(/(setCurrentUser\([^)]+\))/g, '$1; try { localStorage.setItem("currentUser", JSON.stringify($1)); } catch(e){}');
  fs.writeFileSync(appPath, c);
  console.log('App.jsx session storage fixed.');
}

// 2. Fix EditProfileModal.jsx for image upload and saving profile data
const modalPath = 'src/components/EditProfileModal.jsx';
if(fs.existsSync(modalPath)){
  let c = fs.readFileSync(modalPath, 'utf8');
  if(!c.includes('handleImgFile')){
    c = c.replace(/(const\s*[formData[^;]+;)/, '$1\n  const handleImgFile = (e, field) => { const f = e.target.files[0]; if(f){ const r = new FileReader(); r.onloadend = () => setFormData(p => ({...p, [field]: r.result})); r.readAsDataURL(f); } };');
  }
  c = c.replace(/type=["']text["']([^>]*placeholder=["']["']*(Avatar|avatar|صورة|Cover|cover)[^"']*["'][^>]*)>/gi, 'type="file" accept="image/*" onChange={(e) => handleImgFile(e, e.target.placeholder && (e.target.placeholder.includes("الغلاف") || e.target.placeholder.includes("Cover")) ? "cover" : "avatar")}');
  
  // Force save to localStorage on submit
  if(!c.includes('localStorage.setItem("currentUser"')){
    c = c.replace(/(const\s+handleSubmit\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*)/, '$1\n  try { const updated = { ...currentUser, ...formData }; localStorage.setItem("currentUser", JSON.stringify(updated)); let users = JSON.parse(localStorage.getItem("users") || "[]"); let idx = users.findIndex(u => u.email === updated.email); if(idx >= 0) users[idx] = updated; else users.push(updated); localStorage.setItem("users", JSON.stringify(users)); } catch(e){}');
  }
  fs.writeFileSync(modalPath, c);
  console.log('EditProfileModal.jsx fixed.');
}
