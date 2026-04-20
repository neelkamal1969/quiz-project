// // import React, { useState, useEffect } from 'react';

// // export default function ResultSection({ loading, items, topic }) {
// //   // Tracks current card index
// //   const [currentIndex, setCurrentIndex] = useState(0);

// //   // Controls flip state of the card
// //   const [isFlipped, setIsFlipped] = useState(false);

// //   // Reset flip state whenever the card changes
// //   useEffect(() => {
// //     setIsFlipped(false);
// //   }, [currentIndex]);

// //   // Loading state UI
// //   if (loading) return (
// //     <div className="text-center py-20 animate-pulse">
// //       <div className="text-6xl mb-4">🧠</div>
// //       <p className="text-xl text-slate-500 font-medium">Generating your cards...</p>
// //     </div>
// //   );

// //   // Do not render if no items are available
// //   if (!items || items.length === 0) return null;

// //   // Navigate to next card (looping)
// //   const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);

// //   // Navigate to previous card (looping)
// //   const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

// //   // Save current card to backend
// //   const handleSave = async (e, item) => {
// //     e.stopPropagation(); // Prevent card flip when clicking Save

// //     // Retrieve user data from localStorage
// //     const userData = JSON.parse(localStorage.getItem('user'));

// //     try {
// //       const response = await fetch(`${import.meta.env.VITE_API_URL}/save-card`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           userId: userData.id,
// //           question: item.question,
// //           answer: item.answer
// //         }),
// //       });

// //       // No response handling implemented currently

// //     } catch (err) {
// //       console.error("Save failed", err);
// //     }
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto mt-10 px-4 perspective-1000">
      
// //       {/* Card Container with flip animation */}
// //       <div 
// //         className={`relative w-full h-[450px] transition-transform duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
// //         onClick={() => setIsFlipped(!isFlipped)}
// //       >
        
// //         {/* FRONT FACE (Question) */}
// //         <div className="absolute inset-0 backface-hidden bg-white border-2 border-indigo-100 rounded-3xl shadow-xl p-8 flex flex-col">
          
// //           {/* Card index indicator */}
// //           <span className="text-indigo-500 font-bold text-xs uppercase tracking-widest mb-4 text-center">
// //             Question {currentIndex + 1} of {items.length}
// //           </span>
          
// //           {/* Save button */}
// //           <button 
// //             onClick={(e) => handleSave(e, items[currentIndex])}
// //             className="p-2 hover:bg-indigo-50 rounded-full transition-colors text-indigo-400 hover:text-indigo-600"
// //             title="Save to Vault"
// //           >
// //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
// //             </svg>
// //           </button>
          
// //           {/* Scrollable question content */}
// //           <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar flex items-center justify-center">
// //             <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center leading-tight">
// //               {items[currentIndex].question}
// //             </h2>
// //           </div>
          
// //           <p className="mt-4 text-slate-400 text-xs font-medium italic text-center">
// //             Click to see answer
// //           </p>
// //         </div>

// //         {/* BACK FACE (Answer) */}
// //         <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl shadow-xl p-8 flex flex-col rotate-y-180 text-white">
          
// //           <span className="text-indigo-200 font-bold text-xs uppercase tracking-widest mb-4 text-center">
// //             Detailed Explanation
// //           </span>
          
// //           {/* Scrollable answer content */}
// //           <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
// //             <p className="text-lg md:text-xl leading-relaxed">
// //               {items[currentIndex].answer}
// //             </p>
// //           </div>
          
// //           <p className="mt-4 text-indigo-200 text-xs font-medium italic text-center">
// //             Click to see question
// //           </p>
// //         </div>
// //       </div>

// //       {/* Navigation controls */}
// //       <div className="flex items-center justify-between mt-8">
// //         <button 
// //           onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
// //           className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold shadow-sm active:scale-95 transition"
// //         >
// //           ← Prev
// //         </button>

// //         <span className="text-slate-500 font-bold">
// //           {currentIndex + 1} / {items.length}
// //         </span>

// //         <button 
// //           onClick={(e) => { e.stopPropagation(); handleNext(); }} 
// //           className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md active:scale-95 transition"
// //         >
// //           Next →
// //         </button>
// //       </div>
// //     </div>
// //   );
// // }

// // //Copyrightable


// import React, { useState, useEffect, useRef, useCallback } from 'react';

// // ─── Utility ──────────────────────────────────────────────────────────────────
// const clampText = (text, max = 220) =>
//   text?.length > max ? text.slice(0, max).trimEnd() + '…' : text;

// const CONFIDENCE_LEVELS = [
//   { label: 'Forgot', emoji: '😶', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  score: 1 },
//   { label: 'Hard',   emoji: '😅', color: '#f97316', bg: 'rgba(249,115,22,0.12)', score: 2 },
//   { label: 'Good',   emoji: '🙂', color: '#eab308', bg: 'rgba(234,179,8,0.12)',  score: 3 },
//   { label: 'Easy',   emoji: '😎', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  score: 4 },
// ];

// const SHORTCUTS = [
//   { key: '←',     desc: 'Previous card' },
//   { key: '→',     desc: 'Next card'     },
//   { key: 'Space', desc: 'Flip card'     },
//   { key: 'S',     desc: 'Save to vault' },
//   { key: 'R',     desc: 'Read aloud'    },
//   { key: 'Esc',   desc: 'Close panels'  },
// ];

// // ─── Sub-components ───────────────────────────────────────────────────────────
// function ActionBtn({ onClick, title, icon, pulse, dark }) {
//   return (
//     <button
//       onClick={onClick}
//       title={title}
//       style={{
//         width: 34, height: 34, borderRadius: 9,
//         border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0',
//         background: dark ? 'rgba(255,255,255,0.1)' : 'white',
//         cursor: 'pointer', fontSize: 15, flexShrink: 0,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         transition: 'all 0.15s',
//         animation: pulse ? 'rs-pulse 1s ease-in-out infinite' : 'none',
//       }}
//       onMouseEnter={e => {
//         e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.2)' : '#f0f0fe';
//         e.currentTarget.style.transform = 'scale(1.08)';
//       }}
//       onMouseLeave={e => {
//         e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.1)' : 'white';
//         e.currentTarget.style.transform = 'scale(1)';
//       }}
//     >{icon}</button>
//   );
// }

// function SaveButton({ isSaved, onClick }) {
//   return (
//     <button
//       onClick={onClick}
//       title={isSaved ? 'Remove from vault' : 'Save to vault'}
//       style={{
//         display: 'flex', alignItems: 'center', gap: 5,
//         padding: '0 12px', height: 34, borderRadius: 9, flexShrink: 0,
//         border: isSaved ? '1.5px solid #10b981' : '1.5px solid #e0e7ff',
//         background: isSaved ? 'rgba(16,185,129,0.1)' : 'white',
//         color: isSaved ? '#10b981' : '#6366f1',
//         cursor: 'pointer', fontSize: 12, fontWeight: 700,
//         transition: 'all 0.18s', letterSpacing: '0.02em',
//       }}
//       onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
//       onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
//     >
//       <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
//         fill={isSaved ? 'currentColor' : 'none'}
//         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
//         <path strokeLinecap="round" strokeLinejoin="round"
//           d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
//       </svg>
//       {isSaved ? 'Saved' : 'Save'}
//     </button>
//   );
// }

// function NavButton({ onClick, label, variant }) {
//   const isPrimary = variant === 'primary';
//   return (
//     <button
//       onClick={onClick}
//       style={{
//         padding: '11px 24px', borderRadius: 14,
//         border: isPrimary ? 'none' : '1.5px solid #e2e8f0',
//         background: isPrimary
//           ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
//           : 'white',
//         color: isPrimary ? 'white' : '#334155',
//         fontSize: 14, fontWeight: 700, cursor: 'pointer',
//         boxShadow: isPrimary
//           ? '0 4px 14px rgba(99,102,241,0.28)'
//           : '0 1px 4px rgba(0,0,0,0.06)',
//         transition: 'all 0.18s', letterSpacing: '-0.01em',
//       }}
//       onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
//       onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
//     >{label}</button>
//   );
// }

// // ─── Main ─────────────────────────────────────────────────────────────────────
// export default function ResultSection({ loading, items, topic }) {

//   // ── State ─────────────────────────────────────────────────────────────────
//   const [currentIndex,   setCurrentIndex]   = useState(0);
//   const [isFlipped,      setIsFlipped]      = useState(false);
//   const [savedCardIds,   setSavedCardIds]   = useState({});
//   const [isSpeaking,     setIsSpeaking]     = useState(false);
//   const [toast,          setToast]          = useState(null);
//   const [confidence,     setConfidence]     = useState({});
//   const [showConfidence, setShowConfidence] = useState(false);
//   const [searchOpen,     setSearchOpen]     = useState(false);
//   const [searchQuery,    setSearchQuery]    = useState('');
//   const [showShortcuts,  setShowShortcuts]  = useState(false);
//   const [showOverview,   setShowOverview]   = useState(false);

