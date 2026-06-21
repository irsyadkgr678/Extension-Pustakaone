// ============================
// PustakaONE Proxy - Background Service Worker (Secure Mode)
// ============================

const PROXY_HOST = "103.247.11.197";
const PROXY_PORT = 8889;
const ALLOWED_DOMAINS = [
  "103.247.11.197", 
  "10.30.1.47", 
  "localhost", 
  "127.0.0.1",
  "pustakaone.cloud",       // Domain utama
  "*.pustakaone.cloud",     // Subdomain (www, dll)
  "*.trycloudflare.com"     // Cloudflare Tunnel
];

function isDomainAllowed(hostname) {
  return ALLOWED_DOMAINS.some(d => {
    if (d.startsWith("*.")) {
      // Wildcard match: *.trycloudflare.com → cocok dengan xxx.trycloudflare.com
      return hostname.endsWith(d.slice(1)) || hostname === d.slice(2);
    }
    return hostname === d;
  });
}

function isPublisherUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname;
    return PUBLISHER_DOMAINS.some(d => {
      if (d.startsWith("*.")) {
        return hostname.endsWith(d.slice(1)) || hostname === d.slice(2);
      }
      return hostname === d;
    });
  } catch (e) {
    return false;
  }
}



const PUBLISHER_DOMAINS = [
  // === Publisher utama ===
  "*.ieee.org", "ieee.org",
  "*.scopus.com", "scopus.com",
  "*.elsevier.com", "elsevier.com",
  "*.springer.com", "springer.com",
  "*.springerlink.com", "springerlink.com",
  "*.wiley.com", "wiley.com",
  "*.nature.com", "nature.com",
  "*.sciencedirect.com", "sciencedirect.com",
  "*.tandfonline.com", "tandfonline.com",
  "*.sagepub.com", "sagepub.com",
  "*.emerald.com", "emerald.com",
  "*.emeraldinsight.com", "emeraldinsight.com",
  "*.proquest.com", "proquest.com",
  "*.ebscohost.com", "ebscohost.com",
  "*.jstor.org", "jstor.org",

  // === ACM ===
  "*.acm.org", "acm.org",
  "*.dl.acm.org", "dl.acm.org",

  // === Bloomsbury ===
  "*.bloomsbury.com", "bloomsbury.com",
  "*.bloomsburycollections.com", "bloomsburycollections.com",

  // === Gale ===
  "*.gale.com", "gale.com",

  // === IET ===
  "*.theiet.org", "theiet.org",
  "*.digital-library.theiet.org", "digital-library.theiet.org",
  "*.ietdl.org", "ietdl.org",                   // IET Digital Library (legacy domain)

  // === IGI Global ===
  "*.igi-global.com", "igi-global.com",
  "*.iglibrary.com", "iglibrary.com",
  "*.igpublish.com", "igpublish.com",         // portal iGLibrary

  // === Inderscience ===
  "*.inderscience.com", "inderscience.com",
  "*.inderscienceonline.com", "inderscienceonline.com",

  // === Statista ===
  "*.statista.com", "statista.com",

  // === World Scientific ===
  "*.worldscientific.com", "worldscientific.com",
  "*.world-scientific.com", "world-scientific.com",

  // === Taylor & Francis ===
  "*.taylorfrancis.com", "taylorfrancis.com",
  "*.tandf.co.uk", "tandf.co.uk",

  // === Cambridge University Press ===
  "*.cambridge.org", "cambridge.org",

  // === Oxford University Press ===
  "*.oup.com", "oup.com",
  "*.oxfordjournals.org", "oxfordjournals.org",
  "*.oxfordscholarship.com", "oxfordscholarship.com",

  // === ACS Publications ===
  "*.acs.org", "acs.org",
  "*.pubs.acs.org",

  // === IOP Science ===
  "*.iop.org", "iop.org",
  "*.iopscience.iop.org",

  // === AIP Publishing ===
  "*.aip.org", "aip.org",
  "*.scitation.org", "scitation.org",

  // === De Gruyter ===
  "*.degruyter.com", "degruyter.com",

  // === Brill ===
  "*.brill.com", "brill.com",

  // === Project Muse ===
  "*.muse.jhu.edu",

  // === PubMed / NCBI ===
  "*.pubmed.ncbi.nlm.nih.gov",
  "*.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov",

  // === arXiv ===
  "*.arxiv.org", "arxiv.org",

  // === SSRN ===
  "*.ssrn.com", "ssrn.com",

  // === DOAJ ===
  "*.doaj.org", "doaj.org",

  // === OECD iLibrary ===
  "*.oecd-ilibrary.org", "oecd-ilibrary.org",

  // === HeinOnline ===
  "*.heinonline.org", "heinonline.org",

  // === MIT Press ===
  "*.mitpressjournals.org",
  "*.direct.mit.edu",

  // === APA ===
  "*.apa.org", "apa.org",
  "*.psycnet.apa.org",

  // === SPIE ===
  "*.spie.org", "spie.org",
  "*.spiedigitallibrary.org",

  // === ASCE ===
  "*.asce.org", "asce.org",
  "*.ascelibrary.org",

  // === ASME ===
  "*.asme.org", "asme.org",

  // === SIAM ===
  "*.siam.org", "siam.org",
  "*.epubs.siam.org",

  // === Karger ===
  "*.karger.com", "karger.com",

  // === Thieme ===
  "*.thieme-connect.com", "thieme-connect.com",

  // === Wolters Kluwer / LWW ===
  "*.lww.com", "lww.com",
  "*.wolterskluwer.com", "wolterskluwer.com",

  // === BioMed Central ===
  "*.biomedcentral.com", "biomedcentral.com",

  // === PLOS ===
  "*.plos.org", "plos.org",

  // === Frontiers ===
  "*.frontiersin.org", "frontiersin.org",

  // === MDPI ===
  "*.mdpi.com", "mdpi.com",

  // === Hindawi ===
  "*.hindawi.com", "hindawi.com",

  // === Portal Garuda (Indonesia) ===
  "*.garuda.kemdikbud.go.id",

  // === Neliti (Indonesia) ===
  "*.neliti.com", "neliti.com",

  // === Indonesia OneSearch ===
  "*.onesearch.id", "onesearch.id"
];

