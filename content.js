// ============================
// PustakaONE - Content Script
// Mendengarkan perintah dari website PustakaONE
// ============================

console.log("[PustakaONE Extension] Content script loaded di:", window.location.href);

// Tandai bahwa extension sudah terpasang (agar website tahu)
document.documentElement.setAttribute("data-pustakaone-extension", "true");

let lastLoginStatus = null;
let lastReportedInstitution = null;
let intervalId = null;

/**
 * Deteksi institusi dari halaman PustakaONE (DOM).
 * Mencari nama institusi di sidebar atau elemen halaman.
 */
function detectInstitutionFromPage() {
  try {
    const stored = localStorage.getItem("selectedInstitution");
    if (stored && stored !== "null" && stored !== "undefined") return stored;

    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user.email) {
        if (user.email.includes("@undip.ac.id")) return "Universitas Diponegoro";
        if (user.email.includes("@telkomuniversity.ac.id") || user.email.includes("@student.telkomuniversity.ac.id")) return "Telkom University";
        if (user.email.includes("@ui.ac.id")) return "Universitas Indonesia";
      }
      if (user.institution) return user.institution;
      if (user.institution_name) return user.institution_name;
    }

    const headers = document.querySelectorAll('h1, h2, h3, [class*="sidebar"] h2, [class*="Sidebar"] h2, [class*="institution"], [class*="Institution"]');
    for (const el of headers) {
      const text = el.textContent?.trim() || '';
      if (text.includes('Universitas Diponegoro') || text.includes('Undip')) return 'Universitas Diponegoro';
      if (text.includes('Telkom University')) return 'Telkom University';
      if (text.includes('Universitas Indonesia')) return 'Universitas Indonesia';
    }
  } catch (e) { /* ignore */ }
  return null;
}

function reportInstitution() {
  try {
    if (!chrome.runtime || !chrome.runtime.id) return;
    const institution = detectInstitutionFromPage();
    if (institution && institution !== lastReportedInstitution) {
      lastReportedInstitution = institution;
      chrome.runtime.sendMessage({
        action: "reportInstitution",
        institution: institution,
        source: "content-script-dom"
      }, () => { if (chrome.runtime.lastError) { /* ignore */ } });
      console.log("[PustakaONE Extension] Melaporkan institusi dari halaman:", institution);
    }
  } catch (err) { /* ignore */ }
}

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
      if (lastLoginStatus !== isLoggedIn) {
        chrome.runtime.sendMessage({
          action: "reportAppState",
          loggedIn: isLoggedIn
        }, () => {
          if (chrome.runtime.lastError) { /* ignore */ }
        });
        console.log("[PustakaONE Extension] Melaporkan status login:", isLoggedIn);
        lastLoginStatus = isLoggedIn;
      }
      reportInstitution();
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
    const institution = event.data.institution 
      || localStorage.getItem("selectedInstitution") 
      || "Telkom University";
    console.log("[PustakaONE Extension] Menerima perintah buka publisher:", url, "| institusi:", institution);

    try {
      chrome.runtime.sendMessage({
        action: "enableAndOpen",
        url: url,
        institution: institution
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


