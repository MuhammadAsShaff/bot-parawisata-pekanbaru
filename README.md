# SiPekan (Frontend)

Project ini adalah antarmuka frontend untuk **SiPekan**, sebuah aplikasi web cerdas yang memungkinkan pengguna berinteraksi dengan layanan informasi pariwisata di Pekanbaru menggunakan teks maupun suara.

Aplikasi ini dibangun menggunakan teknologi web modern, integrasi AI canggih, dan backend berbasis workflow n8n.

## 🚀 Fitur Utama

-   **Interaksi Multimoda**: Dukungan fleksibel untuk berbagai cara komunikasi:
    -   **Text-to-Text**: Chatting menggunakan teks seperti biasa.
    -   **Voice-to-Text**: Input suara dikonversi menjadi teks secara lokal menggunakan **Whisper AI (WASM)**.
    -   **Text-to-Voice (TTS)**: Bot dapat membacakan balasan teks dengan suara Bahasa Indonesia yang natural.
    -   **Voice-to-Voice**: Percakapan langsung dua arah dengan bot menggunakan suara tanpa perlu mengetik.
-   **Kecerdasan Buatan (LLM)**: Didukung oleh model **Google Gemini 2.5 Flash** yang sangat cepat dan akurat dalam memahami konteks percakapan serta data pariwisata Pekanbaru.
-   **Antarmuka Modern & Responsif**:
    -   **Dynamic Island Status**: Indikator status visual (merekam, memproses, memuat) yang interaktif dan elegan.
    -   **Manajemen Riwayat Chat**: Fitur penyimpanan riwayat percakapan persisten, hapus sesi, dan "New Chat".
    -   **Mobile-First Design**: Tampilan yang optimal di perangkat seluler dengan sidebar adaptif.
-   **Client-side Processing**: Pemrosesan suara (Speech-to-Text) dilakukan sepenuhnya di browser pengguna menggunakan Web Worker, menjaga privasi dan mengurangi latensi server.

## 🛠️ Teknologi yang Digunakan

### Frontend (User Interface)
-   **[Svelte 5](https://svelte.dev/)**: Framework UI reaktif generasi terbaru untuk performa tinggi.
-   **[Vite](https://vitejs.dev/)**: Build tool yang sangat cepat.
-   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework untuk styling yang konsisten.

### AI & Logic
-   **Orchestrator / Backend**: **[n8n](https://n8n.io/)** (Workflow automation tool) untuk mengatur logika alur percakapan.
-   **LLM Model**: **Google Gemini 2.5 Flash** (via n8n integration).
-   **Speech-to-Text**: **[@xenova/transformers](https://huggingface.co/docs/transformers.js/index)** (Whisper) berjalan lokal di browser (WASM).
-   **Text-to-Speech**: Web Speech API dengan prioritas suara Bahasa Indonesia.

## 📂 Struktur Project

```
/
├── backend/            # Resource terkait backend (n8n workflows, data wisata JSON/CSV)
│   ├── bot parawisata.postman_collection.json  # Dokumentasi API / Testing
│   └── BotParawisataPekanbaru.json             # Workflow n8n (Schema & Logic)
├── public/             # Aset statis & Model Cache
├── src/                # Kode sumber aplikasi frontend
│   ├── lib/            # Komponen Svelte, utilitas, dan worker
│   │   ├── components/ # Komponen UI (Atomic Design)
│   │   ├── api.js      # Integrasi ke Webhook n8n
│   │   └── whisper-worker.js # Web Worker untuk pemrosesan suara latar belakang
│   └── App.svelte      # Entry point logic & layout utama
├── index.html          # Entry point aplikasi
└── package.json        # Dependensi project
```

## 📦 Cara Instalasi dan Penggunaan

Ikuti langkah-langkah berikut untuk menjalankan project ini di komputer Anda:

### 1. Prasyarat
Pastikan Anda sudah menginstal:
-   [Node.js](https://nodejs.org/) (Versi LTS disarankan, misal v18 atau v20)
-   Git

### 2. Instalasi Dependensi
Buka terminal di folder project, lalu jalankan perintah:

```bash
npm install
```

### 3. Menjalankan Aplikasi (Development Mode)
Untuk menjalankan server lokal:

```bash
npm run dev
```

Buka browser dan kunjungi alamat yang muncul di terminal (biasanya `http://localhost:5173`).

### 4. Build untuk Produksi
Jika ingin membuat versi siap deploy:

```bash
npm run build
```
File hasil build akan berada di folder `dist/`.

## 🔌 Integrasi Backend (n8n)

Sistem backend menggunakan **n8n** sebagai orchestrator utama yang menghubungkan:
1.  Input dari Frontend (Teks/Suara terjemahan).
2.  Pengambilan Data Wisata (Live Fetch dari Google Sheets/CSV).
3.  Pemrosesan LLM (**Gemini 2.5 Flash**).
4.  Respon kembali ke Frontend.

File workflow n8n tersedia di folder `backend/BotParawisataPekanbaru.json` yang dapat di-import langsung ke instance n8n Anda.

## 📝 Catatan Tambahan

-   **Penggunaan Whisper AI**: Saat pertama kali fitur suara digunakan, aplikasi akan mengunduh model Whisper (quantized) dari HuggingFace Hub. Pastikan koneksi internet stabil saat penggunaan pertama. Indikator "Mengunduh Model" akan muncul di Dynamic Island.
-   **Izin Mikrofon**: Browser akan meminta izin akses mikrofon saat fitur suara diaktifkan pertama kali.
