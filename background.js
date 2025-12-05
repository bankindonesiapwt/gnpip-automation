// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('🤖 GNPIP Automation Extension installed');
  
  // Set default config
  chrome.storage.local.get(['config'], (result) => {
    if (!result.config) {
      const defaultConfig = {
        kodePos: '53319',
        namaProgram: 'GPM Harian Kios Pangan Perwira Puspahastama',
        lokasiLainnya: 'Komplek Pasar Ikan Purbalingga, Jl. AW. Soemarmo Kel. Kembaran Kulon',
        stakeholdersLainnya: 'DKPP PURBALINGGA',
        aoSSInflasi: '0',
        delayFields: 200,
        delaySubmit: 2500,
        delaySuccess: 2000,
        delayNext: 2000
      };
      
      chrome.storage.local.set({ config: defaultConfig });
    }
  });
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('[Content Script]:', request.message);
  }
  return true;
});