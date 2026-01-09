import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Wine, Trash2, Minus, X, Loader2, Edit2, NotebookPen, 
  Sparkles, CheckCircle2, Circle, Settings, RefreshCw, AlertTriangle, 
  Package, Palette, Lightbulb, History, ChevronRight, Upload, Link as LinkIcon, ExternalLink,
  Cloud, LogOut, User, Mail, Key
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  doc, 
  onSnapshot, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';

// --- CONFIGURATION ---
// ⚠️ IMPORTANT: If deploying, replace the values below with your real Firebase config!
const firebaseConfig = {
  apiKey: "AIzaSyABvOntgfWBn3XvJbasB7zKXkLIvHADJkc",
  authDomain: "homebar-95c2f.firebaseapp.com",
  projectId: "homebar-95c2f",
  storageBucket: "homebar-95c2f.firebasestorage.app",
  messagingSenderId: "947971869072",
  appId: "1:947971869072:web:a0648d987255f85f978b15"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- API Key for AI ---
const apiKey = ""; // Injected at runtime

// --- Custom Icons ---
const BottleIcon = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M9 2h6v5.2l2.3 2.8c.5.6.7 1.3.7 2V20c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-8c0-.7.3-1.4.7-2L9 7.2V2Z" />
    <path d="M8 20h8" />
    <path d="M12 15v5" strokeOpacity="0.5" />
    <path d="M8 12h8" strokeOpacity="0.5" />
  </svg>
);

const ShelfIcon = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 21h18" />
    <path d="M6 21v-8h4v8" />
    <path d="M8 13v-3h0v3" />
    <path d="M14 21v-10h4v10" />
    <path d="M16 11v-3h0v3" />
  </svg>
);

// --- Themes Configuration ---
const THEMES = {
  classic: { id: 'classic', name: 'Classic (Amber)', bgMain: 'bg-slate-900', bgCard: 'bg-slate-800', bgInput: 'bg-slate-900', border: 'border-slate-700', textMain: 'text-slate-100', textMuted: 'text-slate-400', accentText: 'text-amber-500', accentBg: 'bg-amber-500', accentBgHover: 'hover:bg-amber-600', accentBorder: 'border-amber-500', ring: 'focus:ring-amber-500', dashboardMain: 'text-amber-500', dashboardMainBg: 'bg-amber-500/10 border-amber-500/50', dashboardSec: 'text-indigo-400', dashboardSecBg: 'bg-indigo-500/10 border-indigo-500/50' },
  forest: { id: 'forest', name: 'Forest (Emerald)', bgMain: 'bg-zinc-900', bgCard: 'bg-zinc-800', bgInput: 'bg-zinc-900', border: 'border-zinc-700', textMain: 'text-zinc-100', textMuted: 'text-zinc-400', accentText: 'text-emerald-500', accentBg: 'bg-emerald-600', accentBgHover: 'hover:bg-emerald-700', accentBorder: 'border-emerald-500', ring: 'focus:ring-emerald-500', dashboardMain: 'text-emerald-500', dashboardMainBg: 'bg-emerald-500/10 border-emerald-500/50', dashboardSec: 'text-lime-400', dashboardSecBg: 'bg-lime-500/10 border-lime-500/50' },
  ocean: { id: 'ocean', name: 'Ocean (Cyan)', bgMain: 'bg-slate-950', bgCard: 'bg-slate-900', bgInput: 'bg-slate-950', border: 'border-slate-800', textMain: 'text-cyan-50', textMuted: 'text-slate-400', accentText: 'text-cyan-400', accentBg: 'bg-cyan-600', accentBgHover: 'hover:bg-cyan-700', accentBorder: 'border-cyan-500', ring: 'focus:ring-cyan-500', dashboardMain: 'text-cyan-400', dashboardMainBg: 'bg-cyan-500/10 border-cyan-500/50', dashboardSec: 'text-blue-400', dashboardSecBg: 'bg-blue-500/10 border-blue-500/50' },
  sky: { id: 'sky', name: 'Sky (Blue)', bgMain: 'bg-gray-900', bgCard: 'bg-gray-800', bgInput: 'bg-gray-900', border: 'border-gray-700', textMain: 'text-gray-50', textMuted: 'text-gray-400', accentText: 'text-sky-400', accentBg: 'bg-sky-600', accentBgHover: 'hover:bg-sky-700', accentBorder: 'border-sky-500', ring: 'focus:ring-sky-500', dashboardMain: 'text-sky-400', dashboardMainBg: 'bg-sky-500/10 border-sky-500/50', dashboardSec: 'text-teal-400', dashboardSecBg: 'bg-teal-500/10 border-teal-500/50' },
  crimson: { id: 'crimson', name: 'Crimson (Rose)', bgMain: 'bg-stone-950', bgCard: 'bg-stone-900', bgInput: 'bg-stone-950', border: 'border-stone-800', textMain: 'text-stone-100', textMuted: 'text-stone-400', accentText: 'text-rose-500', accentBg: 'bg-rose-600', accentBgHover: 'hover:bg-rose-700', accentBorder: 'border-rose-500', ring: 'focus:ring-rose-500', dashboardMain: 'text-rose-500', dashboardMainBg: 'bg-rose-500/10 border-rose-500/50', dashboardSec: 'text-orange-400', dashboardSecBg: 'bg-orange-500/10 border-orange-500/50' },
  royal: { id: 'royal', name: 'Royal (Violet)', bgMain: 'bg-gray-950', bgCard: 'bg-gray-900', bgInput: 'bg-gray-950', border: 'border-gray-800', textMain: 'text-gray-100', textMuted: 'text-gray-400', accentText: 'text-violet-400', accentBg: 'bg-violet-600', accentBgHover: 'hover:bg-violet-700', accentBorder: 'border-violet-500', ring: 'focus:ring-violet-500', dashboardMain: 'text-violet-400', dashboardMainBg: 'bg-violet-500/10 border-violet-500/50', dashboardSec: 'text-fuchsia-400', dashboardSecBg: 'bg-fuchsia-500/10 border-fuchsia-500/50' }
};

