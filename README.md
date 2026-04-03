# BYYU AI 🤖

Asisten AI cerdas berbasis Groq (Llama 3), dibangun oleh **Abiyyu Rafa Ramadhan**.

---

## 🚀 Cara Deploy — Panduan Lengkap

### Prasyarat
- Akun GitHub
- Akun Vercel (https://vercel.com) — **gratis**
- Tidak perlu install apapun di HP/laptop

---

### LANGKAH 1 — Buat Repository GitHub

```
1. Buka github.com → login
2. Klik "+" → "New repository"
3. Nama: byyu-ai
4. Visibility: Public
5. ✅ Add a README file
6. Klik "Create repository"
```

---

### LANGKAH 2 — Upload File via GitHub Web Editor

Di halaman repo, buat file satu per satu:
**Klik "Add file" → "Create new file"**

Buat file-file berikut dengan path yang tepat:

| Path file | Isi dari |
|-----------|---------|
| `package.json` | Salin dari panduan ini |
| `next.config.js` | Salin dari panduan ini |
| `tailwind.config.ts` | Salin dari panduan ini |
| `tsconfig.json` | Salin dari panduan ini |
| `src/app/globals.css` | Salin dari panduan ini |
| `src/app/layout.tsx` | Salin dari panduan ini |
| `src/app/page.tsx` | Salin dari panduan ini |
| `src/app/api/chat/route.ts` | Salin dari panduan ini |

> **Cara buat folder bertingkat:**
> Saat isi nama file, ketik path lengkapnya, contoh:
> `src/app/api/chat/route.ts`
> GitHub otomatis membuat foldernya.

---

### LANGKAH 3 — Deploy ke Vercel

```
1. Buka vercel.com → "Sign up with GitHub"
2. Klik "Add New Project"
3. Pilih repo "byyu-ai"
4. Klik "Import"
```

**Set Environment Variable:**
```
Di halaman konfigurasi Vercel:
→ Klik "Environment Variables"
→ Name:  GROQ_API_KEY
→ Value:
→ Klik "Add"
```

```
5. Klik "Deploy"
6. Tunggu ~2 menit
7. Klik URL yang muncul → BYYU AI online! 🎉
```

---

### LANGKAH 4 — Test Aplikasi

Coba ketik di chat:
- "Siapa yang membuatmu?"
- "Jelaskan konsep async/await"
- "Buatkan to-do list dalam JavaScript"

---

## 📁 Struktur Folder

```
byyu-ai/
├── src/
│   └── app/
│       ├── api/chat/route.ts   ← Backend Groq API
│       ├── layout.tsx          ← Font + metadata
│       ├── page.tsx            ← Main UI
│       └── globals.css         ← Styles
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## ⚙️ Environment Variables

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | Key Groq kamu |

> **Catatan keamanan:** Jangan commit `.env.local` ke GitHub publik.
> Selalu set env variable melalui dashboard Vercel.

---

## 🛠️ Development Lokal (opsional)

```bash
git clone https://github.com/username/byyu-ai
cd byyu-ai
npm install

# Buat file .env.local
echo "GROQ_API_KEY=gsk_xxx" > .env.local

npm run dev
# Buka http://localhost:3000
```

---

## 👨‍💻 About Developer

**Abiyyu Rafa Ramadhan** — Full-stack Developer

Keahlian: Next.js · React · TypeScript · Node.js · Tailwind · AI Integration

BYYU AI adalah demonstrasi kemampuan integrasi AI dalam produk web modern.

---

*© 2026 BYYU AI · Built with ❤️ by Abiyyu Rafa Ramadhan*