// ---------- URL PustakaONE App (untuk deteksi via API) ----------
const PUSTAKAONE_APP_URLS = [
  "http://10.30.1.47:3000",
  "http://localhost:3000",
  "https://pustakaone.cloud"
];

// ---------- Mapping Institusi ke Proxy ----------
const INSTITUTION_PROXY = {
  "Telkom University":       { host: "180.250.135.17", port: 3128 },
  "Universitas Diponegoro":  { host: "180.250.135.17", port: 3129 },
  "Undip":                   { host: "180.250.135.17", port: 3129 }
};

// ---------- Daftar host:port untuk pengecekan konektivitas (FALLBACK) ----------
// Prioritas: cek endpoint HTTP yang pasti merespons (bukan squid proxy!)
const INSTITUTION_CHECK_HOSTS = {
  "Universitas Diponegoro": [
    "http://180.250.135.17:3000",    // PustakaONE app (Next.js dev)
    "http://180.250.135.17",         // PustakaONE app (port 80 / nginx)
    "http://180.250.135.17:3129"     // Squid proxy Undip (fallback)
  ],
  "Telkom University": [
    "http://180.250.135.17:3128"  // Squid proxy Telkom (HANYA reachable dari jaringan Telkom)
  ]
};

// ---------- Mapping nama pendek ke nama panjang ----------
const INSTITUTION_ALIASES = {
  "Undip": "Universitas Diponegoro",
  "Universitas Diponegoro": "Universitas Diponegoro",
  "Telkom University": "Telkom University"
};

function normalizeInstitution(name) {
  return INSTITUTION_ALIASES[name] || name || "Telkom University";
}

function getProxyForInstitution(institution) {
  const normalized = INSTITUTION_ALIASES[institution] || institution;
  return INSTITUTION_PROXY[normalized] || INSTITUTION_PROXY["Telkom University"];
}

// ---------- Auto-Deteksi Jaringan / Institusi ----------
const DETECTION_TIMEOUT = 5000;

let detectedInstitution = null;
let manualInstitution = null;

/**
 * Deteksi institusi melalui API endpoint PustakaONE (METODE UTAMA).
 * Server mendeteksi berdasarkan IP client → jauh lebih reliable.
 */
async function detectViaApi(timeoutMs = DETECTION_TIMEOUT) {
  console.log("[PustakaONE] 🔍 Mencoba deteksi via API endpoint...");

  for (const baseUrl of PUSTAKAONE_APP_URLS) {
    const apiUrl = `${baseUrl}/api/detect-institution`;
    console.log(`[PustakaONE]   → ${apiUrl}`);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const institution = normalizeInstitution(data.institution);
        console.log(`[PustakaONE] ✅ API mendeteksi: ${institution} (IP: ${data.clientIp})`);
        return institution;
      }
    } catch (err) {
      console.log(`[PustakaONE]   ❌ API ${apiUrl} gagal: ${err.message}`);
    }
  }

  console.log("[PustakaONE] ⚠️ Semua API endpoint tidak terjangkau");
  return null;
}

