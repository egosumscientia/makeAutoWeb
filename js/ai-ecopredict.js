// ai-ecopredict.js — versión con línea y valor medio en eje Y
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ecoCanvas");
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("btnPredict");
  const API_URL = "https://5835qh1c9b.execute-api.us-east-1.amazonaws.com";
  let idleAnim;

  function getCssSize(el) {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  }

  function setCanvasSize() {
    const { width, height } = getCssSize(canvas);
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const w = Math.max(100, Math.round(width));
    const h = Math.max(100, Math.round(height || Math.max(220, width * 0.55)));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { cssWidth: w, cssHeight: h };
  }

  function clearBackground(w, h) {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, w, h);
  }

  // Spinner inicial
  function drawIdleState() {
    const { cssWidth: w, cssHeight: h } = setCanvasSize();
    cancelAnimationFrame(idleAnim);
    clearBackground(w, h);

    const title = "AI–EcoPredict listo 🌍";
    const subtitle = "Presiona 'Predecir' para generar datos";
    let radius = 8, growing = true;

    const loop = () => {
      clearBackground(w, h);
      ctx.fillStyle = "#00ffd0";
      ctx.font = `${Math.round(h * 0.06)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(title, w / 2, h * 0.18);

      ctx.fillStyle = "#888";
      ctx.font = `${Math.round(h * 0.04)}px monospace`;
      ctx.fillText(subtitle, w / 2, h * 0.30);

      ctx.beginPath();
      ctx.arc(w / 2, h * 0.58, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#00ffd0";
      ctx.lineWidth = 2;
      ctx.stroke();

      radius += growing ? 0.45 : -0.45;
      if (radius > 18) growing = false;
      if (radius < 8) growing = true;
      idleAnim = requestAnimationFrame(loop);
    };
    loop();
  }

  function drawChart(data) {
    const { cssWidth: w, cssHeight: h } = setCanvasSize();
    cancelAnimationFrame(idleAnim);
    clearBackground(w, h);

    const points = [...(data.datos_pasados || []), ...(data.prediccion || [])];
    if (!points.length) return drawIdleState();

    const temps = points.map(p => p.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min || 1;
    const mid = (max + min) / 2; // Valor medio

    const padX = w * 0.12;
    const padY = h * 0.15;
    const chartW = w - padX * 1.6;
    const chartH = h - padY * 2;

    // Título
    ctx.fillStyle = "#00ffd0";
    ctx.font = `${h * 0.045}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const last = points[points.length - 1];
    ctx.fillText(`📍 ${data.region} — ${last.temp.toFixed(2)} °C a las ${last.hora}`, padX * 0.3, padY * 0.06);

    // Curva
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "#00ffd0");
    grad.addColorStop(1, "#00bfff");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = padX + (i / (points.length - 1)) * chartW;
      const y = padY + chartH * (1 - (p.temp - min) / range);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Puntos
    ctx.fillStyle = "#00ffd0";
    points.forEach((p, i) => {
      const x = padX + (i / (points.length - 1)) * chartW;
      const y = padY + chartH * (1 - (p.temp - min) / range);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Eje Y simple
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, padY + chartH);
    ctx.stroke();

    // 🔹 Línea de referencia media
    const yMid = padY + chartH * (1 - (mid - min) / range);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(padX, yMid);
    ctx.lineTo(padX + chartW, yMid);
    ctx.stroke();

    // 🔹 Etiquetas Y
    ctx.fillStyle = "#888";
    ctx.font = `${h * 0.032}px monospace`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(max.toFixed(1) + "°", padX - 6, padY + 5);
    ctx.fillText(mid.toFixed(1) + "°", padX - 6, yMid);
    ctx.fillText(min.toFixed(1) + "°", padX - 6, padY + chartH - 5);

    // Eje X (horas)
    ctx.fillStyle = "#888";
    ctx.textAlign = "center";
    const step = Math.max(1, Math.floor(points.length / 6));
    points.forEach((p, i) => {
      if (i % step === 0 || i === points.length - 1) {
        const x = padX + (i / (points.length - 1)) * chartW;
        ctx.fillText(p.hora, x, h - padY * 0.35);
      }
    });

    // Leyenda
    ctx.fillStyle = "#00bfff";
    ctx.font = `${h * 0.038}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Temperatura", padX + 5, padY + 6);
  }

  async function fetchPrediction() {
    btn.disabled = true;
    const { cssWidth: w, cssHeight: h } = setCanvasSize();
    clearBackground(w, h);
    ctx.fillStyle = "#00ffd0";
    ctx.font = `${Math.round(h * 0.06)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Obteniendo datos...", w / 2, h / 2);

    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      window.lastData = data;
      drawChart(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      ctx.fillStyle = "#ff4444";
      ctx.fillText("Error al obtener datos", w / 2, h / 2);
    } finally {
      btn.disabled = false;
    }
  }

  btn.addEventListener("click", fetchPrediction);
  drawIdleState();

  // Reinicio automático cuando el slide vuelve a ser visible
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        window.lastData = null;
        drawIdleState();
      }
    }
  }, { threshold: 0.6 });

  io.observe(canvas);
});
