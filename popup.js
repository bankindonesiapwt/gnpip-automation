// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    
    // Update tabs
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(targetTab).classList.add('active');
  });
});

// Mode selector
document.querySelectorAll('.mode-option').forEach(option => {
  option.addEventListener('click', function() {
    document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
    this.classList.add('active');
    this.querySelector('input').checked = true;
  });
});

// Load saved config
chrome.storage.local.get(['config', 'csvData'], (result) => {
  if (result.config) {
    const config = result.config;
    document.getElementById('kodePos').value = config.kodePos || '';
    document.getElementById('namaProgram').value = config.namaProgram || '';
    document.getElementById('lokasiLainnya').value = config.lokasiLainnya || '';
    document.getElementById('stakeholdersLainnya').value = config.stakeholdersLainnya || '';
    document.getElementById('aoSSInflasi').value = config.aoSSInflasi || '0';
    document.getElementById('delayFields').value = config.delayFields || 200;
    document.getElementById('delaySubmit').value = config.delaySubmit || 2500;
    document.getElementById('delaySuccess').value = config.delaySuccess || 2000;
    document.getElementById('delayNext').value = config.delayNext || 2000;
  }
  
  if (result.csvData) {
    document.getElementById('csvData').value = result.csvData;
    validateCSV();
  }
});

// Save config
document.getElementById('saveConfig').addEventListener('click', () => {
  const config = {
    kodePos: document.getElementById('kodePos').value,
    namaProgram: document.getElementById('namaProgram').value,
    lokasiLainnya: document.getElementById('lokasiLainnya').value,
    stakeholdersLainnya: document.getElementById('stakeholdersLainnya').value,
    aoSSInflasi: document.getElementById('aoSSInflasi').value,
    delayFields: document.getElementById('delayFields').value,
    delaySubmit: document.getElementById('delaySubmit').value,
    delaySuccess: document.getElementById('delaySuccess').value,
    delayNext: document.getElementById('delayNext').value
  };
  
  chrome.storage.local.set({ config }, () => {
    showNotification('✅ Config tersimpan!', 'success');
  });
});

// Save CSV
document.getElementById('saveCSV').addEventListener('click', () => {
  const csvData = document.getElementById('csvData').value;
  
  if (!csvData.trim()) {
    showNotification('⚠️ CSV data kosong!', 'error');
    return;
  }
  
  chrome.storage.local.set({ csvData }, () => {
    showNotification('✅ CSV tersimpan!', 'success');
  });
});

// Validate CSV
document.getElementById('validateCSV').addEventListener('click', validateCSV);

function validateCSV() {
  const csvData = document.getElementById('csvData').value.trim();
  const preview = document.getElementById('csvPreview');
  
  if (!csvData) {
    preview.innerHTML = '<div style="color: #856404; font-size: 11px;">⚠️ CSV kosong!</div>';
    return;
  }

  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  if (headers.length !== 4 || !headers.includes('tanggal') || !headers.includes('harga') || !headers.includes('volume') || !headers.includes('selisih')) {
    preview.innerHTML = '<div style="color: #721c24; font-size: 11px;">❌ Format tidak valid! Harus: tanggal,harga,volume,selisih</div>';
    return;
  }

  const dataRows = lines.slice(1);
  let html = `<div style="color: #155724; font-size: 11px; margin-bottom: 8px;">✅ Valid! ${dataRows.length} baris data</div>`;
  html += '<div class="csv-preview">';
  html += '<div class="preview-row">' + lines[0] + '</div>';
  dataRows.slice(0, 5).forEach(row => {
    html += '<div class="preview-row">' + row + '</div>';
  });
  if (dataRows.length > 5) {
    html += '<div class="preview-row" style="color: #6c757d; font-style: italic;">... +' + (dataRows.length - 5) + ' lainnya</div>';
  }
  html += '</div>';
  
  preview.innerHTML = html;
}

// Inject script
document.getElementById('injectScript').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('powerapps.com')) {
    showNotification('⚠️ Buka halaman PowerApps terlebih dahulu!', 'error');
    return;
  }
  
  // Get config and CSV
  chrome.storage.local.get(['config', 'csvData'], (result) => {
    if (!result.config || !result.csvData) {
      showNotification('⚠️ Config dan CSV harus diisi!', 'error');
      return;
    }
    
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const config = result.config;
    config.mode = mode;
    config.csvData = result.csvData;
    
    // Send to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'inject',
      config: config
    }, (response) => {
      if (response && response.success) {
        showNotification('✅ Script berhasil di-inject!', 'success');
      } else {
        showNotification('❌ Gagal inject script', 'error');
      }
    });
  });
});

// Start automation
document.getElementById('startAuto').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'startAuto' }, (response) => {
    if (response && response.success) {
      showNotification('✅ Automation dimulai!', 'success');
    }
  });
});

// Pause
document.getElementById('pauseBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'pause' });
  showNotification('⏸️ Automation di-pause', 'info');
});

// Resume
document.getElementById('resumeBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'resume' });
  showNotification('▶️ Automation dilanjutkan', 'info');
});

// Skip
document.getElementById('skipBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'skip' });
  showNotification('⏭️ Data di-skip', 'info');
});

// Stop
document.getElementById('stopBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: 'stop' });
  showNotification('⛔ Automation dihentikan', 'info');
});

// Refresh status
document.getElementById('refreshStatus').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
    if (response && response.status) {
      const status = response.status;
      document.getElementById('progressText').textContent = `${status.current}/${status.total}`;
      document.getElementById('successText').textContent = status.success;
      document.getElementById('failText').textContent = status.fail;
      document.getElementById('remainText').textContent = status.remain;
      showNotification('🔄 Status diperbarui', 'success');
    }
  });
});

// Show notification
function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `show ${type}`;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}