/**
 * Coba jangkau host tertentu dengan timeout (METODE FALLBACK).
 * ⚠️ Tidak reliable untuk squid proxy! Hanya sebagai fallback.
 */
async function isHostReachable(url, timeoutMs = DETECTION_TIMEOUT) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    await fetch(url, { mode: "no-cors", signal: controller.signal });
    clearTimeout(timer);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Deteksi institusi berdasarkan jaringan saat ini.
 * Prioritas: API endpoint → Host check → Preserve existing → Default Telkom
 * 
 * ⚠️ PENTING: Jangan timpa institusi yang sudah benar dengan default!
 *   Content script bisa sudah melaporkan institusi yang akurat dari halaman.
 */
async function detectNetworkInstitution() {
  console.log("[PustakaONE] 🔍 Memulai auto-deteksi institusi...");

  // METODE 1: API Endpoint (PRIMARY)
  const apiResult = await detectViaApi();
  if (apiResult) {
    detectedInstitution = apiResult;
    await chrome.storage.local.set({ detectedInstitution: apiResult, institutionReportedBy: "api-endpoint" });
    return apiResult;
  }

  // METODE 2: Host Check (FALLBACK) – coba multiple URL per institusi
  console.log("[PustakaONE] 🔄 Fallback ke pengecekan host langsung...");
  const checkOrder = ["Universitas Diponegoro", "Telkom University"];

  for (const institution of checkOrder) {
    const checkUrls = INSTITUTION_CHECK_HOSTS[institution];
    if (!checkUrls || checkUrls.length === 0) continue;

    for (const checkUrl of checkUrls) {
      console.log(`[PustakaONE]   Mencoba: ${institution} → ${checkUrl}`);
      const reachable = await isHostReachable(checkUrl, 4000);
      if (reachable) {
        console.log(`[PustakaONE] ✅ Terdeteksi: ${institution} (${checkUrl} terjangkau)`);
        detectedInstitution = institution;
        await chrome.storage.local.set({ detectedInstitution: institution, institutionReportedBy: "host-check" });
        return institution;
      }
      console.log(`[PustakaONE]   ❌ ${checkUrl} tidak terjangkau`);
    }
  }

  // METODE 3: PERTAHANKAN institusi yang sudah dilaporkan content script!
  // Jangan timpa "Universitas Diponegoro" (dari content script) dengan default "Telkom"!
  const existing = await chrome.storage.local.get(["detectedInstitution", "institutionReportedBy"]);
  if (existing.detectedInstitution && existing.detectedInstitution !== "Telkom University") {
    console.log(`[PustakaONE] 🛡️ Mempertahankan institusi existing: ${existing.detectedInstitution} (source: ${existing.institutionReportedBy || 'unknown'})`);
    detectedInstitution = existing.detectedInstitution;
    return existing.detectedInstitution;
  }

  // METODE 4: Default (hanya jika benar-benar belum ada)
  console.log("[PustakaONE] ⚠️ Tidak ada terdeteksi, fallback ke Telkom University");
  detectedInstitution = "Telkom University";
  await chrome.storage.local.set({ detectedInstitution: "Telkom University" });
  return "Telkom University";
}

async function getActiveInstitution() {
  const data = await chrome.storage.local.get(["manualInstitution", "detectedInstitution", "activeInstitution"]);
  if (data.manualInstitution) {
    console.log("[PustakaONE] Menggunakan institusi manual:", data.manualInstitution);
    return data.manualInstitution;
  }
  if (data.detectedInstitution) {
    console.log("[PustakaONE] Menggunakan institusi terdeteksi:", data.detectedInstitution);
    return data.detectedInstitution;
  }
  return await detectNetworkInstitution();
}