//   // FIX: Separate the slide animation key from the flip state.
//   // slideKey re-mounts only the outer wrapper div (triggers slide-in animation).
//   // The inner .rs-card-inner div is NOT keyed — it persists between navigations,
//   // so its CSS rotateY transform is never destroyed and flip works every time.
//   const [slideKey, setSlideKey] = useState(0);
//   const [slideDir, setSlideDir] = useState(null); // 'next' | 'prev' | null

//   const searchRef   = useRef(null);
//   const touchStartX = useRef(null);

//   // ── Derived values ────────────────────────────────────────────────────────
//   const totalCards        = items ? items.length : 0;
//   const current           = items ? items[currentIndex] : null;
//   const isSaved           = !!savedCardIds[currentIndex];
//   const progressPct       = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;
//   const ratedCount        = Object.keys(confidence).length;
//   const currentConfidence = confidence[currentIndex] ?? null;
//   const avgScore          = ratedCount
//     ? (Object.values(confidence).reduce((s, c) => s + c.score, 0) / ratedCount).toFixed(1)
//     : null;

//   const filteredItems = (items && searchQuery.trim())
//     ? items.map((it, i) => ({ ...it, _i: i })).filter(it =>
//         it.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         it.answer.toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     : (items ? items.map((it, i) => ({ ...it, _i: i })) : []);

//   // ── navigate — only updates index + triggers slide animation ──────────────
//   const navigate = useCallback((dir) => {
//     if (!totalCards) return;
//     // Stop any ongoing speech before navigating
//     if (window.speechSynthesis) window.speechSynthesis.cancel();
//     setIsSpeaking(false);
//     setSlideDir(dir);
//     setSlideKey(k => k + 1);
//     if (dir === 'next') setCurrentIndex(p => (p + 1) % totalCards);
//     else                setCurrentIndex(p => (p - 1 + totalCards) % totalCards);
//   }, [totalCards]);

//   // ── Effects ───────────────────────────────────────────────────────────────

//   // Reset flip + confidence panel whenever we land on a new card
//   useEffect(() => {
//     setIsFlipped(false);
//     setShowConfidence(false);
//   }, [currentIndex]);

//   // Clear slide direction after animation completes (prevents re-triggering)
//   useEffect(() => {
//     if (!slideDir) return;
//     const t = setTimeout(() => setSlideDir(null), 350);
//     return () => clearTimeout(t);
//   }, [slideKey, slideDir]);

//   // Show confidence buttons after flip completes
//   useEffect(() => {
//     let t;
//     if (isFlipped) t = setTimeout(() => setShowConfidence(true), 620);
//     else setShowConfidence(false);
//     return () => clearTimeout(t);
//   }, [isFlipped]);

//   // Auto-dismiss toast
//   useEffect(() => {
//     if (!toast) return;
//     const t = setTimeout(() => setToast(null), 2800);
//     return () => clearTimeout(t);
//   }, [toast]);

//   // Focus search input when opened
//   useEffect(() => {
//     if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
//   }, [searchOpen]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const onKey = (e) => {
//       if (searchOpen || showOverview) return;
//       const tag = document.activeElement?.tagName;
//       if (tag === 'INPUT' || tag === 'TEXTAREA') return;
//       switch (e.key) {
//         case 'ArrowRight':
//           e.preventDefault();
//           navigate('next');
//           break;
//         case 'ArrowLeft':
//           e.preventDefault();
//           navigate('prev');
//           break;
//         case ' ':
//           e.preventDefault();
//           setIsFlipped(f => !f);
//           break;
//         case 's':
//         case 'S':
//           if (!e.metaKey && !e.ctrlKey && items && items[currentIndex]) {
//             e.preventDefault();
//             if (isSaved) handleUnsave({ stopPropagation: () => {} }, currentIndex);
//             else         handleSave({ stopPropagation: () => {} }, items[currentIndex], currentIndex);
//           }
//           break;
//         case 'r':
//         case 'R':
//           if (items && items[currentIndex]) {
//             e.preventDefault();
//             speak(isFlipped ? items[currentIndex].answer : items[currentIndex].question);
//           }
//           break;
//         case 'Escape':
//           setShowShortcuts(false);
//           setShowOverview(false);
//           setSearchOpen(false);
//           setSearchQuery('');
//           break;
//         default:
//           break;
//       }
//     };
//     window.addEventListener('keydown', onKey);
//     return () => window.removeEventListener('keydown', onKey);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentIndex, isFlipped, isSaved, items, searchOpen, showOverview, navigate]);

//   // ── Handlers ──────────────────────────────────────────────────────────────
//   const handleSave = async (e, item, index) => {
//     e.stopPropagation();
//     const userData = JSON.parse(localStorage.getItem('user'));
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/save-card`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId: userData.id, question: item.question, answer: item.answer }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         const vaultId = data.id || data.card?.id || data._id || data.savedId;
//         if (vaultId) setSavedCardIds(prev => ({ ...prev, [index]: vaultId }));
//         setToast({ type: 'success', message: '✅ Saved to vault' });
//       } else {
//         setToast({ type: 'error', message: '❌ Failed to save' });
//       }
//     } catch {
//       setToast({ type: 'error', message: '❌ Failed to save' });
//     }
//   };

//   const handleUnsave = async (e, index) => {
//     e.stopPropagation();
//     const vaultId = savedCardIds[index];
//     if (!vaultId) return;
//     const token = localStorage.getItem('token');
//     if (!token) { setToast({ type: 'error', message: '❌ Auth token missing' }); return; }
//     if (!window.confirm('Remove this card from your vault?')) return;
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/vault/${vaultId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` },
//       });
//       if (response.ok) {
//         setSavedCardIds(prev => { const u = { ...prev }; delete u[index]; return u; });
//         setToast({ type: 'success', message: '🗑️ Removed from vault' });
//       } else {
//         setToast({ type: 'error', message: '❌ Failed to remove' });
//       }
//     } catch {
//       setToast({ type: 'error', message: '❌ Failed to remove' });
//     }
//   };

//   const speak = (text) => {
//     if (!('speechSynthesis' in window)) return;
//     const synth = window.speechSynthesis;
//     if (isSpeaking) { synth.cancel(); setIsSpeaking(false); return; }
//     synth.cancel();
//     const utt = new SpeechSynthesisUtterance(text);
//     utt.rate = 0.94; utt.pitch = 1.06; utt.volume = 1;
//     utt.onend   = () => setIsSpeaking(false);
//     utt.onerror = () => setIsSpeaking(false);
//     synth.speak(utt);
//     setIsSpeaking(true);
//   };

//   const copyToClipboard = async (text, label) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setToast({ type: 'success', message: `📋 ${label} copied` });
//     } catch {
//       setToast({ type: 'error', message: '❌ Copy failed' });
//     }
//   };

//   const rateConfidence = (e, level) => {
//     e.stopPropagation();
//     setConfidence(prev => ({
//       ...prev,
//       [currentIndex]: { score: level.score, label: level.label, ts: Date.now() },
//     }));
//     setToast({ type: 'success', message: `${level.emoji} Marked as ${level.label}` });
//     setTimeout(() => navigate('next'), 500);
//   };

//   const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
//   const onTouchEnd   = (e) => {
//     if (touchStartX.current === null) return;
//     const dx = e.changedTouches[0].clientX - touchStartX.current;
//     if (Math.abs(dx) > 52) dx < 0 ? navigate('next') : navigate('prev');
//     else setIsFlipped(f => !f);
//     touchStartX.current = null;
//   };

//   const qFontSize = (len) => {
//     if (!len)      return 'clamp(20px, 3.2vw, 26px)';
//     if (len > 200) return 'clamp(13px, 2vw, 15px)';
//     if (len > 120) return 'clamp(15px, 2.4vw, 18px)';
//     if (len > 60)  return 'clamp(17px, 2.8vw, 21px)';
//     return 'clamp(20px, 3.2vw, 26px)';
//   };
//   const aFontSize = (len) => {
//     if (!len)      return 'clamp(16px, 2.6vw, 22px)';
//     if (len > 350) return 'clamp(12px, 1.8vw, 14px)';
//     if (len > 180) return 'clamp(13px, 2vw, 16px)';
//     if (len > 80)  return 'clamp(14px, 2.2vw, 18px)';
//     return 'clamp(16px, 2.6vw, 22px)';
//   };

