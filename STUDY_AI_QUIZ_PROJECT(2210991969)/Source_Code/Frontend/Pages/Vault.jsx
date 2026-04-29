// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function Vault() {
//   const [cards, setCards] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedCard, setExpandedCard] = useState(null); // Tracks which card is "open"
//   const navigate = useNavigate();
//   const userData = JSON.parse(localStorage.getItem('user'));

//   useEffect(() => {
//     if (!userData) return navigate('/login');
//     fetchVault();
//   }, []);

//   const fetchVault = async () => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/vault/${userData.id}`);
//       const data = await response.json();
//       setCards(data);
//     } catch (err) {
//       console.error("Vault error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteCard = async (e, id) => {
//     e.stopPropagation(); // Don't open the card when clicking delete
//     if (!window.confirm("Remove this card from your vault?")) return;
//     try {
//       await fetch(`${import.meta.env.VITE_API_URL}/vault/${id}`, { method: 'DELETE' });
//       setCards(cards.filter(card => card.id !== id));
//       if (expandedCard?.id === id) setExpandedCard(null);
//     } catch (err) {
//       alert("Delete failed");
//     }
//   };

//   if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Opening the vault...</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 md:p-12 relative">
//       <div className="max-w-6xl mx-auto">
//         <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
//           <div>
//             <h1 className="text-3xl font-extrabold text-slate-900">Your Study Vault</h1>
//             <p className="text-slate-500 font-medium">Review your {cards.length} saved masterpieces.</p>
//           </div>
//           <button 
//             onClick={() => navigate('/')}
//             className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
//           >
//             + New Session
//           </button>
//         </header>

//         {cards.length === 0 ? (
//           <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
//             <div className="text-5xl mb-4">📂</div>
//             <p className="text-slate-400 font-medium italic text-lg">Your vault is currently empty.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {cards.map((card) => (
//               <div 
//                 key={card.id} 
//                 onClick={() => setExpandedCard(card)}
//                 className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col h-64"
//               >
//                 <div className="flex justify-between items-start mb-3">
//                   <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Question</span>
//                   <button onClick={(e) => deleteCard(e, card.id)} className="text-slate-300 hover:text-red-500 transition-colors">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                 </div>

//                 {/* Question Preview */}
//                 <h3 className="text-lg font-bold text-slate-800 line-clamp-3 mb-4 flex-grow">
//                   {card.question}
//                 </h3>

//                 <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-indigo-600 font-bold text-sm">
//                   <span>View Full Answer</span>
//                   <span>→</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* --- EXPANDED CARD MODAL --- */}
//       {expandedCard && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
//             {/* Modal Header */}
//             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
//               <h2 className="font-bold text-lg uppercase tracking-wide">Full Card View</h2>
//               <button 
//                 onClick={() => setExpandedCard(null)}
//                 className="p-2 hover:bg-white/20 rounded-full transition-colors"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>

//             {/* Modal Content - Scrollable */}
//             <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
//               <div>
//                 <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-2">The Question</span>
//                 <p className="text-2xl font-bold text-slate-800 leading-tight">
//                   {expandedCard.question}
//                 </p>
//               </div>

