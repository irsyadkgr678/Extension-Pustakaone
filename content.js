// ============================
// PustakaONE - Content Script
// Mendengarkan perintah dari website PustakaONE
// ============================

console.log("[PustakaONE Extension] Content script loaded di:", window.location.href);

// Tandai bahwa extension sudah terpasang (agar website tahu)
document.documentElement.setAttribute("data-pustakaone-extension", "true");

let lastLoginStatus = null;
let intervalId = null;

// Fungsi untuk lapor status login ke background
function reportLoginStatus() {
  try {
    // Cegah error "Extension context invalidated" jika ekstensi di-reload
    if (!chrome.runtime || !chrome.runtime.id) {
      if (intervalId) clearInterval(intervalId);
      return;
    }

    const user = localStorage.getItem("user");
    const isLoggedIn = !!user;
    
    // Hanya lapor jika kita berada di domain PustakaONE (termasuk tunnel & IP dev)
    const hostname = window.location.hostname;
    const isPustakaSite = hostname.includes("pustakaone.cloud") || 
                          hostname.includes("trycloudflare.com") ||
                          hostname === "10.30.1.47" ||
                          hostname === "103.247.11.197" ||
                          hostname === "localhost" || 
                          hostname === "127.0.0.1";
    
    if (isPustakaSite) {
      // Hanya kirim pesan jika status berubah untuk menghindari spam
      if (lastLoginStatus !== isLoggedIn) {
        chrome.runtime.sendMessage({
          action: "reportAppState",
          loggedIn: isLoggedIn
        }, () => {
          if (chrome.runtime.lastError) {
            // Abaikan error secara diam-diam
          }
        });
        console.log("[PustakaONE Extension] Melaporkan status login:", isLoggedIn);
        lastLoginStatus = isLoggedIn;
      }
    }
  } catch (err) {
    // Tangkap "Extension context invalidated" yang dilempar oleh Chrome API
    if (intervalId) clearInterval(intervalId);
  }
}

// Jalankan saat load
reportLoginStatus();

// Pantau perubahan localStorage secara berkala (penting untuk SPA Next.js yang tidak me-reload halaman)
intervalId = setInterval(reportLoginStatus, 1000);

// Pantau perubahan localStorage (logout/login di tab lain)
window.addEventListener('storage', (e) => {
  if (e.key === 'user') {
    reportLoginStatus();
  }
});

// Pantau pesan dari window (untuk interaksi dashboard)
window.addEventListener("message", (event) => {
  // Hanya terima pesan dari window sendiri (bukan iframe)
  if (event.source !== window) return;
  
  // Hanya terima pesan dari website PustakaONE
  if (event.data && event.data.type === "PUSTAKAONE_OPEN_PUBLISHER") {
    const url = event.data.url;
    console.log("[PustakaONE Extension] Menerima perintah buka publisher:", url);

    // Kirim ke background.js untuk aktifkan proxy lalu buka URL
    try {
      chrome.runtime.sendMessage({
        action: "enableAndOpen",
        url: url
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("[PustakaONE Extension] Error:", chrome.runtime.lastError.message);
          window.postMessage({
            type: "PUSTAKAONE_ERROR",
            message: "Gagal mengaktifkan proxy. Silakan coba lagi."
          }, "*");
          return;
        }
        console.log("[PustakaONE Extension] Response dari background:", response);
      });
    } catch (err) {
      console.error("[PustakaONE Extension] Fatal error:", err.message);
      // Jangan fallback tanpa proxy, tampilkan error saja
      window.postMessage({
        type: "PUSTAKAONE_ERROR",
        message: "Extension error, silakan reload extension."
      }, "*");
    }
  }
});