//   // ── Early returns — AFTER all hooks ───────────────────────────────────────
//   if (loading) return (
//     <div style={{ textAlign: 'center', padding: '80px 20px' }}>
//       <style>{`@keyframes rs-loading-pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
//       <div style={{ fontSize: 56, marginBottom: 16, animation: 'rs-loading-pulse 1.4s ease-in-out infinite' }}>🧠</div>
//       <p style={{ fontSize: 18, color: '#64748b', fontWeight: 500 }}>Generating your flashcards…</p>
//     </div>
//   );
//   if (!items || items.length === 0) return null;

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <style>{`
//         /* ── 3D card setup ── */
//         .rs-scene { perspective: 1400px; }

//         .rs-card-inner {
//           position: relative; width: 100%; height: 100%;
//           transform-style: preserve-3d;
//           transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
//           will-change: transform;
//         }
//         .rs-card-inner.rs-flipped { transform: rotateY(180deg); }

//         .rs-face {
//           position: absolute; inset: 0;
//           backface-visibility: hidden;
//           -webkit-backface-visibility: hidden;
//           border-radius: 20px;
//           overflow: hidden;
//         }
//         .rs-face-back { transform: rotateY(180deg); }

//         /* ── Slide animations (applied to wrapper only) ── */
//         @keyframes rs-slide-r {
//           from { opacity: 0; transform: translateX(28px) scale(0.97); }
//           to   { opacity: 1; transform: translateX(0)    scale(1);    }
//         }
//         @keyframes rs-slide-l {
//           from { opacity: 0; transform: translateX(-28px) scale(0.97); }
//           to   { opacity: 1; transform: translateX(0)     scale(1);    }
//         }
//         .rs-enter-right { animation: rs-slide-r 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
//         .rs-enter-left  { animation: rs-slide-l 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }

//         /* ── Confidence button stagger ── */
//         @keyframes rs-conf-up {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0);    }
//         }
//         .rs-conf-item                    { animation: rs-conf-up 0.22s ease both; }
//         .rs-conf-item:nth-child(1)       { animation-delay: 0.00s; }
//         .rs-conf-item:nth-child(2)       { animation-delay: 0.04s; }
//         .rs-conf-item:nth-child(3)       { animation-delay: 0.08s; }
//         .rs-conf-item:nth-child(4)       { animation-delay: 0.12s; }

//         /* ── Scrollbar ── */
//         .rs-scroll::-webkit-scrollbar       { width: 3px; }
//         .rs-scroll::-webkit-scrollbar-track { background: transparent; }
//         .rs-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }

//         /* ── Backdrop / modals ── */
//         @keyframes rs-fade { from { opacity: 0; } to { opacity: 1; } }
//         .rs-backdrop {
//           position: fixed; inset: 0; z-index: 100;
//           background: rgba(15, 23, 42, 0.55);
//           backdrop-filter: blur(6px);
//           display: flex; align-items: center; justify-content: center;
//           padding: 20px;
//           animation: rs-fade 0.18s ease both;
//         }

//         /* ── Toast ── */
//         @keyframes rs-toast-in {
//           from { opacity: 0; transform: translateY(10px) scale(0.95); }
//           to   { opacity: 1; transform: translateY(0)    scale(1);    }
//         }
//         .rs-toast { animation: rs-toast-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }

//         /* ── Hint bob ── */
//         @keyframes rs-hint-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
//         .rs-hint { animation: rs-hint-bob 2s ease-in-out infinite; animation-delay: 1s; }

//         /* ── Overview cards ── */
//         .rs-overview-card {
//           width: 100%; text-align: left;
//           background: white; border-radius: 11px;
//           border: 1.5px solid #e2e8f0;
//           padding: 11px 13px; cursor: pointer;
//           transition: all 0.15s ease;
//         }
//         .rs-overview-card:hover {
//           border-color: #6366f1;
//           box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
//           transform: translateY(-1px);
//         }
//         .rs-overview-card.rs-active {
//           border-color: #6366f1;
//           background: rgba(99,102,241,0.04);
//         }

//         /* ── Progress bar ── */
//         @keyframes rs-bar-grow { from { width: 0; } }
//         .rs-bar { animation: rs-bar-grow 0.6s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.1s; }

//         /* ── Speaking pulse ── */
//         @keyframes rs-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }

//         /* ── Card hover lift ── */
//         .rs-card-lift { transition: box-shadow 0.2s; }
//         .rs-card-lift:hover { box-shadow: 0 12px 40px rgba(99,102,241,0.15), 0 2px 8px rgba(0,0,0,0.06) !important; }
//       `}</style>

//       <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px 60px' }}>

//         {/* ── Topic header ── */}
//         {topic && (
//           <div style={{ textAlign: 'center', marginBottom: 26 }}>
//             <div style={{
//               display: 'inline-flex', alignItems: 'center', gap: 10,
//               background: 'white', border: '1.5px solid #e0e7ff',
//               borderRadius: 50, padding: '9px 22px',
//               boxShadow: '0 2px 14px rgba(99,102,241,0.07)',
//             }}>
//               <span style={{ fontSize: 22 }}>📚</span>
//               <h1 style={{
//                 margin: 0,
//                 fontSize: 'clamp(16px, 4vw, 23px)',
//                 fontWeight: 700,
//                 background: 'linear-gradient(135deg, #4f46e5 0%, #1e293b 50%, #4f46e5 100%)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 letterSpacing: '-0.03em',
//                 lineHeight: 1.2,
//               }}>{topic}</h1>
//             </div>
//           </div>
//         )}

//         {/* ── Progress bar + toolbar ── */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
//           <div style={{ flex: 1 }}>
//             <div style={{ height: 5, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden' }}>
//               <div className="rs-bar" style={{
//                 height: '100%', borderRadius: 10,
//                 width: `${progressPct}%`,
//                 background: 'linear-gradient(90deg, #6366f1, #818cf8)',
//                 transition: 'width 0.38s cubic-bezier(0.22,1,0.36,1)',
//               }} />
//             </div>
//             <div style={{
//               marginTop: 5, fontSize: 11, color: '#94a3b8', fontWeight: 600,
//               letterSpacing: '0.04em', textTransform: 'uppercase',
//               display: 'flex', alignItems: 'center', gap: 10,
//             }}>
//               <span>{currentIndex + 1} of {totalCards} cards</span>
//               {avgScore && <span style={{ color: '#6366f1' }}>avg {avgScore}/4</span>}
//             </div>
//           </div>
//           <div style={{ display: 'flex', gap: 5 }}>
//             {[
//               { icon: '🔍', title: 'Search cards',      action: () => setSearchOpen(true) },
//               { icon: '📋', title: 'All cards overview', action: () => setShowOverview(true) },
//               { icon: '⌨️', title: 'Keyboard shortcuts', action: () => setShowShortcuts(s => !s) },
//             ].map(btn => (
//               <button key={btn.title} onClick={btn.action} title={btn.title} style={{
//                 width: 34, height: 34, border: '1.5px solid #e2e8f0',
//                 borderRadius: 9, background: 'white', cursor: 'pointer',
//                 fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
//               }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f5f3ff'; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
//               >{btn.icon}</button>
//             ))}
//           </div>
//         </div>

//         {/* ── Shortcuts strip ── */}
//         {showShortcuts && (
//           <div style={{
//             background: '#1e293b', borderRadius: 11, padding: '11px 15px',
//             marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: '7px 16px',
//             alignItems: 'center', animation: 'rs-fade 0.18s ease',
//           }}>
//             {SHORTCUTS.map(s => (
//               <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                 <kbd style={{
//                   background: 'rgba(255,255,255,0.12)', color: '#e2e8f0',
//                   border: '1px solid rgba(255,255,255,0.2)',
//                   borderRadius: 5, padding: '2px 6px', fontSize: 10,
//                   fontFamily: 'monospace', fontWeight: 700,
//                 }}>{s.key}</kbd>
//                 <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.desc}</span>
//               </div>
//             ))}
//             <button onClick={() => setShowShortcuts(false)} style={{
//               marginLeft: 'auto', background: 'none', border: 'none',
//               color: '#64748b', cursor: 'pointer', fontSize: 13,
//             }}>✕</button>
//           </div>
//         )}

//         {/* ── 3D Card ── */}
//         <div
//           className="rs-scene"
//           style={{ width: '100%', height: 420 }}
//           onTouchStart={onTouchStart}
//           onTouchEnd={onTouchEnd}
//         >
//           {/*
//            * SLIDE WRAPPER — keyed with slideKey.
//            * Re-mounts on navigation to trigger the slide-in CSS animation.
//            * Contains NO CSS transform of its own.
//            */}
//           <div
//             key={slideKey}
//             style={{ width: '100%', height: '100%' }}
//             className={
//               slideDir === 'next' ? 'rs-enter-right' :
//               slideDir === 'prev' ? 'rs-enter-left'  : ''
//             }
//           >
//             {/*
//              * FLIP INNER — NOT keyed. Never unmounted.
//              * isFlipped state drives the rotateY transform.
//              * useEffect(,[currentIndex]) resets isFlipped to false before the
//              * next card's slide animation plays, so you always start unflipped.
//              */}
//             <div className={`rs-card-inner${isFlipped ? ' rs-flipped' : ''}`}>

