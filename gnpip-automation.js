// ===============================================
// GNPIP AUTOMATION - FULL AUTO MODE v2.0
// Updated: Form Ready Detection & Resume Support
// ===============================================

(async function() {
  
  // ========== KONFIGURASI ==========
  const CONFIG = {
    kodePos: '53319',
    namaProgram: 'GPM Harian Kios Pangan Perwira Puspahastama',
    lokasiLainnya: 'Komplek Pasar Ikan Purbalingga, Jl. AW. Soemarmo Kel. Kembaran Kulon',
    stakeholdersLainnya: 'DKPP PURBALINGGA',
    aoSSInflasi: '0',
    
    autoSubmit: true,
    delayBetweenFields: 200, // ms
    delayBetweenSubmissions: 2500, // ms
    delayAfterSuccess: 2000, // ms
    delayBeforeNextData: 2000 // ms
  };
  
  // ========== DATA CSV ==========
  const csvData = `tanggal,harga,volume,selisih
9/26/2025,11500,100,3350
9/27/2025,11500,99,3350
9/28/2025,11500,100,3350
9/29/2025,11500,110,3350
9/30/2025,11500,150,3350
6/6/2025,13500,102,1250
6/7/2025,13500,100,1250
6/8/2025,13500,99,1250
6/9/2025,13500,100,1250
6/10/2025,13500,110,1250
6/11/2025,13500,150,1250
6/12/2025,13500,139,1250
6/13/2025,13500,90,1250
6/14/2025,13500,99,1250
6/15/2025,13500,100,1200
6/16/2025,13500,89,1200
6/17/2025,13500,117,1200
6/18/2025,13500,114,1200
6/19/2025,13500,90,1250
6/20/2025,13500,98,1250
6/21/2025,13500,135,1250
6/22/2025,13500,99,1250
6/23/2025,13500,95,1250
6/24/2025,13500,100,1250
6/25/2025,13500,98,1250
6/26/2025,13500,100,1250
6/27/2025,13500,102,1250
6/28/2025,13500,100,1250
6/29/2025,13500,99,1250
6/30/2025,13500,100,1300
7/1/2025,13500,139,1300
7/2/2025,13500,90,1300
7/3/2025,13500,99,1300
7/4/2025,13500,100,1300
7/5/2025,13500,89,1350
7/6/2025,13500,117,1350
7/7/2025,13500,114,1350
7/8/2025,13500,90,1350
7/9/2025,13500,98,1350
7/10/2025,13500,135,1350
7/11/2025,13500,99,1350
7/12/2025,13500,95,1350
7/13/2025,13500,100,1350
7/14/2025,13500,98,1350
7/15/2025,13500,100,1350
7/16/2025,13500,102,1350
7/17/2025,13500,100,1350
7/18/2025,13500,99,1350
7/19/2025,13500,100,1350
7/20/2025,13500,110,1350
7/21/2025,13500,150,1350
7/22/2025,13500,139,1350
7/23/2025,13500,90,1350
7/24/2025,13500,99,1350
7/25/2025,13500,100,1350
7/26/2025,13500,89,1350
7/27/2025,13500,117,1350
7/28/2025,13500,114,1350
7/29/2025,13500,90,1350
7/30/2025,13500,98,1350
7/31/2025,13500,135,1350
`;
  
  // ========== FUNGSI HELPER ==========
  function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }
    return data;
  }
  
  function formatDate(dateStr) {
    const parts = dateStr.split('/');
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${month}/${day}/${year}`;
  }
  
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function fillInput(title, value) {
    const input = document.querySelector(`input[title="${title}"]`);
    if (!input) {
      console.warn(`⚠️ Input tidak ditemukan: ${title}`);
      return false;
    }
    
    input.value = '';
    input.focus();
    await wait(50);
    
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    input.blur();
    
    await wait(CONFIG.delayBetweenFields);
    return true;
  }
  
  async function selectDropdownByLabel(labelText, optionText) {
    const labels = Array.from(document.querySelectorAll('.appmagic-label-text'));
    const targetLabel = labels.find(label => label.textContent.trim() === labelText);
    
    if (!targetLabel) {
      console.warn(`⚠️ Label "${labelText}" tidak ditemukan`);
      return false;
    }
    
    targetLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(400);
    
    const card = targetLabel.closest('.appmagic-typed-card');
    if (!card) {
      console.warn(`⚠️ Card untuk "${labelText}" tidak ditemukan`);
      return false;
    }
    
    let dropdownButton = card.querySelector('[role="button"][aria-haspopup="dialog"]');
    if (!dropdownButton) dropdownButton = card.querySelector('.appmagic-dropdownLabel');
    if (!dropdownButton) dropdownButton = card.querySelector('.appmagic-dropdownLabelText');
    if (!dropdownButton) dropdownButton = card.querySelector('[role="button"]');
    if (!dropdownButton) dropdownButton = card.querySelector('.appmagic-dropdown');
    
    if (!dropdownButton) {
      console.warn(`⚠️ Dropdown untuk "${labelText}" tidak ditemukan`);
      return false;
    }
    
    dropdownButton.click();
    await wait(800);
    
    let items = Array.from(document.querySelectorAll('.appmagic-dropdownListItem'));
    if (items.length === 0) items = Array.from(document.querySelectorAll('[role="option"]'));
    
    const targetOption = items.find(item => item.textContent.trim() === optionText);
    
    if (targetOption) {
      targetOption.click();
      await wait(400);
      console.log(`   ✓ "${labelText}" → "${optionText}"`);
      return true;
    } else {
      console.warn(`⚠️ Opsi "${optionText}" tidak ditemukan di "${labelText}"`);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await wait(300);
      return false;
    }
  }
  
  async function clickButton(text) {
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
    const button = buttons.find(b => b.textContent.includes(text));
    
    if (button) {
      button.click();
      return true;
    }
    return false;
  }
  
  async function dismissSuccessMessage() {
    await wait(CONFIG.delayAfterSuccess);
    
    const closeButtons = Array.from(document.querySelectorAll('button, div[role="button"]'));
    const okButton = closeButtons.find(b => 
      b.textContent.trim() === 'OK' || 
      b.textContent.trim() === 'Close' ||
      b.textContent.trim() === 'Tutup' ||
      b.getAttribute('aria-label')?.includes('Close')
    );
    
    if (okButton) {
      console.log('   → Menutup pesan sukses...');
      okButton.click();
      await wait(800);
      return true;
    }
    
    const overlay = document.querySelector('.appmagic-dialog-overlay, [role="presentation"]');
    if (overlay) {
      overlay.click();
      await wait(800);
      return true;
    }
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27 }));
    await wait(800);
    
    return false;
  }
  
  async function waitForFormReady() {
    console.log('   → Menunggu form siap...');
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      const dateInput = document.querySelector('input[title="Waktu Mulai Program"]');
      const berasInput = document.querySelector('input[title*="Beras"]');
      const peranLabel = Array.from(document.querySelectorAll('.appmagic-label-text'))
        .find(l => l.textContent.trim() === 'Peran BI dalam Kegiatan');
      
      if (dateInput && berasInput && peranLabel) {
        console.log('   ✓ Form siap!');
        await wait(800);
        return true;
      }
      
      if (attempts % 5 === 0) {
        console.log(`   ⏳ Cek form... (${attempts + 1}/${maxAttempts})`);
      }
      await wait(300);
      attempts++;
    }
    
    console.error('❌ Form tidak siap setelah 9 detik!');
    console.log('💡 Solusi: Refresh halaman manual, lalu jalankan script lagi');
    console.log(`💡 Atau ketik: window.forceNextData(${currentIndex}) untuk skip`);
    return false;
  }
  
  async function resetForm() {
    console.log('   → Menunggu form reset...');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await wait(1000);
    return await waitForFormReady();
  }
  
  // ========== MAIN AUTOMATION ==========
  console.clear();
  console.log('%c╔═══════════════════════════════════════════════╗', 'color: #00ff00; font-weight: bold');
  console.log('%c║   GNPIP AUTOMATION - FULL AUTO MODE v2.0     ║', 'color: #00ff00; font-weight: bold');
  console.log('%c╚═══════════════════════════════════════════════╝', 'color: #00ff00; font-weight: bold');
  
  const data = parseCSV(csvData);
  console.log(`\n📊 Ditemukan ${data.length} baris data`);
  console.log(`⚙️  Mode: AUTO SUBMIT (Fully Automated)`);
  console.log(`⏱️  Estimasi waktu: ~${Math.ceil(data.length * 20 / 60)} menit\n`);
  
  console.log('Preview 3 data pertama:');
  data.slice(0, 3).forEach((row, i) => {
    console.log(`  ${i + 1}. ${row.tanggal} | Vol: ${row.volume} kg | Harga: Rp ${row.harga}`);
  });
  
  let currentIndex = 0;
  let isRunning = false;
  let successCount = 0;
  let failCount = 0;
  
  async function processNextRow() {
    if (currentIndex >= data.length) {
      console.log('\n%c╔═══════════════════════════════════════════════╗', 'color: #00ff00; font-weight: bold');
      console.log('%c║          SEMUA DATA SELESAI! 🎉              ║', 'color: #00ff00; font-weight: bold');
      console.log('%c╚═══════════════════════════════════════════════╝', 'color: #00ff00; font-weight: bold');
      console.log(`\n📊 Ringkasan:`);
      console.log(`   ✅ Berhasil: ${successCount}`);
      console.log(`   ❌ Gagal: ${failCount}`);
      console.log(`   📝 Total: ${data.length}`);
      return;
    }
    
    if (isRunning) {
      console.log('⚠️ Masih ada proses berjalan!');
      return;
    }
    
    isRunning = true;
    const row = data[currentIndex];
    
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`%c📝 DATA ${currentIndex + 1}/${data.length}: ${row.tanggal}`, 'color: cyan; font-weight: bold');
    console.log(`   Harga: Rp ${row.harga} | Volume: ${row.volume} kg | Selisih: Rp ${row.selisih}`);
    console.log('═'.repeat(50));
    
    try {
      window.scrollTo(0, 0);
      await wait(500);
      
      console.log('⏳ Mengisi form...');
      
      console.log('   → Tanggal...');
      await fillInput('Waktu Mulai Program', formatDate(row.tanggal));
      await fillInput('Waktu Selesai Program', formatDate(row.tanggal));
      
      console.log('   → Lokasi...');
      await fillInput('Kode Pos Lokasi Pelaksanaan Program', CONFIG.kodePos);
      await fillInput('Nama Program', CONFIG.namaProgram);
      await fillInput('Jika Lokasi Lainnya Sebutkan', CONFIG.lokasiLainnya);
      
      window.scrollBy(0, 300);
      await wait(400);
      
      console.log('   → Beras...');
      await fillInput('Beras - Volume (Kg)', row.volume);
      await fillInput('Beras - Harga Jual OP (Rp)', row.harga);
      await fillInput('Beras - δ dengan PIHPS (Rp/Kg)', row.selisih);
      
      console.log('   → Cabai Merah (0)...');
      await fillInput('Cabai Merah - Volume (Kg)', '0');
      await fillInput('Cabai Merah - Harga Jual OP (Rp)', '0');
      await fillInput('Cabai Merah - δ dengan PIHPS (Rp/Kg)', '0');
      
      console.log('   → Cabai Rawit (0)...');
      await fillInput('Cabai Rawit - Volume (Kg)', '0');
      await fillInput('Cabai Rawit - Harga Jual OP (Rp)', '0');
      await fillInput('Cabai Rawit - δ dengan PIHPS (Rp/Kg)', '0');
      
      console.log('   → Bawang Merah (0)...');
      await fillInput('Bawang Merah - Volume (Kg)', '0');
      await fillInput('Bawang Merah - Harga Jual OP (Rp)', '0');
      await fillInput('Bawang Merah - δ dengan PIHPS (Rp/Kg)', '0');
      
      window.scrollBy(0, 500);
      await wait(600);
      
      console.log('   → Dropdown fields...');
      await selectDropdownByLabel('Peran BI dalam Kegiatan', 'Dukungan Anggaran');
      await selectDropdownByLabel('Sinergi Program dengan Stakeholders', 'Kementan');
      
      console.log('   → Field tambahan...');
      await fillInput('Jika Stakeholders Lainnya Sebutkan', CONFIG.stakeholdersLainnya);
      await fillInput('AO SS Pengendalian Inflasi (Rp)', CONFIG.aoSSInflasi);
      
      console.log('✅ Form terisi lengkap!');
      
      console.log('🤖 Auto-submit...');
      window.scrollTo(0, document.body.scrollHeight);
      await wait(1000);
      
      if (await clickButton('Kirim')) {
        console.log('   → Klik Kirim (1)...');
        await wait(1000);
        
        if (await clickButton('Kirim')) {
          console.log('   → Klik Kirim konfirmasi (2)...');
          await wait(CONFIG.delayBetweenSubmissions);
          
          await dismissSuccessMessage();
          
          console.log('   ⏳ Menunggu form siap untuk data berikutnya...');
          const formReady = await resetForm();
          
          if (!formReady) {
            console.error('❌ Form tidak siap! Automation DIHENTIKAN.');
            console.log('');
            console.log('%c═══════════════════════════════════════', 'color: yellow');
            console.log('%c⚠️  AUTOMATION DIHENTIKAN - FORM TIDAK SIAP', 'color: yellow; font-weight: bold');
            console.log('%c═══════════════════════════════════════', 'color: yellow');
            console.log('');
            console.log('📋 Langkah selanjutnya:');
            console.log('   1. Refresh halaman (F5)');
            console.log('   2. Paste script lagi');
            console.log(`   3. Ketik: startFrom(${currentIndex + 1}) untuk lanjut dari data ke-${currentIndex + 1}`);
            console.log('');
            isRunning = false;
            return;
          }
          
          console.log(`%c✅ Data ${currentIndex + 1} BERHASIL DIKIRIM!`, 'color: green; font-weight: bold');
          successCount++;
          currentIndex++;
          isRunning = false;
          
          console.log(`   ⏳ Tunggu ${CONFIG.delayBeforeNextData}ms sebelum data berikutnya...`);
          await wait(CONFIG.delayBeforeNextData);
          
          setTimeout(() => processNextRow(), 500);
        } else {
          console.log('❌ Tombol Kirim konfirmasi tidak ditemukan!');
          failCount++;
          isRunning = false;
        }
      } else {
        console.log('❌ Tombol Kirim tidak ditemukan!');
        failCount++;
        isRunning = false;
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error(error);
      failCount++;
      isRunning = false;
    }
  }
  
  // ========== EXPORT FUNCTIONS ==========
  window.startAuto = function() {
    console.log('\n🚀 Memulai automation dari awal...');
    console.log('⚠️  JANGAN tutup tab ini selama proses berjalan!\n');
    currentIndex = 0;
    successCount = 0;
    failCount = 0;
    isRunning = false;
    processNextRow();
  };
  
  window.startFrom = function(index) {
    if (index < 1 || index > data.length) {
      console.error(`❌ Index tidak valid! Harus antara 1-${data.length}`);
      return;
    }
    console.log(`\n🚀 Melanjutkan dari data ke-${index}...`);
    console.log('⚠️  JANGAN tutup tab ini selama proses berjalan!\n');
    currentIndex = index - 1;
    isRunning = false;
    processNextRow();
  };
  
  window.forceNextData = function(skipIndex) {
    console.log(`⏭️  Force skip data ${skipIndex + 1}, lanjut ke ${skipIndex + 2}`);
    failCount++;
    currentIndex = skipIndex + 1;
    isRunning = false;
    processNextRow();
  };
  
  window.pause = function() {
    isRunning = true;
    console.log('⏸️  Automation di-pause. Ketik resume() untuk lanjut');
  };
  
  window.resume = function() {
    isRunning = false;
    console.log('▶️  Melanjutkan automation...');
    processNextRow();
  };
  
  window.skip = function() {
    console.log(`⏭️  Data ${currentIndex + 1} dilewati`);
    failCount++;
    currentIndex++;
    isRunning = false;
    processNextRow();
  };
  
  window.status = function() {
    console.log(`\n📊 STATUS:`);
    console.log(`   Progress: ${currentIndex}/${data.length} (${Math.round(currentIndex/data.length*100)}%)`);
    console.log(`   ✅ Berhasil: ${successCount}`);
    console.log(`   ❌ Gagal: ${failCount}`);
    console.log(`   ⏳ Sisa: ${data.length - currentIndex}`);
  };
  
  window.stop = function() {
    console.log('⛔ Automation dihentikan');
    isRunning = true;
    window.status();
  };
  
  // ========== SHOW COMMANDS ==========
  console.log('\n%c📋 PERINTAH TERSEDIA:', 'color: cyan; font-weight: bold');
  console.log('  startAuto()       - Mulai automation dari awal');
  console.log('  startFrom(N)      - Mulai dari data ke-N (misal: startFrom(6))');
  console.log('  pause()           - Pause automation');
  console.log('  resume()          - Lanjutkan automation');
  console.log('  skip()            - Lewati data saat ini');
  console.log('  status()          - Lihat progress');
  console.log('  stop()            - Hentikan automation\n');
  
  console.log('%c⚡ Ketik: startAuto() untuk memulai', 'color: yellow; font-size: 14px; font-weight: bold');
  
})();
