// // // import React, { useState } from 'react';
// // // import ResultSection from '../components/ResultSection';

// // // export default function ValueToQuestions() {
// // //   const [topic, setTopic] = useState('');
// // //   const [count, setCount] = useState(5); // Default to 5
// // //   const [materials, setMaterials] = useState([]);
// // //   const [loading, setLoading] = useState(false);

// // //    const handleSearch = async (e) => {
// // //      e.preventDefault();
// // //      if (!topic) return;

// // //      // Validation for Free Tier
// // //      if (count > 20) {
// // //        alert("⚠️ Free Tier Limit: Please request 20 or fewer questions.");
// // //        setCount(20);
// // //        return;
// // //      }

// // //      setLoading(true);
// // //      const userData = JSON.parse(localStorage.getItem('user'));
// // //      const baseUrl = import.meta.env.VITE_API_URL; 

// // //      try {
// // //        const response = await fetch(`${baseUrl}/search/${topic}`, {
// // //          method: 'POST',
// // //          headers: { 'Content-Type': 'application/json' },
// // //          body: JSON.stringify({ 
// // //            userId: userData.id,
// // //            count: count // Sending the requested count to backend
// // //          }),
// // //        });
// // //        // This triggers first to save email, topic, and time
// // //        await fetch(`${baseUrl}/log-search`, {
// // //          method: 'POST',
// // //          headers: { 'Content-Type': 'application/json' },
// // //          body: JSON.stringify({ 
// // //            email: userData.email, 
// // //            topic: topic
// // //          }),
// // //        });
// // //        const data = await response.json();
// // //        setMaterials(data);
// // //      } catch (err) {
// // //        console.error("Error fetching study materials:", err);
// // //      } finally {
// // //        setLoading(false);
// // //      }
// // //    };


// // //   return (
// // //     <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
// // //       <header className="bg-indigo-700 py-16 px-4 text-center text-white">
// // //         <h1 className="text-4xl font-extrabold mb-4 tracking-tight">AI Study Assistant</h1>
// // //         <p className="text-indigo-100 mb-8 max-w-xl mx-auto text-lg">
// // //           Generate a custom study guide with a specific number of questions.
// // //         </p>
        
// // //         <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
// // //           <input 
// // //             type="text"
// // //             value={topic}
// // //             onChange={(e) => setTopic(e.target.value)}
// // //             placeholder="Enter Topic (e.g. Photosynthesis)"
// // //             className="flex-grow p-4 rounded-xl text-slate-900 outline-none focus:bg-slate-50 transition"
// // //           />
          
// // //           <div className="flex items-center px-4 border-l border-slate-100">
// // //             <label className="text-slate-400 text-sm font-bold mr-3 uppercase">Count:</label>
// // //             <input 
// // //               type="number"
// // //               value={count}
// // //               min="1"
// // //               max="20"
// // //               onChange={(e) => setCount(e.target.value)}
// // //               className="w-16 p-2 bg-slate-100 rounded-lg text-center font-bold text-indigo-700 outline-none"
// // //             />
// // //           </div>

// // //           <button 
// // //             type="submit"
// // //             disabled={loading}
// // //             className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-xl transition transform active:scale-95 disabled:opacity-50"
// // //           >
// // //             {loading ? 'Generating...' : 'Learn'}
// // //           </button>
// // //         </form>
// // //         {count > 20 && <p className="text-amber-300 text-sm mt-3 font-medium">⚠️ Max 20 questions for Free Tier</p>}
// // //       </header>

// // //       <main className="max-w-5xl mx-auto py-12 px-6">
// // //         <ResultSection loading={loading} items={materials} topic={topic} />
// // //       </main>
// // //     </div>
// // //   );
// // // } 







// import React, { useState } from 'react';
// import ResultSection from '../components/ResultSection';

