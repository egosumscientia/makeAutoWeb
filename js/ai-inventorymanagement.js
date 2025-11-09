/**
 * AI–InventoryManagement – Animación inicial + simulación IA
 * makeAutomatic – 2025
 * Reinicia la demo cuando el slide entra al viewport.
 */

function renderInventoryDemo() {
  const container = document.querySelector("#ai-demo-carousel .carousel-item:nth-child(4)");
  if (!container) return;
  container.innerHTML = "";

  // ===== Título =====
  const title = document.createElement("h3");
  title.textContent = "AI–InventoryManagement";
  Object.assign(title.style, {
    color: "#22d3ee",
    marginBottom: "0.5rem",
    fontSize: "1.25rem",
    fontWeight: "600",
    textAlign: "center",
  });
  container.appendChild(title);

  // ===== Descripción =====
  const desc = document.createElement("p");
  desc.textContent =
    "Analiza el inventario en tiempo real.";
  Object.assign(desc.style, {
    color: "#94a3b8",
    fontSize: "0.9rem",
    textAlign: "center",
    marginBottom: "1rem",
  });
  container.appendChild(desc);

  // ===== Botón =====
  const button = document.createElement("button");
  button.textContent = "Simular Inventario";
  button.className = "ai-btn";
  button.style.display = "block";
  button.style.margin = "0 auto 0.3rem auto";
  container.appendChild(button);

  // ===== Canvas =====
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  Object.assign(canvas.style, {
    display: "block",
    margin: "0.5rem auto 1rem auto", // más margen abajo
    background: "#0f172a",
    borderRadius: "8px",
    boxShadow: "0 0 8px rgba(0,0,0,0.35)",
    maxWidth: "380px",
    width: "90%",
  });
  container.appendChild(canvas);

  // ===== Tamaño responsivo =====
  function resizeCanvas() {
    const w = container.clientWidth || 400;
    canvas.width = Math.min(w * 0.9, 360);
    canvas.height = window.innerWidth < 600 ? 120 : window.innerWidth < 1024 ? 140 : 160;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // ===== Animación inicial =====
  let pulse = true;
  let phase = 0;
  function drawIdleAnimation() {
    if (!pulse) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const numBoxes = 6;
    const padding = 30;
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - 50;
    const gap = 10;
    const boxW = chartW / numBoxes - gap;
    const midY = canvas.height - 40;

    for (let i = 0; i < numBoxes; i++) {
      const height = chartH / 2 + Math.sin(phase + i * 0.5) * (chartH / 4);
      const x = padding + i * (boxW + gap);
      const y = midY - height;
      const alpha = 0.5 + 0.3 * Math.sin(phase + i);
      ctx.fillStyle = `rgba(34,211,238,${alpha.toFixed(2)})`;
      ctx.fillRect(x, y, boxW, height);
      ctx.strokeStyle = "rgba(34,211,238,0.8)";
      ctx.strokeRect(x, y, boxW, height);
    }

    phase += 0.08;
    requestAnimationFrame(drawIdleAnimation);
  }
  drawIdleAnimation();

  // ===== Resumen =====
  const summary = document.createElement("div");
  Object.assign(summary.style, {
    color: "#e2e8f0",
    fontSize: "0.9rem",
    textAlign: "center",
    marginTop: "0.6rem",
  });
  container.appendChild(summary);
  summary.style.marginBottom = "1.4rem";


  // ===== Barras =====
  function drawBars(categories) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - 60;
    const barGap = 10;
    const barWidth = chartWidth / categories.length - barGap;
    const maxVal = Math.max(...categories.map((c) => c.qty)) * 1.1;

    ctx.font = (window.innerWidth < 600 ? "6.5px Segoe UI" : "10px Segoe UI");
    ctx.textAlign = "center";

    categories.forEach((c, i) => {
      const x = padding + i * (barWidth + barGap);
      const h = (c.qty / maxVal) * chartHeight;
      const y = canvas.height - 30 - h;
      ctx.fillStyle = "rgba(34,211,238,0.8)";
      ctx.fillRect(x, y, barWidth, h);
      ctx.strokeStyle = "rgba(34,211,238,1)";
      ctx.strokeRect(x, y, barWidth, h);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(c.name.slice(0, 5), x + barWidth / 2, canvas.height - (window.innerWidth < 600 ? 20 : 15));
    });

    ctx.fillStyle = "#94a3b8";
    ctx.font = (window.innerWidth < 600 ? "7.5px Segoe UI" : "11px Segoe UI");
  }

  // ===== Evento del botón =====
  button.addEventListener("click", async () => {
    pulse = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    button.disabled = true;
    button.textContent = "Consultando...";
    summary.textContent = "";

    try {
      const res = await fetch("https://4khu7h5wdj7aivcyybxsgayuyu0lyhoy.lambda-url.us-east-1.on.aws/");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const cats = data.categories.slice(0, 5);
      drawBars(cats);
      // informar que cambió el alto del contenido
      document.dispatchEvent(new Event("contentResized"));
      summary.innerHTML = `
        <p><b>Total:</b> ${data.summary.totalItems} &nbsp;|&nbsp;
        <b>Bajo:</b> ${data.summary.lowStock} &nbsp;|&nbsp;
        <b>Sobrestock:</b> ${data.summary.overStock}</p>
        <p><b>Rotación:</b> ${data.summary.rotationRate} &nbsp;|&nbsp;
        <b>Valor:</b> $${data.summary.totalValueUSD.toLocaleString()}</p>`;

      summary.querySelectorAll("p").forEach(p => {
        p.style.margin = "0.2rem 0";
        p.style.lineHeight = "1.1";
      });

      button.textContent = "Simular";

    } catch (err) {
      console.error(err);
      summary.innerHTML = "<span style='color:#f87171;'>Error al obtener datos.</span>";
      button.textContent = "Reintentar";
    } finally {
      button.disabled = false;
    }
  });
}

// === Forzar render inicial + reinicio solo cuando cambie de estado ===
let lastActive = -1; // guarda el último slide activo

function activateInventorySlide() {
  const items = document.querySelectorAll("#ai-demo-carousel .carousel-item");
  items.forEach((item, idx) => {
    if (item.classList.contains("active")) {
      // si es el cuarto slide y no estaba activo antes → renderiza
      if (idx === 3 && lastActive !== 3) {
        renderInventoryDemo();
      }
      lastActive = idx;
    }
  });
}

// === Render inicial al cargar ===
document.addEventListener("DOMContentLoaded", () => {
  activateInventorySlide();

  // Rechequear cada 800 ms para detectar cambio real de slide
  setInterval(() => {
    activateInventorySlide();
  }, 800);
});

  // === Reiniciar ondas al volver a entrar en viewport ===
  const target = document.querySelector("#ai-demo-carousel .carousel-item:nth-child(4)");
  if (target) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          renderInventoryDemo(); // vuelve al estado inicial
          lastActive = 3;
        }
      });
    }, { threshold: 0.4 });

    observer.observe(target);
  }


document.addEventListener("contentResized", () => {
  const car = document.querySelector(".carousel");
  const active = document.querySelector(".carousel-item.active");
  if (!car || !active) return;
  car.style.setProperty("--carousel-base-h", active.scrollHeight + "px");
});
