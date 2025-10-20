// =============================================
// makeAutomatic - AI-TestBuddy Demo
// Vector visual adaptation of human preferences
// =============================================

const apiUrl = "https://xktoesq7ujs5llzmjtoncmep240dgpxa.lambda-url.us-east-1.on.aws/";
const dims = ["dulce", "salado", "ácido", "amargo", "umami", "picante", "crujiente"];
let values = [0.4, 0.6, 0.3, 0.2, 0.8, 0.4, 0.6];
let radarChart;

// --- Radar Chart Initialization ---
function drawRadar() {
  const canvas = document.getElementById("tasteRadar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = 400;
  ctx.canvas.height = 400;

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: dims,
      datasets: [
        {
          label: "Vector actual",
          data: values,
          borderColor: "#22D3EE",
          backgroundColor: "rgba(34,211,238,0.35)",
          borderWidth: 3,
          pointBackgroundColor: "#22D3EE",
        },
      ],
    },
    options: {
      scales: {
        r: {
          min: 0,
          max: 1,
          grid: { color: "#333" },
          ticks: { stepSize: 0.2, color: "#999" },
        },
      },
      plugins: { legend: { display: false } },
    },
  });

  console.log("Drawing radar with:", { dims, values });
}

// --- Backend Communication ---
async function sendToTestBuddy(message) {
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    updateUI(data);
  } catch (err) {
    console.error("Error connecting to AI-TestBuddy:", err);
    document.getElementById("reply").innerText =
      "Error de conexión con el servidor IA.";
  }
}

// --- UI Updates after API Response ---
function updateUI(data) {
  const replyEl = document.getElementById("reply");
  const explanationEl = document.getElementById("explanation");
  if (data.reply && !data.reply.includes("Perfil reiniciado")) {
    replyEl.innerText = data.reply;
  } else replyEl.innerText = "";
  if (data.explanation && !data.explanation.includes("Este demo demuestra")) {
    explanationEl.innerText = data.explanation;
  } else explanationEl.innerText = "";
  values = dims.map((d) => data.vector?.[d] ?? 0);
  drawRadar();
}

// --- AI Demo Setup ---
function setupAIInteraction() {
  const sendBtn = document.getElementById("sendBtn");
  const msgInput = document.getElementById("msg");
  if (!sendBtn || !msgInput) return;
  sendBtn.onclick = () => {
    const msg = msgInput.value.trim();
    if (!msg) return;
    sendToTestBuddy(msg);
    msgInput.value = "";
  };
  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
  drawRadar();
}

// Initialize demo on page load
document.addEventListener("DOMContentLoaded", () => {
  setupAIInteraction();
  setTimeout(drawRadar, 150);
});

// Handle window resize
window.addEventListener("resize", () => {
  if (radarChart) radarChart.resize();
});

window.addEventListener("load", () => {
  setTimeout(drawRadar, 300);
});

// === Reinicio del demo cuando su slide entra al viewport ===
// Guarda el estado inicial una sola vez
const __ma_initialValues = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4];

function __ma_resetAITestBuddy() {
  try {
    values = [...__ma_initialValues];
    const replyEl = document.getElementById("reply");
    const explanationEl = document.getElementById("explanation");
    if (replyEl) replyEl.innerText = "";
    if (explanationEl) explanationEl.innerText = "";
    drawRadar();
    console.log("[AI-TestBuddy] Estado reiniciado por visibilidad del carrusel.");
  } catch (e) {
    console.warn("[AI-TestBuddy] No se pudo reiniciar:", e);
  }
}

// Encuentra el slide que contiene el radar (sin requerir IDs nuevos)
function __ma_getRadarSlide() {
  const radar = document.getElementById("tasteRadar");
  return radar ? radar.closest(".carousel-item") : null;
}

// Observa la visibilidad del slide en el viewport
(function __ma_attachIO(){
  const slide = __ma_getRadarSlide();
  if (!slide) return;

  let wasVisible = false;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const nowVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      if (nowVisible && !wasVisible) {
        __ma_resetAITestBuddy();
      }
      wasVisible = nowVisible;
    }
  }, { threshold: [0.0, 0.5, 1.0] });

  io.observe(slide);
})();