// export default function ValueToQuestions() {
//   const [topic, setTopic]       = useState('');
//   const [count, setCount]       = useState(5);
//   const [materials, setMaterials] = useState([]);
//   const [loading, setLoading]   = useState(false);
//   const [error, setError]       = useState('');
//   const [hasSearched, setHasSearched] = useState(false);

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!topic.trim()) return;

//     if (count > 20) {
//       setCount(20);
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setHasSearched(true);

//     const userData = JSON.parse(localStorage.getItem('user') || '{}');
//     const baseUrl  = import.meta.env.VITE_API_URL;

//     try {
//       const payload = { count: Number(count) };
//       if (userData.id) payload.userId = userData.id;

//       const response = await fetch(`${baseUrl}/search/${topic}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       // Log search only if logged in (non-blocking)
//       if (userData.email) {
//         fetch(`${baseUrl}/log-search`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email: userData.email, topic }),
//         }).catch(() => {});
//       }

//       const data = await response.json();
//       setMaterials(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching study materials:', err);
//       setError('Failed to generate questions. Please check your connection and try again.');
//       setMaterials([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
//       className="min-h-screen text-slate-900"
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

//         /* ── Page background ── */
//         .vtq-bg {
//           min-height: 100vh;
//           background:
//             radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%),
//             radial-gradient(ellipse 50% 40% at 90% 60%, rgba(14,165,233,0.08) 0%, transparent 60%),
//             linear-gradient(180deg, #f0f4ff 0%, #f8faff 40%, #ffffff 100%);
//         }

//         /* ── Floating hero orbs ── */
//         .orb-1 {
//           position: absolute; top: -80px; left: -60px;
//           width: 340px; height: 340px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
//           filter: blur(50px); pointer-events: none;
//           animation: floatOrb 10s ease-in-out infinite;
//         }
//         .orb-2 {
//           position: absolute; top: 20px; right: -80px;
//           width: 260px; height: 260px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(14,165,233,0.13) 0%, transparent 70%);
//           filter: blur(40px); pointer-events: none;
//           animation: floatOrb 13s ease-in-out infinite reverse;
//         }
//         @keyframes floatOrb {
//           0%, 100% { transform: translate(0, 0) scale(1); }
//           50% { transform: translate(15px, -20px) scale(1.04); }
//         }

//         /* ── Hero section ── */
//         .hero-section {
//           position: relative;
//           overflow: hidden;
//           padding: 72px 24px 80px;
//           text-align: center;
//           background:
//             radial-gradient(ellipse 90% 80% at 50% 0%, rgba(79,70,229,0.09) 0%, transparent 70%),
//             linear-gradient(180deg, #eef2ff 0%, #f0f4ff 100%);
//           border-bottom: 1px solid rgba(99,102,241,0.1);
//         }

//         /* ── Badge ── */
//         .ai-badge {
//           display: inline-flex; align-items: center; gap: 6px;
//           background: rgba(99,102,241,0.1);
//           border: 1px solid rgba(99,102,241,0.2);
//           color: #4f46e5;
//           font-size: 12px; font-weight: 700;
//           letter-spacing: 0.6px; text-transform: uppercase;
//           padding: 6px 14px; border-radius: 100px;
//           margin-bottom: 20px;
//         }

//         /* ── Hero title ── */
//         .hero-title {
//           font-size: clamp(2rem, 5vw, 3.2rem);
//           font-weight: 800;
//           letter-spacing: -1px;
//           line-height: 1.1;
//           margin: 0 0 16px;
//           background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #0ea5e9 100%);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }
//         .hero-subtitle {
//           color: #64748b;
//           font-size: 16px; font-weight: 500;
//           max-width: 480px; margin: 0 auto 40px;
//           line-height: 1.7;
//         }

//         /* ── Search card ── */
//         .search-card {
//           max-width: 700px; margin: 0 auto;
//           background: rgba(255,255,255,0.85);
//           backdrop-filter: blur(20px);
//           -webkit-backdrop-filter: blur(20px);
//           border: 1.5px solid rgba(99,102,241,0.15);
//           border-radius: 24px;
//           padding: 10px 10px 10px 10px;
//           box-shadow:
//             0 8px 40px rgba(79,70,229,0.12),
//             0 1px 0 rgba(255,255,255,0.9) inset;
//         }

