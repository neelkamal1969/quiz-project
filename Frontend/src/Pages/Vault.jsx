import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getToken, getUser } from '../lib/auth';
import { ENDPOINTS, ROUTES } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import GlassCard from '../components/ui/GlassCard';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Icon3D from '../components/ui/Icon3D';
import { randomQuote } from '../lib/quotes';

const ctaBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '12px 20px', borderRadius: 'var(--radius-md)', fontWeight: 'var(--weight-bold)',
  fontSize: 'var(--text-sm)', border: 'none', cursor: 'pointer',
  transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast)',
};
const ctaPrimary = { ...ctaBase, background: 'var(--grad-primary)', color: '#fff', boxShadow: 'var(--shadow-glow)' };
const ctaGhost = { ...ctaBase, background: 'var(--glass-bg)', color: 'var(--text-primary)', border: '1.5px solid var(--glass-border)' };
const controlStyle = {
  background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', color: 'var(--text-primary)',
  borderRadius: 'var(--radius-full)', padding: '11px 18px', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-sans)',
};

export default function Vault() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [practiceCards, setPracticeCards] = useState([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [deletingId, setDeletingId] = useState(null);
  const [motivationalQuote, setMotivationalQuote] = useState(() => randomQuote());
  const [deckFilter, setDeckFilter] = useState('__all__');

  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const userData = getUser() || {};
  const token = getToken();

  useEffect(() => {
    if (!userData?.id || !token) {
      navigate(ROUTES.LOGIN);
      return;
    }
    fetchVault();
  }, []);

  // Rotate the motivational quote every minute while the page is open.
  useEffect(() => {
    const id = setInterval(() => setMotivationalQuote(randomQuote()), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchVault = async () => {
    try {
      const data = await api.get(ENDPOINTS.VAULT(userData.id));
      setCards(data);
    } catch (err) {
      console.error('Vault fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (e, id) => {
    e.stopPropagation();
    const ok = await confirm({ title: 'Remove card?', message: 'This permanently removes the card from your vault.', confirmText: 'Remove', tone: 'danger' });
    if (!ok) return;
    setDeletingId(id);
    try {
      await api.del(ENDPOINTS.VAULT_CARD(id));
      setCards(cards.filter((card) => card.id !== id));
      if (expandedCard?.id === id) setExpandedCard(null);
      toast.success('Card removed from vault');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  // Local keyword analyzer → tag cloud
  const getTagCloud = () => {
    if (!cards.length) return [];
    const text = cards.map((c) => c.question.toLowerCase()).join(' ');
    const words = text.split(/\s+/).filter((w) => w.length > 3 && !['the', 'and', 'for', 'you', 'this', 'that', 'with', 'from'].includes(w));
    const freq = {};
    words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word, count]) => ({ word, size: Math.max(14, 14 + count * 6) }));
  };

  const decks = [...new Set(cards.map((c) => c.deck).filter(Boolean))];

  const filteredCards = cards
    .filter((card) =>
      (deckFilter === '__all__' || card.deck === deckFilter) &&
      (card.question.toLowerCase().includes(searchTerm.toLowerCase()) || card.answer.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'az') return a.question.localeCompare(b.question);
      return 0;
    });

  const exportToCSV = () => {
    if (!cards.length) return toast.error('Vault is empty.');
    const headers = ['Question', 'Answer', 'Saved Date'];
    const rows = cards.map((card) => [
      `"${card.question.replace(/"/g, '""')}"`,
      `"${card.answer.replace(/"/g, '""')}"`,
      new Date(card.created_at).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyAI-Vault-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (!cards.length) return toast.error('Vault is empty.');
    const content = cards.map((card) => `
      <div style="border:1px solid #e2e8f0; padding:20px; margin-bottom:25px; border-radius:12px;">
        <h3 style="color:#1e40af;">${card.question}</h3>
        <p style="color:#334155;">${card.answer}</p>
        <small>Saved: ${new Date(card.created_at).toLocaleDateString('en-IN')}</small>
      </div>`).join('');
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>StudyAI Vault</title><style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.6;}</style></head><body><h1 style="text-align:center;color:#1e40af;">Your Study Vault</h1><p style="text-align:center;">Exported ${new Date().toLocaleString('en-IN')}</p>${content}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // Anki-friendly export: tab-separated Front<TAB>Back (Anki's default import format).
  const exportToAnki = () => {
    if (!cards.length) return toast.error('Vault is empty.');
    const clean = (s) => (s || '').replace(/\t/g, ' ').replace(/\r?\n/g, '<br>');
    const tsv = cards.map((c) => `${clean(c.question)}\t${clean(c.answer)}`).join('\n');
    const blob = new Blob([tsv], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyAI-Anki-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  // Assign / clear a card's deck label.
  const setCardDeck = async (id, value) => {
    try {
      const res = await api.patch(ENDPOINTS.VAULT_CARD(id), { deck: value });
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, deck: res.deck } : c)));
      setExpandedCard((c) => (c && c.id === id ? { ...c, deck: res.deck } : c));
      toast.success(res.deck ? `Moved to “${res.deck}”` : 'Removed from deck');
    } catch {
      toast.error('Could not update deck');
    }
  };

  const startPractice = () => {
    if (!filteredCards.length) return toast.error('No cards to practice yet.');
    setPracticeCards([...filteredCards]);
    setPracticeIndex(0);
    setIsFlipped(false);
  };
  const nextPractice = () => {
    if (practiceIndex < practiceCards.length - 1) {
      setPracticeIndex(practiceIndex + 1);
      setIsFlipped(false);
    } else {
      setPracticeCards([]);
    }
  };
  const toggleFlip = () => setIsFlipped(!isFlipped);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size={40} color="var(--accent-indigo)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Unlocking your vault…</p>
        </div>
      </div>
    );
  }

  const avgWords = Math.round(cards.reduce((acc, c) => acc + c.answer.split(' ').length, 0) / (cards.length || 1));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        {/* Header + controls */}
        <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-5)', marginBottom: 'var(--space-10)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-black)', letterSpacing: '-1px', margin: 0 }}>Your Study Vault</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0' }}>{cards.length} saved Q&amp;A cards · your private knowledge base</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: 220, flex: 1 }}>
              <input
                type="text"
                aria-label="Search saved cards"
                placeholder="Search questions or answers…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...controlStyle, width: '100%', paddingLeft: 42 }}
              />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><Icon3D code="🔎" size={16} /></span>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...controlStyle, cursor: 'pointer' }}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A–Z</option>
            </select>
            {decks.length > 0 && (
              <select value={deckFilter} onChange={(e) => setDeckFilter(e.target.value)} style={{ ...controlStyle, cursor: 'pointer' }}>
                <option value="__all__">All decks</option>
                {decks.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <button onClick={startPractice} style={ctaPrimary}><Icon3D code="🧠" size={18} /> Practice Mode →</button>
            <button onClick={exportToCSV} style={ctaGhost}><Icon3D code="📥" size={18} /> CSV</button>
            <button onClick={exportToPDF} style={ctaGhost}><Icon3D code="📄" size={18} /> PDF</button>
            <button onClick={exportToAnki} style={ctaGhost}><Icon3D code="🃏" size={18} /> Anki</button>
          </div>
        </header>

        {/* Smart analyzer */}
        <GlassCard style={{ marginBottom: 'var(--space-12)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', margin: 0, color: 'var(--text-primary)' }}>Smart Vault Analyzer</h2>
            {motivationalQuote && (
              <div style={{ maxWidth: 320, textAlign: 'right', fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '2px solid rgba(var(--accent-rgb),0.4)', paddingLeft: 'var(--space-4)' }}>
                “{motivationalQuote.text}”
                <span style={{ display: 'block', fontStyle: 'normal', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>— {motivationalQuote.author}</span>
              </div>
            )}
          </div>

          {/* Tag cloud */}
          <div style={{ marginBottom: 'var(--space-10)' }}>
            <h3 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', fontWeight: 700 }}>Top topics in your vault</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
              {getTagCloud().map((tag, i) => (
                <span key={i} style={{ padding: '6px 18px', background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid rgba(var(--accent-rgb),0.3)', color: 'var(--accent-light)', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: `${tag.size}px`, lineHeight: 1.2 }}>
                  {tag.word}
                </span>
              ))}
              {!getTagCloud().length && <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Save some cards to see your topics.</span>}
            </div>
          </div>

          {/* Quick insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-5)', textAlign: 'center' }}>
            {[
              [cards.length, 'Total cards'],
              [avgWords, 'Avg words / answer'],
              [filteredCards.length, 'Matches filter'],
            ].map(([val, label], i) => (
              <div key={i} style={{ background: 'var(--glass-bg-light)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                <div className="ds-holo-text" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-black)' }}>{val}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>{label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Card grid */}
        {filteredCards.length === 0 ? (
          <GlassCard>
            <EmptyState icon={<Icon3D code="🔎" size={30} />} title="No matching cards" description="Try a different search, or generate and save new questions." />
          </GlassCard>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
            {filteredCards.map((card) => (
              <GlassCard
                key={card.id}
                onClick={() => setExpandedCard(card)}
                style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge tone="indigo">Q&amp;A</Badge>
                    {card.deck && <Badge tone="default">▦ {card.deck}</Badge>}
                  </div>
                  <button
                    onClick={(e) => deleteCard(e, card.id)}
                    disabled={deletingId === card.id}
                    title="Delete"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Icon3D code="🗑" size={16} />
                  </button>
                </div>
                <h3 style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-lg)', lineHeight: 1.35, margin: 0, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {card.question}
                </h3>
                <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--glass-border)', color: 'var(--accent-light)', fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>View answer</span><span>→</span>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal open={!!expandedCard} onClose={() => setExpandedCard(null)} title="Saved card" maxWidth={620}>
        {expandedCard && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent-light)', marginBottom: 6 }}>Question</div>
              <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', margin: 0 }}>{expandedCard.question}</p>
            </div>
            <div style={{ background: 'var(--glass-bg-light)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: 6 }}>Answer</div>
              <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>{expandedCard.answer}</p>
            </div>
            <div>
              <div style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 6 }}>Deck</div>
              <input
                key={expandedCard.id}
                defaultValue={expandedCard.deck || ''}
                placeholder="e.g. Biology — type a deck name"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setCardDeck(expandedCard.id, e.target.value); } }}
                onBlur={(e) => { if ((e.target.value.trim() || null) !== (expandedCard.deck || null)) setCardDeck(expandedCard.id, e.target.value); }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--glass-bg)', border: '1.5px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', outline: 'none', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '6px 0 0' }}>Press Enter or click away to save · clear to remove from deck</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Interactive flashcard practice */}
      {practiceCards.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)', background: 'rgba(6,9,18,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ textAlign: 'center', color: '#fff', marginBottom: 'var(--space-6)' }}>
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.15em', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>Practice session</span>
              <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xl)', fontWeight: 300 }}>Card {practiceIndex + 1} of {practiceCards.length}</p>
            </div>

            <div onClick={toggleFlip} style={{ position: 'relative', width: '100%', height: 440, cursor: 'pointer', perspective: '1200px' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.7s var(--ease-out)', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                {/* Front */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: 'linear-gradient(145deg, rgba(22,30,54,0.98) 0%, rgba(12,18,36,0.98) 100%)', border: '1.5px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)', textAlign: 'center' }}>
                  <div style={{ textTransform: 'uppercase', color: 'var(--accent-light)', fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: '0.15em', marginBottom: 'var(--space-4)' }}>Question</div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <p style={{ fontSize: 'var(--text-xl)', lineHeight: 1.4, fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{practiceCards[practiceIndex].question}</p>
                  </div>
                  <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: '#94a3b8' }}>Tap card to flip →</div>
                </div>
                {/* Back */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(12,18,36,0.96))', border: '2px solid rgba(52,211,153,0.4)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)', textAlign: 'center' }}>
                  <div style={{ textTransform: 'uppercase', color: '#34d399', fontSize: 'var(--text-xs)', fontWeight: 800, letterSpacing: '0.15em', marginBottom: 'var(--space-4)' }}>Answer</div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <p style={{ fontSize: 'var(--text-lg)', lineHeight: 1.7, color: 'var(--text-primary)', wordBreak: 'break-word' }}>{practiceCards[practiceIndex].answer}</p>
                  </div>
                  <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: '#94a3b8' }}>Tap card to flip back</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)' }}>
              <button onClick={() => { setPracticeCards([]); setIsFlipped(false); }} style={{ padding: '14px 28px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>End practice</button>
              <button onClick={nextPractice} style={{ padding: '14px 28px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--grad-primary)', color: '#fff', cursor: 'pointer', fontWeight: 'var(--weight-bold)', boxShadow: 'var(--shadow-glow)' }}>Next card →</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', padding: 'var(--space-8)' }}>
        © {new Date().getFullYear()} StudyAI · Your vault is 100% private
      </footer>
    </div>
  );
}
