// =============================================
// makeAutomatic - AI-TestBuddy Frontend Logic
// =============================================

const apiUrl = "https://77stzif1o3.execute-api.us-east-1.amazonaws.com/default/";
const dims = ["dulce", "salado", "ácido", "amargo", "umami", "picante", "crujiente"];
let values = [0.4, 0.6, 0.3, 0.2, 0.8, 0.4, 0.6];
let radarChart;

// --- Inicialización del radar ---
function drawRadar() {
  const ctx = document.getElementById("tasteRadar").getContext("2d");
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: dims,
      datasets: [
        {
          label: "Vector actual",
          data: values,
          borderColor: "#58a6ff",
          backgroundColor: "rgba(88,166,255,0.2)",
          borderWidth: 2,
          pointBackgroundColor: "#1f6feb",
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
}

// --- Envío de mensaje al backend ---
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
    console.error("Error al conectar con AI-TestBuddy:", err);
    document.getElementById("reply").innerText =
      "Error de conexión con el servidor IA.";
  }
}

// --- Actualizar UI tras recibir respuesta ---
function updateUI(data) {
  const replyEl = document.getElementById("reply");
  const explanationEl = document.getElementById("explanation");

  if (data.reply && !data.reply.includes("Perfil reiniciado")) {
    replyEl.innerText = data.reply;
  } else {
    replyEl.innerText = "";
  }

  if (data.explanation && !data.explanation.includes("Este demo demuestra")) {
    explanationEl.innerText = data.explanation;
  } else {
    explanationEl.innerText = "";
  }

  values = dims.map((d) => data.vector?.[d] ?? 0);
  drawRadar();
}

// --- Control de eventos ---
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

// === Simple Carousel Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".carousel-item");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  let index = 0;

  function showSlide(i) {
    const inner = document.querySelector(".carousel-inner");
    inner.style.transform = `translateX(-${i * 100}%)`;

    // 🔔 NUEVO: notifica a los scripts que el slide cambió
    const event = new CustomEvent("slideChanged", { detail: { index: i } });
    document.dispatchEvent(event);
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % items.length;
    showSlide(index);
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + items.length) % items.length;
    showSlide(index);
  });
});

// --- Inicialización automática ---
document.addEventListener("DOMContentLoaded", setupAIInteraction);

window.addEventListener("resize", () => {
  const canvas = document.getElementById("tasteRadar");
  if (canvas && typeof radarChart !== "undefined" && radarChart) {
    radarChart.resize();
  }
});
