'use client';
// BYYU AI v2 — Main UI
// © Abiyyu Rafa Ramadhan

import {
  useState, useRef, useEffect, useCallback,
  createContext, useContext,
  type KeyboardEvent, type FormEvent, type ReactNode,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm     from 'remark-gfm';
import remarkMath    from 'remark-math';
import rehypeKatex   from 'rehype-katex';
import {
  Send, Plus, MessageSquare, Trash2, Menu,
  User, X, Github, Sparkles, ChevronRight,
  Sun, Moon, Zap, Search, Copy, Check,
} from 'lucide-react';

// ══════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════
interface Msg {
  id:       string;
  role:     'user' | 'assistant';
  content:  string;
  ts:       number;
  proMode?: boolean;
  searched?: boolean;
}

interface Conv {
  id:       string;
  title:    string;
  messages: Msg[];
  ts:       number;
}

interface SearchResult {
  title:   string;
  snippet: string;
  url:     string;
  source:  string;
}

// ══════════════════════════════════════════
// THEME CONTEXT
// ══════════════════════════════════════════
const ThemeCtx = createContext<{
  theme:       'light' | 'dark';
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved  = localStorage.getItem('byyu-theme') as 'light' | 'dark' | null;
    const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const init   = saved ?? prefer;
    setTheme(init);
    document.documentElement.setAttribute('data-theme', init);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('byyu-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ theme, toggleTheme }}>{children}</ThemeCtx.Provider>;
}

// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
const uid    = () => Math.random().toString(36).slice(2, 11);
const trunc  = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + '…' : s;
const fmtTime = (ts: number) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));

const blockCopy = (e: React.ClipboardEvent) => { e.preventDefault(); e.stopPropagation(); };

const STARTERS = [
  'Siapa yang membuatmu?',
  'Selesaikan: $\\int_0^1 x^2\\,dx$',
  'Debug kode JavaScript ini',
  'Apa itu Machine Learning?',
];

