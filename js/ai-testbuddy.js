// =============================================
// makeAutomatic - AI-TestBuddy Demo
// Vector visual adaptation of human preferences
// =============================================

const apiUrl = "https://xktoesq7ujs5llzmjtoncmep240dgpxa.lambda-url.us-east-1.on.aws/";
const dims = ["dulce", "salado", "ácido", "amargo", "umami", "picante", "crujiente"];
let values = [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4];
let radarChart;
let __lastUserMsg = "";

// --- Normalización y coincidencia exacta ---
function normalizeES(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
const dimsNorm = dims.map(normalizeES);

// --- Radar Chart Initialization ---
function drawRadar() {
  const canvas = document.getElementById("tasteRadar");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = canvas.clientWidth;
  ctx.canvas.height = canvas.clientHeight;

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
      responsive: true,
      maintainAspectRatio: false,
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

  const prevValues = [...values];
  let newValues = [...prevValues];

  // --- Detecta el eje basado en el mensaje del usuario ---
  const userMsgNorm = normalizeES(__lastUserMsg);

  function findDimFromUserMsg(msgNorm) {
    for (let i = 0; i < dims.length; i++) {
      const dimNorm = dimsNorm[i];
      const re = new RegExp(
        `(?:^|[^\\p{L}\\p{N}])${dimNorm}(?:$|[^\\p{L}\\p{N}])`,
        "u"
      );
      if (re.test(msgNorm)) return dims[i];
    }
    return null;
  }

  let targetDim = findDimFromUserMsg(userMsgNorm);

  // --- Detecta comandos de equilibrio o reinicio ---
  if (/equilibrad|reiniciad|reset|inicial/i.test(__lastUserMsg)) {
    values = [...__ma_initialValues];
    drawRadar();
    replyEl.innerText = "Perfil equilibrado restaurado.";
    console.log("[AI-TestBuddy] Estado equilibrado restaurado.");
    return;
  }

  if (!targetDim) {
    values = prevValues;
    drawRadar();
    return;
  }

  // --- Ajuste solo del eje válido ---
  for (let i = 0; i < dims.length; i++) {
    const d = dims[i];
    if (d === targetDim) {
       // Detecta explícitamente la dirección en el mensaje del usuario
        const hasMas = /\b(mas|más|\+)\b/i.test(__lastUserMsg);
        const hasMenos = /\b(menos|-)\b/i.test(__lastUserMsg);

        // Si no hay "más" ni "menos", no cambia nada
        if (!hasMas && !hasMenos) {
          newValues[i] = prevValues[i];
          continue;
        }

        const step = hasMas ? +0.1 : -0.1;
        const nextValue = prevValues[i] + step;
        newValues[i] = Math.min(1, Math.max(0, nextValue));
    } else {
      newValues[i] = prevValues[i];
    }
  }

  values = newValues;
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
    __lastUserMsg = msg; // Guarda lo que el usuario escribió
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

function __ma_getRadarSlide() {
  const radar = document.getElementById("tasteRadar");
  return radar ? radar.closest(".carousel-item") : null;
}

(function __ma_attachIO() {
  const slide = __ma_getRadarSlide();
  if (!slide) return;

  let wasVisible = false;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const nowVisible =
          entry.isIntersecting && entry.intersectionRatio >= 0.5;
        if (nowVisible && !wasVisible) {
          __ma_resetAITestBuddy();
        }
        wasVisible = nowVisible;
      }
    },
    { threshold: [0.0, 0.5, 1.0] }
  );

  io.observe(slide);
})();
