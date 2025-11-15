# Rencana Fitur Detail: haiseven

## Strategi PLG "Public-View, Login-to-Save"
- **Langkah 1 (Gratis Publik):** Semua orang dapat mencoba tools flagship secara terbuka tanpa friksi awal.
- **Langkah 2 (Login-to-Save):** Akses akun dibutuhkan untuk menyimpan data pribadi, menjalankan limiter harian, dan menyiapkan upsell PRO.
- **Langkah 3 (haiseven PRO):** Langganan bulanan/tahunan membuka koneksi data, analitik mendalam, kolaborasi, dan AI assistant.

## Pilar Nilai haiseven PRO
1. **haiseven Search:** Pencarian universal lintas tools untuk benar-benar menjadi "Second Brain".
2. **Thought Canvas PRO:** Koneksi ide, upload visual, dan kolaborasi real-time.
3. **Gamification PRO:** Statistik pribadi dan leaderboard publik untuk memicu kompetisi sehat.
4. **Language Lab & AI Assistant:** Vocab intelligence, parafrase, dan integrasi AI inline di tools kreatif.

---

## Bagian 1. Fitur Inti (Gratis & Login-to-Save)
Fokus: **Capture** data penting dan **Fun** sebagai hook harian.

### Status Implementasi (Nov 2025)
- Poin 1 sampai 7 (Landing Page hingga Thought Canvas Basic) sudah live di produksi.
- Language Lab Basic (poin 8) menjadi fokus pengerjaan berikutnya.
- Semua tiket lanjutan dimulai dari poin 8 dan berlanjut ke fitur-fitur PRO.

### 1. Landing Page
- **Level akses:** 100% publik.
- **Tujuan utama:** Memperkenalkan brand "Sapaan untuk Memulai Hari" dengan nuansa Web3 Gradient Minimalism.
- **UX & visual:** White space luas, SVG ilustratif dengan gradien lembut, kartu fitur `rounded-xl` + border transparan + `shadow-sm`. Micro-interaction hover (scale 1.02, shadow sedikit bertambah).
- **Konten kunci:** Elevator pitch, highlight 4 pilar PRO, CTA eksplorasi tools.
- **Teknis:** Gunakan Next.js App Router, sections modular untuk mudah iterasi AB testing.

### 2. Daily Focus
- **Level akses:** Publik input; login diperlukan untuk menyimpan fokus.
- **Tujuan:** Pengguna menetapkan 3 prioritas harian.
- **UX:** Animasi `framer-motion` staggered fade-in-up untuk 3 input. Tombol "Simpan Fokus" memicu loader minimalis lalu confetti digital bertema gradient.
- **Data:** Tersimpan sebagai array dengan metadata tanggal; siap untuk sync ke search & statistik PRO.
- **Instrumentation:** Track event `daily_focus.save_attempt` (anon), `daily_focus.save_success` (login).

### 3. Gratitude Jar
- **Level akses:** Publik input; login untuk menyimpan.
- **Tujuan:** One-line gratitude sebagai ritual positif.
- **UX:** Area menulis tenang, warna lembut. Saat simpan, textarea animasi fold + fade-out-down; toast elegan muncul dari sudut kanan bawah.
- **Data:** Simpan dengan timestamp + mood optional untuk future insights.
- **Instrumentation:** Event `gratitude.save_attempt`, `gratitude.save_success`.

### 4. Morning Page (Jurnal Cepat)
- **Level akses:** Publik input; login untuk menyimpan.
- **Tujuan:** Brain dump 3 menit.
- **UX:** Teks kabur halus setelah 5 detik (CSS filter) untuk menjaga flow. Progress bar gradient biru-cyan 2px di top berjalan 3 menit. Tombol simpan dengan login gating.
- **Data:** Simpan teks + durasi + word count. Siapkan hook untuk AI inline PRO.

### 5. Mental Unload (Teks Fana)
- **Level akses:** 100% publik tanpa penyimpanan.
- **Tujuan:** Melepaskan pikiran negatif secara anonim.
- **UX:** Tombol "Bakar Pikiran Ini" memicu animasi partikel (WebGL atau canvas) yang membuat teks larut seperti abu.
- **Data:** Tidak disimpan; catat event volumetrik saja untuk insight penggunaan.