//               {/* ── FRONT FACE ── */}
//               <div
//                 className="rs-face rs-card-lift"
//                 onClick={() => setIsFlipped(true)}
//                 role="button"
//                 tabIndex={0}
//                 aria-label={`Question ${currentIndex + 1} of ${totalCards}. Click to reveal answer.`}
//                 onKeyDown={e => {
//                   if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(true); }
//                 }}
//                 style={{
//                   background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
//                   border: '1.5px solid #e0e7ff',
//                   boxShadow: '0 8px 32px rgba(99,102,241,0.09), 0 2px 6px rgba(0,0,0,0.04)',
//                   display: 'flex', flexDirection: 'column',
//                   cursor: 'pointer', userSelect: 'none',
//                 }}
//               >
//                 {/* Front header */}
//                 <div style={{
//                   padding: '14px 16px 0',
//                   display: 'flex', alignItems: 'center',
//                   justifyContent: 'space-between', gap: 8,
//                 }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 1, minWidth: 0 }}>
//                     <span style={{
//                       background: '#f0f0fe', color: '#6366f1',
//                       fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
//                       textTransform: 'uppercase', padding: '4px 9px', borderRadius: 20,
//                       whiteSpace: 'nowrap', flexShrink: 0,
//                     }}>Q {currentIndex + 1}/{totalCards}</span>
//                     {currentConfidence && (
//                       <span style={{
//                         background: CONFIDENCE_LEVELS[currentConfidence.score - 1].bg,
//                         color: CONFIDENCE_LEVELS[currentConfidence.score - 1].color,
//                         fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 20,
//                         whiteSpace: 'nowrap', flexShrink: 0,
//                       }}>
//                         {CONFIDENCE_LEVELS[currentConfidence.score - 1].emoji} {currentConfidence.label}
//                       </span>
//                     )}
//                   </div>
//                   <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
//                     <ActionBtn
//                       onClick={e => { e.stopPropagation(); speak(current.question); }}
//                       title={isSpeaking ? 'Stop' : 'Read aloud'}
//                       icon={isSpeaking ? '⏹️' : '🔊'}
//                       pulse={isSpeaking}
//                     />
//                     <ActionBtn
//                       onClick={e => { e.stopPropagation(); copyToClipboard(current.question, 'Question'); }}
//                       title="Copy question"
//                       icon="📋"
//                     />
//                     <SaveButton
//                       isSaved={isSaved}
//                       onClick={e => isSaved
//                         ? handleUnsave(e, currentIndex)
//                         : handleSave(e, current, currentIndex)}
//                     />
//                   </div>
//                 </div>

//                 {/* Front body */}
//                 <div className="rs-scroll" style={{
//                   flex: 1, overflowY: 'auto',
//                   padding: '14px 22px',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 }}>
//                   <p style={{
//                     margin: 0,
//                     fontSize: qFontSize(current?.question?.length),
//                     fontWeight: 650,
//                     lineHeight: 1.65,
//                     letterSpacing: '-0.015em',
//                     color: '#1e293b',
//                     textAlign: 'center',
//                     wordBreak: 'break-word',
//                     overflowWrap: 'break-word',
//                     whiteSpace: 'pre-line',
//                     width: '100%',
//                   }}>
//                     {current?.question}
//                   </p>
//                 </div>

//                 {/* Front footer */}
//                 <div className="rs-hint" style={{
//                   paddingBottom: 14, textAlign: 'center',
//                   fontSize: 11, color: '#94a3b8', fontWeight: 500,
//                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
//                 }}>
//                   <span>Tap to reveal answer</span>
//                   <span style={{ color: '#6366f1', fontSize: 13 }}>↓</span>
//                 </div>
//               </div>

//               {/* ── BACK FACE ── */}
//               <div
//                 className="rs-face rs-face-back rs-card-lift"
//                 onClick={() => setIsFlipped(false)}
//                 role="button"
//                 tabIndex={0}
//                 aria-label={`Answer for card ${currentIndex + 1}. Click to return to question.`}
//                 onKeyDown={e => {
//                   if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(false); }
//                 }}
//                 style={{
//                   background: 'linear-gradient(145deg, #4f46e5 0%, #4338ca 100%)',
//                   boxShadow: '0 8px 32px rgba(79,70,229,0.24), 0 2px 6px rgba(0,0,0,0.06)',
//                   display: 'flex', flexDirection: 'column',
//                   cursor: 'pointer', userSelect: 'none',
//                 }}
//               >
//                 {/* Back header */}
//                 <div style={{
//                   padding: '14px 16px 0',
//                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 }}>
//                   <span style={{
//                     background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)',
//                     fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
//                     textTransform: 'uppercase', padding: '4px 9px', borderRadius: 20,
//                   }}>Answer</span>
//                   <div style={{ display: 'flex', gap: 4 }}>
//                     <ActionBtn
//                       onClick={e => { e.stopPropagation(); speak(current.answer); }}
//                       title={isSpeaking ? 'Stop' : 'Read aloud'}
//                       icon={isSpeaking ? '⏹️' : '🔊'}
//                       pulse={isSpeaking}
//                       dark
//                     />
//                     <ActionBtn
//                       onClick={e => { e.stopPropagation(); copyToClipboard(current.answer, 'Answer'); }}
//                       title="Copy answer"
//                       icon="📋"
//                       dark
//                     />
//                   </div>
//                 </div>

//                 {/* Back body */}
//                 <div className="rs-scroll" style={{
//                   flex: 1, overflowY: 'auto',
//                   padding: '14px 22px',
//                   display: 'flex', alignItems: 'center',
//                 }}>
//                   <p style={{
//                     margin: 0,
//                     fontSize: aFontSize(current?.answer?.length),
//                     fontWeight: 500,
//                     lineHeight: 1.7,
//                     letterSpacing: '-0.01em',
//                     color: 'rgba(255,255,255,0.94)',
//                     wordBreak: 'break-word',
//                     overflowWrap: 'break-word',
//                     whiteSpace: 'pre-line',
//                     width: '100%',
//                   }}>
//                     {current?.answer}
//                   </p>
//                 </div>

//                 {/* Back footer */}
//                 <div style={{
//                   paddingBottom: 14, textAlign: 'center',
//                   fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 500,
//                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
//                 }}>
//                   <span style={{ fontSize: 13 }}>↑</span>
//                   <span>Tap to see question</span>
//                 </div>
//               </div>

//             </div>{/* end .rs-card-inner */}
//           </div>{/* end slide wrapper */}
//         </div>{/* end .rs-scene */}

//         {/* ── Confidence self-rating ── */}
//         {showConfidence && (
//           <div style={{
//             marginTop: 12,
//             background: 'white', border: '1.5px solid #e0e7ff',
//             borderRadius: 14, padding: '13px 16px',
//             boxShadow: '0 4px 16px rgba(99,102,241,0.07)',
//           }}>
//             <p style={{
//               margin: '0 0 9px', fontSize: 11, fontWeight: 700,
//               color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em',
//             }}>How well did you know it?</p>
//             <div style={{ display: 'flex', gap: 7 }}>
//               {CONFIDENCE_LEVELS.map(lvl => {
//                 const isActive = currentConfidence?.label === lvl.label;
//                 return (
//                   <button
//                     key={lvl.label}
//                     className="rs-conf-item"
//                     onClick={e => rateConfidence(e, lvl)}
//                     style={{
//                       flex: 1, padding: '8px 4px',
//                       border: `1.5px solid ${isActive ? lvl.color : '#e2e8f0'}`,
//                       borderRadius: 10,
//                       background: isActive ? lvl.bg : 'white',
//                       cursor: 'pointer', transition: 'all 0.16s',
//                       display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
//                     }}
//                     onMouseEnter={e => {
//                       e.currentTarget.style.background = lvl.bg;
//                       e.currentTarget.style.borderColor = lvl.color;
//                     }}
//                     onMouseLeave={e => {
//                       // FIX: Check current confidence at event time, not stale closure.
//                       // Read from the confidence state object for the current card.
//                       const currentConf = confidence[currentIndex];
//                       const stillActive = currentConf?.label === lvl.label;
//                       if (!stillActive) {
//                         e.currentTarget.style.background = 'white';
//                         e.currentTarget.style.borderColor = '#e2e8f0';
//                       }
//                     }}
//                   >
//                     <span style={{ fontSize: 19 }}>{lvl.emoji}</span>
//                     <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{lvl.label}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ── Navigation ── */}
//         <div style={{
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           marginTop: 14, gap: 12,
//         }}>
//           <NavButton onClick={() => navigate('prev')} label="← Prev" variant="secondary" />
//           <div style={{ textAlign: 'center' }}>
//             <div style={{
//               fontSize: 16, fontWeight: 700, color: '#334155',
//               fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
//             }}>
//               {currentIndex + 1}
//               <span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>
//               {totalCards}
//             </div>
//             {ratedCount > 0 && (
//               <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginTop: 2 }}>
//                 {ratedCount}/{totalCards} rated
//               </div>
//             )}
//           </div>
//           <NavButton onClick={() => navigate('next')} label="Next →" variant="primary" />
//         </div>

