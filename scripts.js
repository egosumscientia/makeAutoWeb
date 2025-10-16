// =============================================
// makeAutomatic - AI-TestBuddy + Carrusel
// =============================================

const apiUrl = "https://77stzif1o3.execute-api.us-east-1.amazonaws.com/default/";
const dims = ["dulce", "salado", "ácido", "amargo", "umami", "picante", "crujiente"];
let values = [0.4, 0.6, 0.3, 0.2, 0.8, 0.4, 0.6];
let radarChart;

// --- Inicialización del radar ---
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

  console.log("Dibujando radar con:", { dims, values });
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
  } else replyEl.innerText = "";
  if (data.explanation && !data.explanation.includes("Este demo demuestra")) {
    explanationEl.innerText = data.explanation;
  } else explanationEl.innerText = "";
  values = dims.map((d) => data.vector?.[d] ?? 0);
  drawRadar();
}

// --- Configuración del demo de IA ---
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

// === Carousel Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".carousel-item");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const inner = document.querySelector(".carousel-inner");
  let index = 0;

  if (items.length > 0) items[0].classList.add("active");
  inner.style.transform = "translateX(0)";
  setTimeout(drawRadar, 150);

  function showSlide(i) {
    items.forEach(item => item.classList.remove("active"));
    items[i].classList.add("active");
    inner.style.transform = `translateX(-${i * 100}%)`;
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

  setupAIInteraction();
});

// === Ajuste de tamaño del radar ===
window.addEventListener("resize", () => {
  if (radarChart) radarChart.resize();
});

window.addEventListener("load", () => {
  setTimeout(drawRadar, 300);
});

// === Evento global para EcoPredict ===
document.addEventListener("slideChanged", (e) => {
  if (e.detail.index === 1) {
    console.log("Mostrando slide 2: EcoPredict");
    document.dispatchEvent(new CustomEvent("ecoPredictInit"));
  }
});