### 6. Games: Brain Warm-up & Pattern Play
- **Level akses:** Publik bermain; login untuk menyimpan skor.
- **Tujuan:** Gamifikasi logika angka & visual.
- **UX:** Feedback instan: flash hijau/merah, timer berdenyut ketika <10 detik, kartu pattern menggunakan palet gradient signature.
- **Data:** Simpan skor, streak, XP. Siapkan aggregator untuk leaderboard PRO.
- **Instrumentation:** `game.round_start`, `game.round_end`, `game.score_saved`.

### 7. Thought Canvas (Basic)
- **Level akses:** Publik dapat membuat node; login-to-save peta.
- **Tujuan:** Memetakan ide secara visual sebagai flagship "Second Brain".
- **UX:** Kanvas pan/zoom lembut, nodes draggable, animasi scale-up saat node baru muncul. Tema gradient minimal.
- **Data:** Setiap node dengan teks, posisi, kategori. Simpan map per user saat login.
- **Upgrade hook:** Banner subtle meng-highlight fitur PRO (connections, images, collaboration).

### 8. Language Lab (Basic)
- **Level akses:** Wajib login gratis.
- **Tujuan:** Hook personal growth & integrasi AI.
- **Fitur gratis:**
  - **Vocab Manager:** Simpan kosakata tanpa batas (fields kata, arti, label).
  - **Sentence Builder (Basic):** Grammar check inline, limit 10x/hari; highlight error + suggestion singkat.
- **UX:** UI ringkas, status limit dengan badge countdown. Quick feedback (<1 detik) untuk rasa "instant assistant".
- **Data:** Kosakata per user, log penggunaan grammar check (untuk gating PRO/anti-abuse).

---

## Bagian 2. Fitur haiseven PRO (Langganan)
Fokus: **Connection** dan **Intelligence** untuk memperdalam retensi.

### 1. haiseven Search
- **Level akses:** PRO.
- **Nilai jual:** Satu search bar universal (CTRL+K) lintas Thought Canvas, Daily Focus, Gratitude, Decision Maker, Morning Page, Vocab Manager.
- **UX:** Modal command palette dengan preview snippet; filter by tool, tag, tanggal. Highlight keyword memakai gradient accent.
- **Teknis:** Service search federated (Elasticsearch/Meili) + indexing pipeline. Respect permissions per user.

### 2. Thought Canvas PRO
- **Level akses:** PRO.
- **Fitur+:**
  - **Node Connections:** Drag garis (SVG) antar nodes untuk graph insights.
  - **Image Nodes:** Upload gambar (drag & drop) per node; thumbnail di canvas.
  - **Collaboration:** Real-time co-edit (WebSockets/Liveblocks) dengan cursors multi-user.
- **Nilai jual:** Mind mapping dari capture ke synthesis kolaboratif.
- **UX:** Toolbar PRO badges, presence avatar, connection lines animasi glow.

### 3. Gamification PRO
- **Level akses:** PRO.
- **Fitur+:**
  - **Personal Stats:** Dashboard progres skor, chart streak (line/bar) per game.
  - **Public Leaderboards:** Daily/Weekly scoreboard untuk Brain Warm-up, Pattern Play, XP streak.
- **Nilai jual:** Memicu kompetisi, menjaga habit, menambah social proof.
- **UX:** Cards gradient, animasi podium, shareable link.

### 4. Language Lab & AI Assistant PRO
- **Level akses:** PRO.
- **Fitur+:**
  - **Vocab Manager PRO:** Quiz custom (spaced repetition), contoh kalimat AI per kosakata.
  - **Sentence Builder PRO:** Parafrase 3 variasi + terjemahan multi-bahasa.
  - **Integrasi AI inline:** Tombol grammar/parafrase di Thought Canvas & Morning Page.