//         {/* ── Session stats (shown after 2+ ratings) ── */}
//         {ratedCount >= 2 && (
//           <div style={{
//             marginTop: 14,
//             background: 'linear-gradient(135deg, #f8faff 0%, #f0f0fe 100%)',
//             border: '1.5px solid #e0e7ff',
//             borderRadius: 12, padding: '11px 16px',
//             display: 'flex', animation: 'rs-fade 0.3s ease',
//           }}>
//             {CONFIDENCE_LEVELS.map((lvl, i) => {
//               const count = Object.values(confidence).filter(c => c.label === lvl.label).length;
//               const pct   = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
//               return (
//                 <div key={lvl.label} style={{
//                   flex: 1, textAlign: 'center', padding: '0 5px',
//                   borderRight: i < 3 ? '1px solid #e0e7ff' : 'none',
//                 }}>
//                   <div style={{ fontSize: 15 }}>{lvl.emoji}</div>
//                   <div style={{ fontSize: 14, fontWeight: 700, color: lvl.color, lineHeight: 1.2 }}>{count}</div>
//                   <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{lvl.label}</div>
//                   <div style={{ fontSize: 10, color: '#94a3b8' }}>{pct}%</div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ── Overview modal ── */}
//       {showOverview && (
//         <div className="rs-backdrop" onClick={() => { setShowOverview(false); setSearchQuery(''); }}>
//           <div onClick={e => e.stopPropagation()} style={{
//             background: 'white', borderRadius: 20, padding: '22px',
//             maxWidth: 600, width: '100%', maxHeight: '80vh',
//             display: 'flex', flexDirection: 'column',
//             boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
//               <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.03em' }}>
//                 All Cards ({totalCards})
//               </h2>
//               <button onClick={() => { setShowOverview(false); setSearchQuery(''); }} style={{
//                 background: '#f1f5f9', border: 'none', borderRadius: 8,
//                 padding: '5px 11px', cursor: 'pointer', fontSize: 12, color: '#64748b', fontWeight: 600,
//               }}>✕ Close</button>
//             </div>
//             <input
//               placeholder="Search cards…"
//               value={searchQuery}
//               onChange={e => setSearchQuery(e.target.value)}
//               style={{
//                 width: '100%', padding: '9px 12px',
//                 border: '1.5px solid #e2e8f0', borderRadius: 9,
//                 fontSize: 13, outline: 'none', marginBottom: 11,
//                 fontFamily: 'inherit', color: '#1e293b', background: '#f8fafc',
//                 boxSizing: 'border-box',
//               }}
//               onFocus={e => { e.target.style.borderColor = '#6366f1'; }}
//               onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
//             />
//             <div className="rs-scroll" style={{
//               overflowY: 'auto', flex: 1,
//               display: 'flex', flexDirection: 'column', gap: 6,
//             }}>
//               {filteredItems.length === 0 && (
//                 <p style={{ color: '#94a3b8', textAlign: 'center', margin: '26px 0', fontSize: 13 }}>
//                   No cards match
//                 </p>
//               )}
//               {filteredItems.map(it => {
//                 const conf = confidence[it._i];
//                 return (
//                   <button
//                     key={it._i}
//                     className={`rs-overview-card${it._i === currentIndex ? ' rs-active' : ''}`}
//                     onClick={() => {
//                       setCurrentIndex(it._i);
//                       setSlideKey(k => k + 1);
//                       setSlideDir(null);
//                       setShowOverview(false);
//                       setSearchQuery('');
//                     }}
//                   >
//                     <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{
//                           fontSize: 10, fontWeight: 700, color: '#6366f1',
//                           textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3,
//                           display: 'flex', gap: 7,
//                         }}>
//                           <span>Card {it._i + 1}</span>
//                           {savedCardIds[it._i] && <span style={{ color: '#10b981' }}>● Saved</span>}
//                         </div>
//                         <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.4, wordBreak: 'break-word' }}>
//                           {clampText(it.question, 120)}
//                         </p>
//                         <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.4, wordBreak: 'break-word' }}>
//                           {clampText(it.answer, 75)}
//                         </p>
//                       </div>
//                       {conf && (
//                         <span style={{
//                           flexShrink: 0, fontSize: 16,
//                           background: CONFIDENCE_LEVELS[conf.score - 1].bg,
//                           borderRadius: 7, padding: '3px 6px',
//                         }}>
//                           {CONFIDENCE_LEVELS[conf.score - 1].emoji}
//                         </span>
//                       )}
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Search jump modal ── */}
//       {searchOpen && (
//         <div className="rs-backdrop" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
//           <div onClick={e => e.stopPropagation()} style={{
//             background: 'white', borderRadius: 16, padding: '18px',
//             maxWidth: 480, width: '100%', maxHeight: '70vh',
//             display: 'flex', flexDirection: 'column',
//             boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
//           }}>
//             <input
//               ref={searchRef}
//               placeholder="Search by question or answer…"
//               value={searchQuery}
//               onChange={e => setSearchQuery(e.target.value)}
//               style={{
//                 width: '100%', padding: '10px 13px',
//                 border: '2px solid #6366f1', borderRadius: 10,
//                 fontSize: 14, outline: 'none',
//                 fontFamily: 'inherit', color: '#1e293b',
//                 boxSizing: 'border-box', marginBottom: 11,
//               }}
//             />
//             <div className="rs-scroll" style={{
//               overflowY: 'auto', flex: 1,
//               display: 'flex', flexDirection: 'column', gap: 5,
//             }}>
//               {filteredItems.length === 0 && (
//                 <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0', fontSize: 13 }}>No results</p>
//               )}
//               {filteredItems.map(it => (
//                 <button
//                   key={it._i}
//                   className="rs-overview-card"
//                   onClick={() => {
//                     setCurrentIndex(it._i);
//                     setSlideKey(k => k + 1);
//                     setSlideDir(null);
//                     setSearchOpen(false);
//                     setSearchQuery('');
//                   }}
//                 >
//                   <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
//                     Card {it._i + 1}
//                   </span>
//                   <p style={{ margin: '3px 0 0', fontSize: 13, color: '#1e293b', fontWeight: 600, wordBreak: 'break-word' }}>
//                     {clampText(it.question, 100)}
//                   </p>
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Toast notification ── */}
//       {toast && (
//         <div className="rs-toast" style={{
//           position: 'fixed', bottom: 24, right: 24, zIndex: 200,
//           display: 'flex', alignItems: 'center', gap: 9,
//           padding: '10px 16px', borderRadius: 12,
//           background: toast.type === 'success' ? '#10b981' : '#ef4444',
//           color: 'white', fontSize: 13, fontWeight: 600,
//           boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
//           maxWidth: 290,
//         }}>
//           {toast.message}
//         </div>
//       )}
//     </>
//   );
// }






import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Utility ──────────────────────────────────────────────────────────────────
const clampText = (text, max = 220) =>
  text?.length > max ? text.slice(0, max).trimEnd() + '…' : text;

// ─── Auth helper — safe, never throws ────────────────────────────────────────
const getLoggedInUser = () => {
  try {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    if (token && user && user.id) return user;
    return null;
  } catch {
    return null;
  }
};

const CONFIDENCE_LEVELS = [
  { label: 'Forgot', emoji: '😶', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  score: 1 },
  { label: 'Hard',   emoji: '😅', color: '#f97316', bg: 'rgba(249,115,22,0.12)', score: 2 },
  { label: 'Good',   emoji: '🙂', color: '#eab308', bg: 'rgba(234,179,8,0.12)',  score: 3 },
  { label: 'Easy',   emoji: '😎', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  score: 4 },
];

const SHORTCUTS = [
  { key: '←',     desc: 'Previous card' },
  { key: '→',     desc: 'Next card'     },
  { key: 'Space', desc: 'Flip card'     },
  { key: 'S',     desc: 'Save to vault' },
  { key: 'R',     desc: 'Read aloud'    },
  { key: 'Esc',   desc: 'Close panels'  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function ActionBtn({ onClick, title, icon, pulse, dark }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34, height: 34, borderRadius: 9,
        border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0',
        background: dark ? 'rgba(255,255,255,0.1)' : 'white',
        cursor: 'pointer', fontSize: 15, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s',
        animation: pulse ? 'rs-pulse 1s ease-in-out infinite' : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.2)' : '#f0f0fe';
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.1)' : 'white';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >{icon}</button>
  );
}