//         .search-inner {
//           display: flex;
//           flex-direction: row;
//           gap: 8px;
//           align-items: stretch;
//         }

//         /* ── Topic input ── */
//         .topic-input {
//           flex: 1;
//           padding: 16px 20px;
//           background: rgba(248,250,255,0.8);
//           border: 1.5px solid rgba(99,102,241,0.12);
//           border-radius: 16px;
//           color: #1e1b4b;
//           font-size: 15px; font-weight: 500;
//           font-family: inherit;
//           outline: none;
//           transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
//           min-width: 0;
//         }
//         .topic-input::placeholder { color: #94a3b8; font-weight: 400; }
//         .topic-input:focus {
//           border-color: rgba(99,102,241,0.5);
//           background: #fff;
//           box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
//         }

//         /* ── Count control ── */
//         .count-wrapper {
//           display: flex; align-items: center; gap: 8px;
//           padding: 0 16px;
//           background: rgba(248,250,255,0.8);
//           border: 1.5px solid rgba(99,102,241,0.12);
//           border-radius: 16px;
//           transition: border-color 0.2s;
//           flex-shrink: 0;
//         }
//         .count-wrapper:focus-within {
//           border-color: rgba(99,102,241,0.5);
//           box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
//         }
//         .count-label {
//           color: #94a3b8; font-size: 11px; font-weight: 700;
//           letter-spacing: 0.6px; text-transform: uppercase;
//           white-space: nowrap;
//         }
//         .count-input {
//           width: 44px; padding: 8px 4px;
//           background: transparent; border: none;
//           text-align: center; font-size: 16px; font-weight: 800;
//           color: #4f46e5; font-family: inherit;
//           outline: none;
//         }
//         .count-input::-webkit-inner-spin-button,
//         .count-input::-webkit-outer-spin-button { opacity: 0; }

//         /* ── Search button ── */
//         .search-btn {
//           padding: 0 28px;
//           border-radius: 16px; border: none;
//           cursor: pointer;
//           font-size: 14px; font-weight: 700;
//           letter-spacing: 0.3px; color: #fff;
//           background: linear-gradient(135deg, #4f46e5 0%, #2563eb 60%, #0ea5e9 100%);
//           box-shadow: 0 4px 20px rgba(79,70,229,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
//           transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
//           display: flex; align-items: center; justify-content: center; gap: 8px;
//           white-space: nowrap; flex-shrink: 0;
//           min-height: 54px;
//         }
//         .search-btn:hover:not(:disabled) {
//           transform: translateY(-1px);
//           box-shadow: 0 8px 28px rgba(79,70,229,0.45);
//         }
//         .search-btn:active:not(:disabled) { transform: scale(0.97); }
//         .search-btn:disabled { opacity: 0.55; cursor: not-allowed; }

//         /* ── Spinner ── */
//         .spinner {
//           width: 15px; height: 15px;
//           border: 2px solid rgba(255,255,255,0.35);
//           border-top-color: #fff;
//           border-radius: 50%;
//           animation: spin 0.7s linear infinite;
//         }
//         @keyframes spin { to { transform: rotate(360deg); } }

//         /* ── Warning / error pills ── */
//         .warn-pill {
//           display: inline-flex; align-items: center; gap: 6px;
//           margin-top: 14px;
//           padding: 7px 14px; border-radius: 100px;
//           background: rgba(245,158,11,0.1);
//           border: 1px solid rgba(245,158,11,0.25);
//           color: #b45309;
//           font-size: 12px; font-weight: 600;
//         }
//         .error-banner {
//           max-width: 700px; margin: 16px auto 0;
//           padding: 14px 18px; border-radius: 16px;
//           background: rgba(239,68,68,0.07);
//           border: 1px solid rgba(239,68,68,0.2);
//           color: #b91c1c;
//           font-size: 13px; font-weight: 500;
//           display: flex; align-items: center; gap: 10px;
//         }