// ---------- Fungsi Proxy ----------
function enableProxy(institution = "Telkom University") {
  return new Promise((resolve) => {
    const proxy = getProxyForInstitution(institution);
    const config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          host: proxy.host,
          port: proxy.port,
          scheme: "http"
        },
        bypassList: [
          "<local>",
          "pustakaone.cloud",
          "*.pustakaone.cloud",
          "*.trycloudflare.com",
          "10.30.1.47",
          "103.247.11.197"
        ]
      }
    };

    chrome.proxy.settings.set({ value: config, scope: "regular" }, () => {
      if (chrome.runtime.lastError) {
        console.error("[PustakaONE] Gagal set proxy:", chrome.runtime.lastError.message);
        resolve(false);
        return;
      }
      chrome.proxy.settings.get({}, (details) => {
        const isFixed = details.value.mode === "fixed_servers";
        console.log(`[PustakaONE] Proxy AKTIF (${institution}) → ${proxy.host}:${proxy.port} | verified:`, isFixed);
        chrome.storage.local.set({ proxyEnabled: true, activeInstitution: institution });
        resolve(isFixed);
      });
    });
  });
}

function disableProxy() {
  return new Promise((resolve) => {
    chrome.proxy.settings.clear({ scope: "regular" }, () => {
      chrome.storage.local.set({ proxyEnabled: false });
      console.log("[PustakaONE] Proxy NONAKTIF");
      resolve();
    });
  });
}

// ---------- Pemeriksaan Tab & Status Aplikasi ----------
/**
 * Aturan proxy ON/OFF:
 * 
 * 🔴 PROXY OFF jika user BELUM login ke PustakaONE (meski buka publisher!)
 * 🔵 PROXY ON  jika user SUDAH login DAN tab aktif adalah publisher
 * 🔴 PROXY OFF jika user sudah login tapi tab aktif BUKAN publisher
 *
 * Auto-reload: jika proxy baru saja dinyalakan, reload tab publisher
 * agar halaman dimuat ulang melalui proxy (hindari "harus refresh dulu").
 */

// Track tab yang baru saja di-reload untuk mencegah infinite loop
const recentlyReloaded = new Set();

async function checkTabStates() {
  const tabs = await chrome.tabs.query({});

  // Tab yang sedang dilihat user
  const activeTab = tabs.find(t => t.active);
  const activeTabUrl = activeTab?.url || "";
  const isActiveTabPublisher = activeTab ? isPublisherUrl(activeTabUrl) : false;

  const data = await chrome.storage.local.get(["isAppLoggedIn"]);
  const isAppLoggedIn = data.isAppLoggedIn || false;
  const institution = await getActiveInstitution();

  console.log(`[PustakaONE] Tab Audit: activePublisher=${isActiveTabPublisher}, AppLoggedIn=${isAppLoggedIn}, Institution=${institution}, activeURL=${activeTabUrl}`);

  // ── Cek status proxy SEBELUM berubah ──
  let proxyWasActive = false;
  try {
    const proxySettings = await new Promise((resolve) => {
      chrome.proxy.settings.get({}, (details) => resolve(details));
    });
    proxyWasActive = proxySettings?.value?.mode === "fixed_servers";
  } catch (e) { /* ignore */ }

  // ── ATURAN UTAMA ──
  if (!isAppLoggedIn) {
    // Belum login → PROXY WAJIB OFF (meskipun lagi buka publisher!)
    console.log("[PustakaONE] 🔒 User belum login, proxy OFF");
    await disableProxy();
  } else if (isActiveTabPublisher) {
    // Sudah login + tab aktif publisher → PROXY ON
    console.log("[PustakaONE] 🔵 User login & tab publisher aktif, proxy ON");
    await enableProxy(institution);

    // ⭐ Auto-reload: jika proxy baru saja dinyalakan (OFF→ON), reload tab publisher
    //    agar halaman dimuat ulang melalui proxy. Hindari "harus refresh manual".
    if (!proxyWasActive && activeTab && activeTab.id && !recentlyReloaded.has(activeTab.id)) {
      const tabUrl = activeTab.url || "";
      // Jangan reload tab kosong, chrome://, atau PustakaONE
      if (tabUrl && !tabUrl.startsWith("chrome://") && !tabUrl.startsWith("about:") &&
          !tabUrl.includes("pustakaone.cloud") && !tabUrl.includes("10.30.1.47") &&
          !tabUrl.includes("103.247.11.197") && !tabUrl.includes("localhost")) {
        console.log(`[PustakaONE] 🔄 Auto-reload tab ${activeTab.id} (proxy baru dinyalakan): ${tabUrl}`);
        recentlyReloaded.add(activeTab.id);
        chrome.tabs.reload(activeTab.id);
        // Hapus dari set setelah 5 detik agar reload berikutnya (user manual) bisa normal
        setTimeout(() => recentlyReloaded.delete(activeTab.id), 5000);
      }
    }
  } else {
    // Sudah login tapi tab aktif bukan publisher → PROXY OFF
    console.log("[PustakaONE] 🔴 User login tapi bukan tab publisher, proxy OFF");
    await disableProxy();
  }
}

