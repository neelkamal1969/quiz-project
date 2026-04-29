// import React from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';

// export default function Header() {
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   // Determine authentication status based on stored token
//   const isAuthenticated = !!localStorage.getItem('token');

//   // Retrieve user object safely from localStorage
//   const user = JSON.parse(localStorage.getItem('user') || '{}');

//   // Handles user logout by clearing stored data and redirecting
//   const handleLogout = () => {
//     localStorage.clear(); // Clears token, user info, and any stored profile data
//     navigate('/login');
//   };

//   // Utility function to apply active styling based on current route
//   const isActive = (path) => 
//     location.pathname === path 
//       ? "bg-blue-600 text-white" 
//       : "text-slate-600 hover:bg-slate-100";

//   return (
//     <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
//       <div className="max-w-7xl mx-auto flex items-center justify-between">
        
//         {/* Logo Section */}
//         <Link to="/" className="flex items-center gap-2 group">
//           <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-sm">
//             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path 
//                 strokeLinecap="round" 
//                 strokeLinejoin="round" 
//                 strokeWidth="2" 
//                 d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
//               />
//             </svg>
//           </div>
//           <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">
//             StudyAI
//           </span>
//         </Link>

//         {/* Navigation Links */}
//         <div className="flex items-center gap-2">
//           {isAuthenticated ? (
//             <>
//               <Link 
//                 to="/myquestions" 
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive('/myquestions')}`}
//               >
//                 Question Bank
//               </Link>

//               <Link 
//                 to="/valueInput" 
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive('/valueInput')}`}
//               >
//                 Topic Search
//               </Link>

//               <Link 
//                 to="/imageInput" 
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive('/imageInput')}`}
//               >
//                 Image OCR
//               </Link>

//               <Link 
//                 to="/profile-setup" 
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive('/profile-setup')}`}
//               >
//                 Profile
//               </Link>

//               {/* Divider */}
//               <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

//               {/* Logout Button */}
//               <button 
//                 onClick={handleLogout}
//                 className="px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link 
//                 to="/login" 
//                 className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
//               >
//                 Login
//               </Link>

//               <Link 
//                 to="/signup" 
//                 className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md"
//               >
//                 Get Started
//               </Link>
//             </>
//           )}
//         </div>

//       </div>
//     </nav>
//   );
// }

// //Copyrightable






import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// ─── Nav items config ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/myquestions',icon: '▦', fullLabel: 'Question Bank' },
  { to: '/valueInput',icon: '◈', fullLabel: 'Topic Search'  },
  { to: '/imageInput',icon: '◎', fullLabel: 'Image OCR'     },
  { to: '/profile-setup',icon: '◉', fullLabel: 'Profile'      },
];

const DOCK_POSITIONS = ['top', 'left', 'right'];
const DOCK_ICONS = { top: '▬', left: '▐', right: '▌' };

