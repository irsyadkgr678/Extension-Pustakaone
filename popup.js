// ============================
// PustakaONE Proxy - Popup Logic (Secure Mode)
// ============================

const statusCard = document.getElementById("statusCard");
const statusIcon = document.getElementById("statusIcon");
const statusText = document.getElementById("statusText");
const infoText = document.getElementById("infoText");
const btnStop = document.getElementById("btnStop");
const instName = document.getElementById("instName");
const instMethod = document.getElementById("instMethod");
const btnDetect = document.getElementById("btnDetect");
const detectIcon = document.getElementById("detectIcon");
const detectText = document.getElementById("detectText");

function updateUI() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (!response) return;

    // --- Status Proxy ---
    if (response.enabled) {
      statusCard.classList.add("active");
      statusIcon.textContent = "verified_user";
      statusText.textContent = "Akses Aktif";
      infoText.textContent = "Lalu lintas jurnal sedang diteruskan melalui gateway kampus yang aman.";
      btnStop.style.display = "flex";
    } else {
      statusCard.classList.remove("active");
      statusIcon.textContent = "lock";
      statusText.textContent = "Terkunci";
      infoText.textContent = "Silakan login ke Dashboard PustakaONE untuk mengaktifkan akses otomatis.";
      btnStop.style.display = "none";
    }

    // --- Info Institusi ---
    const institution = response.institution || "Telkom University";
    instName.textContent = institution;

    if (response.manualInstitution) {
      instMethod.textContent = "⚙️ Dipilih manual";
      instMethod.style.color = "#fbbf24";
    } else if (response.detectedInstitution) {
      instMethod.textContent = "📍 Terdeteksi otomatis";
      instMethod.style.color = "#34d399";
    } else {
      instMethod.textContent = "🔍 Mendeteksi...";
      instMethod.style.color = "#94a3b8";
    }
  });
}

// Tombol "Putuskan Koneksi"
btnStop.addEventListener("click", () => {
  btnStop.style.opacity = "0.7";
  chrome.runtime.sendMessage({ action: "disable" }, () => {
    setTimeout(() => {
      updateUI();
      btnStop.style.opacity = "1";
    }, 300);
  });
});

// Tombol "Deteksi Ulang Jaringan"
btnDetect.addEventListener("click", () => {
  btnDetect.disabled = true;
  detectIcon.textContent = "sync";
  detectIcon.classList.add("spin");
  detectText.textContent = "Mendeteksi...";

  chrome.runtime.sendMessage({ action: "detectNetwork" }, (response) => {
    btnDetect.disabled = false;
    detectIcon.classList.remove("spin");
    detectIcon.textContent = "network_check";
    detectText.textContent = "Deteksi Ulang Jaringan";

    if (response && response.institution) {
      instName.textContent = response.institution;
      instMethod.textContent = "📍 Terdeteksi otomatis";
      instMethod.style.color = "#34d399";
    }

    setTimeout(updateUI, 500);
  });
});

// Update UI saat popup dibuka
updateUI();