// ---------- Message Handler ----------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[PustakaONE] Pesan diterima:", message.action, "dari:", sender.tab ? sender.tab.url : "popup/internal");

  // 1. enableAndOpen
  if (message.action === "enableAndOpen") {
    if (sender.tab) {
      try {
        const senderUrl = new URL(sender.tab.url);
        if (!isDomainAllowed(senderUrl.hostname)) {
          console.error("[PustakaONE] DITOLAK: Perintah ilegal dari", senderUrl.hostname);
          sendResponse({ status: "rejected", reason: "domain_not_allowed" });
          return;
        }
      } catch (e) {
        console.error("[PustakaONE] Error parsing sender URL:", e);
        sendResponse({ status: "error", reason: "url_parse_error" });
        return;
      }
    }

    const targetUrl = message.url;
    const institution = message.institution || getActiveInstitution();
    console.log("[PustakaONE] Mengaktifkan proxy dan membuka:", targetUrl, "untuk", institution);

    Promise.resolve(institution).then(inst =>
      enableProxy(inst).then((proxyOk) => {
        console.log("[PustakaONE] Proxy status setelah enable:", proxyOk);
        return new Promise(resolve => setTimeout(() => resolve(proxyOk), 300));
      }).then(() => {
        console.log("[PustakaONE] Proxy siap, membuka tab baru:", targetUrl);
        return chrome.tabs.create({ url: targetUrl });
      }).then((tab) => {
        console.log("[PustakaONE] Tab berhasil dibuat:", tab.id);
        sendResponse({ status: "enabled", tabId: tab.id });
      })
    ).catch((err) => {
      console.error("[PustakaONE] Error:", err);
      sendResponse({ status: "error", reason: err.message });
    });

    return true;
  }

  // 2. disable
  else if (message.action === "disable") {
    disableProxy().then(() => {
      sendResponse({ status: "disabled" });
    });
    return true;
  }

  // 3. reportAppState
  else if (message.action === "reportAppState") {
    chrome.storage.local.set({ isAppLoggedIn: message.loggedIn }, () => {
      console.log("[PustakaONE] App login status reported:", message.loggedIn);
      checkTabStates();
      sendResponse({ status: "state_updated" });
    });
    return true;
  }

  // 4. reportInstitution (dari content script) – PALING DIPERCAYA karena dari halaman!
  else if (message.action === "reportInstitution") {
    const institution = normalizeInstitution(message.institution);
    const source = message.source || "content-script";
    console.log(`[PustakaONE] Institusi dilaporkan dari ${source}: ${institution}`);

    chrome.storage.local.get("manualInstitution", (data) => {
      if (!data.manualInstitution) {
        // Set flag institutionReportedBy agar detectNetworkInstitution tidak menimpa
        chrome.storage.local.set({
          detectedInstitution: institution,
          institutionReportedBy: source
        }, () => {
          console.log("[PustakaONE] ✅ Institusi diperbarui dari content-script:", institution);
          checkTabStates();
        });
      } else {
        console.log("[PustakaONE] ⏭️ Manual override aktif, abaikan laporan content-script");
      }
    });
    sendResponse({ status: "institution_updated", institution });
    return true;
  }

  // 5. getStatus – baca status proxy LANGSUNG dari Chrome settings (bukan cuma storage!) 
  else if (message.action === "getStatus") {
    (async () => {
      const data = await chrome.storage.local.get(["proxyEnabled", "detectedInstitution", "manualInstitution", "activeInstitution"]);
      const institution = await getActiveInstitution();

      // Verifikasi LANGSUNG ke chrome.proxy.settings (paling akurat!)
      let actualProxyActive = data.proxyEnabled || false;
      try {
        const proxySettings = await new Promise((resolve) => {
          chrome.proxy.settings.get({}, (details) => resolve(details));
        });
        actualProxyActive = proxySettings?.value?.mode === "fixed_servers";

        // Sync: jika proxy aktif tapi storage bilang false → perbaiki storage
        if (actualProxyActive && !data.proxyEnabled) {
          console.log("[PustakaONE] 🔧 Sinkronisasi: proxy aktif tapi storage stale, perbaiki...");
          await chrome.storage.local.set({ proxyEnabled: true });
        }
        if (!actualProxyActive && data.proxyEnabled) {
          console.log("[PustakaONE] 🔧 Sinkronisasi: storage stale (true tapi proxy off), perbaiki...");
          await chrome.storage.local.set({ proxyEnabled: false });
        }
      } catch (e) {
        console.log("[PustakaONE] ⚠️ Gagal baca proxy settings:", e.message);
      }

      sendResponse({
        enabled: actualProxyActive,
        institution: institution,
        detectedInstitution: data.detectedInstitution || null,
        manualInstitution: data.manualInstitution || null
      });
    })();
    return true;
  }

  // 6. detectNetwork (dari popup) – prioritaskan content-script report!
  else if (message.action === "detectNetwork") {
    (async () => {
      // Cek dulu: apakah content script sudah melaporkan institusi dari halaman?
      const stored = await chrome.storage.local.get(["detectedInstitution", "institutionReportedBy"]);
      
      if (stored.institutionReportedBy === "content-script-dom" && 
          stored.detectedInstitution && 
          stored.detectedInstitution !== "Telkom University") {
        // Content script report adalah yang PALING AKURAT (dari halaman dashboard!)
        console.log(`[PustakaONE] 📍 Menggunakan institusi dari content-script: ${stored.detectedInstitution}`);
        sendResponse({ institution: stored.detectedInstitution });
        chrome.storage.local.get("proxyEnabled", (data) => {
          if (data.proxyEnabled) {
            enableProxy(stored.detectedInstitution);
          }
        });
        return;
      }

      // Kalau tidak ada content-script report, jalankan network detection
      const institution = await detectNetworkInstitution();
      sendResponse({ institution: institution });
      chrome.storage.local.get("proxyEnabled", (data) => {
        if (data.proxyEnabled) {
          enableProxy(institution);
        }
      });
    })();
    return true;
  }

  // 7. setManualInstitution (override dari popup)
  else if (message.action === "setManualInstitution") {
    const institution = message.institution || null;
    chrome.storage.local.set({ manualInstitution: institution }, () => {
      console.log("[PustakaONE] Manual institution set:", institution);
      sendResponse({ status: "ok", institution: institution });
      checkTabStates();
    });
    return true;
  }
});