// --- Helper: Image Fetcher (URL) ---
const fetchBottleImage = async (queryName) => {
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${queryName}`);
    const data = await response.json();
    if (data.ingredients && data.ingredients.length > 0) {
      const ingredientName = data.ingredients[0].strIngredient;
      return `https://www.thecocktaildb.com/images/ingredients/${ingredientName}.png`;
    }
    return null;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

// --- Helper: Image Resizer (File) ---
const resizeImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 400;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const DEFAULT_CATEGORIES = ["Whiskey", "Bourbon", "Vodka", "Gin", "Rum", "Tequila", "Brandy", "Liqueur", "Wine", "Beer", "Mixer", "Syrup", "Garnish", "Other"];
const DEFAULT_LOCATIONS = ["Bar Shelf", "Fridge", "Cabinet", "Deep Storage", "Display"];
const EXCLUDED_FROM_SPIRITS = ["Beer", "Wine", "Mixer", "Syrup", "Garnish", "Other"];
const NON_ALCOHOLIC_CATS = ["Mixer", "Syrup", "Garnish"];
const LOW_ABV_CATS = ["Beer", "Wine"];

// --- Main Component ---
export default function HomeBarInventory() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Settings
  const [theme, setTheme] = useState(THEMES.classic);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Auth State
  const [authMode, setAuthMode] = useState('menu'); // menu, login, signup
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Settings UI
  const [newCatName, setNewCatName] = useState('');
  const [newLocName, setNewLocName] = useState('');

  // Confirmation State
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    type: null,
    id: null,
    name: ''
  });

  // AI & Selection
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [barAnalysis, setBarAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({ name: '', category: 'Whiskey', location: 'Bar Shelf', image: '', proof: '', size: '750 mL', abv: '', notes: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Auth & Init
  useEffect(() => {
    const initAuth = async () => {
      // Use standard canvas auth if available, otherwise anonymous
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Data Sync
  useEffect(() => {
    if (!user) return;
    
    // Inventory
    const q = query(collection(db, 'users', user.uid, 'inventory'));
    const unsubInv = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    });

    // Settings
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.themeId && THEMES[data.themeId]) setTheme(THEMES[data.themeId]);
        if (data.categories) setCategories(data.categories);
        if (data.locations) setLocations(data.locations);
      } else {
        // Create defaults if not exist
        setDoc(settingsRef, {
          themeId: 'classic',
          categories: DEFAULT_CATEGORIES,
          locations: DEFAULT_LOCATIONS
        });
      }
    });

    return () => { unsubInv(); unsubSettings(); };
  }, [user]);

  // --- Auth Handlers (Email/Pass) ---
  const handleEmailAuth = async (isSignup) => {
    setAuthError('');
    setIsAuthLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, authEmail, authPass);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPass);
      }
      setIsSettingsOpen(false); // Close on success
      setAuthMode('menu');
      setAuthEmail('');
      setAuthPass('');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-api-key') {
        setAuthError("Configuration Error: Invalid API Key. Please update HomeBarApp.jsx with your Firebase config.");
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError("Email already in use. Try signing in.");
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setAuthError("Invalid email or password.");
      } else {
        setAuthError(error.message);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth); // Re-login as anonymous so app doesn't break
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // --- Logic Helpers ---
  const saveTheme = async (t) => {
    setTheme(t);
    if(user) await updateDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), { themeId: t.id }).catch(()=>{});
  };

  const addCategory = async () => {
    if(!newCatName.trim()) return;
    const updated = [...categories, newCatName.trim()];
    setCategories(updated); setNewCatName('');
    if(user) await updateDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), { categories: updated }).catch(()=>{});
  };

  const removeCategory = async (cat) => {
    // Note: We use window.confirm here for settings actions as it's simpler
    if(!window.confirm(`Delete category "${cat}"?`)) return;
    const updated = categories.filter(c => c !== cat);
    setCategories(updated);
    if(user) await updateDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), { categories: updated }).catch(()=>{});
  };

  const addLocation = async () => {
    if(!newLocName.trim()) return;
    const updated = [...locations, newLocName.trim()];
    setLocations(updated); setNewLocName('');
    if(user) await updateDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), { locations: updated }).catch(()=>{});
  };

  const removeLocation = async (loc) => {
    if(!window.confirm(`Delete location "${loc}"?`)) return;
    const updated = locations.filter(l => l !== loc);
    setLocations(updated);
    if(user) await updateDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), { locations: updated }).catch(()=>{});
  };

  // Form Logic
  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'proof' && value && !isNaN(value)) {
        newData.abv = (parseFloat(value) / 2).toString();
      }
      return newData;
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await resizeImage(file);
      handleFieldChange('image', base64);
    } catch(err) { console.error(err); alert("Error processing image"); }
    finally { setIsUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSaving(true);
    
    let img = formData.image.trim();
    if (!img) img = await fetchBottleImage(formData.name);

    const payload = {
      ...formData,
      imageUrl: img,
      quantity: editingId ? undefined : 1,
      createdAt: editingId ? undefined : serverTimestamp()
    };
    // Clean undefined fields
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    try {
      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'inventory', editingId), payload);
      } else {
        await addDoc(collection(db, 'users', user.uid, 'inventory'), payload);
      }
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const updateQuantity = async (e, id, current, change) => {
    if(e) e.stopPropagation();
    if (current + change < 0) return;
    await updateDoc(doc(db, 'users', user.uid, 'inventory', id), { quantity: current + change });
  };

  // --- Confirmation Helpers ---
  const promptAction = (e, type, item) => {
    e.stopPropagation();
    setConfirmation({
      isOpen: true,
      type: type,
      id: item.id,
      name: item.name
    });
  };

  const executeConfirmation = async () => {
    if (!confirmation.id) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'inventory', confirmation.id);
      
      if (confirmation.type === 'empty') {
        await updateDoc(docRef, { quantity: 0 });
      } else if (confirmation.type === 'delete') {
        await deleteDoc(docRef);
        if (isModalOpen && editingId === confirmation.id) setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error executing action:", error);
    } finally {
      setConfirmation({ isOpen: false, type: null, id: null, name: '' });
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', category: categories[0] || 'Whiskey', location: locations[0] || 'Bar Shelf', image: '', proof: '', size: '750 mL', abv: '', notes: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    if (selectionMode) { toggleSelection(item.id); return; }
    setEditingId(item.id);
    setFormData({ 
      name: item.name || '', category: item.category || categories[0], 
      location: item.location || locations[0], image: item.imageUrl || '', 
      proof: item.proof || '', size: item.size || '750 mL', 
      abv: item.abv || '', notes: item.notes || '' 
    });
    setIsModalOpen(true);
  };

  // AI Logic
  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const generateCocktails = async () => {
    setIsGenerating(true);

    // Filter available inventory (quantity > 0)
    const availableInventory = inventory.filter(i => i.quantity > 0).map(i => i.name).join(', ');
    
    // Check if user has selected specific items
    const hasSelection = selectedIds.size > 0;
    const selectedIngredients = inventory.filter(item => selectedIds.has(item.id)).map(item => item.name).join(', ');

    let prompt = "";
    if (hasSelection) {
      prompt = `
        I have a home bar.
        My FULL AVAILABLE INVENTORY is: ${availableInventory}.
        I specifically want to make a drink using these selected ingredients: ${selectedIngredients}.
        
        Suggest 3-5 distinct cocktails.
        
        CRITICAL RULES:
        1. You must ONLY use ingredients listed in my FULL AVAILABLE INVENTORY.
        2. Do NOT include recipes that require ingredients I do not have (e.g., if I don't have Lemon, don't suggest a Sour).
        3. Exception: You may assume I have Ice, Water, and Sugar (or Simple Syrup).
        
        Return strictly a JSON array of objects with keys: "name", "description", "ingredients" (array of strings), "instructions".
        Do not include markdown formatting like \`\`\`json.
      `;
    } else {
      prompt = `
        I have a home bar.
        My FULL AVAILABLE INVENTORY is: ${availableInventory}.
        
        Suggest 3-5 distinct cocktails I can make right now.
        
        CRITICAL RULES:
        1. You must ONLY use ingredients listed in my FULL AVAILABLE INVENTORY.
        2. Do NOT include recipes that require ingredients I do not have (e.g., if I don't have Lemon, don't suggest a Sour).
        3. Exception: You may assume I have Ice, Water, and Sugar (or Simple Syrup).
        
        Return strictly a JSON array of objects with keys: "name", "description", "ingredients" (array of strings), "instructions".
        Do not include markdown formatting like \`\`\`json.
      `;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
         throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
             text = text.substring(start, end + 1);
             const recipes = JSON.parse(text);
             setSuggestions(recipes);
             setShowSuggestions(true);
        } else {
             throw new Error("Invalid JSON format from AI");
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert(`Unable to generate cocktails. ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTastingNotes = async () => {
    if (!formData.name) return;
    setIsGeneratingNotes(true);
    const prompt = `Describe tasting notes for ${formData.name} (${formData.category}) in <10 words, comma separated. Return raw text only.`;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) handleFieldChange('notes', text);
    } catch (e) { 
        alert("Failed to auto-fill notes.");
        console.error(e); 
    } finally { 
        setIsGeneratingNotes(false); 
    }
  };

  const analyzeCollection = async () => {
    if (inventory.length === 0) return;
    setIsAnalyzing(true);
    const list = inventory.filter(i => i.quantity > 0).map(i => `${i.name} (${i.category})`).join(', ');
    const prompt = `Analyze inventory: ${list}. Return ONLY JSON: {"vibe": "short string", "summary": "string", "missing": "string"}. No markdown.`;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const start = text?.indexOf('{'); const end = text?.lastIndexOf('}');
      if (start !== -1 && end !== -1) setBarAnalysis(JSON.parse(text.substring(start, end + 1)));
      else throw new Error("Invalid JSON");
    } catch(e) { 
        alert("Analysis failed. Try again.");
        console.error(e); 
    } finally { 
        setIsAnalyzing(false); 
    }
  };

  // --- Render Helpers ---
  const filteredInventory = inventory.filter(item => {
    const s = searchTerm.toLowerCase();
    const match = item.name.toLowerCase().includes(s) || item.category.toLowerCase().includes(s) || (item.notes||'').toLowerCase().includes(s) || (item.location||'').toLowerCase().includes(s);
    if (!match) return false;
    if (activeCategory === 'HISTORY') return item.quantity === 0;
    if (item.quantity === 0) return false;
    if (activeCategory === 'SPIRITS') return !EXCLUDED_FROM_SPIRITS.includes(item.category);
    if (activeCategory && item.category !== activeCategory) return false;
    return true;
  });

  const emptyCount = inventory.filter(i => i.quantity === 0).length;
  const totalCount = inventory.reduce((a, b) => b.quantity > 0 ? a + b.quantity : a, 0);
  const spiritsCount = inventory.reduce((a, b) => (b.quantity > 0 && !EXCLUDED_FROM_SPIRITS.includes(b.category)) ? a + b.quantity : a, 0);
  const catStats = inventory.reduce((acc, item) => { if(item.quantity===0) return acc; const c=item.category||'Other'; acc[c]=(acc[c]||0)+item.quantity; return acc; }, {});
  const sortedCats = Object.entries(catStats)
    // Filter out EXCLUDED categories if in SPIRITS mode
    .filter(([cat]) => activeCategory !== 'SPIRITS' || !EXCLUDED_FROM_SPIRITS.includes(cat))
    .sort(([,a],[,b])=>b-a);

  // --- UI Render ---
  if (loading) return <div className={`min-h-screen ${theme.bgMain} flex items-center justify-center text-white`}><Loader2 className="animate-spin" /></div>;

  return (
    <div className={`min-h-screen ${theme.bgMain} ${theme.textMain} font-sans pb-32 transition-colors duration-500`}>
      <nav className={`sticky top-0 z-30 ${theme.bgCard} border-b ${theme.border} px-4 py-3 bg-opacity-90 backdrop-blur-md`}>
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-gradient-to-tr from-gray-700 to-gray-600"><BottleIcon className="text-white" size={20} /></div>
             <div><h1 className="font-bold text-lg">HomeBar</h1><p className={`text-xs ${theme.textMuted}`}>Inventory System</p></div>
             <button onClick={() => setIsSettingsOpen(true)} className={`ml-2 p-1.5 ${theme.textMuted} hover:text-white hover:bg-white/5 rounded-lg transition-colors`}><Settings size={18} /></button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectionMode(!selectionMode)} 
              className={`p-2 rounded-full transition-all ${selectionMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : `${theme.bgMain} ${theme.textMuted} hover:text-white border ${theme.border}`}`}
              title="Cocktail Generator"
            >
              <Sparkles size={20} className={selectionMode ? 'text-yellow-300' : ''} />
            </button>
            {!selectionMode && (
              <button onClick={openAddModal} className={`${theme.accentBg} ${theme.accentBgHover} text-white p-2 px-4 rounded-lg shadow-lg flex items-center gap-2 font-medium active:scale-95 transition-all`}>
                <Plus size={20} /> <span className="hidden sm:inline">Add</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className={`h-5 w-5 ${theme.textMuted}`} /></div>
          <input type="text" className={`block w-full pl-10 pr-3 py-3 border ${theme.border} rounded-xl leading-5 ${theme.bgInput} ${theme.textMain} placeholder-slate-500 focus:outline-none focus:ring-2 ${theme.ring}`} placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Dashboard */}
        {!activeCategory && !selectionMode && (
          <div className="grid grid-cols-2 gap-4 mb-3">
             <div onClick={()=>setActiveCategory(null)} className={`relative overflow-hidden rounded-2xl p-5 border cursor-pointer ${theme.dashboardSecBg} hover:opacity-90`}>
               <p className={`text-xs font-bold uppercase ${theme.dashboardSec}`}>Total Inventory</p>
               <p className="text-3xl font-bold mt-1 text-white">{totalCount}</p>
               <ShelfIcon className={`absolute -right-2 -bottom-2 opacity-10 text-white`} size={80} />
             </div>
             <div onClick={()=>setActiveCategory('SPIRITS')} className={`relative overflow-hidden rounded-2xl p-5 border cursor-pointer ${theme.dashboardMainBg} hover:opacity-90`}>
               <p className={`text-xs font-bold uppercase ${theme.dashboardMain}`}>Total Bottles</p>
               <p className="text-3xl font-bold mt-1 text-white">{spiritsCount}</p>
               <BottleIcon className={`absolute -right-2 -bottom-2 opacity-10 text-white`} size={80} />
             </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2 no-scrollbar">
          {activeCategory && <button onClick={()=>setActiveCategory(null)} className="flex items-center gap-1 bg-slate-700 text-white px-3 py-1 rounded-full text-xs whitespace-nowrap"><X size={12}/> Clear: {activeCategory === 'SPIRITS' ? 'Liquor & Spirits' : activeCategory}</button>}
          {sortedCats.map(([c, count]) => (
            <button key={c} onClick={()=>setActiveCategory(c)} className={`border rounded-lg p-2 min-w-[80px] text-left hover:bg-white/5 ${activeCategory === c ? theme.dashboardMainBg : `${theme.bgCard} ${theme.border}`}`}>
              <p className={`text-[10px] font-bold ${activeCategory === c ? theme.dashboardMain : theme.textMuted}`}>{c}</p>
              <p className="text-lg font-bold text-white">{count}</p>
            </button>
          ))}
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredInventory.map(item => (
            <div key={item.id} onClick={()=>{setEditingId(item.id); setFormData({...item}); setIsModalOpen(true);}} className={`group relative ${theme.bgCard} rounded-xl overflow-hidden border ${theme.border} hover:border-slate-500 transition-all cursor-pointer`}>
              <div className="aspect-[3/4] bg-white relative p-4 flex items-center justify-center">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" /> : <BottleIcon size={40} className="text-slate-300"/>}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.category}</div>
                {selectionMode && (
                   <div 
                     className="absolute inset-0 bg-black/40 z-10 flex items-start justify-end p-2"
                     onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
                   >
                     {selectedIds.has(item.id) ? <CheckCircle2 size={24} className="text-indigo-400 fill-white" /> : <Circle size={24} className="text-white" />}
                   </div>
                )}
              </div>
              <div className="p-3">
                <p className={`font-bold ${theme.textMain} text-sm line-clamp-1`}>{item.name}</p>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <p className={`text-[10px] ${theme.textMuted} font-medium`}>
                    {item.proof ? `${item.proof} Proof` : (item.abv ? `${item.abv}% ABV` : '')}
                  </p>
                  <p className={`text-[10px] ${theme.textMuted}`}>{item.size}</p>
                  <p className={`text-[10px] ${theme.textMuted} truncate max-w-[60px]`}>{item.location}</p>
                </div>
                {item.notes && <p className={`text-[10px] ${theme.dashboardMain} italic truncate mt-1`}>"{item.notes}"</p>}
                
                <div className={`flex items-center justify-between mt-3 pt-2 border-t ${theme.border}`}>
                  <div className={`flex items-center ${theme.bgInput} rounded-lg border ${theme.border} p-0.5`}>
                    <button onClick={(e)=>{e.stopPropagation(); updateQuantity(e, item.id, item.quantity, -1)}} className="p-1 hover:bg-white/10 rounded"><Minus size={12} className={theme.textMuted}/></button>
                    <span className="w-6 text-center text-xs font-mono">{item.quantity}</span>
                    <button onClick={(e)=>{e.stopPropagation(); updateQuantity(e, item.id, item.quantity, 1)}} className="p-1 hover:bg-white/10 rounded"><Plus size={12} className={theme.textMuted}/></button>
                  </div>
                  <div className="flex gap-1">
                     {item.quantity > 0 ? (
                       <button onClick={(e) => promptAction(e, 'empty', item)} className={`px-2 py-1 text-[10px] font-bold uppercase ${theme.textMuted} hover:text-white bg-slate-700/50 hover:${theme.accentBg} rounded transition-colors`}>Empty</button>
                     ) : (
                       <button onClick={(e) => updateQuantity(e, item.id, item.quantity, 1)} className={`px-2 py-1 text-[10px] font-bold uppercase ${theme.textMuted} hover:text-white bg-slate-700/50 hover:bg-emerald-600 rounded transition-colors flex gap-1`}><RefreshCw size={10} /> Restock</button>
                     )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FAB AI */}
      {selectionMode && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom-5 fade-in w-full max-w-sm px-4">
          <button 
            onClick={generateCocktails} 
            disabled={isGenerating} 
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-full shadow-2xl shadow-indigo-500/50 flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95`}
          >
            {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles className={selectedIds.size > 0 ? "text-yellow-300" : "text-white/50"} size={24} />}
            <span className="font-bold text-lg">
              {isGenerating ? 'Bartender is thinking...' : (selectedIds.size > 0 ? `Generate (${selectedIds.size})` : 'Suggest from Full Bar')}
            </span>
          </button>
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showSuggestions && suggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowSuggestions(false)}></div>
           <div className={`relative ${theme.bgMain} w-full max-w-2xl rounded-2xl shadow-2xl border ${theme.border} flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200`}>
             <div className={`p-6 border-b ${theme.border} flex justify-between items-center ${theme.bgCard} rounded-t-2xl`}>
               <div className="flex items-center gap-3"><div className="bg-indigo-500/20 p-2 rounded-lg"><Sparkles className="text-indigo-400" size={24} /></div><div><h2 className="text-xl font-bold text-white">Bartender Suggestions</h2><p className={`text-sm ${theme.textMuted}`}>{selectedIds.size > 0 ? 'Using selected items' : 'Using full inventory'}</p></div></div>
               <button onClick={() => setShowSuggestions(false)} className={`${theme.textMuted} hover:text-white transition-colors ${theme.bgMain} p-2 rounded-full hover:${theme.bgCard}`}><X size={20} /></button>
             </div>
             <div className="overflow-y-auto p-6 space-y-6">
                {suggestions.map((drink, idx) => (
                  <div key={idx} className={`${theme.bgCard} rounded-xl border ${theme.border} p-5 hover:border-indigo-500/30 transition-colors`}>
                    <div className="flex justify-between items-start mb-2"><h3 className="text-lg font-bold text-indigo-300">{drink.name}</h3></div>
                    <p className="text-slate-300 text-sm mb-4 italic">"{drink.description}"</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div><h4 className={`text-xs uppercase tracking-wider font-bold ${theme.textMuted} mb-2`}>Ingredients</h4><ul className="space-y-1">{drink.ingredients.map((ing, i) => (<li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-indigo-500 mt-1.5">•</span>{ing}</li>))}</ul></div>
                      <div><h4 className={`text-xs uppercase tracking-wider font-bold ${theme.textMuted} mb-2`}>Instructions</h4><p className="text-sm text-slate-300 leading-relaxed">{drink.instructions}</p></div>
                    </div>
                  </div>
                ))}
             </div>
             <div className={`p-4 border-t ${theme.border} ${theme.bgMain} rounded-b-2xl text-center`}><p className={`text-xs ${theme.textMuted}`}>AI generated recipes. Taste may vary!</p></div>
           </div>
        </div>
      )}


      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSettingsOpen(false)}></div>
          <div className={`relative ${theme.bgMain} w-full max-w-md rounded-2xl shadow-2xl border ${theme.border} flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200`}>
            <div className={`p-6 border-b ${theme.border} flex justify-between items-center`}>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} /> Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} className={`${theme.textMuted} hover:text-white`}><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">

              {/* 0. Sync / Account (New) */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>Sync & Account</h3>
                {authMode === 'menu' ? (
                  <>
                  {user && !user.isAnonymous ? (
                    <button 
                      onClick={handleLogout}
                      className={`w-full p-3 rounded-xl border ${theme.border} hover:border-red-500 hover:bg-red-500/10 transition-all flex items-center justify-between group ${theme.bgCard}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors`}>
                          <LogOut size={18} className="text-red-400" />
                        </div>
                        <div className="text-left">
                          <p className={`font-bold ${theme.textMain} text-sm`}>Sign Out</p>
                          <p className={`text-[10px] ${theme.textMuted}`}>{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setAuthMode('login')}
                      className={`w-full p-3 rounded-xl border border-dashed ${theme.border} hover:border-indigo-500 hover:bg-indigo-500/10 transition-all flex items-center justify-between group ${theme.bgCard}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors`}>
                          <Cloud size={18} className="text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <p className={`font-bold ${theme.textMain} text-sm`}>Sign in to Sync</p>
                          <p className={`text-[10px] ${theme.textMuted}`}>Save inventory to cloud</p>
                        </div>
                      </div>
                      <div className={`${theme.textMuted} group-hover:text-white`}>
                        →
                      </div>
                    </button>
                  )}
                  </>
                ) : (
                  <div className={`p-4 rounded-xl border ${theme.border} ${theme.bgCard} space-y-3`}>
                    <div className="flex justify-between items-center mb-2">
                       <h4 className={`text-sm font-bold ${theme.textMain}`}>{authMode === 'login' ? 'Sign In' : 'Create Account'}</h4>
                       <button onClick={()=>setAuthMode('menu')} className="text-xs text-slate-400 hover:text-white">Cancel</button>
                    </div>
                    {authError && <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">{authError}</div>}
                    <div className="space-y-2">
                       <div className="relative">
                         <Mail size={14} className="absolute left-3 top-3 text-slate-500"/>
                         <input type="email" placeholder="Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 ${theme.ring}`} />
                       </div>
                       <div className="relative">
                         <Key size={14} className="absolute left-3 top-3 text-slate-500"/>
                         <input type="password" placeholder="Password" value={authPass} onChange={e=>setAuthPass(e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 ${theme.ring}`} />
                       </div>
                    </div>
                    <button onClick={() => handleEmailAuth(authMode === 'signup')} disabled={isAuthLoading || !authEmail || !authPass} className={`w-full py-2 rounded-lg font-bold text-sm text-white ${theme.accentBg} disabled:opacity-50 flex justify-center`}>
                      {isAuthLoading ? <Loader2 size={16} className="animate-spin"/> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                    <div className="text-center text-[10px] text-slate-400 mt-2">
                       {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                       <button onClick={()=>setAuthMode(authMode === 'login' ? 'signup' : 'login')} className={`${theme.accentText} hover:underline`}>
                         {authMode === 'login' ? 'Sign Up' : 'Log In'}
                       </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`h-px ${theme.bgCard}`} />

              {/* 1. Empty Bottles History */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>History</h3>
                
                <button 
                  onClick={() => {
                    setActiveCategory('HISTORY');
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl border ${theme.border} hover:border-slate-500 transition-all flex items-center justify-between group ${theme.bgCard}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors`}>
                      <RefreshCw size={18} className={theme.textMuted} />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${theme.textMain} text-sm`}>View History</p>
                      <p className={`text-[10px] ${theme.textMuted}`}>{emptyCount} items</p>
                    </div>
                  </div>
                  <div className={`${theme.textMuted} group-hover:text-white`}>
                    →
                  </div>
                </button>
              </div>

              <div className={`h-px ${theme.bgCard}`} />

              {/* 2. Color Palette Selector (Compact) */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider flex items-center gap-2`}>
                  <Palette size={14} /> Color Palette
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEMES).map(t => (
                    <button
                      key={t.id}
                      onClick={() => saveTheme(t)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left group ${
                        theme.id === t.id 
                          ? `${t.bgCard} ${t.accentBorder} ring-1 ${t.ring}` 
                          : `${t.bgMain} ${t.border} hover:bg-white/5`
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${t.accentBg} shadow-sm shrink-0`}></div>
                      <span className={`text-xs font-medium truncate ${theme.id === t.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {t.name.split(' ')[0]}
                      </span>
                      {theme.id === t.id && <CheckCircle2 size={12} className={`ml-auto ${t.accentText}`} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`h-px ${theme.bgCard}`} />
              
              {/* 3. AI Bar Sommelier (Compact) */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider flex items-center gap-2`}>
                  <Sparkles size={14} className="text-yellow-400" /> AI Bar Sommelier
                </h3>
                
                {!barAnalysis ? (
                  <button 
                    onClick={analyzeCollection}
                    disabled={isAnalyzing}
                    className={`w-full p-3 rounded-xl border ${theme.border} hover:border-indigo-500 hover:bg-indigo-500/10 transition-all flex items-center justify-between group ${theme.bgCard}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                        {isAnalyzing ? (
                          <Loader2 size={18} className="animate-spin text-indigo-400" />
                        ) : (
                          <Lightbulb size={18} className="text-indigo-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${theme.textMain} text-sm`}>Analyze Collection</p>
                        <p className={`text-[10px] ${theme.textMuted}`}>Get a vibe check & tips</p>
                      </div>
                    </div>
                    <div className={`${theme.textMuted} group-hover:text-indigo-400`}>
                      →
                    </div>
                  </button>
                ) : (
                  <div className={`bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-xl border border-indigo-500/30 p-4 space-y-3 relative overflow-hidden`}>
                    {/* Reset Button */}
                    <button 
                      onClick={analyzeCollection} 
                      className="absolute top-3 right-3 text-indigo-300 hover:text-white p-1 rounded-full hover:bg-indigo-500/20"
                      title="Re-analyze"
                    >
                      <RefreshCw size={14} className={isAnalyzing ? "animate-spin" : ""} />
                    </button>

                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">Your Vibe</p>
                      <p className="text-lg font-bold text-white leading-tight">"{barAnalysis.vibe}"</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">Summary</p>
                      <p className="text-xs text-slate-300 italic">"{barAnalysis.summary}"</p>
                    </div>
                    <div className="pt-2 border-t border-indigo-500/20">
                      <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">Missing</p>
                      <p className="text-xs text-white">{barAnalysis.missing}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={`h-px ${theme.bgCard}`} />

              {/* 4. Lists Management (New) */}
              <div className="space-y-4">
                <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider flex items-center gap-2`}><Package size={14} /> Custom Categories</h3>
                <div className="flex gap-2">
                  <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New category..." className={`flex-1 ${theme.bgInput} border ${theme.border} rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 ${theme.ring}`} />
                  <button onClick={addCategory} disabled={!newCatName} className={`${theme.accentBg} text-white px-3 rounded-lg text-xs font-bold disabled:opacity-50`}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat} className={`text-[10px] px-2 py-1 rounded bg-white/5 border ${theme.border} flex items-center gap-1 group`}>
                      <span className={theme.textMuted}>{cat}</span>
                      {!DEFAULT_CATEGORIES.includes(cat) && <button onClick={() => removeCategory(cat)} className="text-red-400 hover:text-white"><X size={10} /></button>}
                    </div>
                  ))}
                </div>

                <div className={`h-px ${theme.bgCard} my-2`} />

                <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider flex items-center gap-2`}><Settings size={14} /> Locations</h3>
                <div className="flex gap-2">
                  <input type="text" value={newLocName} onChange={(e) => setNewLocName(e.target.value)} placeholder="New location..." className={`flex-1 ${theme.bgInput} border ${theme.border} rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 ${theme.ring}`} />
                  <button onClick={addLocation} disabled={!newLocName} className={`${theme.accentBg} text-white px-3 rounded-lg text-xs font-bold disabled:opacity-50`}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locations.map(loc => (
                    <div key={loc} className={`text-[10px] px-2 py-1 rounded bg-white/5 border ${theme.border} flex items-center gap-1 group`}>
                      <span className={theme.textMuted}>{loc}</span>
                      {!DEFAULT_LOCATIONS.includes(loc) && <button onClick={() => removeLocation(loc)} className="text-red-400 hover:text-white"><X size={10} /></button>}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={`h-px ${theme.bgCard}`} />

              {/* 5. Profile */}
              <div className="space-y-3">
                <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>Profile</h3>
                <div className={`${theme.bgInput} p-3 rounded-lg border ${theme.border}`}><p className={`text-[10px] ${theme.textMuted} uppercase font-bold mb-1`}>User ID</p><p className="text-xs text-slate-300 font-mono truncate">{user?.uid || 'Not signed in'}</p></div>
              </div>
              <div className={`text-center pt-4 border-t border-white/5`}><p className={`text-xs ${theme.textMuted}`}>HomeBar v2.2.0</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setConfirmation({ isOpen: false, type: null, id: null, name: '' })}
          ></div>
          <div className={`relative ${theme.bgMain} border ${theme.border} rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`p-3 rounded-full ${confirmation.type === 'delete' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                 <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Are you sure?</h3>
                <p className={`text-sm ${theme.textMuted}`}>
                  {confirmation.type === 'empty' 
                    ? `Mark "${confirmation.name}" as empty? It will be moved to your history.`
                    : `Permanently delete "${confirmation.name}" from your records? This cannot be undone.`
                  }
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmation({ isOpen: false, type: null, id: null, name: '' })}
                className={`px-4 py-2 text-sm font-medium ${theme.textMuted} hover:text-white transition-colors`}
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmation}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
                  confirmation.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700' 
                    : `${theme.accentBg} ${theme.accentBgHover}`
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className={`relative ${theme.bgMain} w-full max-w-md rounded-2xl shadow-2xl border ${theme.border} overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col`}>
            <div className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">{editingId ? <><Edit2 size={18}/> Edit Bottle</> : "Add to Inventory"}</h2>
                <button onClick={() => setIsModalOpen(false)} className={`${theme.textMuted} hover:text-white transition-colors`}><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-[3]">
                    <label className={`block text-xs font-medium ${theme.textMuted} mb-1`}>Name</label>
                    <input autoFocus={!editingId} type="text" required placeholder="e.g. Maker's Mark" value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent text-sm`} />
                  </div>
                  <div className="flex-[2]">
                    <label className={`block text-xs font-medium ${theme.textMuted} mb-1`}>Category</label>
                    <select value={formData.category} onChange={(e) => handleFieldChange('category', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg px-2 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 ${theme.ring}`}>
                      {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                  </div>
                </div>
                
                {/* Location Picker (New) */}
                <div>
                   <label className={`block text-xs font-medium ${theme.textMuted} mb-1`}>Location</label>
                   <select value={formData.location} onChange={(e) => handleFieldChange('location', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg px-2 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 ${theme.ring}`}>
                      {locations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}
                   </select>
                </div>

                {!NON_ALCOHOLIC_CATS.includes(formData.category) && (
                  <div className="flex gap-3">
                      <div className="flex-1">
                          <label className={`block text-xs font-medium ${theme.textMuted} mb-1`}>Size</label>
                          <input type="text" value={formData.size} onChange={(e) => handleFieldChange('size', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 ${theme.ring}`} />
                      </div>
                      {!LOW_ABV_CATS.includes(formData.category) && (
                        <div className="w-1/4">
                            <label className={`block text-xs font-medium ${theme.textMuted} mb-1`}>Proof</label>
                            <input type="number" placeholder="0" value={formData.proof} onChange={(e) => handleFieldChange('proof', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 ${theme.ring}`} />
                        </div>
                      )}
                      <div className="w-1/4">
                          <label className="block text-xs font-medium text-slate-500 mb-1">ABV %</label>
                          <input type="text" readOnly={!LOW_ABV_CATS.includes(formData.category)} placeholder="%" value={formData.abv} onChange={(e) => handleFieldChange('abv', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg px-3 py-2 text-slate-500 text-sm focus:outline-none ${!LOW_ABV_CATS.includes(formData.category) ? 'cursor-not-allowed' : `focus:ring-2 ${theme.ring} text-white`}`} />
                      </div>
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`block text-xs font-medium ${theme.textMuted} flex items-center gap-2`}><NotebookPen size={12}/> Tasting Notes</label>
                    <button type="button" onClick={generateTastingNotes} disabled={!formData.name || isGeneratingNotes} className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isGeneratingNotes ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10} />} Auto-Fill</button>
                  </div>
                  <textarea rows={2} placeholder="Caramel, vanilla, oak..." value={formData.notes} onChange={(e) => handleFieldChange('notes', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent text-sm resize-none`} />
                </div>
                
                {/* Image Section: Tabs for URL vs Upload */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className={`block text-xs font-medium ${theme.textMuted}`}>Image Source</label>
                    {formData.name && <a href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(formData.name + ' bottle transparent background')}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">Find Online <ExternalLink size={10} /></a>}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className={`flex-1 relative`}>
                      <input type="text" placeholder="Paste image URL..." value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''} onChange={(e) => handleFieldChange('image', e.target.value)} className={`w-full ${theme.bgInput} border ${theme.border} rounded-lg pl-8 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-2 ${theme.ring} focus:border-transparent text-sm`} />
                      <div className="absolute left-2.5 top-2.5 text-slate-500 pointer-events-none"><LinkIcon size={14} /></div>
                    </div>
                    <div className="relative">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
                      <button type="button" className={`h-full px-3 rounded-lg border ${theme.border} ${theme.bgInput} hover:bg-white/5 flex items-center gap-2 text-sm text-slate-300`}>{isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}<span className="hidden sm:inline">Upload</span></button>
                    </div>
                  </div>
                  {formData.image && <div className={`mt-2 h-24 w-full rounded-lg border ${theme.border} bg-black/20 flex items-center justify-center relative overflow-hidden group`}><img src={formData.image} alt="Preview" className="h-full object-contain" /><button type="button" onClick={() => handleFieldChange('image', '')} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button></div>}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isSaving || !formData.name.trim()} className={`w-full ${theme.accentBg} ${theme.accentBgHover} disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl transition-all flex justify-center items-center gap-2 text-sm`}>
                    {isSaving ? <><Loader2 className="animate-spin" size={16} /><span>{editingId ? 'Updating...' : 'Fetching...'}</span></> : <>{editingId ? 'Save Changes' : 'Add Bottle'}</>}
                  </button>
                  
                  {/* DELETE BUTTON ADDED HERE */}
                  {editingId && (
                    <button 
                      type="button" 
                      onClick={(e) => promptAction(e, 'delete', { id: editingId, name: formData.name })} 
                      className={`w-full p-3 rounded-lg border border-red-500/30 text-red-500 font-bold flex items-center justify-center gap-2 mt-4 hover:bg-red-500/10 transition-colors`}
                    >
                      <Trash2 size={16} /> Delete Bottle
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}