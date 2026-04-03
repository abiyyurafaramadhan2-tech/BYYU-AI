'use client';
// BYYU AI — © Abiyyu Rafa Ramadhan

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type FormEvent,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm     from 'remark-gfm';
import {
  Send, Plus, MessageSquare, User, X,
  Sparkles, Github, Trash2, Menu, ChevronRight,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────
interface Message {
  id:      string;
  role:    'user' | 'assistant';
  content: string;
  ts:      number;
}

interface Conversation {
  id:       string;
  title:    string;
  messages: Message[];
  ts:       number;
}

// ── Helpers ────────────────────────────────────────────────
const uid    = () => Math.random().toString(36).slice(2, 11);
const trunc  = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + '…' : s;
const fmtTime = (ts: number) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));

const STARTERS = [
  'Siapa yang membuatmu?',
  'Jelaskan konsep React Hooks',
  'Bantu saya debug kode TypeScript',
  'Apa itu Large Language Model?',
];

// ── Prevent copy util ──────────────────────────────────────
function blockCopy(e: React.ClipboardEvent) {
  e.preventDefault();
  e.stopPropagation();
}

// ── Loading Dots ───────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="dots-row">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  );
}

// ── About Modal ────────────────────────────────────────────
function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose} onCopy={blockCopy}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <X size={18} />
        </button>

        <div className="modal-avatar-wrap">
          <div className="modal-avatar">👨‍💻</div>
          <p className="modal-name">Abiyyu Rafa Ramadhan</p>
          <p className="modal-role">Full-stack Developer</p>
        </div>

        <p className="modal-bio">
          Developer yang passionate dalam membangun produk digital berkualitas tinggi,
          dari UI elegan hingga backend yang robust dan integrasi AI.
        </p>

        <div className="modal-info-box">
          {[
            { label: 'Keahlian',     value: 'Next.js, React, Node.js, TypeScript' },
            { label: 'Spesialisasi', value: 'Full-stack Web & AI Integration' },
            { label: 'Proyek',       value: 'BYYU AI, QuizGenius, ElectroVerse' },
          ].map(item => (
            <div key={item.label} className="modal-info-row">
              <span className="modal-info-label">{item.label}</span>
              <span className="modal-info-value">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="skill-chips">
          {['Next.js','React','TypeScript','Node.js','Tailwind','Prisma','AI/LLM','UI/UX'].map(s => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
        </div>

        <div className="modal-btns">
          <a
            href="https://github.com/abiyyurafa"
            target="_blank"
            rel="noopener noreferrer"
            className="modal-btn-outline"
          >
            <Github size={14} /> GitHub
          </a>
          <button className="modal-btn-accent" onClick={onClose}>
            <Sparkles size={14} /> Kembali Chat
          </button>
        </div>

        <p className="modal-copy">© 2026 BYYU AI · Abiyyu Rafa Ramadhan</p>
      </div>
    </div>
  );
}

// ── Message Component ──────────────────────────────────────
function MessageBlock({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      /* User: hanya teks bisa diselect */
      <div className="user-msg-wrap" onCopy={blockCopy}>
        <div className="user-bubble">
          <div className="user-bubble-inner">
            {/* selectable: teks prompt bisa dikopi */}
            <p className="user-text selectable">{message.content}</p>
          </div>
          <p className="msg-time">{fmtTime(message.ts)}</p>
        </div>
      </div>
    );
  }

  return (
    /* AI: konten bisa diselect, wrapper tidak */
    <div className="ai-msg-wrap">
      {/* Avatar — tidak bisa dikopi */}
      <div className="ai-avatar" onCopy={blockCopy}>B</div>

      <div className="ai-content">
        {/* Nama & waktu — tidak bisa dikopi */}
        <div className="ai-name-row" onCopy={blockCopy}>
          <span className="ai-name">BYYU AI</span>
          <span className="ai-time">{fmtTime(message.ts)}</span>
        </div>

        {/* Konten jawaban — BISA dikopi */}
        <div className="ai-prose selectable">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ children }) => (
                <pre>{children}</pre>
              ),
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function Page() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId,      setActiveId]      = useState<string | null>(null);
  const [input,         setInput]         = useState('');
  const [isLoading,     setIsLoading]     = useState(false);
  const [showAbout,     setShowAbout]     = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeId) ?? null;
  const messages   = activeConv?.messages ?? [];

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  /* Buat conversation baru */
  const newConversation = useCallback(() => {
    const id = uid();
    const conv: Conversation = { id, title: 'Percakapan Baru', messages: [], ts: Date.now() };
    setConversations(prev => [conv, ...prev]);
    setActiveId(id);
    setInput('');
    setError(null);
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  /* Init */
  useEffect(() => { newConversation(); }, []); // eslint-disable-line

  /* Hapus conversation */
  const deleteConv = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setTimeout(newConversation, 50);
  }, [activeId, newConversation]);

  /* Kirim pesan */
  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text || isLoading) return;

    setError(null);
    setInput('');

    let convId = activeId;
    if (!convId) {
      const id = uid();
      const conv: Conversation = { id, title: trunc(text, 40), messages: [], ts: Date.now() };
      setConversations(prev => [conv, ...prev]);
      setActiveId(id);
      convId = id;
    }

    const userMsg: Message = { id: uid(), role: 'user', content: text, ts: Date.now() };

    setConversations(prev =>
      prev.map(c => c.id !== convId ? c : {
        ...c,
        title:    c.messages.length === 0 ? trunc(text, 40) : c.title,
        messages: [...c.messages, userMsg],
      })
    );

    setIsLoading(true);

    try {
      const history = [
        ...(conversations.find(c => c.id === convId)?.messages ?? []),
        userMsg,
      ];

      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: Message = {
        id:      uid(),
        role:    'assistant',
        content: data.message ?? '',
        ts:      Date.now(),
      };

      setConversations(prev =>
        prev.map(c => c.id !== convId ? c : {
          ...c,
          messages: [...c.messages, aiMsg],
        })
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [activeId, isLoading, conversations]);

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKey    = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const isEmptyChat = messages.length === 0;

  return (
    /* onCopy di root: blokir semua kecuali yang pakai .selectable */
    <div className="app-container" onCopy={blockCopy}>

      {/* ── Sidebar overlay (mobile) ── */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-badge">B</div>
            <span className="logo-text">BYYU AI</span>
          </div>
          <button className="icon-btn" onClick={newConversation} title="Chat baru">
            <Plus size={16} />
          </button>
        </div>

        <div className="sidebar-list">
          {conversations.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 24, padding: '0 16px' }}>
              Belum ada percakapan
            </p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`conv-item ${activeId === conv.id ? 'active' : ''}`}
                onClick={() => { setActiveId(conv.id); setSidebarOpen(false); }}
              >
                <MessageSquare size={13} style={{ flexShrink: 0, color: 'var(--muted)' }} />
                <span className="conv-title">{conv.title}</span>
                <button
                  className="conv-delete"
                  onClick={e => { e.stopPropagation(); deleteConv(conv.id); }}
                  title="Hapus"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button className="about-btn" onClick={() => setShowAbout(true)}>
            <User size={14} />
            About Developer
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">

        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="icon-btn"
              style={{ display: 'none' }}
              id="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <MobileHamburger onClick={() => setSidebarOpen(true)} />
            <span className="topbar-title">{activeConv?.title ?? 'BYYU AI'}</span>
          </div>
          <button className="topbar-about-btn" onClick={() => setShowAbout(true)}>
            <User size={13} />
            About Developer
          </button>
        </header>

        {/* Chat scroll */}
        <div className="chat-scroll">
          <div className="chat-inner">

            {/* Welcome */}
            {isEmptyChat && (
              <div className="welcome-screen" onCopy={blockCopy}>
                <div className="welcome-badge">B</div>
                <h1 className="welcome-title">Halo, saya BYYU AI</h1>
                <p className="welcome-sub">
                  Asisten cerdas yang siap membantu Anda dengan berbagai pertanyaan dan tugas.
                </p>
                <div className="starters-grid">
                  {STARTERS.map(q => (
                    <button
                      key={q}
                      className="starter-btn"
                      onClick={() => sendMessage(q)}
                    >
                      <span style={{ flex: 1 }}>{q}</span>
                      <ChevronRight size={13} className="arrow" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map(msg => (
              <MessageBlock key={msg.id} message={msg} />
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="loading-wrap">
                <div className="ai-avatar">B</div>
                <div className="ai-content">
                  <div className="ai-name-row" onCopy={blockCopy}>
                    <span className="ai-name">BYYU AI</span>
                  </div>
                  <LoadingDots />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error-wrap" onCopy={blockCopy}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ef4444', fontSize: 13 }}>
                  !
                </div>
                <div className="error-bubble">
                  <p className="error-text">{error}</p>
                  <button className="error-close" onClick={() => setError(null)}>Tutup</button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="input-area" onCopy={blockCopy}>
          <div className="input-wrap-outer">
            <form onSubmit={handleSubmit}>
              <div className="input-box">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Kirim pesan ke BYYU AI..."
                  rows={1}
                  className="chat-textarea"
                  disabled={isLoading}
                />
                <div className="input-bottom">
                  <span className="input-hint">Enter kirim · Shift+Enter baris baru</span>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="send-btn"
                    aria-label="Kirim"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </form>
            <p className="footer-credit">
              © 2026 BYYU AI · Built by{' '}
              <button className="footer-link" onClick={() => setShowAbout(true)}>
                Abiyyu Rafa Ramadhan
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* About Modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}

/* Komponen kecil untuk hamburger mobile */
function MobileHamburger({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="icon-btn"
      onClick={onClick}
      style={{ display: 'flex' }}
      id="mobile-hamburger"
    >
      <Menu size={18} />
    </button>
  );
                  }