// ---------- Event Listener Tab ----------
// Tab ditutup → cek apakah masih ada publisher tab
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  setTimeout(checkTabStates, 500);
});

// URL tab berubah (navigasi) → cek ulang
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    checkTabStates();
  }
});

// ⭐ User pindah tab → cek apakah tab baru adalah publisher
//    Ini kunci fitur: proxy MATI saat pindah ke tab non-publisher,
//    proxy NYALA lagi saat kembali ke tab publisher.
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("[PustakaONE] 🔄 Tab switch terdeteksi, cek ulang...");
  checkTabStates();
});

// ---------- Inisialisasi ----------
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({ proxyEnabled: false, isAppLoggedIn: false });
  console.log("[PustakaONE] Extension terinstall, proxy di-reset.");
  await detectNetworkInstitution();
  console.log("[PustakaONE] Deteksi awal selesai.");
});

chrome.runtime.onStartup.addListener(async () => {
  console.log("[PustakaONE] Browser startup, deteksi jaringan & sinkronisasi proxy...");

  // Sinkronisasi: cek apakah proxy masih aktif dari session sebelumnya
  try {
    const proxySettings = await new Promise((resolve) => {
      chrome.proxy.settings.get({}, (details) => resolve(details));
    });
    const isProxyActive = proxySettings?.value?.mode === "fixed_servers";
    if (isProxyActive) {
      console.log("[PustakaONE] 🔧 Proxy masih aktif dari session sebelumnya, sinkronkan storage...");
      await chrome.storage.local.set({ proxyEnabled: true });
    }
  } catch (e) {
    console.log("[PustakaONE] ⚠️ Gagal sinkronisasi proxy state:", e.message);
  }

  await detectNetworkInstitution();
  checkTabStates();
});

// ---------- Alarm: Deteksi ulang jaringan setiap 30 menit ----------
chrome.alarms.create("networkRedetect", { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "networkRedetect") {
    console.log("[PustakaONE] ⏰ Alarm: deteksi ulang jaringan...");
    const previous = detectedInstitution;
    const current = await detectNetworkInstitution();
    if (previous !== current) {
      console.log(`[PustakaONE] 🔄 Jaringan berubah: ${previous} → ${current}`);
      checkTabStates();
    }
  }
});
