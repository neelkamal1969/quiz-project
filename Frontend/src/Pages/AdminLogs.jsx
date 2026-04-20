// import React, { useState, useEffect } from 'react';

// export default function AdminLogs() {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('');

//   useEffect(() => {
//     fetchLogs();
//   }, []);

//   const fetchLogs = async () => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/logs`);
//       const data = await response.json();
//       setLogs(data);
//     } catch (err) {
//       console.error("Error loading logs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredLogs = logs.filter(log => 
//     log.email.toLowerCase().includes(filter.toLowerCase()) || 
//     log.topic.toLowerCase().includes(filter.toLowerCase())
//   );

//   if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse font-bold">Accessing Secure Logs...</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 md:p-12">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
//               <span className="p-2 bg-indigo-600 rounded-lg text-white text-sm">ADMIN</span> 
//               Search Activity Logs
//             </h1>
//             <p className="text-slate-500 text-sm mt-1">Real-time tracking of user searches and AI triggers.</p>
//           </div>

//           <input 
//             type="text" 
//             placeholder="Search by email or topic..."
//             className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500 w-full md:w-64 shadow-sm text-sm"
//             onChange={(e) => setFilter(e.target.value)}
//           />
//         </div>

//         <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-100">
//                 <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Email</th>
//                 <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Topic Searched</th>
//                 <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Time (IST)</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {filteredLogs.map((log) => (
//                 <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
//                   <td className="p-5">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
//                         {log.email[0].toUpperCase()}
//                       </div>
//                       <span className="font-semibold text-slate-700">{log.email}</span>
//                     </div>
//                   </td>
//                   <td className="p-5">
//                     <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-100">
//                       {log.topic}
//                     </span>
//                   </td>
//                   <td className="p-5 text-right text-slate-400 text-sm font-mono">
//                     {new Date(log.search_time).toLocaleString('en-IN', {
//                       timeZone: 'Asia/Kolkata', // Forces the display to IST
//                       day: '2-digit',
//                       month: 'short',
//                       year: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit',
//                       hour12: true // Shows AM/PM
//                     })}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
          
//           {filteredLogs.length === 0 && (
//             <div className="p-20 text-center text-slate-400 italic">No logs match your search.</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


//the above is the original v1 and below is v2



// import React, { useState, useEffect, useMemo } from 'react';

// export default function AdminLogs() {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('');

//   useEffect(() => {
//     // Initial fetch of logs on component mount and setup of periodic refresh
//     // to support the real-time tracking requirement without relying on WebSockets.
//     // Polling interval is set to 30 seconds to balance freshness and server load.
//     fetchLogs();

//     const interval = setInterval(() => {
//       // Silent refresh on subsequent calls (no loading spinner shown to user)
//       fetchLogs();
//     }, 30000);

//     // Cleanup interval on unmount to prevent memory leaks
//     return () => clearInterval(interval);
//   }, []);

//   const fetchLogs = async () => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/logs`);
      
//       // Critical improvement: explicit HTTP status check to prevent silent failures
//       // when backend returns error codes (e.g., 401, 500, 404). This avoids
//       // trying to parse non-JSON error responses and provides better debugging.
//       if (!response.ok) {
//         throw new Error(`Failed to fetch logs: ${response.status}`);
//       }
      
//       const data = await response.json();
//       setLogs(data);
//     } catch (err) {
//       console.error("Error loading logs:", err);
//       // No state mutation in catch block to preserve any previously loaded logs
//       // (graceful degradation – important for larger admin dashboard flows).
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Optimized with useMemo: prevents unnecessary filter re-computation on every render.
//   // Dependency array ensures it only recalculates when logs or filter actually change.
//   // This is a performance win for larger log sets while keeping the exact same filtering logic.
//   const filteredLogs = useMemo(() => 
//     logs.filter(log => 
//       log.email.toLowerCase().includes(filter.toLowerCase()) || 
//       log.topic.toLowerCase().includes(filter.toLowerCase())
//     ),
//     [logs, filter]
//   );

