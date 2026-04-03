'use client';
// BYYU AI — Main UI
// © Abiyyu Rafa Ramadhan

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
  Send,
  Plus,
  MessageSquare,
  User,
  X,
  Sparkles,
  Github,
  Globe,
  ChevronRight,
  Trash2,
  Menu,
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

// ── Konstanta ─────────────────────────────────────────────
const WELCOME_MESSAGE = `Halo! Saya **BYYU AI**, asisten cerdas yang siap membantu Anda.

Saya dibangun oleh **Abiyyu Rafa Ramadhan**, seorang Full-stack Developer yang passionate dalam dunia teknologi dan AI.

Ada yang bisa saya bantu hari ini? 😊`;

const STARTERS = [
  'Siapa yang membuatmu?',
  'Jelaskan konsep React Hooks',
  'Bantu saya debug kode TypeScript',
  'Apa itu Large Language Model?',
];

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function formatTime(ts: number) {
  return new Intl.DateTimeFormat('id-ID', {
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

// ── Loading dots component ─────────────────────────────────
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <div className="loading-dot" />
      <div className="loading-dot" />
      <div className="loading-dot" />
    </div>
  );
}

// ── About Modal ────────────────────────────────────────────
function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-off-white border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-charcoal hover:bg-hover-bg transition-colors"
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 border-2 border-accent/30 flex items-center justify-center mb-4 text-3xl">
            👨‍💻
          </div>
          <h2 className="text-xl font-semibold text-charcoal font-serif">
            Abiyyu Rafa Ramadhan
          </h2>
          <p className="text-muted text-sm mt-1 font-sans">Full-stack Developer</p>
        </div>

        {/* Bio */}
        <div className="space-y-3 text-sm text-charcoal/80 font-sans leading-relaxed mb-6">
          <p>
            Seorang developer yang passionate dalam membangun produk digital
            berkualitas tinggi, dari UI yang elegan hingga backend yang robust.
          </p>
          <div className="bg-hover-bg rounded-xl p-4 space-y-2">
            {[
              { label: 'Keahlian',  value: 'Next.js, React, Node.js, TypeScript'  },
              { label: 'Spesialisasi', value: 'Full-stack Web & AI Integration'   },
              { label: 'Proyek',    value: 'BYYU AI, QuizGenius, ElectroVerse'     },
            ].map(item => (
              <div key={item.label} className="flex gap-3">
                <span className="text-muted font-medium w-24 shrink-0">{item.label}</span>
                <span className="text-charcoal">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['Next.js','React','TypeScript','Node.js','Tailwind','Prisma','AI/LLM','UI/UX'].map(s => (
            <span
              key={s}
              className="px-2.5 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full border border-accent/20"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3">
          <a
            href="https://github.com/abiyyurafa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-charcoal hover:bg-hover-bg transition-colors"
          >
            <Github size={15} /> GitHub
          </a>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Sparkles size={15} /> Kembali Chat
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-4">
          © 2026 BYYU AI by Abiyyu Rafa Ramadhan
        </p>
      </div>
    </div>
  );
}

// ── Message Block ──────────────────────────────────────────
function MessageBlock({
  message,
  isLatest,
}: {
  message:  Message;
  isLatest: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`group animate-fade-in ${isLatest ? 'animate-slide-up' : ''}`}
    >
      {isUser ? (
        /* User message */
        <div className="flex justify-end mb-6">
          <div className="max-w-[80%]">
            <div className="bg-hover-bg border border-border rounded-2xl rounded-tr-sm px-5 py-3.5">
              <p className="text-charcoal font-sans text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
            <p className="text-[11px] text-muted mt-1.5 text-right font-sans">
              {formatTime(message.ts)}
            </p>
          </div>
        </div>
      ) : (
        /* AI message */
        <div className="flex gap-3 mb-8">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/60 flex items-center justify-center shrink-0 mt-0.5 text-sm">
            B
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-sm font-semibold text-charcoal font-sans">BYYU AI</span>
              <span className="text-[11px] text-muted font-sans">
                {formatTime(message.ts)}
              </span>
            </div>

            <div className="ai-prose font-serif text-charcoal text-[0.9375rem] leading-[1.75]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom code block rendering
                  pre: ({ children }) => (
                    <div className="relative group/code">
                      <pre className="bg-charcoal text-[#f0ede8] p-4 rounded-xl overflow-x-auto text-[0.8125rem] leading-relaxed my-3">
                        {children}
                      </pre>
                    </div>
                  ),
                  // Links open in new tab
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
                    >
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
      )}
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

  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Aktif conversation
  const activeConv = conversations.find(c => c.id === activeId) ?? null;
  const messages   = activeConv?.messages ?? [];

  // Auto-scroll ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  // Buat conversation baru
  const newConversation = useCallback(() => {
    const id: string = generateId();
    const conv: Conversation = {
      id,
      title:    'Percakapan Baru',
      messages: [],
      ts:       Date.now(),
    };
    setConversations(prev => [conv, ...prev]);
    setActiveId(id);
    setInput('');
    setError(null);
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  // Inisialisasi conversation pertama
  useEffect(() => {
    newConversation();
  }, []); // eslint-disable-line

  // Hapus conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setTimeout(newConversation, 50);
    }
  }, [activeId, newConversation]);

  // Kirim pesan
  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text || isLoading) return;

    setError(null);
    setInput('');

    // Pastikan ada conversation aktif
    let convId = activeId;
    if (!convId) {
      const id = generateId();
      const conv: Conversation = {
        id,
        title:    truncate(text, 40),
        messages: [],
        ts:       Date.now(),
      };
      setConversations(prev => [conv, ...prev]);
      setActiveId(id);
      convId = id;
    }

    // Tambah pesan user
    const userMsg: Message = {
      id:      generateId(),
      role:    'user',
      content: text,
      ts:      Date.now(),
    };

    setConversations(prev =>
      prev.map(c =>
        c.id !== convId ? c : {
          ...c,
          title:    c.messages.length === 0 ? truncate(text, 40) : c.title,
          messages: [...c.messages, userMsg],
        }
      )
    );

    setIsLoading(true);

    try {
      // Ambil semua pesan termasuk yang baru
      const currentMessages = [
        ...(conversations.find(c => c.id === convId)?.messages ?? []),
        userMsg,
      ];

      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: currentMessages.map(m => ({
            role:    m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiContent: string = data.message ?? '';

      const aiMsg: Message = {
        id:      generateId(),
        role:    'assistant',
        content: aiContent,
        ts:      Date.now(),
      };

      setConversations(prev =>
        prev.map(c =>
          c.id !== convId ? c : {
            ...c,
            messages: [...c.messages, aiMsg],
          }
        )
      );

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(msg);
      console.error('[BYYU AI]', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [activeId, isLoading, conversations]);

  // Handle submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Enter = submit, Shift+Enter = newline
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmptyChat = messages.length === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-off-white font-sans">

      {/* ── SIDEBAR ────────────────────────────────────── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-sidebar-bg border-r border-border
            flex flex-col shrink-0
            transition-transform duration-300 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Sidebar header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
              <span className="font-semibold text-charcoal text-sm">BYYU AI</span>
            </div>
            <button
              onClick={newConversation}
              className="p-1.5 rounded-lg hover:bg-hover-bg transition-colors text-muted hover:text-charcoal"
              title="Chat baru"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {conversations.length === 0 ? (
              <p className="text-xs text-muted text-center mt-6 px-4">
                Belum ada percakapan
              </p>
            ) : (
              <div className="space-y-0.5">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`
                      group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer
                      transition-colors text-sm
                      ${activeId === conv.id
                        ? 'bg-hover-bg text-charcoal'
                        : 'text-charcoal/70 hover:bg-hover-bg/70 hover:text-charcoal'
                      }
                    `}
                    onClick={() => { setActiveId(conv.id); setSidebarOpen(false); }}
                  >
                    <MessageSquare size={14} className="shrink-0 text-muted" />
                    <span className="flex-1 truncate text-xs">{conv.title}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted hover:text-red-500 transition-all"
                      title="Hapus"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-border p-3 space-y-1">
            <button
              onClick={() => setShowAbout(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-charcoal/70 hover:bg-hover-bg hover:text-charcoal transition-colors"
            >
              <User size={14} />
              <span>About Developer</span>
            </button>
          </div>
        </aside>
      </>

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-off-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-hover-bg transition-colors text-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-medium text-charcoal/70">
              {activeConv?.title ?? 'BYYU AI'}
            </span>
          </div>

          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-charcoal/70 hover:bg-hover-bg hover:text-charcoal transition-colors"
          >
            <User size={13} />
            About Developer
          </button>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">

            {/* ── Welcome / Empty state ── */}
            {isEmptyChat && (
              <div className="text-center mb-12 animate-fade-in">
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/50 flex items-center justify-center text-3xl font-bold text-accent mx-auto mb-6 shadow-sm">
                  B
                </div>

                <h1 className="text-3xl font-semibold text-charcoal font-serif mb-3">
                  Halo, saya BYYU AI
                </h1>
                <p className="text-muted text-base font-sans mb-8 max-w-sm mx-auto leading-relaxed">
                  Asisten cerdas yang siap membantu Anda dengan berbagai pertanyaan dan tugas.
                </p>

                {/* Starter questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto">
                  {STARTERS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex items-center gap-3 px-4 py-3.5 bg-off-white border border-border rounded-xl text-left text-sm text-charcoal/80 hover:bg-hover-bg hover:border-charcoal/20 transition-all group"
                    >
                      <span className="flex-1 font-sans">{q}</span>
                      <ChevronRight
                        size={14}
                        className="text-muted group-hover:text-charcoal transition-colors shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Messages ── */}
            {messages.map((msg, i) => (
              <MessageBlock
                key={msg.id}
                message={msg}
                isLatest={i === messages.length - 1}
              />
            ))}

            {/* ── Loading indicator ── */}
            {isLoading && (
              <div className="flex gap-3 mb-8 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/60 flex items-center justify-center shrink-0 mt-0.5 text-sm">
                  B
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm font-semibold text-charcoal font-sans">BYYU AI</span>
                  </div>
                  <LoadingDots />
                </div>
              </div>
            )}

            {/* ── Error ── */}
            {error && (
              <div className="flex gap-3 mb-6 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-500 text-sm">
                  !
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-700 text-sm font-sans">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 text-xs mt-1 hover:underline font-sans"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input area (floating) ─────────────────── */}
        <div className="shrink-0 px-4 pb-6 pt-3 bg-gradient-to-t from-off-white via-off-white to-transparent">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="relative bg-off-white border border-border rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.12)] transition-shadow"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kirim pesan ke BYYU AI..."
                rows={1}
                className="chat-input px-4 pt-4 pb-12 min-h-[56px] max-h-[200px]"
                disabled={isLoading}
              />

              {/* Bottom bar inside input */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2.5 pointer-events-none">
                <p className="text-[11px] text-muted font-sans pointer-events-none">
                  Enter kirim · Shift+Enter baris baru
                </p>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="pointer-events-auto w-8 h-8 rounded-lg bg-charcoal text-off-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-charcoal/80 active:scale-95"
                  aria-label="Kirim"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>

            <p className="text-center text-[11px] text-muted mt-2.5 font-sans">
              © 2026 BYYU AI · Built by{' '}
              <button
                onClick={() => setShowAbout(true)}
                className="text-accent hover:underline"
              >
                Abiyyu Rafa Ramadhan
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ── About Modal ── */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
      }