//         /* ── Stats bar ── */
//         .stats-bar {
//           max-width: 700px; margin: 28px auto 0;
//           display: flex; justify-content: center; gap: 32px;
//           flex-wrap: wrap;
//         }
//         .stat-item {
//           display: flex; flex-direction: column; align-items: center; gap: 2px;
//         }
//         .stat-value {
//           font-size: 18px; font-weight: 800; color: #4f46e5;
//         }
//         .stat-label {
//           font-size: 10px; font-weight: 600; color: #94a3b8;
//           text-transform: uppercase; letter-spacing: 0.5px;
//         }

//         /* ── Main content area ── */
//         .main-content {
//           max-width: 900px; margin: 0 auto;
//           padding: 48px 24px 64px;
//         }

//         /* ── Responsive ── */
//         @media (max-width: 600px) {
//           .search-inner { flex-direction: column; }
//           .count-wrapper { justify-content: space-between; padding: 12px 16px; }
//           .search-btn { min-height: 50px; }
//           .stats-bar { gap: 20px; }
//         }
//       `}</style>

//       <div className="vtq-bg">
//         {/* ── Hero / Header ── */}
//         <header className="hero-section">
//           <div className="orb-1" aria-hidden="true" />
//           <div className="orb-2" aria-hidden="true" />

//           <div className="ai-badge">
//             <span>✦</span> AI-Powered
//           </div>

//           <h1 className="hero-title">
//             Your Personal<br />Study Assistant
//           </h1>
//           <p className="hero-subtitle">
//             Enter any topic and instantly generate a tailored set of study questions powered by AI.
//           </p>

//           {/* ── Search card ── */}
//           <form onSubmit={handleSearch} className="search-card">
//             <div className="search-inner">
//               <input
//                 type="text"
//                 value={topic}
//                 onChange={(e) => setTopic(e.target.value)}
//                 placeholder="Enter a topic  (e.g. Photosynthesis, WW2, Calculus...)"
//                 className="topic-input"
//                 autoComplete="off"
//                 spellCheck="false"
//               />

//               <div className="count-wrapper">
//                 <span className="count-label">Q's</span>
//                 <input
//                   type="number"
//                   value={count}
//                   min="1"
//                   max="20"
//                   onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
//                   className="count-input"
//                   aria-label="Number of questions"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading || !topic.trim()}
//                 className="search-btn"
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner" />
//                     Generating…
//                   </>
//                 ) : (
//                   <>
//                     <span>✦</span> Generate
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>

//           {/* Inline warnings */}
//           {count >= 20 && (
//             <div>
//               <span className="warn-pill">⚠ Free Tier: Max 20 questions</span>
//             </div>
//           )}

//           {/* Error banner */}
//           {error && (
//             <div className="error-banner">
//               <span>⚠️</span> {error}
//             </div>
//           )}

//           {/* Stats bar — subtle social proof */}
//           {!hasSearched && (
//             <div className="stats-bar" aria-hidden="true">
//               {[
//                 { value: '20', label: 'Max Questions' },
//                 { value: 'AI', label: 'Gemini Powered' },
//                 { value: '∞', label: 'Topics Covered' },
//               ].map(({ value, label }) => (
//                 <div className="stat-item" key={label}>
//                   <span className="stat-value">{value}</span>
//                   <span className="stat-label">{label}</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </header>

//         {/* ── Results ── */}
//         <main className="main-content">
//           <ResultSection loading={loading} items={materials} topic={topic} />
//         </main>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import ResultSection from '../components/ResultSection';