- **Nilai jual:** Upgrade dari sekadar koreksi menjadi peningkatan kualitas tulisan.
- **Teknis:** Integrasi API AI (Gemini). Implement rate limiting, caching, role-based gating.

---

## Backlog Implementasi (Mulai Poin 8)
- **Language Lab Basic Completion**
  - Finalisasi UI/UX Vocab Manager login-only termasuk empty, loading, dan success state konsisten.
  - Implement service grammar check dengan limiter 10x/hari per user, audit log, dan error messaging.
  - QA toast, badge counter, dan telemetry `language_lab.grammar_check` di client + backend.
- **haiseven Search (PRO)**
  - Rancang skema indeks + pipeline ETL dari Daily Focus, Gratitude, Thought Canvas, Decision Maker, Morning Page, dan Vocab Manager.
  - Bangun command palette (CTRL+K) dengan filter, preview snippet, dan highlight kata kunci.
  - Tambahkan pengecekan langganan + instrumentation konversi PRO.
- **Thought Canvas PRO**
  - Node connections (SVG) termasuk UX membuat/menghapus garis dan penyimpanan relasi antar node.
  - Image nodes dengan upload (S3/Edge) dan rendering thumbnail di canvas.
  - Kolaborasi real-time (presence, cursors, conflict resolution) via WebSockets/Liveblocks.
- **Gamification PRO**
  - Pipeline agregasi skor dan streak ke API statistik personal + visualisasi chart.
  - Leaderboard publik harian/mingguan untuk Brain Warm-up, Pattern Play, dan XP streak.
  - Anti-cheat dasar: rate-limit submit, anomaly detection, dan moderation tools.
- **Language Lab & AI Assistant PRO**
  - Quiz custom berbasis spaced repetition serta generator contoh kalimat AI per vocab.
  - Parafrase 3 variasi dan terjemahan multi-bahasa dengan fallback error handling.
  - Integrasi tombol AI inline di Thought Canvas & Morning Page lengkap dengan gating subscription.

---

## Journey Pengguna & Upsell Moments
- **Public Try:** Landing, Daily Focus, Gratitude, Games, Thought Canvas Basic memberi taste value.
- **Login Gate:** "Simpan" tombol memunculkan modal login dengan messaging "Bawa data kamu kemanapun".
- **In-App Upsell:** Badge PRO, tooltip contextual ketika user mencoba fitur PRO, modal yang menonjolkan 4 pilar.
- **Email/Notif:** Setelah 3 hari berturut-turut login, kirim highlight PRO (search, AI, leaderboard).

## Metrics & Eksperimen Awal
- **Activation:** % user publik yang login saat mencoba menyimpan.
- **Retention:** Mingguan DAU/WAU untuk Daily Focus dan Thought Canvas.
- **Monetisasi:** Conversion rate dari login ke PRO dalam 7 hari.
- **Experiment backlog:** A/B copy pada modal login-to-save, limit grammar check (5 vs 10), highlight PRO di canvas.

## Implementasi & Dependencies
- **Design System:** Komponen gradient minimal (buttons, cards, modals) reusable across pages.
- **Animation Stack:** `framer-motion`, `gsap` (opsional) untuk efek fisik (confetti, fold).
- **Backend koordinasi:** Endpoint save per tool, rate limit grammar, search indexing, real-time collab infra.
- **Security & Perf:** Auth gating di edge, caching untuk public pages, upload validation untuk image nodes.

## Tahapan Prioritas (Roadmap Tingkat Tinggi)
1. **MVP Capture & Fun:** Landing, Daily Focus, Gratitude, Games, Thought Canvas Basic, auth flow login-to-save.
2. **Language Lab Basic:** Vocab manager, grammar check limit.
3. **PRO Foundations:** Billing, paywall, haiseven Search index, Gamification stats pipeline.
4. **PRO Enhancements:** Thought Canvas PRO (connections, image, collab) + Language Lab AI advanced.
5. **Polish & Growth:** Email flows, referral, community leaderboard rollout.

Dokumen ini menjadi referensi master bagi tim produk, desain, dan engineering untuk menyamakan visi eksekusi haiseven.