export default function Header() {
  const location     = useNavigate ? useLocation() : { pathname: '/' };
  const navigate     = useNavigate();
  const [dock, setDock]         = useState('top');       // 'top' | 'left' | 'right'
  const [menuOpen, setMenuOpen] = useState(false);        // mobile hamburger
  const [tilt, setTilt]         = useState({ x: 0, y: 0 });
  const [hovered, setHovered]   = useState(null);
  const [dockPickerOpen, setDockPickerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setDockPickerOpen(false);
  }, [location.pathname]);

  // Close dock picker on outside click
  useEffect(() => {
    if (!dockPickerOpen) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setDockPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dockPickerOpen]);

  // 3D tilt on mouse move (top dock only)
  const handleMouseMove = (e) => {
    if (dock !== 'top') return;
    const rect = navRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -4, y: dx * 4 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  // ── Shared CSS ──
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

    :root {
      --nav-indigo: #4f46e5;
      --nav-sky:    #0ea5e9;
      --nav-ink:    #1e1b4b;
      --nav-glass:  rgba(255,255,255,0.72);
      --nav-border: rgba(99,102,241,0.18);
      --nav-shadow: 0 8px 40px rgba(79,70,229,0.18), 0 1.5px 0 rgba(255,255,255,0.9) inset;
      --nav-shadow-scrolled: 0 12px 50px rgba(79,70,229,0.28), 0 1.5px 0 rgba(255,255,255,0.9) inset;
    }

    /* ─── TOP DOCK ─── */
    .nav-top {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 9999; width: auto; max-width: calc(100vw - 32px);
    }
    .nav-top .nav-pill {
      display: flex; align-items: center; gap: 0;
      background: var(--nav-glass);
      backdrop-filter: blur(28px) saturate(1.8);
      -webkit-backdrop-filter: blur(28px) saturate(1.8);
      border: 1.5px solid var(--nav-border);
      border-radius: 100px;
      padding: 6px 6px 6px 16px;
      box-shadow: var(--nav-shadow);
      transition: box-shadow 0.3s, transform 0.15s;
      transform-style: preserve-3d;
      will-change: transform;
    }
    .nav-top.scrolled .nav-pill {
      box-shadow: var(--nav-shadow-scrolled);
    }

    /* ─── LEFT DOCK ─── */
    .nav-left {
      position: fixed; left: 16px; top: 50%; transform: translateY(-50%);
      z-index: 9999;
    }
    .nav-left .nav-pill {
      display: flex; flex-direction: column; align-items: center; gap: 0;
      background: var(--nav-glass);
      backdrop-filter: blur(28px) saturate(1.8);
      -webkit-backdrop-filter: blur(28px) saturate(1.8);
      border: 1.5px solid var(--nav-border);
      border-radius: 28px;
      padding: 16px 6px 6px 6px;
      box-shadow: var(--nav-shadow);
      transition: box-shadow 0.3s;
    }

    /* ─── RIGHT DOCK ─── */
    .nav-right {
      position: fixed; right: 16px; top: 50%; transform: translateY(-50%);
      z-index: 9999;
    }
    .nav-right .nav-pill {
      display: flex; flex-direction: column; align-items: center; gap: 0;
      background: var(--nav-glass);
      backdrop-filter: blur(28px) saturate(1.8);
      -webkit-backdrop-filter: blur(28px) saturate(1.8);
      border: 1.5px solid var(--nav-border);
      border-radius: 28px;
      padding: 16px 6px 6px 6px;
      box-shadow: var(--nav-shadow);
      transition: box-shadow 0.3s;
    }

    /* ─── Prismatic edge shimmer ─── */
    .nav-pill::before {
      content: '';
      position: absolute; inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        135deg,
        rgba(255,255,255,0.55) 0%,
        rgba(99,102,241,0.08) 40%,
        rgba(14,165,233,0.06) 70%,
        rgba(255,255,255,0.3) 100%
      );
      pointer-events: none;
      z-index: 0;
    }
    .nav-pill > * { position: relative; z-index: 1; }

    /* ─── Logo ─── */
    .nav-logo {
      display: flex; align-items: center; gap: 8px;
      text-decoration: none; flex-shrink: 0;
      margin-right: 4px;
    }
    .nav-left .nav-logo, .nav-right .nav-logo {
      flex-direction: column; margin-right: 0; margin-bottom: 8px;
      gap: 4px;
    }
    .logo-gem {
      width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 55%, #0ea5e9 100%);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(79,70,229,0.4);
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
      font-size: 15px; color: white; font-weight: 800;
      font-family: 'Syne', sans-serif;
    }
    .nav-logo:hover .logo-gem {
      transform: rotate(15deg) scale(1.08);
      box-shadow: 0 6px 20px rgba(79,70,229,0.55);
    }
    .logo-text {
      font-family: 'Syne', sans-serif;
      font-weight: 800; font-size: 16px;
      color: var(--nav-ink);
      letter-spacing: -0.3px;
    }
    .nav-left .logo-text, .nav-right .logo-text {
      font-size: 10px; letter-spacing: 0.5px; text-transform: uppercase;
      writing-mode: horizontal-tb;
    }

    /* ─── Divider ─── */
    .nav-divider-v { width: 1px; height: 20px; background: rgba(99,102,241,0.15); margin: 0 4px; }
    .nav-divider-h { height: 1px; width: 20px; background: rgba(99,102,241,0.15); margin: 4px 0; }

    /* ─── Nav link ─── */
    .nav-link {
      position: relative;
      display: flex; align-items: center; gap: 6px;
      padding: 7px 14px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 600;
      color: #475569;
      text-decoration: none;
      transition: color 0.2s, background 0.2s;
      white-space: nowrap;
    }
    .nav-left .nav-link, .nav-right .nav-link {
      flex-direction: column; gap: 3px;
      padding: 10px 8px; border-radius: 16px;
      font-size: 9px; text-align: center;
      writing-mode: horizontal-tb;
    }
    .nav-link .link-icon {
      font-size: 15px; line-height: 1;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .nav-left .nav-link .link-icon,
    .nav-right .nav-link .link-icon { font-size: 18px; }

    .nav-link:hover { color: var(--nav-indigo); background: rgba(99,102,241,0.08); }
    .nav-link:hover .link-icon { transform: scale(1.25) rotate(-8deg); }

    .nav-link.active {
      color: white;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 60%, #0ea5e9 100%);
      box-shadow: 0 4px 16px rgba(79,70,229,0.35);
    }
    .nav-link.active .link-icon { transform: scale(1.1); }

    /* Active dot for side docks */
    .nav-link.active::after {
      content: '';
      position: absolute; right: -8px; top: 50%; transform: translateY(-50%);
      width: 4px; height: 4px; border-radius: 50%;
      background: var(--nav-indigo);
    }
    .nav-left .nav-link.active::after { right: auto; bottom: -6px; top: auto; left: 50%; transform: translateX(-50%) translateY(0); }
    .nav-right .nav-link.active::after { right: auto; bottom: -6px; top: auto; left: 50%; transform: translateX(-50%) translateY(0); }

    /* ─── Auth buttons ─── */
    .btn-ghost {
      display: flex; align-items: center; gap: 5px;
      padding: 7px 14px; border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 600;
      color: #ef4444; background: transparent; border: none; cursor: pointer;
      transition: background 0.2s, color 0.2s;
      white-space: nowrap;
    }
    .nav-left .btn-ghost, .nav-right .btn-ghost {
      flex-direction: column; gap: 2px; font-size: 9px;
      padding: 10px 8px; border-radius: 16px;
    }
    .btn-ghost:hover { background: rgba(239,68,68,0.1); }

    .btn-cta {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 18px; border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 700;
      color: white; border: none; cursor: pointer;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 60%, #0ea5e9 100%);
      box-shadow: 0 4px 16px rgba(79,70,229,0.35);
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
      white-space: nowrap;
    }
    .nav-left .btn-cta, .nav-right .btn-cta {
      flex-direction: column; gap: 2px; font-size: 9px;
      padding: 10px 8px; border-radius: 16px;
    }
    .btn-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(79,70,229,0.45); }

    /* ─── Dock picker micro-widget ─── */
    .dock-widget {
      position: relative;
      display: flex; align-items: center;
    }
    .nav-left .dock-widget, .nav-right .dock-widget {
      flex-direction: column;
    }
    .dock-trigger {
      width: 30px; height: 30px; border-radius: 10px;
      background: rgba(99,102,241,0.1);
      border: 1.5px solid rgba(99,102,241,0.2);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      font-size: 12px; color: var(--nav-indigo);
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
      margin-left: 4px;
    }
    .nav-left .dock-trigger, .nav-right .dock-trigger { margin-left: 0; margin-top: 4px; }
    .dock-trigger:hover { background: rgba(99,102,241,0.18); transform: scale(1.1); }

    .dock-picker {
      position: absolute;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(20px);
      border: 1.5px solid var(--nav-border);
      border-radius: 16px;
      padding: 8px;
      box-shadow: 0 12px 40px rgba(79,70,229,0.2);
      display: flex; flex-direction: column; gap: 4px;
      animation: popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
      z-index: 10000;
    }
    /* Placement: below for top dock, right for left dock, left for right dock */
    .nav-top .dock-picker    { top: calc(100% + 8px); right: 0; }
    .nav-left .dock-picker   { left: calc(100% + 8px); top: 0; }
    .nav-right .dock-picker  { right: calc(100% + 8px); top: 0; }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.85); }
      to   { opacity: 1; transform: scale(1); }
    }

    .dock-option {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 12px; border-radius: 10px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px; font-weight: 600; color: #475569;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
      border: none; background: transparent;
    }
    .dock-option:hover { background: rgba(99,102,241,0.08); color: var(--nav-indigo); }
    .dock-option.selected {
      background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(14,165,233,0.08));
      color: var(--nav-indigo);
    }
    .dock-option-icon {
      width: 26px; height: 26px; border-radius: 8px;
      background: rgba(99,102,241,0.1);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
    }
    .dock-option.selected .dock-option-icon {
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      color: white;
    }

    /* ─── Hamburger (mobile, top only) ─── */
    .hamburger {
      display: none;
      width: 34px; height: 34px; border-radius: 10px;
      background: rgba(99,102,241,0.08); border: 1.5px solid rgba(99,102,241,0.15);
      flex-direction: column; align-items: center; justify-content: center; gap: 5px;
      cursor: pointer; transition: background 0.2s;
      margin-left: 6px;
    }
    .hamburger:hover { background: rgba(99,102,241,0.16); }
    .ham-line {
      width: 16px; height: 1.5px; border-radius: 2px;
      background: var(--nav-indigo);
      transition: transform 0.25s, opacity 0.25s, width 0.25s;
    }
    .hamburger.open .ham-line:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
    .hamburger.open .ham-line:nth-child(2) { opacity: 0; width: 0; }
    .hamburger.open .ham-line:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

    /* ─── Mobile dropdown (top dock only) ─── */
    .mobile-menu {
      position: absolute; top: calc(100% + 8px); left: 0; right: 0;
      background: rgba(255,255,255,0.96);
      backdrop-filter: blur(24px);
      border: 1.5px solid var(--nav-border);
      border-radius: 22px;
      padding: 12px;
      box-shadow: 0 16px 50px rgba(79,70,229,0.2);
      display: flex; flex-direction: column; gap: 4px;
      animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
      z-index: 10000;
    }
    .mobile-nav-link {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border-radius: 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px; font-weight: 600; color: #475569;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .mobile-nav-link:hover { background: rgba(99,102,241,0.07); color: var(--nav-indigo); }
    .mobile-nav-link.active {
      background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(14,165,233,0.07));
      color: var(--nav-indigo);
    }
    .mobile-icon {
      width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
      background: rgba(99,102,241,0.08);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    .mobile-nav-link.active .mobile-icon {
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      color: white;
    }
    .mobile-divider { height: 1px; background: rgba(99,102,241,0.1); margin: 4px 0; }
    .mobile-logout {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px; border-radius: 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px; font-weight: 600; color: #ef4444;
      border: none; background: transparent; cursor: pointer;
      transition: background 0.15s;
      width: 100%;
    }
    .mobile-logout:hover { background: rgba(239,68,68,0.07); }
    .mobile-logout .mobile-icon { background: rgba(239,68,68,0.08); }

    /* ─── Responsive: hide desktop links, show hamburger ─── */
    @media (max-width: 680px) {
      .nav-top .desktop-links { display: none !important; }
      .nav-top .hamburger { display: flex !important; }
    }

    /* ─── Tooltip for side docks ─── */
    .nav-link[data-tip] { overflow: visible; }
    .nav-left .nav-link .tip,
    .nav-right .nav-link .tip {
      position: absolute;
      background: rgba(30,27,75,0.92);
      color: white; font-family: 'DM Sans', sans-serif;
      font-size: 11px; font-weight: 600;
      padding: 4px 10px; border-radius: 8px;
      white-space: nowrap; pointer-events: none;
      opacity: 0; transition: opacity 0.2s, transform 0.2s;
      transform: translateX(8px);
      top: 50%; translate: 0 -50%;
      z-index: 100;
    }
    .nav-left .nav-link .tip  { left: calc(100% + 10px); transform: translateX(0) translateY(-50%); }
    .nav-right .nav-link .tip { right: calc(100% + 10px); left: auto; transform: translateX(0) translateY(-50%); }
    .nav-left .nav-link:hover .tip,
    .nav-right .nav-link:hover .tip { opacity: 1; }
  `;

  // ── 3D tilt transform (top dock only) ────────────────────────────────────
  const tiltStyle = dock === 'top'
    ? { transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }
    : {};

  // ── Dock class ────────────────────────────────────────────────────────────
  const dockClass = `nav-${dock}${scrolled && dock === 'top' ? ' scrolled' : ''}`;

  // ── Render nav items (shared between desktop + mobile) ───────────────────
  const renderDesktopLinks = () => (
    <div className="desktop-links" style={{ display: 'flex', alignItems: dock === 'top' ? 'center' : 'stretch', flexDirection: dock === 'top' ? 'row' : 'column', gap: 0 }}>
      {isAuthenticated ? (
        <>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link${isActive(item.to) ? ' active' : ''}`}
              onMouseEnter={() => setHovered(item.to)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {/* Tooltip for side docks */}
              <span className="tip">{item.fullLabel}</span>
            </Link>
          ))}

          <div className={dock === 'top' ? 'nav-divider-v' : 'nav-divider-h'} />

          <button className="btn-ghost" onClick={handleLogout}>
            <span style={{ fontSize: dock === 'top' ? 14 : 18 }}>⎋</span>
            <span className="tip">Logout</span>
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className={`nav-link${isActive('/login') ? ' active' : ''}`}
          >
            <span className="link-icon">◎</span>
            <span>Login</span>
          </Link>
          <Link to="/signup" className="btn-cta">
            <span style={{ fontSize: 13 }}>✦</span>
            <span>Start</span>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <>
      <style>{css}</style>

      <nav ref={navRef} className={dockClass} aria-label="Main navigation">
        <div
          className="nav-pill"
          style={tiltStyle}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-gem">S</div>
            <span className="logo-text">StudyAI</span>
          </Link>

          {/* Vertical divider (top dock only) */}
          {dock === 'top' && <div className="nav-divider-v" />}
          {dock !== 'top' && <div className="nav-divider-h" />}

          {/* Desktop nav links */}
          {renderDesktopLinks()}

          {/* Dock position micro-widget */}
          <div className="dock-widget">
            <button
              className="dock-trigger"
              onClick={() => setDockPickerOpen(!dockPickerOpen)}
              title="Change navigation position"
              aria-label="Change navigation dock position"
            >
              {DOCK_ICONS[dock]}
            </button>

            {dockPickerOpen && (
              <div className="dock-picker">
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 4px 6px' }}>
                  Dock position
                </div>
                {DOCK_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    className={`dock-option${dock === pos ? ' selected' : ''}`}
                    onClick={() => { setDock(pos); setDockPickerOpen(false); setMenuOpen(false); }}
                  >
                    <span className="dock-option-icon">{DOCK_ICONS[pos]}</span>
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hamburger (mobile, top dock only) */}
          {dock === 'top' && (
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="ham-line" />
              <div className="ham-line" />
              <div className="ham-line" />
            </button>
          )}

          {/* Mobile dropdown */}
          {dock === 'top' && menuOpen && (
            <div className="mobile-menu">
              {isAuthenticated ? (
                <>
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`mobile-nav-link${isActive(item.to) ? ' active' : ''}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="mobile-icon">{item.icon}</span>
                      {item.fullLabel}
                    </Link>
                  ))}
                  <div className="mobile-divider" />
                  <button className="mobile-logout" onClick={handleLogout}>
                    <span className="mobile-icon">⎋</span>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                    <span className="mobile-icon">◎</span>
                    Login
                  </Link>
                  <Link to="/signup" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                    <span className="mobile-icon" style={{ background: 'linear-gradient(135deg,#4f46e5,#0ea5e9)', color: 'white' }}>✦</span>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── Body padding so content doesn't hide behind the nav ── */}
      <style>{`
        body {
          ${dock === 'top'    ? 'padding-top: 72px !important; padding-left: 0 !important; padding-right: 0 !important;' : ''}
          ${dock === 'left'   ? 'padding-left: 80px !important; padding-top: 0 !important;'  : ''}
          ${dock === 'right'  ? 'padding-right: 80px !important; padding-top: 0 !important;' : ''}
        }
      `}</style>
    </>
  );
}