//   if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse font-bold">Accessing Secure Logs...</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 md:p-12">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//           <div>
//             <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
//               <span className="p-2 bg-indigo-600 rounded-lg text-white text-sm">ADMIN</span> 
//               Search Activity Logs
//             </h1>
//             <p className="text-slate-500 text-sm mt-1">Real-time tracking of user searches and AI triggers.</p>
            
//             {/* UX enhancement: clear count indicator (total vs filtered) for better product transparency */}
//             {/* Placed here to keep layout identical while giving admins instant context */}
//             <span className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-2xl">
//               {filteredLogs.length} of {logs.length} logs
//             </span>
//           </div>

//           <input 
//             type="text" 
//             placeholder="Search by email or topic..."
//             className="p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500 w-full md:w-64 shadow-sm text-sm"
//             onChange={(e) => setFilter(e.target.value)}
//           />
//         </div>

//         <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-100">
//                 <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Email</th>
//                 <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Topic Searched</th>
//                 <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Time (IST)</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {filteredLogs.map((log) => (
//                 <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
//                   <td className="p-5">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
//                         {log.email[0].toUpperCase()}
//                       </div>
//                       <span className="font-semibold text-slate-700">{log.email}</span>
//                     </div>
//                   </td>
//                   <td className="p-5">
//                     <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-100">
//                       {log.topic}
//                     </span>
//                   </td>
//                   <td className="p-5 text-right text-slate-400 text-sm font-mono">
//                     {new Date(log.search_time).toLocaleString('en-IN', {
//                       timeZone: 'Asia/Kolkata', // Forces the display to IST
//                       day: '2-digit',
//                       month: 'short',
//                       year: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit',
//                       hour12: true // Shows AM/PM
//                     })}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
          
//           {/* Improved empty state: distinguishes between "no data at all" vs "filter has no matches" */}
//           {/* This prevents confusing UX when the system genuinely has zero logs */}
//           {filteredLogs.length === 0 && (
//             <div className="p-20 text-center text-slate-400 italic">
//               {logs.length === 0 
//                 ? "No activity logs recorded yet." 
//                 : "No logs match your search."
//               }
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }





// below is v3


import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ─── Utility: format IST time ────────────────────────────────────────────────
const fmtTime = (ts) =>
  new Date(ts).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

