// Content script - runs on PowerApps pages
console.log('🤖 GNPIP Automation Extension loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'inject') {
    injectAutomationScript(request.config);
    sendResponse({ success: true });
  } else if (request.action === 'startAuto') {
    if (window.startAuto) {
      window.startAuto();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Script belum di-inject' });
    }
  } else if (request.action === 'pause') {
    if (window.pause) window.pause();
  } else if (request.action === 'resume') {
    if (window.resume) window.resume();
  } else if (request.action === 'skip') {
    if (window.skip) window.skip();
  } else if (request.action === 'stop') {
    if (window.stop) window.stop();
  } else if (request.action === 'getStatus') {
    if (window.getAutomationStatus) {
      sendResponse({ status: window.getAutomationStatus() });
    } else {
      sendResponse({ status: null });
    }
  }
  return true;
});

function injectAutomationScript(config) {
  const script = document.createElement('script');
  script.textContent = generateAutomationScript(config);
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

function generateAutomationScript(config) {
  const autoSubmit = config.mode === 'auto';

  return `
(async function() {
  const CONFIG = {
    kodePos: '${config.kodePos}',
    namaProgram: '${config.namaProgram.replace(/'/g, "\\'")}',
    lokasiLainnya: '${config.lokasiLainnya.replace(/'/g, "\\'")}',
    stakeholdersLainnya: '${config.stakeholdersLainnya.replace(/'/g, "\\'")}',
    aoSSInflasi: '${config.aoSSInflasi}',
    autoSubmit: ${autoSubmit},
    delayBetweenFields: ${config.delayFields},
    delayBetweenSubmissions: ${config.delaySubmit},
    delayAfterSuccess: ${config.delaySuccess},
    delayBeforeNextData: ${config.delayNext}
  };
  
  const csvData = \`${config.csvData}\`;
  
  function parseCSV(csv) {
    const lines = csv.trim().split('\\n');
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
    return \`\${month}/\${day}/\${year}\`;
  }
  
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function fillInput(title, value) {
    const input = document.querySelector(\`input[title="\${title}"]\`);
    if (!input) {
      console.warn(\`⚠️ Input tidak ditemukan: \${title}\`);
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
    if (!targetLabel) return false;
    
    targetLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(400);
    
    const card = targetLabel.closest('.appmagic-typed-card');
    if (!card) return false;
    
    let dropdownButton = card.querySelector('[role="button"][aria-haspopup="dialog"]');
    if (!dropdownButton) dropdownButton = card.querySelector('.appmagic-dropdownLabel');
    if (!dropdownButton) dropdownButton = card.querySelector('.appmagic-dropdownLabelText');
    if (!dropdownButton) dropdownButton = card.querySelector('[role="button"]');
    if (!dropdownButton) return false;
    
    dropdownButton.click();
    await wait(800);
    
    let items = Array.from(document.querySelectorAll('.appmagic-dropdownListItem'));
    if (items.length === 0) items = Array.from(document.querySelectorAll('[role="option"]'));
    
    const targetOption = items.find(item => item.textContent.trim() === optionText);
    if (targetOption) {
      targetOption.click();
      await wait(400);
      console.log(\`   ✓ "\${labelText}" → "\${optionText}"\`);
      return true;
    }
    return false;
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
        console.log(\`   ⏳ Cek form... (\${attempts + 1}/\${maxAttempts})\`);
      }
      await wait(300);
      attempts++;
    }
    console.error('❌ Form tidak siap setelah 9 detik!');
    return false;
  }
  
  async function resetForm() {
    console.log('   → Menunggu form reset...');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await wait(1000);
    return await waitForFormReady();
  }
  
  console.clear();
  console.log('%c╔═══════════════════════════════════════════════╗', 'color: #00ff00; font-weight: bold');
  console.log('%c║   GNPIP AUTOMATION - ${config.mode.toUpperCase()} MODE          ║', 'color: #00ff00; font-weight: bold');
  console.log('%c╚═══════════════════════════════════════════════╝', 'color: #00ff00; font-weight: bold');
  
  const data = parseCSV(csvData);
  console.log(\`\\n📊 Ditemukan \${data.length} baris data\`);
  console.log(\`⚙️  Mode: \${CONFIG.autoSubmit ? 'AUTO SUBMIT' : 'MANUAL SUBMIT'}\`);
  console.log(\`⏱️  Estimasi waktu: ~\${Math.ceil(data.length * 20 / 60)} menit\\n\`);
  
  let currentIndex = 0;
  let isRunning = false;
  let successCount = 0;
  let failCount = 0;
  
  async function processNextRow() {
    if (currentIndex >= data.length) {
      console.log('\\n%c✅ SEMUA DATA SELESAI!', 'color: green; font-size: 16px; font-weight: bold');
      console.log(\`📊 Berhasil: \${successCount} | Gagal: \${failCount} | Total: \${data.length}\`);
      return;
    }
    
    if (isRunning) {
      console.log('⚠️ Masih ada proses berjalan!');
      return;
    }
    
    isRunning = true;
    const row = data[currentIndex];
    
    console.log(\`\\n${'═'.repeat(50)}\`);
    console.log(\`%c📝 DATA \${currentIndex + 1}/\${data.length}: \${row.tanggal}\`, 'color: cyan; font-weight: bold');
    console.log(\`   Harga: Rp \${row.harga} | Volume: \${row.volume} kg | Selisih: Rp \${row.selisih}\`);
    console.log('═'.repeat(50));
    
    try {
      window.scrollTo(0, 0);
      await wait(500);
      console.log('⏳ Mengisi form...');
      
      await fillInput('Waktu Mulai Program', formatDate(row.tanggal));
      await fillInput('Waktu Selesai Program', formatDate(row.tanggal));
      await fillInput('Kode Pos Lokasi Pelaksanaan Program', CONFIG.kodePos);
      await fillInput('Nama Program', CONFIG.namaProgram);
      await fillInput('Jika Lokasi Lainnya Sebutkan', CONFIG.lokasiLainnya);
      
      window.scrollBy(0, 300);
      await wait(400);
      
      await fillInput('Beras - Volume (Kg)', row.volume);
      await fillInput('Beras - Harga Jual OP (Rp)', row.harga);
      await fillInput('Beras - δ dengan PIHPS (Rp/Kg)', row.selisih);
      
      await fillInput('Cabai Merah - Volume (Kg)', '0');
      await fillInput('Cabai Merah - Harga Jual OP (Rp)', '0');
      await fillInput('Cabai Merah - δ dengan PIHPS (Rp/Kg)', '0');
      
      await fillInput('Cabai Rawit - Volume (Kg)', '0');
      await fillInput('Cabai Rawit - Harga Jual OP (Rp)', '0');
      await fillInput('Cabai Rawit - δ dengan PIHPS (Rp/Kg)', '0');
      
      await fillInput('Bawang Merah - Volume (Kg)', '0');
      await fillInput('Bawang Merah - Harga Jual OP (Rp)', '0');
      await fillInput('Bawang Merah - δ dengan PIHPS (Rp/Kg)', '0');
      
      window.scrollBy(0, 500);
      await wait(600);
      
      await selectDropdownByLabel('Peran BI dalam Kegiatan', 'Dukungan Anggaran');
      await selectDropdownByLabel('Sinergi Program dengan Stakeholders', 'Kementan');
      await fillInput('Jika Stakeholders Lainnya Sebutkan', CONFIG.stakeholdersLainnya);
      await fillInput('AO SS Pengendalian Inflasi (Rp)', CONFIG.aoSSInflasi);
      
      console.log('✅ Form terisi lengkap!');
      
      if (CONFIG.autoSubmit) {t) {
        window.scrollTo(0, document.body.scrollHeight);
        await wait(1000);
        if (await clickButton('Kirim')) {
          await wait(1000);
          if (await clickButton('Kirim')) {
            await wait(CONFIG.delayBetweenSubmissions);
            await dismissSuccessMessage();
            const formReady = await resetForm();
            if (!formReady) {
              console.error('❌ Form tidak siap!');
              isRunning = false;
              return;
            }
            console.log(\`%c✅ Data \${currentIndex + 1} BERHASIL!\`, 'color: green; font-weight: bold');
            successCount++;
            currentIndex++;
            isRunning = false;
            await wait(CONFIG.delayBeforeNextData);
            setTimeout(() => processNextRow(), 500);
          } else {
            failCount++;
            isRunning = false;
          }
        } else {
          failCount++;
          isRunning = false;
        }
      } else {
        console.log('%c✅ Form terisi! Klik KIRIM manual, lalu ketik: next()', 'color: orange; font-weight: bold');
        successCount++;
        isRunning = false;
      }
    } catch (error) {
      console.error('❌ Error:', error);
      failCount++;
      isRunning = false;
    }
  }
  
  window.startAuto = function() {
    console.log('🚀 Memulai automation...');
    currentIndex = 0;
    successCount = 0;
    failCount = 0;
    isRunning = false;
    processNextRow();
  };
  
  window.startFrom = function(index) {
    if (index < 1 || index > data.length) {
      console.error('❌ Index tidak valid!');
      return;
    }
    currentIndex = index - 1;
    isRunning = false;
    processNextRow();
  };
  
  window.next = function() {
    currentIndex++;
    isRunning = false;
    processNextRow();
  };
  
  window.pause = function() {
    isRunning = true;
    console.log('⏸️ Paused');
  };
  
  window.resume = function() {
    isRunning = false;
    console.log('▶️ Resumed');
    processNextRow();
  };
  
  window.skip = function() {
    failCount++;
    currentIndex++;
    isRunning = false;
    processNextRow();
  };
  
  window.status = function() {
    console.log(\`📊 Progress: \${currentIndex}/\${data.length} | ✅ \${successCount} | ❌ \${failCount}\`);
  };
  
  window.stop = function() {
    isRunning = true;
    console.log('⛔ Stopped');
    window.status();
  };
  
  window.getAutomationStatus = function() {
    return {
      current: currentIndex,
      total: data.length,
      success: successCount,
      fail: failCount,
      remain: data.length - currentIndex
    };
  };
  
  console.log('\n%c📋 Commands: startAuto() | startFrom(N) | next() | pause() | resume() | skip() | status() | stop()', 'color: cyan');
  console.log('%c⚡ Ketik: startAuto() untuk mulai', 'color: yellow; font-weight: bold');
})();
`;
}
