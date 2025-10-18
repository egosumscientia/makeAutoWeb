// ai-ecopredict.js — versión final responsiva con spinner restaurado y compatibilidad Safari
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ecoCanvas");
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("btnPredict");
  const API_URL = "https://5835qh1c9b.execute-api.us-east-1.amazonaws.com";
  let idleAnim;

  // ------------------ FONDO ------------------
  function clearBackground() {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ------------------ ESTADO INICIAL (SPINNER) ------------------
  function drawIdleState() {
    cancelAnimationFrame(idleAnim);
    clearBackground();

    const title = "AI–EcoPredict listo 🌍";
    const subtitle = "Presiona 'Predecir' para generar datos";
    let radius = 8, growing = true;

    const loop = () => {
      clearBackground();
      ctx.fillStyle = "#00ffd0";
      ctx.font = `${canvas.height * 0.08}px monospace`;
      const tw = ctx.measureText(title).width;
      ctx.fillText(title, (canvas.width - tw) / 2, canvas.height * 0.35);

      ctx.fillStyle = "#888";
      ctx.font = `${canvas.height * 0.06}px monospace`;
      const sw = ctx.measureText(subtitle).width;
      ctx.fillText(subtitle, (canvas.width - sw) / 2, canvas.height * 0.47);

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height * 0.63, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#00ffd0";
      ctx.lineWidth = 2;
      ctx.stroke();

      radius += growing ? 0.4 : -0.4;
      if (radius > 15 || radius < 8) growing = !growing;
      idleAnim = requestAnimationFrame(loop);
    };
    loop();
  }

  // ------------------ CONFIGURACIÓN CANVAS ------------------
  function resizeCanvas() {
    const width = canvas.parentElement.offsetWidth;
    const height = Math.max(220, width * 0.55);
    canvas.width = width;
    canvas.height = height;
    if (window.lastData) drawChart(window.lastData);
  }

  window.addEventListener("resize", resizeCanvas);

  // Mostrar spinner unos ms antes del primer resize
  drawIdleState();
  setTimeout(resizeCanvas, 200);

  // ------------------ GRAFICADO PRINCIPAL ------------------
  function drawChart(data) {
    cancelAnimationFrame(idleAnim);
    clearBackground();

    const points = [...data.datos_pasados, ...data.prediccion];
    const temps = points.map(p => p.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min || 1;

    const padX = canvas.width * 0.1;
    const padY = canvas.height * 0.15;
    const chartW = canvas.width - padX * 2;
    const chartH = canvas.height - padY * 2;

    // --- Título ---
    ctx.fillStyle = "#00ffd0";
    ctx.font = `${canvas.height * 0.045}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const titleText = `📍 ${data.region} — ${points.at(-1).temp.toFixed(2)} °C a las ${points.at(-1).hora}`;
    ctx.fillText(titleText, padX * 0.3, padY * 0.08);

    // --- Curva ---
    ctx.lineWidth = 2;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "#00ffd0");
    grad.addColorStop(1, "#00bfff");
    ctx.strokeStyle = grad;
    ctx.fillStyle = "#00ffd0";

    ctx.beginPath();
    points.forEach((p, i) => {
      const x = padX + (i / (points.length - 1)) * chartW;
      const y = padY + chartH * (1 - (p.temp - min) / range);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // --- Puntos y etiquetas ---
    const labelFs = Math.max(10, Math.round(canvas.height * 0.035));
    ctx.font = `${labelFs}px monospace`;
    ctx.fillStyle = "#00ffd0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle"; // Safari-safe baseline

    const step = Math.max(1, Math.floor(points.length / 6));
    let lastLabelBox = null;

    points.forEach((p, i) => {
      const x = padX + (i / (points.length - 1)) * chartW;
      const y = padY + chartH * (1 - (p.temp - min) / range);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      if (!(i % step === 0 || i === points.length - 1)) return;

      const text = `${p.temp.toFixed(1)}°`;
      const textW = ctx.measureText(text).width;
      const margin = 8;
      let ly = y - 14;

      if (ly > padY + chartH - (labelFs + margin)) ly = y - (labelFs + 8);
      if (ly < padY + labelFs + margin) ly = y + (labelFs + 4);

      if (lastLabelBox) {
        const box = { x: x - textW / 2, y: ly - labelFs, w: textW, h: labelFs + 6 };
        const interseca =
          !(box.x + box.w < lastLabelBox.x ||
            lastLabelBox.x + lastLabelBox.w < box.x ||
            box.y + box.h < lastLabelBox.y ||
            lastLabelBox.y + lastLabelBox.h < box.y);
        if (interseca) ly = lastLabelBox.y - 6;
        lastLabelBox = { x: x - textW / 2, y: ly - labelFs, w: textW, h: labelFs + 6 };
      } else {
        lastLabelBox = { x: x - textW / 2, y: ly - labelFs, w: textW, h: labelFs + 6 };
      }

      ctx.fillText(text, x, ly);
    });

    // --- Eje inferior ---
    ctx.fillStyle = "#888";
    ctx.font = `${canvas.height * 0.032}px monospace`;
    ctx.textBaseline = "alphabetic";
    points.forEach((p, i) => {
      if (i % step === 0 || i === points.length - 1) {
        const x = padX + (i / (points.length - 1)) * chartW;
        ctx.textAlign = "center";
        ctx.fillText(p.hora, x, canvas.height - padY * 0.35);
      }
    });

    // --- Leyenda ---
    const legendFs = Math.round(canvas.height * 0.038);
    ctx.fillStyle = "#00bfff";
    ctx.font = `${legendFs}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Temperatura", padX, padY + 6);
  }

  // ------------------ FETCH AWS ------------------
  const fetchPrediction = async () => {
    btn.disabled = true;
    cancelAnimationFrame(idleAnim);
    clearBackground();
    ctx.fillStyle = "#00ffd0";
    ctx.font = `${canvas.height * 0.06}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("Obteniendo datos...", canvas.width / 2, canvas.height / 2);

    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      window.lastData = data;
      drawChart(data);
    } catch (e) {
      console.error("Error fetching data:", e);
      ctx.fillStyle = "#ff4444";
      ctx.fillText("Error al obtener datos", canvas.width / 2, canvas.height / 2);
    } finally {
      btn.disabled = false;
    }
  };

  btn.addEventListener("click", fetchPrediction);
});
