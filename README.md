# 🤖 GNPIP Automation Extension

Extension Chrome untuk automasi pengisian form GNPIP PowerApps.

## 📁 Struktur Folder

```
gnpip-automation-extension/
├── manifest.json          # Konfigurasi extension
├── popup.html            # UI popup extension
├── popup.css             # Styling popup
├── popup.js              # Logic popup
├── content.js            # Script yang diinjek ke halaman
├── background.js         # Background service worker
├── icons/                # Folder icon
│   ├── icon16.png       # Icon 16x16
│   ├── icon48.png       # Icon 48x48
│   └── icon128.png      # Icon 128x128
└── README.md            # Dokumentasi ini
```

## 🚀 Cara Install Extension

### 1. **Persiapan File**

Buat folder baru bernama `gnpip-automation-extension` dan simpan semua file berikut:

- ✅ `manifest.json`
- ✅ `popup.html`
- ✅ `popup.css`
- ✅ `popup.js`
- ✅ `content.js`
- ✅ `background.js`

### 2. **Buat Icon**

Buat folder `icons` di dalam folder extension, lalu buat 3 file icon PNG:

- `icon16.png` (16x16 pixel)
- `icon48.png` (48x48 pixel)
- `icon128.png` (128x128 pixel)

**Cara cepat membuat icon:**
- Buka https://www.canva.com atau tools online lainnya
- Buat gambar sederhana (misal: robot emoji 🤖)
- Export dalam 3 ukuran tersebut

**Atau gunakan placeholder:**
```bash
# Di terminal/command prompt, masuk ke folder icons/
# Buat file kosong (temporary)
touch icon16.png icon48.png icon128.png
```

### 3. **Load Extension ke Chrome**

1. Buka **Chrome Browser**
2. Ketik di address bar: `chrome://extensions/`
3. Aktifkan **Developer mode** (toggle di kanan atas)
4. Klik **Load unpacked** (Muat yang tidak dikemas)
5. Pilih folder `gnpip-automation-extension`
6. Klik **Select Folder**

✅ **Extension berhasil terinstall!**

---

## 📖 Cara Pakai Extension

### **Step 1: Setup Config**

1. Klik icon extension di toolbar Chrome
2. Masuk tab **⚙️ Config**
3. Isi semua field konfigurasi tetap:
   - Kode Pos
   - Nama Program
   - Lokasi Lainnya
   - Stakeholders Lainnya
   - AO SS Pengendalian Inflasi
4. Atur **Timing Settings** jika perlu
5. Klik **💾 Simpan Config**

### **Step 2: Input CSV Data**

1. Masuk tab **📊 CSV Data**
2. Paste data CSV dengan format:
   ```
   tanggal,harga,volume,selisih
   9/20/2025,11500,99,3350
   9/21/2025,11500,95,3350
   ```
3. Klik **🔍 Validasi CSV** untuk cek format
4. Klik **💾 Simpan CSV**

### **Step 3: Run Automation**

1. **Buka halaman PowerApps** (harus sudah login)
2. Klik icon extension
3. Masuk tab **🎮 Control**
4. Pilih mode:
   - **🚀 Auto**: Submit otomatis
   - **✋ Manual**: Submit manual (Anda yang klik Kirim)
5. Klik **🚀 Inject & Start**
6. Klik **▶️ Start Automation**

### **Step 4: Monitor Progress**

- Lihat status di tab **🎮 Control**
- Klik **🔄 Refresh Status** untuk update
- Gunakan tombol control:
  - **⏸️ Pause** - Pause sementara
  - **▶️ Resume** - Lanjutkan
  - **⏭️ Skip** - Lewati data saat ini
  - **⛔ Stop** - Hentikan automation

---

## 🎮 Commands di Console

Extension juga inject commands ke Console (F12):

```javascript
startAuto()      // Mulai automation
startFrom(6)     // Mulai dari data ke-6
next()           // Data berikutnya (manual mode)
pause()          // Pause
resume()         // Resume
skip()           // Skip data saat ini
status()         // Lihat progress
stop()           // Stop automation
```

---

## 🔧 Troubleshooting

### ❌ **Extension tidak muncul**
- Pastikan Developer mode aktif
- Reload extension: `chrome://extensions/` → klik icon refresh

### ❌ **"Config dan CSV harus diisi!"**
- Masuk tab Config dan CSV
- Isi semua field
- Klik tombol Simpan di masing-masing tab

### ❌ **"Buka halaman PowerApps terlebih dahulu!"**
- Buka halaman PowerApps dulu
- URL harus mengandung `powerapps.com`
- Baru klik Inject & Start

### ❌ **Icon tidak tampil**
- Buat file PNG di folder `icons/`
- Atau gunakan placeholder sementara
- Reload extension

### ❌ **Script tidak jalan**
- Buka Console (F12)
- Lihat error message
- Pastikan form PowerApps sudah loaded

---

## 📝 Update Extension

Jika ada perubahan code:

1. Edit file yang perlu diubah
2. Buka `chrome://extensions/`
3. Klik icon **🔄 Reload** pada extension

---

## 🎨 Customization

### **Ubah Warna Theme**

Edit `popup.css`, cari bagian:
```css
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```
Ganti kode warna sesuai selera.

### **Ubah Default Config**

Edit `background.js`, bagian `defaultConfig`.

### **Tambah Field Baru**

1. Edit `popup.html` - tambah input
2. Edit `popup.js` - tambah logic save/load
3. Edit `content.js` - tambah ke script generation

---

## ⚠️ Catatan Penting

1. **Extension hanya jalan di PowerApps** (cek `manifest.json` → `host_permissions`)
2. **Data tersimpan lokal** di browser (menggunakan `chrome.storage.local`)
3. **Tidak ada data yang dikirim ke server** extension
4. **Jangan tutup tab** PowerApps saat automation berjalan

---

## 📄 License

Free to use & modify. Made with ❤️ for GNPIP automation.

---

## 🆘 Support

Jika ada masalah, cek:
1. Console browser (F12)
2. Extension error: `chrome://extensions/` → klik Details → Errors
3. Background logs: `chrome://extensions/` → Background page → Inspect

---

**Version:** 1.0.0  
**Last Updated:** 2024