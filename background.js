const PROXY_HOST = "180.250.135.17";
const PROXY_PORT = 3128;
const ALLOWED_DOMAINS = [
  "103.247.11.197",
  "10.30.1.47",
  "localhost",
  "127.0.0.1",
  "pustakaone.cloud",
  "*.pustakaone.cloud",
  "*.trycloudflare.com"
];

function isDomainAllowed(hostname) {
  return ALLOWED_DOMAINS.some(d => {
    if (d.startsWith("*.")) {

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

  "*.acm.org", "acm.org",
  "*.dl.acm.org", "dl.acm.org",

  "*.bloomsbury.com", "bloomsbury.com",
  "*.bloomsburycollections.com", "bloomsburycollections.com",

  "*.gale.com", "gale.com",

  "*.theiet.org", "theiet.org",
  "*.digital-library.theiet.org",

  "*.igi-global.com", "igi-global.com",
  "*.iglibrary.com", "iglibrary.com",

  "*.inderscience.com", "inderscience.com",
  "*.inderscienceonline.com", "inderscienceonline.com",

  "*.statista.com", "statista.com",

  "*.worldscientific.com", "worldscientific.com",
  "*.world-scientific.com", "world-scientific.com",

  "*.taylorfrancis.com", "taylorfrancis.com",
  "*.tandf.co.uk", "tandf.co.uk",

  "*.cambridge.org", "cambridge.org",

  "*.oup.com", "oup.com",
  "*.oxfordjournals.org", "oxfordjournals.org",
  "*.oxfordscholarship.com", "oxfordscholarship.com",

  "*.acs.org", "acs.org",
  "*.pubs.acs.org",

  "*.iop.org", "iop.org",
  "*.iopscience.iop.org",

  "*.aip.org", "aip.org",
  "*.scitation.org", "scitation.org",

  "*.degruyter.com", "degruyter.com",

  "*.brill.com", "brill.com",

  "*.muse.jhu.edu",

  "*.pubmed.ncbi.nlm.nih.gov",
  "*.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov",

  "*.arxiv.org", "arxiv.org",

  "*.ssrn.com", "ssrn.com",

  "*.doaj.org", "doaj.org",

  "*.oecd-ilibrary.org", "oecd-ilibrary.org",

  "*.heinonline.org", "heinonline.org",

  "*.mitpressjournals.org",
  "*.direct.mit.edu",

  "*.apa.org", "apa.org",
  "*.psycnet.apa.org",

  "*.spie.org", "spie.org",
  "*.spiedigitallibrary.org",

  "*.asce.org", "asce.org",
  "*.ascelibrary.org",

  "*.asme.org", "asme.org",

  "*.siam.org", "siam.org",
  "*.epubs.siam.org",

  "*.karger.com", "karger.com",

  "*.thieme-connect.com", "thieme-connect.com",

  "*.lww.com", "lww.com",
  "*.wolterskluwer.com", "wolterskluwer.com",

  "*.biomedcentral.com", "biomedcentral.com",

  "*.plos.org", "plos.org",

  "*.frontiersin.org", "frontiersin.org",

  "*.mdpi.com", "mdpi.com",

  "*.hindawi.com", "hindawi.com",

  "*.garuda.kemdikbud.go.id",

  "*.neliti.com", "neliti.com",

  "*.onesearch.id", "onesearch.id"
];

function generatePacScript() {
  const conditions = PUBLISHER_DOMAINS.map(d => `shExpMatch(host, "${d}")`).join(" ||\n    ");
  return `function FindProxyForURL(url, host) {
    if (${conditions}) { return "PROXY ${PROXY_HOST}:${PROXY_PORT}"; }
    return "DIRECT";
  }`;
}

function enableProxy() {
  return new Promise((resolve) => {
    const config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          host: PROXY_HOST,
          port: PROXY_PORT,
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

    chrome.proxy.settings.set({
      value: config,
      scope: "regular"
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("[PustakaONE] Gagal set proxy:", chrome.runtime.lastError.message);
        resolve(false);
        return;
      }

      chrome.proxy.settings.get({}, (details) => {
        const isFixed = details.value.mode === "fixed_servers";
        console.log("[PustakaONE] Proxy AKTIF via fixed_servers, verified:", isFixed, JSON.stringify(details.value));
        chrome.storage.local.set({ proxyEnabled: true });
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

async function checkTabStates() {
  const tabs = await chrome.tabs.query({});
  const hasPublisherTab = tabs.some(t => isPublisherUrl(t.url));

  const data = await chrome.storage.local.get("isAppLoggedIn");
  const isAppLoggedIn = data.isAppLoggedIn || false;

  console.log(`[PustakaONE] Tab Audit: Publisher=${hasPublisherTab}, AppLoggedIn=${isAppLoggedIn}`);

  if (hasPublisherTab || isAppLoggedIn) {
    await enableProxy();
  } else {
    await disableProxy();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[PustakaONE] Pesan diterima:", message.action, "dari:", sender.tab ? sender.tab.url : "popup/internal");

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
    console.log("[PustakaONE] Mengaktifkan proxy dan membuka:", targetUrl);

    enableProxy().then((proxyOk) => {
      console.log("[PustakaONE] Proxy status setelah enable:", proxyOk);

      return new Promise(resolve => setTimeout(() => resolve(proxyOk), 300));
    }).then(() => {
      console.log("[PustakaONE] Proxy siap, membuka tab baru:", targetUrl);
      return chrome.tabs.create({ url: targetUrl });
    }).then((tab) => {
      console.log("[PustakaONE] Tab berhasil dibuat:", tab.id);
      sendResponse({ status: "enabled", tabId: tab.id });
    }).catch((err) => {
      console.error("[PustakaONE] Error:", err);
      sendResponse({ status: "error", reason: err.message });
    });

    return true;
  }

  else if (message.action === "disable") {
    disableProxy().then(() => {
      sendResponse({ status: "disabled" });
    });
    return true;
  }

  else if (message.action === "reportAppState") {
    chrome.storage.local.set({ isAppLoggedIn: message.loggedIn }, () => {
      console.log("[PustakaONE] App login status reported:", message.loggedIn);
      checkTabStates();
      sendResponse({ status: "state_updated" });
    });
    return true;
  }

  else if (message.action === "getStatus") {
    chrome.storage.local.get("proxyEnabled", (data) => {
      sendResponse({ enabled: data.proxyEnabled || false });
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {

  setTimeout(checkTabStates, 500);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    checkTabStates();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ proxyEnabled: false, isAppLoggedIn: false });
  console.log("[PustakaONE] Extension terinstall, proxy di-reset.");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("[PustakaONE] Browser startup, cek ulang proxy...");
  checkTabStates();
});