// ══════════════════════════════════════════
// CODE BLOCK (dengan copy button)
// ══════════════════════════════════════════
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  };

  return (
    <div className="code-block" onCopy={e => e.stopPropagation()}>
      <div className="code-head">
        <span className="code-lang">{language || 'code'}</span>
        <button className="copy-btn selectable" onClick={handleCopy}>
          {copied
            ? <><Check size={11} />Copied!</>
            : <><Copy size={11} />Copy</>
          }
        </button>
      </div>
      <div className="code-body selectable">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// AI CONTENT (Markdown + Math + Code)
// ══════════════════════════════════════════
type CodeComponentProps = {
  inline?:    boolean;
  className?: string;
  children?:  React.ReactNode;
};

function AIContent({ content }: { content: string }) {
  return (
    <div className="ai-prose selectable">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children }: CodeComponentProps) {
            const lang = /language-(\w+)/.exec(className || '')?.[1] ?? '';
            const code = String(children ?? '').replace(/\n$/, '');
            if (!inline && code.includes('\n')) {
              return <CodeBlock language={lang} code={code} />;
            }
            return <code className={className}>{children}</code>;
          },
          a({ href, children }) {
            return (
              <a href={href ?? '#'} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ══════════════════════════════════════════
// LOADING DOTS
// ══════════════════════════════════════════
function LoadingDots({ proMode, searching }: { proMode: boolean; searching: boolean }) {
  const label = searching
    ? '🔍 Mencari di web...'
    : proMode
    ? '🧠 Berpikir mendalam...'
    : undefined;

  return (
    <div className="dots-row">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
      {label && <span className="thinking-label">{label}</span>}
    </div>
  );
}

// ══════════════════════════════════════════
// MESSAGE BLOCK
// ══════════════════════════════════════════
function MessageBlock({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="user-wrap" onCopy={blockCopy}>
        <div className="user-inner">
          <div className="user-bubble">
            <p className="user-text selectable">{msg.content}</p>
          </div>
          <p className="msg-time">{fmtTime(msg.ts)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-wrap">
      <div className="ai-avatar" onCopy={blockCopy}>B</div>
      <div className="ai-body">
        <div className="ai-name-row" onCopy={blockCopy}>
          <span className="ai-name">BYYU AI</span>
          <span className="ai-time">{fmtTime(msg.ts)}</span>
          {msg.proMode   && <span className="ai-tag pro">⚡ Pro</span>}
          {msg.searched  && <span className="ai-tag search">🔍 Web</span>}
        </div>
        <AIContent content={msg.content} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// ABOUT MODAL
// ══════════════════════════════════════════
function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose} onCopy={blockCopy}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <X size={17} />
        </button>

        <div className="modal-avatar">👨‍💻</div>
        <h2>Abiyyu Rafa Ramadhan</h2>
        <p className="modal-role">Full-stack Developer · Pelajar SMKN 1 Purwakarta</p>

        <p className="modal-bio">
          Pelajar muda berbakat dari jurusan Teknik Elektronika Industri, lahir 2008.
          Memiliki passion besar dalam dunia teknologi—khususnya pengembangan web,
          AI engineering, dan sistem digital inovatif.
        </p>

        <div className="modal-info">
          {[
            { l:'Sekolah',      v:'SMKN 1 Purwakarta — Teknik Elektronika Industri' },
            { l:'Keahlian',     v:'Next.js, React, TypeScript, Node.js, AI/LLM' },
            { l:'Proyek',       v:'BYYU AI, QuizGenius, ElectroVerse, ChubbyGenius' },
            { l:'Cita-cita',    v:'Teknik Industri Universitas Indonesia' },
          ].map(item => (
            <div key={item.l} className="info-row">
              <span className="info-lbl">{item.l}</span>
              <span className="info-val">{item.v}</span>
            </div>
          ))}
        </div>

        <div className="chips">
          {['Next.js','React','TypeScript','Node.js','Tailwind','Prisma','PostgreSQL','AI/LLM','UI/UX','Railway'].map(s => (
            <span key={s} className="chip">{s}</span>
          ))}
        </div>

        <div className="modal-btns">
          <a
            href="https://github.com/abiyyurafa"
            target="_blank"
            rel="noopener noreferrer"
            className="modal-btn outline"
          >
            <Github size={14} /> GitHub
          </a>
          <button className="modal-btn filled" onClick={onClose}>
            <Sparkles size={14} /> Kembali Chat
          </button>
        </div>
        <p className="modal-copy">© 2026 BYYU AI · Abiyyu Rafa Ramadhan</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════
function ChatPage() {
  const { theme, toggleTheme } = useContext(ThemeCtx);

  const [convs,       setConvs]       = useState<Conv[]>([]);
  const [activeId,    setActiveId]    = useState<string | null>(null);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [searching,   setSearching]   = useState(false);
  const [proMode,     setProMode]     = useState(false);
  const [searchMode,  setSearchMode]  = useState(false);
  const [showAbout,   setShowAbout]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const taRef  = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const activeConv = convs.find(c => c.id === activeId) ?? null;
  const messages   = activeConv?.messages ?? [];

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // New conversation
  const newConv = useCallback(() => {
    const id   = uid();
    const conv: Conv = { id, title: 'Percakapan Baru', messages: [], ts: Date.now() };
    setConvs(prev => [conv, ...prev]);
    setActiveId(id);
    setInput('');
    setError(null);
    setSidebarOpen(false);
    setTimeout(() => taRef.current?.focus(), 80);
  }, []);

  useEffect(() => { newConv(); }, []); // eslint-disable-line

  // Delete conversation
  const delConv = useCallback((id: string) => {
    setConvs(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setTimeout(newConv, 40);
  }, [activeId, newConv]);

  // Send message
  const send = useCallback(async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    setError(null);
    setInput('');

    // Ensure active conversation
    let convId = activeId;
    if (!convId) {
      const id = uid();
      setConvs(prev => [{ id, title: trunc(content, 40), messages: [], ts: Date.now() }, ...prev]);
      setActiveId(id);
      convId = id;
    }

    const userMsg: Msg = { id: uid(), role: 'user', content, ts: Date.now() };

    setConvs(prev =>
      prev.map(c => c.id !== convId ? c : {
        ...c,
        title:    c.messages.length === 0 ? trunc(content, 40) : c.title,
        messages: [...c.messages, userMsg],
      })
    );

    setLoading(true);

    // Web search if enabled
    let searchResults: SearchResult[] | null = null;
    if (searchMode) {
      setSearching(true);
      try {
        const r = await fetch('/api/search', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ query: content }),
        });
        if (r.ok) {
          const d = await r.json();
          searchResults = d.results ?? null;
        }
      } catch { /* silently ignore */ }
      setSearching(false);
    }

    // Build history
    const currentMsgs = [
      ...(convs.find(c => c.id === convId)?.messages ?? []),
      userMsg,
    ];

    try {
      const r = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: currentMsgs.map(m => ({ role: m.role, content: m.content })),
          proMode,
          searchResults,
        }),
      });

      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error ?? `HTTP ${r.status}`);
      }

      const data = await r.json();
      const aiMsg: Msg = {
        id:       uid(),
        role:     'assistant',
        content:  data.message ?? '',
        ts:       Date.now(),
        proMode,
        searched: !!searchResults?.length,
      };

      setConvs(prev =>
        prev.map(c => c.id !== convId ? c : {
          ...c, messages: [...c.messages, aiMsg],
        })
      );

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      setSearching(false);
      setTimeout(() => taRef.current?.focus(), 80);
    }
  }, [activeId, loading, convs, proMode, searchMode]);

  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };
  const onKey    = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="app" onCopy={blockCopy}>

      {/* Mobile overlay */}
      <div
        className={`mob-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <div className="logo-row">
            <div className="logo-b">B</div>
            <span className="logo-name">BYYU AI</span>
          </div>
          <button className="icon-btn" onClick={newConv} title="Chat baru">
            <Plus size={16} />
          </button>
        </div>

        <div className="sidebar-body">
          {convs.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 24, padding: '0 12px' }}>
              Belum ada percakapan
            </p>
          ) : convs.map(c => (
            <div
              key={c.id}
              className={`conv-item ${activeId === c.id ? 'active' : ''}`}
              onClick={() => { setActiveId(c.id); setSidebarOpen(false); }}
            >
              <MessageSquare size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <span className="conv-title">{c.title}</span>
              <button
                className="conv-del"
                onClick={e => { e.stopPropagation(); delConv(c.id); }}
                title="Hapus"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-foot">
          <button className="about-btn" onClick={() => setShowAbout(true)}>
            <User size={14} />
            About Developer
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-btn" onClick={() => setSidebarOpen(true)}
              style={{ display: 'flex' }}>
              <Menu size={18} />
            </button>
            <span className="topbar-title">{activeConv?.title ?? 'BYYU AI'}</span>
          </div>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={toggleTheme}
              title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}>
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button className="topbar-about" onClick={() => setShowAbout(true)}>
              <User size={13} />
              <span style={{ display: 'none', fontSize: 12 }}>About</span>
            </button>
          </div>
        </header>

        {/* Chat scroll */}
        <div className="chat-scroll">
          <div className="chat-inner">

            {/* Welcome */}
            {isEmpty && (
              <div className="welcome" onCopy={blockCopy}>
                <div className="welcome-icon">B</div>
                <h1>Halo, saya BYYU AI</h1>
                <p className="welcome-sub">
                  Asisten AI canggih — matematika, koding, penelitian, dan lebih.
                  {proMode && ' ⚡ Mode Pro aktif.'}{searchMode && ' 🔍 Pencarian web aktif.'}
                </p>
                <div className="starters">
                  {STARTERS.map(s => (
                    <button key={s} className="starter" onClick={() => send(s)}>
                      <span>{s}</span>
                      <ChevronRight size={13} className="arrow" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map(msg => (
              <MessageBlock key={msg.id} msg={msg} />
            ))}

            {/* Loading */}
            {loading && (
              <div className="status-wrap">
                <div className="ai-avatar" onCopy={blockCopy}>B</div>
                <div className="ai-body">
                  <div className="ai-name-row" onCopy={blockCopy}>
                    <span className="ai-name">BYYU AI</span>
                  </div>
                  <LoadingDots proMode={proMode} searching={searching} />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="status-wrap" onCopy={blockCopy}>
                <div style={{ width:33, height:33, borderRadius:'50%', background:'color-mix(in srgb, #ef4444 12%, transparent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'#ef4444', fontSize:13, border:'1px solid color-mix(in srgb, #ef4444 25%, transparent)' }}>!</div>
                <div className="error-bubble">
                  <p className="error-text">{error}</p>
                  <button className="error-close" onClick={() => setError(null)}>Tutup</button>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="input-area" onCopy={blockCopy}>
          <div className="input-outer">
            <form onSubmit={onSubmit}>
              <div className="input-box">
                <textarea
                  ref={taRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={
                    proMode && searchMode ? 'Mode Pro + Web aktif — tanya apa saja...' :
                    proMode              ? 'Mode Pro aktif — untuk soal kompleks...' :
                    searchMode           ? 'Pencarian web aktif — tanya fakta terkini...' :
                    'Kirim pesan ke BYYU AI...'
                  }
                  rows={1}
                  className="chat-ta"
                  disabled={loading}
                />

                <div className="input-foot">
                  {/* Mode toggles */}
                  <div className="modes">
                    <button
                      type="button"
                      className={`mode-toggle ${proMode ? 'active pro' : ''}`}
                      onClick={() => setProMode(p => !p)}
                      title="Mode Pro: penalaran mendalam"
                    >
                      <Zap size={12} />
                      <span>Pro</span>
                    </button>
                    <button
                      type="button"
 className={`mode-toggle ${searchMode ? 'active search' : ''}`}
                      onClick={() => setSearchMode(p => !p)}
                      title="Cari web untuk info terkini"
                    >
                      <Search size={12} />
                      <span>Web</span>
                    </button>
                  </div>

                  {/* Send */}
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="send-btn"
                    aria-label="Kirim"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </form>

            <p className="footer-credit">
              © 2026 BYYU AI ·{' '}
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

// ══════════════════════════════════════════
// EXPORT (with ThemeProvider wrapper)
// ══════════════════════════════════════════
export default function Page() {
  return (
    <ThemeProvider>
      <ChatPage />
    </ThemeProvider>
  );
}
