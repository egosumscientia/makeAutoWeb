// ai-ecopredict.js — versión con suavizado realista tipo sensor + corrección DPI móvil
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ecoCanvas");
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("btnPredict");

  const API_URL = "https://5835qh1c9b.execute-api.us-east-1.amazonaws.com";

  let idleAnim;

  // ------------------ AJUSTE DPI UNIVERSAL ------------------
  function fixDpi(width, height) {
    const dpi = window.devicePixelRatio || 1;
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.scale(dpi, dpi);
  }

  // ------------------ CONFIGURACIÓN CANVAS ------------------
  function resizeCanvas() {
    const parent = canvas.parentElement;
    const width = parent.offsetWidth;
    const height = Math.max(200, width * 0.6);

    canvas.style.width = "100%";
    canvas.style.height = "auto";

    fixDpi(width, height);

    if (ctx) {
      if (window.lastData) {
        drawChart(window.lastData);
      } else {
        drawIdleState();
      }
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("slideChanged", (e) => {
    if (e.detail.index === 1) {
      setTimeout(() => {
        window.lastData = null;
        cancelAnimationFrame(idleAnim);
        drawIdleState();
        resizeCanvas();
      }, 200);
    }
  });

  // ------------------ FONDO ------------------
  function clearBackground() {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ------------------ ESTADO INICIAL ------------------
  function drawIdleState() {
    cancelAnimationFrame(idleAnim);
    clearBackground();

    const title = "AI–EcoPredict listo 🌍";
    const subtitle = "Presiona 'Predecir' para generar datos";

    const titleFont = "18px monospace";
    const subtitleFont = "13px monospace";
    const titleColor = "#00ffd0";
    const subtitleColor = "#888";

    let radius = 8;
    let growing = true;

    const pulse = () => {
      clearBackground();

      ctx.font = titleFont;
      ctx.fillStyle = titleColor;
      const titleWidth = ctx.measureText(title).width;
      const titleX = (canvas.width / (window.devicePixelRatio || 1) - titleWidth) / 2;
      const titleY = Math.round((canvas.height / (window.devicePixelRatio || 1)) * 0.35);
      ctx.fillText(title, titleX, titleY);

      ctx.font = subtitleFont;
      ctx.fillStyle = subtitleColor;
      const subtitleWidth = ctx.measureText(subtitle).width;
      const subtitleX = (canvas.width / (window.devicePixelRatio || 1) - subtitleWidth) / 2;
      const subtitleY = titleY + 30;
      ctx.fillText(subtitle, subtitleX, subtitleY);

      const spinnerY = subtitleY + 30;
      const spinnerX = (canvas.width / (window.devicePixelRatio || 1)) / 2;

      ctx.beginPath();
      ctx.arc(spinnerX, spinnerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "#00ffd0";
      ctx.lineWidth = 2;
      ctx.stroke();

      radius += growing ? 0.4 : -0.4;
      if (radius > 15 || radius < 8) growing = !growing;

      idleAnim = requestAnimationFrame(pulse);
    };

    pulse();
  }

  // ------------------ UTILIDADES DE GRAFICADO ------------------
  function getChartDims(all) {
    const padX = 40;
    const padY = 40;
    const temps = all.map(p => p.temp);
    let min = Math.min(...temps);
    let max = Math.max(...temps);
    const range = Math.max(4, max - min + 1);
    const mid = (max + min) / 2;

    min = mid - range / 2;
    max = mid + range / 2;

    const yScale = (canvas.clientHeight - padY * 2) / (max - min);
    const xStep = (canvas.clientWidth - padX * 2) / (all.length - 1);
    return { padX, padY, min, max, yScale, xStep };
  }

  function drawInfo(region, current) {
    ctx.fillStyle = "#00ffd0";
    ctx.font = "16px monospace";
    ctx.fillText(`📍 ${region} — ${current.temp} °C a las ${current.hora}`, 40, 30);
  }

  function drawLabels(points, dims) {
    ctx.fillStyle = "#888";
    ctx.font = "10px monospace";
    points.forEach((p, i) => {
      const x = dims.padX + i * dims.xStep;
      ctx.fillText(p.hora, x - 10, canvas.height - 20);
    });
  }

  function drawLegend(dims) {
    ctx.fillStyle = "#00bfff";
    ctx.font = "12px monospace";
    ctx.fillText("Temperatura", dims.padX, canvas.height - 5);
  }

  // ------------------ GRAFICADO PRINCIPAL ------------------
  function drawChart(data) {
    cancelAnimationFrame(idleAnim);
    clearBackground();

    const original = [...data.datos_pasados, ...data.prediccion];

    const smoothData = (arr, factor = 0.4) => {
      const result = [arr[0]];
      for (let i = 1; i < arr.length; i++) {
        const prev = result[i - 1].temp;
        const curr = arr[i].temp;
        const smoothed = prev * factor + curr * (1 - factor);
        result.push({ ...arr[i], temp: +smoothed.toFixed(2) });
      }
      return result;
    };

    const all = smoothData(original);
    const dims = getChartDims(all);
    const current = all[all.length - 1];
    const yOffsetFix = 10; // compensación vertical universal

    drawInfo(data.region, current);

    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, canvas.clientWidth, 0);
    gradient.addColorStop(0, "#00ffd0");
    gradient.addColorStop(1, "#00bfff");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();

    all.forEach((p, i) => {
      const x = dims.padX + i * dims.xStep;
      const y =
        canvas.clientHeight -
        dims.padY -
        (p.temp - dims.min) * dims.yScale -
        yOffsetFix;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#00ffd0";
    all.forEach((p, i) => {
      const x = dims.padX + i * dims.xStep;
      const y =
        canvas.clientHeight -
        dims.padY -
        (p.temp - dims.min) * dims.yScale -
        yOffsetFix;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    const labelStep = Math.max(1, Math.floor(all.length / 6));
    ctx.font = `${Math.round(canvas.clientWidth * 0.02)}px monospace`;
    ctx.fillStyle = "#00ffd0";

    all.forEach((p, i) => {
      if (i % labelStep === 0 || i === all.length - 1) {
        const x = dims.padX + i * dims.xStep;
        const y =
          canvas.clientHeight -
          dims.padY -
          (p.temp - dims.min) * dims.yScale -
          yOffsetFix;
        const yOffset = i % 2 === 0 ? -14 : 16;
        ctx.fillText(`${p.temp.toFixed(1)}°`, x - 10, y + yOffset);
      }
    });

    drawLabels(all, dims);
    drawLegend(dims);
  }

  // ------------------ FETCH AWS ------------------
  const fetchPrediction = async () => {
    btn.disabled = true;
    cancelAnimationFrame(idleAnim);
    clearBackground();

    ctx.fillStyle = "#00ffd0";
    ctx.font = "14px monospace";
    ctx.fillText("Obteniendo datos...", 80, 130);

    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      window.lastData = data;
      drawChart(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      ctx.fillStyle = "#ff4444";
      ctx.fillText("Error al obtener datos", 50, 50);
    } finally {
      btn.disabled = false;
    }
  };

  btn.addEventListener("click", fetchPrediction);
  drawIdleState();
  console.log("AI–EcoPredict listo con corrección DPI y suavizado realista.");
});