//               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
//                 <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-2">The Answer</span>
//                 <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
//                   {expandedCard.answer}
//                 </p>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="p-6 border-t border-slate-100 text-center">
//               <button 
//                 onClick={() => setExpandedCard(null)}
//                 className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
//               >
//                 Close View
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Vault() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);     // Detail view
  const [practiceCards, setPracticeCards] = useState([]);     // For interactive flashcard mode
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');             // newest | oldest | az
  const [deletingId, setDeletingId] = useState(null);
  const [motivationalQuote, setMotivationalQuote] = useState(null);

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Fetch vault + quote
  useEffect(() => {
    if (!userData?.id || !token) {
      navigate('/login');
      return;
    }
    fetchVault();
    fetchMotivationalQuote();
  }, []);

  const fetchVault = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vault/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setCards(data);
    } catch (err) {
      console.error("Vault fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Free public quote API (no key, fully license-free, motivational/educational)
  const fetchMotivationalQuote = async () => {
    try {
      const res = await fetch('https://api.quotable.io/random?tags=motivational|education|success');
      const data = await res.json();
      setMotivationalQuote({
        text: data.content,
        author: data.author
      });
    } catch {
      // Graceful fallback – always shows something beautiful
      setMotivationalQuote({
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
      });
    }
  };

  const deleteCard = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Remove this card from your vault?")) return;
    setDeletingId(id);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/vault/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCards(cards.filter(card => card.id !== id));
      if (expandedCard?.id === id) setExpandedCard(null);
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Smart local analyzer – extracts keywords from ALL questions
  // ─────────────────────────────────────────────────────────────
  const getTagCloud = () => {
    if (!cards.length) return [];
    const text = cards.map(c => c.question.toLowerCase()).join(' ');
    const words = text.split(/\s+/).filter(w => w.length > 3 && !['the','and','for','you','this','that','with','from'].includes(w));
    
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([word, count]) => ({ word, size: Math.max(14, 14 + count * 6) }));
  };

  // ─────────────────────────────────────────────────────────────
  // Filtered + Sorted cards (live search + sort)
  // ─────────────────────────────────────────────────────────────
  const filteredCards = cards
    .filter(card =>
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'az') return a.question.localeCompare(b.question);
      return 0;
    });

  // ─────────────────────────────────────────────────────────────
  // Export functions (kept from before)
  // ─────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (!cards.length) return alert("Vault is empty.");
    const headers = ['Question', 'Answer', 'Saved Date'];
    const rows = cards.map(card => [
      `"${card.question.replace(/"/g, '""')}"`,
      `"${card.answer.replace(/"/g, '""')}"`,
      new Date(card.created_at).toLocaleDateString('en-IN')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyAI-Vault-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (!cards.length) return alert("Vault is empty.");
    const content = cards.map(card => `
      <div style="border:1px solid #e2e8f0; padding:20px; margin-bottom:25px; border-radius:12px;">
        <h3 style="color:#1e40af;">${card.question}</h3>
        <p style="color:#334155;">${card.answer}</p>
        <small>Saved: ${new Date(card.created_at).toLocaleDateString('en-IN')}</small>
      </div>
    `).join('');
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>StudyAI Vault</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.6;}</style>
      </head><body><h1 style="text-align:center;color:#1e40af;">Your Study Vault</h1><p style="text-align:center;">Exported ${new Date().toLocaleString('en-IN')}</p>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // ─────────────────────────────────────────────────────────────
  // Start interactive flashcard practice (3D flip)
  // ─────────────────────────────────────────────────────────────
  const startPractice = () => {
    if (!filteredCards.length) return alert("No cards to practice yet.");
    setPracticeCards([...filteredCards]); // shuffle copy
    setPracticeIndex(0);
    setIsFlipped(false);
  };

  const nextPractice = () => {
    if (practiceIndex < practiceCards.length - 1) {
      setPracticeIndex(practiceIndex + 1);
      setIsFlipped(false);
    } else {
      setPracticeCards([]); // end session
    }
  };

  const toggleFlip = () => setIsFlipped(!isFlipped);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-6"></div>
          <p className="text-slate-500">Unlocking your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER + CONTROLS */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-[-1px] text-slate-900">Your Study Vault</h1>
            <p className="text-slate-600 mt-1">{cards.length} saved Q&amp;A cards • Your private knowledge base</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="Search questions or answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-3xl text-sm focus:outline-none focus:border-blue-400 shadow-sm"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-3xl px-5 py-3 text-sm focus:outline-none shadow-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A–Z</option>
            </select>

            {/* Practice Button – OUT-OF-BOX interactive feature */}
            <button
              onClick={startPractice}
              className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-3xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <span>🧠 Practice Mode</span>
              <span className="text-xl">→</span>
            </button>

            {/* Exports */}
            <button onClick={exportToCSV} className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-3xl font-medium hover:bg-slate-50 flex items-center gap-2">
              📥 CSV
            </button>
            <button onClick={exportToPDF} className="px-6 py-3 bg-blue-600 text-white rounded-3xl font-medium hover:bg-blue-700 flex items-center gap-2">
              📄 PDF
            </button>
          </div>
        </header>

        {/* VAULT ANALYZER – fresh, interactive, visual */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">Smart Vault Analyzer</h2>
            {motivationalQuote && (
              <div className="max-w-xs text-right text-sm italic text-slate-600 border-l-2 border-blue-200 pl-4">
                “{motivationalQuote.text}”<br />
                <span className="text-xs text-slate-400 mt-1 block">— {motivationalQuote.author}</span>
              </div>
            )}
          </div>

          {/* Tag Cloud – truly visual & interactive */}
          <div className="mb-10">
            <h3 className="text-sm uppercase font-medium text-slate-400 mb-4 tracking-widest">Top Topics in Your Vault</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {getTagCloud().map((tag, i) => (
                <span
                  key={i}
                  className="inline-block px-5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-3xl text-sm font-medium cursor-pointer transition-all hover:scale-110"
                  style={{ fontSize: `${tag.size}px` }}
                >
                  {tag.word}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-blue-600">{cards.length}</div>
              <p className="text-slate-600 text-sm mt-1">Total Cards</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-emerald-600">
                {Math.round(cards.reduce((acc, c) => acc + c.answer.split(' ').length, 0) / (cards.length || 1))}
              </div>
              <p className="text-slate-600 text-sm mt-1">Avg Words per Answer</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-amber-600">{filteredCards.length}</div>
              <p className="text-slate-600 text-sm mt-1">Matches Current Filter</p>
            </div>
          </div>
        </div>

        {/* CARD GRID */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="text-6xl mb-4">🔎</div>
            <p className="font-medium text-slate-400">No matching cards found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={() => setExpandedCard(card)}
                className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300 transition-all duration-500 flex flex-col cursor-pointer"
              >
                <div className="flex justify-between mb-6">
                  <span className="px-4 py-1 text-xs font-bold bg-blue-100 text-blue-600 rounded-3xl">Q&amp;A</span>
                  <button
                    onClick={(e) => deleteCard(e, card.id)}
                    disabled={deletingId === card.id}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    🗑
                  </button>
                </div>
                <h3 className="font-semibold text-slate-800 line-clamp-3 text-lg leading-tight flex-1">
                  {card.question}
                </h3>
                <div className="mt-auto pt-6 text-blue-600 text-sm font-medium flex items-center justify-between">
                  <span>View Answer</span>
                  <span className="group-hover:translate-x-1 transition">→</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* DETAIL MODAL – kept but polished */}
      {expandedCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-8 py-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="font-bold">Full Card</h2>
              <button onClick={() => setExpandedCard(null)} className="text-3xl leading-none">×</button>
            </div>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-auto">
              <div>
                <div className="uppercase text-xs font-bold text-blue-500 mb-2">Question</div>
                <p className="text-2xl font-semibold text-slate-800">{expandedCard.question}</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl">
                <div className="uppercase text-xs font-bold text-emerald-500 mb-2">Answer</div>
                <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">{expandedCard.answer}</p>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button onClick={() => setExpandedCard(null)} className="px-8 py-3 bg-slate-100 text-slate-700 rounded-3xl font-medium">Close</button>
            </div>
          </div>
        </div>
      )}


      

{/* INTERACTIVE FLASHCARD PRACTICE MODE */}
{practiceCards.length > 0 && (
  <div className="fixed inset-0 z-[999] bg-slate-950/95 flex items-center justify-center p-6">
    <div className="w-full max-w-xl">
      <div className="text-center text-white mb-6">
        <span className="text-xs uppercase tracking-widest bg-white/10 px-4 py-2 rounded-3xl">
          Practice Session
        </span>
        <p className="mt-3 text-2xl font-light">
          Card {practiceIndex + 1} of {practiceCards.length}
        </p>
      </div>

      {/* CARD */}
      <div
        onClick={toggleFlip}
        className="relative w-full h-[460px] cursor-pointer"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRONT – Question */}
          <div
            className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="p-6 flex flex-col h-full text-center">
              <div className="uppercase text-blue-600 text-xs font-bold mb-4 tracking-widest">
                QUESTION
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="text-2xl leading-snug font-semibold text-slate-800 break-words">
                  {practiceCards[practiceIndex].question}
                </p>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                Tap card to flip →
              </div>
            </div>
          </div>

          {/* BACK – Answer */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white rounded-3xl shadow-2xl flex flex-col border-2 border-emerald-200 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="p-6 flex flex-col h-full text-center">
              <div className="uppercase text-emerald-600 text-xs font-bold mb-4 tracking-widest">
                ANSWER
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="text-xl leading-relaxed text-slate-700 break-words">
                  {practiceCards[practiceIndex].answer}
                </p>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                Tap card to flip back
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between text-white mt-8">
        <button
          onClick={() => {
            setPracticeCards([]);
            setIsFlipped(false);
          }}
          className="px-8 py-4 rounded-3xl border border-white/30 hover:bg-white/10"
        >
          End Practice
        </button>

        <button
          onClick={nextPractice}
          className="px-8 py-4 bg-white text-slate-900 rounded-3xl font-semibold flex items-center gap-2"
        >
          Next Card <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  </div>
)}



      <footer className="text-center text-slate-400 text-xs py-8">
        © {new Date().getFullYear()} StudyAI • Your vault is 100% private
      </footer>
    </div>
  );
}

//copyrightable