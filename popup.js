const button = document.getElementById("toggleButton");
const statusText = document.getElementById("statusText");
const powerIcon = button.querySelector("img");

/* -------------------- UI helpers -------------------- */

function setEnabledStyles(enabled) {
  button.style.backgroundColor = enabled ? "#007bff" : "#888";
  powerIcon.style.filter = enabled
    ? "brightness(0) invert(1)"   // ícone branco
    : "grayscale(1) opacity(0.5)"; // ícone cinza
}

async function updateUI() {
  const { blockingEnabled = true } =
    await browser.storage.local.get("blockingEnabled");

  statusText.textContent = blockingEnabled
    ? "Bloqueio Ativado"
    : "Bloqueio Desativado";

  setEnabledStyles(blockingEnabled);
}

/* -------------------- Clique no botão -------------------- */

button.addEventListener("click", async () => {
  const { blockingEnabled = true } =
    await browser.storage.local.get("blockingEnabled");

  const newState = !blockingEnabled;
  await browser.storage.local.set({ blockingEnabled: newState });
  updateUI();

  // Se acabou de ligar, mande o background aplicar a regra agora
  if (newState) {
    browser.runtime.sendMessage({ action: "enforceYouTubeLimit" });
  }
});

/* -------------------- Init -------------------- */
updateUI();

function setEnabledStyles(enabled) {
  button.style.backgroundColor = enabled ? "var(--bg-button-on)" : "var(--bg-button-off)";
  powerIcon.style.filter = enabled
    ? "brightness(0) invert(1)"
    : "grayscale(1) opacity(0.5)";
}
