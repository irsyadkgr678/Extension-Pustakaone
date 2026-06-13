// ============================
// PustakaONE Proxy - Popup Logic (Secure Mode)
// ============================

const statusCard = document.getElementById("statusCard");
const statusIcon = document.getElementById("statusIcon");
const statusText = document.getElementById("statusText");
const infoText = document.getElementById("infoText");
const btnStop = document.getElementById("btnStop");

function updateUI() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (response && response.enabled) {
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
  });
}

btnStop.addEventListener("click", () => {
  // Tambahkan feedback visual saat diklik
  btnStop.style.opacity = "0.7";
  chrome.runtime.sendMessage({ action: "disable" }, () => {
    setTimeout(() => {
      updateUI();
      btnStop.style.opacity = "1";
    }, 300);
  });
});

// Update UI saat popup dibuka
updateUI();