// ─── Export CSV ──────────────────────────────────────────────────────────────
const exportCSV = (logs) => {
  const header = ['Email', 'Topic', 'Time (IST)'];
  const rows = logs.map((l) => [
    `"${l.email}"`,
    `"${l.topic}"`,
    `"${fmtTime(l.search_time)}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `studyai_logs_${Date.now()}.csv` });
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

// ─── Export PDF via print ────────────────────────────────────────────────────
const exportPDF = () => window.print();

// ─── Compute analytics from logs ────────────────────────────────────────────
const computeAnalytics = (logs) => {
  const topicCount = {};
  const userCount  = {};
  const hourBucket = Array(24).fill(0);
  const today      = new Date().toDateString();
  let   todayCount = 0;

  logs.forEach((l) => {
    const t = (l.topic || '').trim().toLowerCase();
    const e = (l.email || '').trim().toLowerCase();
    topicCount[t] = (topicCount[t] || 0) + 1;
    userCount[e]  = (userCount[e]  || 0) + 1;
    const h = new Date(l.search_time).getHours();
    hourBucket[h]++;
    if (new Date(l.search_time).toDateString() === today) todayCount++;
  });

  const topTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 20);
  const topUsers  = Object.entries(userCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 8);

  return {
    totalSearches: logs.length,
    uniqueUsers:   Object.keys(userCount).length,
    uniqueTopics:  Object.keys(topicCount).length,
    todaySearches: todayCount,
    topTopics,
    topUsers,
    hourBucket,
  };
};

// ─── Word Cloud ──────────────────────────────────────────────────────────────
const WordCloud = ({ topTopics }) => {
  if (!topTopics.length) return null;
  const max = topTopics[0][1];
  const colors = ['#4f46e5','#2563eb','#0ea5e9','#6366f1','#3b82f6','#8b5cf6','#06b6d4'];
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', alignItems:'center', justifyContent:'center', padding:'8px 0' }}>
      {topTopics.map(([topic, count], i) => {
        const ratio = count / max;
        const size  = Math.round(11 + ratio * 20);
        const opacity = 0.55 + ratio * 0.45;
        const color   = colors[i % colors.length];
        return (
          <span key={topic} style={{
            fontSize: size, fontWeight: ratio > 0.6 ? 800 : ratio > 0.3 ? 700 : 600,
            color, opacity,
            fontFamily: "'Syne', sans-serif",
            lineHeight: 1.3, cursor: 'default',
            transition: 'transform 0.2s, opacity 0.2s',
            display: 'inline-block',
          }}
            onMouseEnter={e => { e.target.style.opacity = 1; e.target.style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { e.target.style.opacity = opacity; e.target.style.transform = 'scale(1)'; }}
            title={`${count} search${count !== 1 ? 'es' : ''}`}
          >
            {topic}
          </span>
        );
      })}
    </div>
  );
};

// ─── Sparkline chart (24-hour buckets) ──────────────────────────────────────
const HourlyChart = ({ hourBucket }) => {
  const max   = Math.max(...hourBucket, 1);
  const W     = 600; const H = 80; const barW = W / 24;
  const now   = new Date().getHours();

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width:'100%', minWidth:320 }}>
        {hourBucket.map((v, h) => {
          const bh     = Math.max(4, (v / max) * H);
          const x      = h * barW + barW * 0.15;
          const y      = H - bh;
          const isNow  = h === now;
          const color  = isNow ? '#4f46e5' : v > 0 ? '#818cf8' : '#e2e8f0';
          return (
            <g key={h}>
              <rect x={x} y={y} width={barW * 0.7} height={bh}
                rx={3} fill={color} opacity={isNow ? 1 : 0.75}>
                <title>{`${h}:00 — ${v} search${v !== 1 ? 'es' : ''}`}</title>
              </rect>
              {(h % 6 === 0) && (
                <text x={x + barW * 0.35} y={H + 16}
                  textAnchor="middle" fontSize={9} fill="#94a3b8"
                  fontFamily="'DM Mono', monospace">
                  {h}h
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Top Users bar chart ─────────────────────────────────────────────────────
const TopUsers = ({ topUsers }) => {
  if (!topUsers.length) return <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center', padding:'16px 0' }}>No user data yet.</p>;
  const max = topUsers[0][1];
  const colors = ['#4f46e5','#6366f1','#818cf8','#a5b4fc','#c7d2fe','#e0e7ff','#ede9fe','#ddd6fe'];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {topUsers.map(([email, count], i) => {
        const pct = (count / max) * 100;
        const initials = email.slice(0,2).toUpperCase();
        return (
          <div key={email} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:28, height:28, borderRadius:'50%', flexShrink:0,
              background:`linear-gradient(135deg, ${colors[i]}, ${colors[Math.min(i+1, colors.length-1)]})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontSize:9, fontWeight:800, fontFamily:"'Syne',sans-serif",
            }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:600, color:'#374151', fontFamily:"'DM Sans',sans-serif",
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>
                  {email}
                </span>
                <span style={{ fontSize:11, fontWeight:700, color:colors[i], fontFamily:"'DM Mono',monospace", flexShrink:0 }}>
                  {count}
                </span>
              </div>
              <div style={{ height:5, borderRadius:3, background:'#f1f5f9', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:3, width:`${pct}%`,
                  background:`linear-gradient(90deg, ${colors[i]}, ${colors[Math.min(i+2, colors.length-1)]})`,
                  transition:'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon, accent, sub }) => (
  <div style={{
    background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)',
    border:'1.5px solid rgba(99,102,241,0.1)',
    borderRadius:20, padding:'20px 22px',
    boxShadow:'0 4px 24px rgba(79,70,229,0.08)',
    display:'flex', flexDirection:'column', gap:6,
    transition:'transform 0.2s, box-shadow 0.2s',
    cursor:'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(79,70,229,0.14)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.boxShadow='0 4px 24px rgba(79,70,229,0.08)'; }}
  >
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase',
        letterSpacing:'0.6px', fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
      <span style={{ fontSize:18, lineHeight:1,
        background: accent, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{icon}</span>
    </div>
    <div style={{ fontSize:32, fontWeight:800, color:'#1e1b4b', fontFamily:"'Syne',sans-serif",
      letterSpacing:'-1px', lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:'#94a3b8', fontFamily:"'DM Sans',sans-serif" }}>{sub}</div>}
  </div>
);

// ─── Section Card wrapper ─────────────────────────────────────────────────────
const SectionCard = ({ title, icon, action, children, style }) => (
  <div style={{
    background:'rgba(255,255,255,0.85)', backdropFilter:'blur(16px)',
    border:'1.5px solid rgba(99,102,241,0.1)',
    borderRadius:24, overflow:'hidden',
    boxShadow:'0 4px 24px rgba(79,70,229,0.07)',
    ...style,
  }}>
    <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid rgba(99,102,241,0.07)',
      display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:'#1e1b4b' }}>{title}</span>
      </div>
      {action}
    </div>
    <div style={{ padding:'18px 22px' }}>{children}</div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function AdminLogs() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [pulse, setPulse]       = useState(false);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'insights'
  const [sortField, setSortField] = useState('search_time');
  const [sortDir, setSortDir]   = useState('desc');
  const refreshRef = useRef(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/logs`);
      if (!response.ok) throw new Error(`Failed to fetch logs: ${response.status}`);
      const data = await response.json();
      setLogs(data);
      // Pulse indicator on refresh
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(false);
    refreshRef.current = setInterval(() => fetchLogs(true), 30000);
    return () => clearInterval(refreshRef.current);
  }, [fetchLogs]);

  const analytics = useMemo(() => computeAnalytics(logs), [logs]);

  const filteredLogs = useMemo(() => {
    const q = filter.toLowerCase();
    return logs
      .filter((l) =>
        l.email.toLowerCase().includes(q) ||
        l.topic.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let va = a[sortField], vb = b[sortField];
        if (sortField === 'search_time') { va = new Date(va); vb = new Date(vb); }
        else { va = (va || '').toLowerCase(); vb = (vb || '').toLowerCase(); }
        if (va < vb) return sortDir === 'asc' ? -1 :  1;
        if (va > vb) return sortDir === 'asc' ?  1 : -1;
        return 0;
      });
  }, [logs, filter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };
  const sortIcon = (field) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ⇅';

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(160deg,#f0f4ff 0%,#fafbff 100%)',
      fontFamily:"'Syne',sans-serif", flexDirection:'column', gap:16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div style={{ width:48, height:48, borderRadius:16,
        background:'linear-gradient(135deg,#4f46e5,#0ea5e9)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22, color:'white', animation:'spinPulse 1.4s ease-in-out infinite' }}>▦</div>
      <p style={{ color:'#94a3b8', fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
        Accessing secure logs…
      </p>
      <style>{`@keyframes spinPulse { 0%,100%{transform:scale(1) rotate(0deg);opacity:1} 50%{transform:scale(1.1) rotate(15deg);opacity:0.8} }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", minHeight:'100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .al-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 70% 40% at 60% -5%, rgba(99,102,241,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 10% 80%, rgba(14,165,233,0.07) 0%, transparent 60%),
            linear-gradient(180deg, #f0f4ff 0%, #f8faff 50%, #ffffff 100%);
          padding: 32px 24px 64px;
        }

        /* Print styles for PDF export */
        @media print {
          .al-no-print { display: none !important; }
          .al-page { background: white !important; padding: 16px !important; }
          .al-table-wrap { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }

        .al-tab {
          padding: 8px 18px; border-radius: 100px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          transition: all 0.2s;
        }
        .al-tab.active {
          background: linear-gradient(135deg, #4f46e5 0%, #2563eb 60%, #0ea5e9 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(79,70,229,0.3);
        }
        .al-tab:not(.active) {
          background: rgba(99,102,241,0.08); color: #475569;
        }
        .al-tab:not(.active):hover { background: rgba(99,102,241,0.15); }

        .al-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .al-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #0ea5e9);
          color: white; box-shadow: 0 4px 16px rgba(79,70,229,0.3);
        }
        .al-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(79,70,229,0.4); }
        .al-btn-outline {
          background: rgba(255,255,255,0.9); color: #475569;
          border: 1.5px solid rgba(99,102,241,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .al-btn-outline:hover { background: white; border-color: rgba(99,102,241,0.4); }

        .al-search {
          padding: 10px 18px; border-radius: 14px;
          border: 1.5px solid rgba(99,102,241,0.15);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: #1e1b4b; outline: none; width: 100%; max-width: 280px;
          box-shadow: 0 2px 12px rgba(79,70,229,0.07);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .al-search::placeholder { color: #94a3b8; }
        .al-search:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .al-th {
          padding: 14px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.8px;
          background: rgba(248,250,255,0.9); cursor: pointer;
          user-select: none; white-space: nowrap;
          transition: color 0.15s;
        }
        .al-th:hover { color: #4f46e5; }

        .al-tr {
          border-bottom: 1px solid rgba(99,102,241,0.05);
          transition: background 0.15s;
        }
        .al-tr:hover { background: rgba(99,102,241,0.03); }
        .al-tr:last-child { border-bottom: none; }

        .al-td { padding: 14px 18px; vertical-align: middle; }

        /* Mobile card view for table rows */
        @media (max-width: 640px) {
          .al-thead { display: none; }
          .al-tr {
            display: block; border-radius: 16px; margin-bottom: 10px;
            border: 1.5px solid rgba(99,102,241,0.1) !important;
            background: rgba(255,255,255,0.9) !important;
            box-shadow: 0 2px 12px rgba(79,70,229,0.06);
          }
          .al-td {
            display: flex; align-items: center; justify-content: space-between;
            padding: 10px 14px; border-bottom: 1px solid rgba(99,102,241,0.05);
          }
          .al-td:last-child { border-bottom: none; }
          .al-td::before {
            content: attr(data-label);
            font-size: 10px; font-weight: 700; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 0.6px;
            font-family: 'DM Sans', sans-serif; flex-shrink: 0; margin-right: 8px;
          }
          .al-search { max-width: 100%; }
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .insights-grid { grid-template-columns: 1fr !important; }
          .al-no-print.al-header-actions { flex-wrap: wrap; gap: 8px !important; }
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .al-fade { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.7); }
        }
        .pulse-dot { animation: pulseDot 1.2s ease-in-out; }
      `}</style>

      <div className="al-page">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* ── Header ── */}
          <div className="al-fade" style={{ marginBottom:28, display:'flex', flexWrap:'wrap',
            alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ padding:'6px 12px', borderRadius:10,
                  background:'linear-gradient(135deg,#4f46e5,#0ea5e9)',
                  color:'white', fontSize:10, fontWeight:800, fontFamily:"'Syne',sans-serif",
                  letterSpacing:'1px', textTransform:'uppercase' }}>Admin</div>
                <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800,
                  color:'#1e1b4b', margin:0, letterSpacing:'-0.5px' }}>Activity Intelligence</h1>
                {/* Live pulse */}
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <div className={pulse ? 'pulse-dot' : ''} style={{
                    width:8, height:8, borderRadius:'50%',
                    background: pulse ? '#10b981' : '#94a3b8',
                    transition:'background 0.3s',
                  }} />
                  <span style={{ fontSize:10, color:'#94a3b8', fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
                    LIVE
                  </span>
                </div>
              </div>
              <p style={{ color:'#64748b', fontSize:13, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                Real-time user search tracking · auto-refreshes every 30s
              </p>
            </div>

            {/* Export buttons */}
            <div className="al-no-print al-header-actions" style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button className="al-btn al-btn-outline" onClick={() => exportCSV(filteredLogs)}>
                ↓ CSV
              </button>
              <button className="al-btn al-btn-outline" onClick={exportPDF}>
                ↓ PDF
              </button>
              <button className="al-btn al-btn-primary" onClick={() => fetchLogs(true)}>
                ↺ Refresh
              </button>
            </div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="al-fade kpi-grid" style={{
            display:'grid', gridTemplateColumns:'repeat(4,1fr)',
            gap:16, marginBottom:24, animationDelay:'0.06s'
          }}>
            <KpiCard label="Total Searches"  value={analytics.totalSearches} icon="◈" accent="linear-gradient(135deg,#4f46e5,#0ea5e9)" sub="all time" />
            <KpiCard label="Unique Users"    value={analytics.uniqueUsers}   icon="◉" accent="linear-gradient(135deg,#2563eb,#06b6d4)" sub="registered" />
            <KpiCard label="Unique Topics"   value={analytics.uniqueTopics}  icon="▦" accent="linear-gradient(135deg,#6366f1,#a855f7)" sub="searched" />
            <KpiCard label="Today"           value={analytics.todaySearches} icon="◎" accent="linear-gradient(135deg,#0ea5e9,#10b981)" sub="searches today (IST)" />
          </div>

          {/* ── Tabs ── */}
          <div className="al-no-print al-fade" style={{ display:'flex', gap:8, marginBottom:20, animationDelay:'0.1s' }}>
            <button className={`al-tab${activeTab==='logs' ? ' active':''}`} onClick={() => setActiveTab('logs')}>
              ▦ Logs
            </button>
            <button className={`al-tab${activeTab==='insights' ? ' active':''}`} onClick={() => setActiveTab('insights')}>
              ◈ Insights
            </button>
          </div>

          {/* ══ LOGS TAB ══════════════════════════════════════════════════════ */}
          {activeTab === 'logs' && (
            <div className="al-fade">
              {/* Search + count bar */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom:14, flexWrap:'wrap', gap:10 }}>
                <input
                  className="al-search"
                  type="text"
                  placeholder="Search by email or topic…"
                  onChange={(e) => setFilter(e.target.value)}
                />
                <span style={{ fontSize:12, color:'#94a3b8', fontFamily:"'DM Mono',monospace",
                  background:'rgba(99,102,241,0.06)', padding:'5px 12px', borderRadius:100 }}>
                  {filteredLogs.length} / {logs.length} entries
                </span>
              </div>

              {/* Table */}
              <div className="al-table-wrap" style={{
                background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)',
                border:'1.5px solid rgba(99,102,241,0.1)', borderRadius:24, overflow:'hidden',
                boxShadow:'0 4px 28px rgba(79,70,229,0.08)',
              }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead className="al-thead">
                    <tr>
                      <th className="al-th" onClick={() => toggleSort('email')} style={{ textAlign:'left' }}>
                        User Email{sortIcon('email')}
                      </th>
                      <th className="al-th" onClick={() => toggleSort('topic')} style={{ textAlign:'left' }}>
                        Topic{sortIcon('topic')}
                      </th>
                      <th className="al-th" onClick={() => toggleSort('search_time')} style={{ textAlign:'right' }}>
                        Time (IST){sortIcon('search_time')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="al-tr">
                        <td className="al-td" data-label="Email">
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{
                              width:32, height:32, borderRadius:'50%', flexShrink:0,
                              background:'linear-gradient(135deg,#4f46e5,#0ea5e9)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              color:'white', fontSize:11, fontWeight:800, fontFamily:"'Syne',sans-serif",
                            }}>
                              {log.email[0].toUpperCase()}
                            </div>
                            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13,
                              fontWeight:600, color:'#374151' }}>{log.email}</span>
                          </div>
                        </td>
                        <td className="al-td" data-label="Topic">
                          <span style={{
                            padding:'4px 12px', borderRadius:8,
                            background:'rgba(245,158,11,0.08)',
                            border:'1px solid rgba(245,158,11,0.2)',
                            color:'#b45309', fontSize:12, fontWeight:600,
                            fontFamily:"'DM Sans',sans-serif",
                          }}>
                            {log.topic}
                          </span>
                        </td>
                        <td className="al-td" data-label="Time" style={{ textAlign:'right' }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11,
                            color:'#94a3b8', fontWeight:500 }}>
                            {fmtTime(log.search_time)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredLogs.length === 0 && (
                  <div style={{ padding:'48px 24px', textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>◎</div>
                    <p style={{ color:'#94a3b8', fontFamily:"'DM Sans',sans-serif", fontSize:13,
                      fontWeight:600, margin:0 }}>
                      {logs.length === 0 ? 'No activity logs recorded yet.' : 'No logs match your search.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ INSIGHTS TAB ══════════════════════════════════════════════════ */}
          {activeTab === 'insights' && (
            <div className="al-fade insights-grid" style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:16
            }}>
              {/* Topic Word Cloud */}
              <SectionCard title="Topic Cloud" icon="◈" style={{ gridColumn:'1 / -1' }}>
                {analytics.topTopics.length
                  ? <WordCloud topTopics={analytics.topTopics} />
                  : <p style={{ color:'#94a3b8', fontSize:13, textAlign:'center' }}>No topics yet.</p>
                }
              </SectionCard>

              {/* Hourly Activity */}
              <SectionCard title="Hourly Activity" icon="▬"
                action={<span style={{ fontSize:10, color:'#94a3b8', fontFamily:"'DM Mono',monospace" }}>24h · IST</span>}
              >
                <HourlyChart hourBucket={analytics.hourBucket} />
                <p style={{ fontSize:11, color:'#94a3b8', marginTop:8, fontFamily:"'DM Sans',sans-serif",
                  textAlign:'center' }}>
                  Current hour highlighted in indigo
                </p>
              </SectionCard>

              {/* Top Users */}
              <SectionCard title="Most Active Users" icon="◉"
                action={<span style={{ fontSize:10, color:'#94a3b8', fontFamily:"'DM Mono',monospace" }}>top 8</span>}
              >
                <TopUsers topUsers={analytics.topUsers} />
              </SectionCard>

              {/* Top Topics ranked list */}
              <SectionCard title="Top Topics Ranked" icon="▦" style={{ gridColumn:'1 / -1' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {analytics.topTopics.slice(0,10).map(([topic, count], i) => (
                    <div key={topic} style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'8px 14px', borderRadius:12,
                      background: i < 3 ? 'linear-gradient(135deg,rgba(79,70,229,0.1),rgba(14,165,233,0.07))' : 'rgba(248,250,255,0.9)',
                      border:`1.5px solid ${i < 3 ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)'}`,
                    }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12,
                        color: i < 3 ? '#4f46e5' : '#94a3b8' }}>
                        #{i+1}
                      </span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13,
                        color:'#374151' }}>{topic}</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#94a3b8',
                        background:'rgba(99,102,241,0.08)', padding:'2px 7px', borderRadius:6 }}>
                        {count}
                      </span>
                    </div>
                  ))}
                  {analytics.topTopics.length === 0 && (
                    <p style={{ color:'#94a3b8', fontSize:13 }}>No topics yet.</p>
                  )}
                </div>
              </SectionCard>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}