export default function ValueToQuestions() {
  const [topic, setTopic]           = useState('');
  const [count, setCount]           = useState(5);
  const [materials, setMaterials]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (count > 20) {
      setCount(20);
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    // Safe user read — never throws, returns {} for guests
    const userData = (() => {
      try { return JSON.parse(localStorage.getItem('user') || '{}'); }
      catch { return {}; }
    })();

    const baseUrl = import.meta.env.VITE_API_URL;

    try {
      // Build payload — only include userId when the user is actually logged in.
      // The backend's `body('userId').isInt()` validator is NOT marked `.exists()`,
      // so omitting it entirely passes validation and the backend falls back to an
      // empty profile object (`users[0] || {}`), which is perfectly safe.
      const payload = { count: Number(count) };
      if (userData.id) payload.userId = userData.id;

      const response = await fetch(`${baseUrl}/search/${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Log search only when user is logged in — non-blocking, fire-and-forget
      if (userData.email) {
        fetch(`${baseUrl}/log-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email, topic }),
        }).catch(() => {});
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching study materials:', err);
      setError('Failed to generate questions. Please check your connection and try again.');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="min-h-screen text-slate-900"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        /* ── Page background ── */
        .vtq-bg {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 60%, rgba(14,165,233,0.08) 0%, transparent 60%),
            linear-gradient(180deg, #f0f4ff 0%, #f8faff 40%, #ffffff 100%);
        }

        /* ── Floating hero orbs ── */
        .orb-1 {
          position: absolute; top: -80px; left: -60px;
          width: 340px; height: 340px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          filter: blur(50px); pointer-events: none;
          animation: floatOrb 10s ease-in-out infinite;
        }
        .orb-2 {
          position: absolute; top: 20px; right: -80px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.13) 0%, transparent 70%);
          filter: blur(40px); pointer-events: none;
          animation: floatOrb 13s ease-in-out infinite reverse;
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -20px) scale(1.04); }
        }

        /* ── Hero section ── */
        .hero-section {
          position: relative;
          overflow: hidden;
          padding: 72px 24px 80px;
          text-align: center;
          background:
            radial-gradient(ellipse 90% 80% at 50% 0%, rgba(79,70,229,0.09) 0%, transparent 70%),
            linear-gradient(180deg, #eef2ff 0%, #f0f4ff 100%);
          border-bottom: 1px solid rgba(99,102,241,0.1);
        }

        /* ── Badge ── */
        .ai-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          color: #4f46e5;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.6px; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px;
          margin-bottom: 20px;
        }

        /* ── Hero title ── */
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1.1;
          margin: 0 0 16px;
          background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 50%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          color: #64748b;
          font-size: 16px; font-weight: 500;
          max-width: 480px; margin: 0 auto 40px;
          line-height: 1.7;
        }

        /* ── Search card ── */
        .search-card {
          max-width: 700px; margin: 0 auto;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(99,102,241,0.15);
          border-radius: 24px;
          padding: 10px 10px 10px 10px;
          box-shadow:
            0 8px 40px rgba(79,70,229,0.12),
            0 1px 0 rgba(255,255,255,0.9) inset;
        }

        .search-inner {
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: stretch;
        }

        /* ── Topic input ── */
        .topic-input {
          flex: 1;
          padding: 16px 20px;
          background: rgba(248,250,255,0.8);
          border: 1.5px solid rgba(99,102,241,0.12);
          border-radius: 16px;
          color: #1e1b4b;
          font-size: 15px; font-weight: 500;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          min-width: 0;
        }
        .topic-input::placeholder { color: #94a3b8; font-weight: 400; }
        .topic-input:focus {
          border-color: rgba(99,102,241,0.5);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        /* ── Count control ── */
        .count-wrapper {
          display: flex; align-items: center; gap: 8px;
          padding: 0 16px;
          background: rgba(248,250,255,0.8);
          border: 1.5px solid rgba(99,102,241,0.12);
          border-radius: 16px;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .count-wrapper:focus-within {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .count-label {
          color: #94a3b8; font-size: 11px; font-weight: 700;
          letter-spacing: 0.6px; text-transform: uppercase;
          white-space: nowrap;
        }
        .count-input {
          width: 44px; padding: 8px 4px;
          background: transparent; border: none;
          text-align: center; font-size: 16px; font-weight: 800;
          color: #4f46e5; font-family: inherit;
          outline: none;
        }
        .count-input::-webkit-inner-spin-button,
        .count-input::-webkit-outer-spin-button { opacity: 0; }

        /* ── Search button ── */
        .search-btn {
          padding: 0 28px;
          border-radius: 16px; border: none;
          cursor: pointer;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.3px; color: #fff;
          background: linear-gradient(135deg, #4f46e5 0%, #2563eb 60%, #0ea5e9 100%);
          box-shadow: 0 4px 20px rgba(79,70,229,0.35), 0 1px 0 rgba(255,255,255,0.15) inset;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          white-space: nowrap; flex-shrink: 0;
          min-height: 54px;
        }
        .search-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(79,70,229,0.45);
        }
        .search-btn:active:not(:disabled) { transform: scale(0.97); }
        .search-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Spinner ── */
        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Warning / error pills ── */
        .warn-pill {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 14px;
          padding: 7px 14px; border-radius: 100px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          color: #b45309;
          font-size: 12px; font-weight: 600;
        }
        .error-banner {
          max-width: 700px; margin: 16px auto 0;
          padding: 14px 18px; border-radius: 16px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          color: #b91c1c;
          font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 10px;
        }

        /* ── Stats bar ── */
        .stats-bar {
          max-width: 700px; margin: 28px auto 0;
          display: flex; justify-content: center; gap: 32px;
          flex-wrap: wrap;
        }
        .stat-item {
          display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .stat-value {
          font-size: 18px; font-weight: 800; color: #4f46e5;
        }
        .stat-label {
          font-size: 10px; font-weight: 600; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* ── Main content area ── */
        .main-content {
          max-width: 900px; margin: 0 auto;
          padding: 48px 24px 64px;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .search-inner { flex-direction: column; }
          .count-wrapper { justify-content: space-between; padding: 12px 16px; }
          .search-btn { min-height: 50px; }
          .stats-bar { gap: 20px; }
        }
      `}</style>

      <div className="vtq-bg">
        {/* ── Hero / Header ── */}
        <header className="hero-section">
          <div className="orb-1" aria-hidden="true" />
          <div className="orb-2" aria-hidden="true" />

          <div className="ai-badge">
            <span>✦</span> AI-Powered
          </div>

          <h1 className="hero-title">
            Your Personal<br />Study Assistant
          </h1>
          <p className="hero-subtitle">
            Enter any topic and instantly generate a tailored set of study questions powered by AI.
          </p>

          {/* ── Search card ── */}
          <form onSubmit={handleSearch} className="search-card">
            <div className="search-inner">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic  (e.g. Photosynthesis, WW2, Calculus...)"
                className="topic-input"
                autoComplete="off"
                spellCheck="false"
              />

              <div className="count-wrapper">
                <span className="count-label">Q's</span>
                <input
                  type="number"
                  value={count}
                  min="1"
                  max="20"
                  onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
                  className="count-input"
                  aria-label="Number of questions"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="search-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Generating…
                  </>
                ) : (
                  <>
                    <span>✦</span> Generate
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Inline warnings */}
          {count >= 20 && (
            <div>
              <span className="warn-pill">⚠ Free Tier: Max 20 questions</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="error-banner">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Stats bar — subtle social proof */}
          {!hasSearched && (
            <div className="stats-bar" aria-hidden="true">
              {[
                { value: '20', label: 'Max Questions' },
                { value: 'AI', label: 'Gemini Powered' },
                { value: '∞', label: 'Topics Covered' },
              ].map(({ value, label }) => (
                <div className="stat-item" key={label}>
                  <span className="stat-value">{value}</span>
                  <span className="stat-label">{label}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* ── Results ── */}
        <main className="main-content">
          <ResultSection loading={loading} items={materials} topic={topic} />
        </main>
      </div>
    </div>
  );
}