// ─── SaveButton — guest-aware ─────────────────────────────────────────────────
// isGuest: when true, shows the lock icon and "Save" label but triggers the
// polite guest message instead of an API call (handled in parent via onGuestSave)
function SaveButton({ isSaved, isGuest, onClick }) {
  return (
    <button
      onClick={onClick}
      title={isGuest ? 'Create a free account to save cards' : isSaved ? 'Remove from vault' : 'Save to vault'}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '0 12px', height: 34, borderRadius: 9, flexShrink: 0,
        border: isSaved
          ? '1.5px solid #10b981'
          : isGuest
          ? '1.5px solid rgba(99,102,241,0.3)'
          : '1.5px solid #e0e7ff',
        background: isSaved
          ? 'rgba(16,185,129,0.1)'
          : isGuest
          ? 'rgba(99,102,241,0.06)'
          : 'white',
        color: isSaved ? '#10b981' : '#6366f1',
        cursor: 'pointer', fontSize: 12, fontWeight: 700,
        transition: 'all 0.18s', letterSpacing: '0.02em',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13"
        fill={isSaved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}

function NavButton({ onClick, label, variant }) {
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      style={{
        padding: '11px 24px', borderRadius: 14,
        border: isPrimary ? 'none' : '1.5px solid #e2e8f0',
        background: isPrimary
          ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
          : 'white',
        color: isPrimary ? 'white' : '#334155',
        fontSize: 14, fontWeight: 700, cursor: 'pointer',
        boxShadow: isPrimary
          ? '0 4px 14px rgba(99,102,241,0.28)'
          : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.18s', letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >{label}</button>
  );
}

// ─── Guest Save Prompt ────────────────────────────────────────────────────────
// A polite non-blocking banner shown when a guest tries to save.
// Dismisses automatically after 4 seconds or on manual close.
function GuestSaveBanner({ onClose }) {
  return (
    <div style={{
      marginTop: 12,
      background: 'linear-gradient(135deg, rgba(99,102,241,0.07), rgba(14,165,233,0.05))',
      border: '1.5px solid rgba(99,102,241,0.2)',
      borderRadius: 14,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      animation: 'rs-fade 0.22s ease both',
      boxShadow: '0 4px 16px rgba(99,102,241,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
        <div>
          <p style={{
            margin: 0,
            fontSize: 13, fontWeight: 700, color: '#1e293b',
            lineHeight: 1.4,
          }}>
            Create a free account to save this card
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
            Your vault stores all your saved Q&amp;A cards for revision anytime.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a
          href="/signup"
          style={{
            padding: '7px 14px', borderRadius: 9, textDecoration: 'none',
            background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
            color: 'white', fontSize: 12, fontWeight: 700,
            boxShadow: '0 3px 10px rgba(79,70,229,0.3)',
            transition: 'transform 0.15s',
            display: 'inline-block',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Sign up free →
        </a>
        <button
          onClick={onClose}
          style={{
            padding: '7px 10px', borderRadius: 9, border: 'none',
            background: 'rgba(99,102,241,0.08)', color: '#6366f1',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ResultSection({ loading, items, topic }) {

  // ── State ─────────────────────────────────────────────────────────────────
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [isFlipped,       setIsFlipped]       = useState(false);
  const [savedCardIds,    setSavedCardIds]     = useState({});
  const [isSpeaking,      setIsSpeaking]      = useState(false);
  const [toast,           setToast]           = useState(null);
  const [confidence,      setConfidence]      = useState({});
  const [showConfidence,  setShowConfidence]  = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [showShortcuts,   setShowShortcuts]   = useState(false);
  const [showOverview,    setShowOverview]    = useState(false);
  // Guest save banner — shown when a non-logged-in user clicks Save
  const [showGuestBanner, setShowGuestBanner] = useState(false);

  const [slideKey, setSlideKey] = useState(0);
  const [slideDir, setSlideDir] = useState(null);

  const searchRef   = useRef(null);
  const touchStartX = useRef(null);
  // Timer ref so we can clear the auto-dismiss of the guest banner
  const guestBannerTimer = useRef(null);

  // ── Derived values ────────────────────────────────────────────────────────
  const totalCards        = items ? items.length : 0;
  const current           = items ? items[currentIndex] : null;
  const isSaved           = !!savedCardIds[currentIndex];
  const progressPct       = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;
  const ratedCount        = Object.keys(confidence).length;
  const currentConfidence = confidence[currentIndex] ?? null;
  const avgScore          = ratedCount
    ? (Object.values(confidence).reduce((s, c) => s + c.score, 0) / ratedCount).toFixed(1)
    : null;

  // Computed once per render — safe to call getLoggedInUser here (not in a hook)
  const loggedInUser = getLoggedInUser();
  const isGuest      = !loggedInUser;

  const filteredItems = (items && searchQuery.trim())
    ? items.map((it, i) => ({ ...it, _i: i })).filter(it =>
        it.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (items ? items.map((it, i) => ({ ...it, _i: i })) : []);

  // ── navigate ──────────────────────────────────────────────────────────────
  const navigate = useCallback((dir) => {
    if (!totalCards) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSlideDir(dir);
    setSlideKey(k => k + 1);
    if (dir === 'next') setCurrentIndex(p => (p + 1) % totalCards);
    else                setCurrentIndex(p => (p - 1 + totalCards) % totalCards);
  }, [totalCards]);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setIsFlipped(false);
    setShowConfidence(false);
    // Hide guest banner when user navigates to a different card
    setShowGuestBanner(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!slideDir) return;
    const t = setTimeout(() => setSlideDir(null), 350);
    return () => clearTimeout(t);
  }, [slideKey, slideDir]);

  useEffect(() => {
    let t;
    if (isFlipped) t = setTimeout(() => setShowConfidence(true), 620);
    else setShowConfidence(false);
    return () => clearTimeout(t);
  }, [isFlipped]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  // Auto-dismiss guest banner after 5 seconds
  useEffect(() => {
    if (showGuestBanner) {
      guestBannerTimer.current = setTimeout(() => setShowGuestBanner(false), 5000);
    }
    return () => clearTimeout(guestBannerTimer.current);
  }, [showGuestBanner]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (searchOpen || showOverview) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          navigate('next');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigate('prev');
          break;
        case ' ':
          e.preventDefault();
          setIsFlipped(f => !f);
          break;
        case 's':
        case 'S':
          if (!e.metaKey && !e.ctrlKey && items && items[currentIndex]) {
            e.preventDefault();
            if (isGuest) {
              setShowGuestBanner(true);
            } else if (isSaved) {
              handleUnsave({ stopPropagation: () => {} }, currentIndex);
            } else {
              handleSave({ stopPropagation: () => {} }, items[currentIndex], currentIndex);
            }
          }
          break;
        case 'r':
        case 'R':
          if (items && items[currentIndex]) {
            e.preventDefault();
            speak(isFlipped ? items[currentIndex].answer : items[currentIndex].question);
          }
          break;
        case 'Escape':
          setShowShortcuts(false);
          setShowOverview(false);
          setSearchOpen(false);
          setSearchQuery('');
          setShowGuestBanner(false);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isFlipped, isSaved, isGuest, items, searchOpen, showOverview, navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // handleSave — only called when user IS logged in (isGuest === false)
  const handleSave = async (e, item, index) => {
    e.stopPropagation();
    const user = getLoggedInUser();
    // Defensive: should never reach here as a guest, but guard anyway
    if (!user) {
      setShowGuestBanner(true);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/save-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, question: item.question, answer: item.answer }),
      });
      if (response.ok) {
        const data = await response.json();
        const vaultId = data.id || data.card?.id || data._id || data.savedId;
        if (vaultId) setSavedCardIds(prev => ({ ...prev, [index]: vaultId }));
        setToast({ type: 'success', message: '✅ Saved to vault' });
      } else {
        setToast({ type: 'error', message: '❌ Failed to save' });
      }
    } catch {
      setToast({ type: 'error', message: '❌ Failed to save' });
    }
  };

  const handleUnsave = async (e, index) => {
    e.stopPropagation();
    const vaultId = savedCardIds[index];
    if (!vaultId) return;
    const token = localStorage.getItem('token');
    if (!token) { setToast({ type: 'error', message: '❌ Auth token missing' }); return; }
    if (!window.confirm('Remove this card from your vault?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vault/${vaultId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setSavedCardIds(prev => { const u = { ...prev }; delete u[index]; return u; });
        setToast({ type: 'success', message: '🗑️ Removed from vault' });
      } else {
        setToast({ type: 'error', message: '❌ Failed to remove' });
      }
    } catch {
      setToast({ type: 'error', message: '❌ Failed to remove' });
    }
  };

  // Unified Save button click — decides guest vs. logged-in path
  const handleSaveClick = (e, item, index) => {
    e.stopPropagation();
    if (isGuest) {
      setShowGuestBanner(true);
      return;
    }
    if (isSaved) {
      handleUnsave(e, index);
    } else {
      handleSave(e, item, index);
    }
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (isSpeaking) { synth.cancel(); setIsSpeaking(false); return; }
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.94; utt.pitch = 1.06; utt.volume = 1;
    utt.onend   = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    synth.speak(utt);
    setIsSpeaking(true);
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ type: 'success', message: `📋 ${label} copied` });
    } catch {
      setToast({ type: 'error', message: '❌ Copy failed' });
    }
  };

  const rateConfidence = (e, level) => {
    e.stopPropagation();
    setConfidence(prev => ({
      ...prev,
      [currentIndex]: { score: level.score, label: level.label, ts: Date.now() },
    }));
    setToast({ type: 'success', message: `${level.emoji} Marked as ${level.label}` });
    setTimeout(() => navigate('next'), 500);
  };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 52) dx < 0 ? navigate('next') : navigate('prev');
    else setIsFlipped(f => !f);
    touchStartX.current = null;
  };

  const qFontSize = (len) => {
    if (!len)      return 'clamp(20px, 3.2vw, 26px)';
    if (len > 200) return 'clamp(13px, 2vw, 15px)';
    if (len > 120) return 'clamp(15px, 2.4vw, 18px)';
    if (len > 60)  return 'clamp(17px, 2.8vw, 21px)';
    return 'clamp(20px, 3.2vw, 26px)';
  };
  const aFontSize = (len) => {
    if (!len)      return 'clamp(16px, 2.6vw, 22px)';
    if (len > 350) return 'clamp(12px, 1.8vw, 14px)';
    if (len > 180) return 'clamp(13px, 2vw, 16px)';
    if (len > 80)  return 'clamp(14px, 2.2vw, 18px)';
    return 'clamp(16px, 2.6vw, 22px)';
  };

  // ── Early returns — AFTER all hooks ───────────────────────────────────────
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <style>{`@keyframes rs-loading-pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ fontSize: 56, marginBottom: 16, animation: 'rs-loading-pulse 1.4s ease-in-out infinite' }}>🧠</div>
      <p style={{ fontSize: 18, color: '#64748b', fontWeight: 500 }}>Generating your flashcards…</p>
    </div>
  );
  if (!items || items.length === 0) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── 3D card setup ── */
        .rs-scene { perspective: 1400px; }

        .rs-card-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
          will-change: transform;
        }
        .rs-card-inner.rs-flipped { transform: rotateY(180deg); }

        .rs-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 20px;
          overflow: hidden;
        }
        .rs-face-back { transform: rotateY(180deg); }

        /* ── Slide animations ── */
        @keyframes rs-slide-r {
          from { opacity: 0; transform: translateX(28px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes rs-slide-l {
          from { opacity: 0; transform: translateX(-28px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)     scale(1);    }
        }
        .rs-enter-right { animation: rs-slide-r 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .rs-enter-left  { animation: rs-slide-l 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* ── Confidence button stagger ── */
        @keyframes rs-conf-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .rs-conf-item                    { animation: rs-conf-up 0.22s ease both; }
        .rs-conf-item:nth-child(1)       { animation-delay: 0.00s; }
        .rs-conf-item:nth-child(2)       { animation-delay: 0.04s; }
        .rs-conf-item:nth-child(3)       { animation-delay: 0.08s; }
        .rs-conf-item:nth-child(4)       { animation-delay: 0.12s; }

        /* ── Scrollbar ── */
        .rs-scroll::-webkit-scrollbar       { width: 3px; }
        .rs-scroll::-webkit-scrollbar-track { background: transparent; }
        .rs-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }

        /* ── Backdrop / modals ── */
        @keyframes rs-fade { from { opacity: 0; } to { opacity: 1; } }
        .rs-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: rs-fade 0.18s ease both;
        }

        /* ── Toast ── */
        @keyframes rs-toast-in {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .rs-toast { animation: rs-toast-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* ── Hint bob ── */
        @keyframes rs-hint-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        .rs-hint { animation: rs-hint-bob 2s ease-in-out infinite; animation-delay: 1s; }

        /* ── Overview cards ── */
        .rs-overview-card {
          width: 100%; text-align: left;
          background: white; border-radius: 11px;
          border: 1.5px solid #e2e8f0;
          padding: 11px 13px; cursor: pointer;
          transition: all 0.15s ease;
        }
        .rs-overview-card:hover {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
          transform: translateY(-1px);
        }
        .rs-overview-card.rs-active {
          border-color: #6366f1;
          background: rgba(99,102,241,0.04);
        }

        /* ── Progress bar ── */
        @keyframes rs-bar-grow { from { width: 0; } }
        .rs-bar { animation: rs-bar-grow 0.6s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.1s; }

        /* ── Speaking pulse ── */
        @keyframes rs-pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }

        /* ── Card hover lift ── */
        .rs-card-lift { transition: box-shadow 0.2s; }
        .rs-card-lift:hover { box-shadow: 0 12px 40px rgba(99,102,241,0.15), 0 2px 8px rgba(0,0,0,0.06) !important; }
      `}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px 60px' }}>

        {/* ── Topic header ── */}
        {topic && (
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'white', border: '1.5px solid #e0e7ff',
              borderRadius: 50, padding: '9px 22px',
              boxShadow: '0 2px 14px rgba(99,102,241,0.07)',
            }}>
              <span style={{ fontSize: 22 }}>📚</span>
              <h1 style={{
                margin: 0,
                fontSize: 'clamp(16px, 4vw, 23px)',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #4f46e5 0%, #1e293b 50%, #4f46e5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}>{topic}</h1>
            </div>
          </div>
        )}

        {/* ── Progress bar + toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 5, borderRadius: 10, background: '#e2e8f0', overflow: 'hidden' }}>
              <div className="rs-bar" style={{
                height: '100%', borderRadius: 10,
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                transition: 'width 0.38s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </div>
            <div style={{
              marginTop: 5, fontSize: 11, color: '#94a3b8', fontWeight: 600,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>{currentIndex + 1} of {totalCards} cards</span>
              {avgScore && <span style={{ color: '#6366f1' }}>avg {avgScore}/4</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {[
              { icon: '🔍', title: 'Search cards',       action: () => setSearchOpen(true)          },
              { icon: '📋', title: 'All cards overview',  action: () => setShowOverview(true)        },
              { icon: '⌨️', title: 'Keyboard shortcuts',  action: () => setShowShortcuts(s => !s)   },
            ].map(btn => (
              <button key={btn.title} onClick={btn.action} title={btn.title} style={{
                width: 34, height: 34, border: '1.5px solid #e2e8f0',
                borderRadius: 9, background: 'white', cursor: 'pointer',
                fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f5f3ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}
              >{btn.icon}</button>
            ))}
          </div>
        </div>

        {/* ── Shortcuts strip ── */}
        {showShortcuts && (
          <div style={{
            background: '#1e293b', borderRadius: 11, padding: '11px 15px',
            marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: '7px 16px',
            alignItems: 'center', animation: 'rs-fade 0.18s ease',
          }}>
            {SHORTCUTS.map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <kbd style={{
                  background: 'rgba(255,255,255,0.12)', color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 5, padding: '2px 6px', fontSize: 10,
                  fontFamily: 'monospace', fontWeight: 700,
                }}>{s.key}</kbd>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.desc}</span>
              </div>
            ))}
            <button onClick={() => setShowShortcuts(false)} style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#64748b', cursor: 'pointer', fontSize: 13,
            }}>✕</button>
          </div>
        )}

        {/* ── 3D Card ── */}
        <div
          className="rs-scene"
          style={{ width: '100%', height: 420 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            key={slideKey}
            style={{ width: '100%', height: '100%' }}
            className={
              slideDir === 'next' ? 'rs-enter-right' :
              slideDir === 'prev' ? 'rs-enter-left'  : ''
            }
          >
            <div className={`rs-card-inner${isFlipped ? ' rs-flipped' : ''}`}>

              {/* ── FRONT FACE ── */}
              <div
                className="rs-face rs-card-lift"
                onClick={() => setIsFlipped(true)}
                role="button"
                tabIndex={0}
                aria-label={`Question ${currentIndex + 1} of ${totalCards}. Click to reveal answer.`}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(true); }
                }}
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                  border: '1.5px solid #e0e7ff',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.09), 0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                {/* Front header */}
                <div style={{
                  padding: '14px 16px 0',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 1, minWidth: 0 }}>
                    <span style={{
                      background: '#f0f0fe', color: '#6366f1',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                      textTransform: 'uppercase', padding: '4px 9px', borderRadius: 20,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>Q {currentIndex + 1}/{totalCards}</span>
                    {currentConfidence && (
                      <span style={{
                        background: CONFIDENCE_LEVELS[currentConfidence.score - 1].bg,
                        color: CONFIDENCE_LEVELS[currentConfidence.score - 1].color,
                        fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 20,
                        whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        {CONFIDENCE_LEVELS[currentConfidence.score - 1].emoji} {currentConfidence.label}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <ActionBtn
                      onClick={e => { e.stopPropagation(); speak(current.question); }}
                      title={isSpeaking ? 'Stop' : 'Read aloud'}
                      icon={isSpeaking ? '⏹️' : '🔊'}
                      pulse={isSpeaking}
                    />
                    <ActionBtn
                      onClick={e => { e.stopPropagation(); copyToClipboard(current.question, 'Question'); }}
                      title="Copy question"
                      icon="📋"
                    />
                    {/* SaveButton — passes isGuest so it can style accordingly */}
                    <SaveButton
                      isSaved={isSaved}
                      isGuest={isGuest}
                      onClick={e => handleSaveClick(e, current, currentIndex)}
                    />
                  </div>
                </div>

                {/* Front body */}
                <div className="rs-scroll" style={{
                  flex: 1, overflowY: 'auto',
                  padding: '14px 22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: qFontSize(current?.question?.length),
                    fontWeight: 650,
                    lineHeight: 1.65,
                    letterSpacing: '-0.015em',
                    color: '#1e293b',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-line',
                    width: '100%',
                  }}>
                    {current?.question}
                  </p>
                </div>

                {/* Front footer */}
                <div className="rs-hint" style={{
                  paddingBottom: 14, textAlign: 'center',
                  fontSize: 11, color: '#94a3b8', fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  <span>Tap to reveal answer</span>
                  <span style={{ color: '#6366f1', fontSize: 13 }}>↓</span>
                </div>
              </div>

              {/* ── BACK FACE ── */}
              <div
                className="rs-face rs-face-back rs-card-lift"
                onClick={() => setIsFlipped(false)}
                role="button"
                tabIndex={0}
                aria-label={`Answer for card ${currentIndex + 1}. Click to return to question.`}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(false); }
                }}
                style={{
                  background: 'linear-gradient(145deg, #4f46e5 0%, #4338ca 100%)',
                  boxShadow: '0 8px 32px rgba(79,70,229,0.24), 0 2px 6px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                {/* Back header */}
                <div style={{
                  padding: '14px 16px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                    textTransform: 'uppercase', padding: '4px 9px', borderRadius: 20,
                  }}>Answer</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <ActionBtn
                      onClick={e => { e.stopPropagation(); speak(current.answer); }}
                      title={isSpeaking ? 'Stop' : 'Read aloud'}
                      icon={isSpeaking ? '⏹️' : '🔊'}
                      pulse={isSpeaking}
                      dark
                    />
                    <ActionBtn
                      onClick={e => { e.stopPropagation(); copyToClipboard(current.answer, 'Answer'); }}
                      title="Copy answer"
                      icon="📋"
                      dark
                    />
                  </div>
                </div>

                {/* Back body */}
                <div className="rs-scroll" style={{
                  flex: 1, overflowY: 'auto',
                  padding: '14px 22px',
                  display: 'flex', alignItems: 'center',
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: aFontSize(current?.answer?.length),
                    fontWeight: 500,
                    lineHeight: 1.7,
                    letterSpacing: '-0.01em',
                    color: 'rgba(255,255,255,0.94)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-line',
                    width: '100%',
                  }}>
                    {current?.answer}
                  </p>
                </div>

                {/* Back footer */}
                <div style={{
                  paddingBottom: 14, textAlign: 'center',
                  fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                  <span style={{ fontSize: 13 }}>↑</span>
                  <span>Tap to see question</span>
                </div>
              </div>

            </div>{/* end .rs-card-inner */}
          </div>{/* end slide wrapper */}
        </div>{/* end .rs-scene */}

        {/* ── Guest Save Banner — shown when guest clicks Save ── */}
        {showGuestBanner && (
          <GuestSaveBanner onClose={() => setShowGuestBanner(false)} />
        )}

        {/* ── Confidence self-rating ── */}
        {showConfidence && (
          <div style={{
            marginTop: 12,
            background: 'white', border: '1.5px solid #e0e7ff',
            borderRadius: 14, padding: '13px 16px',
            boxShadow: '0 4px 16px rgba(99,102,241,0.07)',
          }}>
            <p style={{
              margin: '0 0 9px', fontSize: 11, fontWeight: 700,
              color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>How well did you know it?</p>
            <div style={{ display: 'flex', gap: 7 }}>
              {CONFIDENCE_LEVELS.map(lvl => {
                const isActive = currentConfidence?.label === lvl.label;
                return (
                  <button
                    key={lvl.label}
                    className="rs-conf-item"
                    onClick={e => rateConfidence(e, lvl)}
                    style={{
                      flex: 1, padding: '8px 4px',
                      border: `1.5px solid ${isActive ? lvl.color : '#e2e8f0'}`,
                      borderRadius: 10,
                      background: isActive ? lvl.bg : 'white',
                      cursor: 'pointer', transition: 'all 0.16s',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = lvl.bg;
                      e.currentTarget.style.borderColor = lvl.color;
                    }}
                    onMouseLeave={e => {
                      const currentConf = confidence[currentIndex];
                      const stillActive = currentConf?.label === lvl.label;
                      if (!stillActive) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  >
                    <span style={{ fontSize: 19 }}>{lvl.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{lvl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, gap: 12,
        }}>
          <NavButton onClick={() => navigate('prev')} label="← Prev" variant="secondary" />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 16, fontWeight: 700, color: '#334155',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
            }}>
              {currentIndex + 1}
              <span style={{ color: '#cbd5e1', margin: '0 4px' }}>/</span>
              {totalCards}
            </div>
            {ratedCount > 0 && (
              <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginTop: 2 }}>
                {ratedCount}/{totalCards} rated
              </div>
            )}
          </div>
          <NavButton onClick={() => navigate('next')} label="Next →" variant="primary" />
        </div>

        {/* ── Session stats (shown after 2+ ratings) ── */}
        {ratedCount >= 2 && (
          <div style={{
            marginTop: 14,
            background: 'linear-gradient(135deg, #f8faff 0%, #f0f0fe 100%)',
            border: '1.5px solid #e0e7ff',
            borderRadius: 12, padding: '11px 16px',
            display: 'flex', animation: 'rs-fade 0.3s ease',
          }}>
            {CONFIDENCE_LEVELS.map((lvl, i) => {
              const count = Object.values(confidence).filter(c => c.label === lvl.label).length;
              const pct   = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
              return (
                <div key={lvl.label} style={{
                  flex: 1, textAlign: 'center', padding: '0 5px',
                  borderRight: i < 3 ? '1px solid #e0e7ff' : 'none',
                }}>
                  <div style={{ fontSize: 15 }}>{lvl.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: lvl.color, lineHeight: 1.2 }}>{count}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{lvl.label}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Overview modal ── */}
      {showOverview && (
        <div className="rs-backdrop" onClick={() => { setShowOverview(false); setSearchQuery(''); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 20, padding: '22px',
            maxWidth: 600, width: '100%', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b', letterSpacing: '-0.03em' }}>
                All Cards ({totalCards})
              </h2>
              <button onClick={() => { setShowOverview(false); setSearchQuery(''); }} style={{
                background: '#f1f5f9', border: 'none', borderRadius: 8,
                padding: '5px 11px', cursor: 'pointer', fontSize: 12, color: '#64748b', fontWeight: 600,
              }}>✕ Close</button>
            </div>
            <input
              placeholder="Search cards…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px',
                border: '1.5px solid #e2e8f0', borderRadius: 9,
                fontSize: 13, outline: 'none', marginBottom: 11,
                fontFamily: 'inherit', color: '#1e293b', background: '#f8fafc',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#6366f1'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
            />
            <div className="rs-scroll" style={{
              overflowY: 'auto', flex: 1,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {filteredItems.length === 0 && (
                <p style={{ color: '#94a3b8', textAlign: 'center', margin: '26px 0', fontSize: 13 }}>
                  No cards match
                </p>
              )}
              {filteredItems.map(it => {
                const conf = confidence[it._i];
                return (
                  <button
                    key={it._i}
                    className={`rs-overview-card${it._i === currentIndex ? ' rs-active' : ''}`}
                    onClick={() => {
                      setCurrentIndex(it._i);
                      setSlideKey(k => k + 1);
                      setSlideDir(null);
                      setShowOverview(false);
                      setSearchQuery('');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 10, fontWeight: 700, color: '#6366f1',
                          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3,
                          display: 'flex', gap: 7,
                        }}>
                          <span>Card {it._i + 1}</span>
                          {savedCardIds[it._i] && <span style={{ color: '#10b981' }}>● Saved</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.4, wordBreak: 'break-word' }}>
                          {clampText(it.question, 120)}
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.4, wordBreak: 'break-word' }}>
                          {clampText(it.answer, 75)}
                        </p>
                      </div>
                      {conf && (
                        <span style={{
                          flexShrink: 0, fontSize: 16,
                          background: CONFIDENCE_LEVELS[conf.score - 1].bg,
                          borderRadius: 7, padding: '3px 6px',
                        }}>
                          {CONFIDENCE_LEVELS[conf.score - 1].emoji}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Search jump modal ── */}
      {searchOpen && (
        <div className="rs-backdrop" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 16, padding: '18px',
            maxWidth: 480, width: '100%', maxHeight: '70vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
          }}>
            <input
              ref={searchRef}
              placeholder="Search by question or answer…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 13px',
                border: '2px solid #6366f1', borderRadius: 10,
                fontSize: 14, outline: 'none',
                fontFamily: 'inherit', color: '#1e293b',
                boxSizing: 'border-box', marginBottom: 11,
              }}
            />
            <div className="rs-scroll" style={{
              overflowY: 'auto', flex: 1,
              display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              {filteredItems.length === 0 && (
                <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0', fontSize: 13 }}>No results</p>
              )}
              {filteredItems.map(it => (
                <button
                  key={it._i}
                  className="rs-overview-card"
                  onClick={() => {
                    setCurrentIndex(it._i);
                    setSlideKey(k => k + 1);
                    setSlideDir(null);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
                    Card {it._i + 1}
                  </span>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#1e293b', fontWeight: 600, wordBreak: 'break-word' }}>
                    {clampText(it.question, 100)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notification ── */}
      {toast && (
        <div className="rs-toast" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '10px 16px', borderRadius: 12,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          maxWidth: 290,
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
}