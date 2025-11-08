/**
 * AI-AudioSense – Fondo animado de ondas (solo inicio)
 * makeAutomatic – 2025
 * Onda visual hasta que se pulse "Analizar Audio"
 */

document.addEventListener("slideChanged", (e) => {
  if (e.detail.index !== 2) return;

  const container = document.querySelector(".carousel-item:nth-child(3)");
  if (!container) return;
  container.innerHTML = "";

  // ===== Título =====
  const title = document.createElement("h3");
  title.textContent = "AI–AudioSense";
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
    "Analiza sonidos industriales para detectar patrones anómalos en motores, compresores o líneas de producción.";
  Object.assign(desc.style, {
    textAlign: "center",
    marginBottom: "1rem",
    fontSize: "0.95rem",
  });
  container.appendChild(desc);

  // ===== Botón =====
  const button = document.createElement("button");
  button.textContent = "Analizar Audio";
  button.className = "ai-btn";
  button.style.display = "block";
  button.style.margin = "0 auto 1rem auto";
  container.appendChild(button);

  // ===== Canvas =====
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.style.display = "block";
  canvas.style.margin = "0 auto";
  canvas.style.background = "#0f172a";
  canvas.style.borderRadius = "8px";
  canvas.style.boxShadow = "0 0 8px rgba(0,0,0,0.35)";
  container.appendChild(canvas);

  function resizeCanvas() {
    canvas.width = Math.min(container.clientWidth * 0.9, 440);
    canvas.height = Math.min(window.innerHeight * 0.35, 200);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // ===== Animación de onda inicial =====
  let phase = 0;
  let running = true;

  function drawWave() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const midY = canvas.height / 2;
    const amp = canvas.height / 6;
    const freq = 0.03;

    // onda principal celeste
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = midY + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(34,211,238,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // onda secundaria verde
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = midY + Math.cos(x * freq * 1.2 + phase + 1) * (amp * 0.6);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(16,185,129,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    phase += 0.05;
    requestAnimationFrame(drawWave);
  }

  drawWave();

  // ===== Caja Diagnóstico =====
  const kpiBox = document.createElement("div");
  Object.assign(kpiBox.style, {
    margin: "1rem auto 0 auto",
    maxWidth: "560px",
    background: "#0f172a",
    borderRadius: "8px",
    padding: "10px 14px",
    textAlign: "left",
    fontSize: "0.9rem",
    color: "#e2e8f0",
    display: "none",
  });
  container.appendChild(kpiBox);

  const resultText = document.createElement("p");
  Object.assign(resultText.style, {
    marginTop: "6px",
    textAlign: "center",
    fontSize: "0.9rem",
  });
  container.appendChild(resultText);

  // ===== Dibuja barras =====
  function drawBars(labels, values) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 40;
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - 50;
    const barGap = 10;
    const barWidth = chartW / values.length - barGap;
    const maxVal = Math.max(...values) * 1.1;

    ctx.font = `${Math.max(9, canvas.width / 45)}px Segoe UI`;
    ctx.textAlign = "center";

    values.forEach((val, i) => {
      const x = padding + i * (barWidth + barGap);
      const h = (val / maxVal) * chartH;
      const y = canvas.height - 30 - h;

      ctx.fillStyle = "rgba(34,211,238,0.8)";
      ctx.fillRect(x, y, barWidth, h);
      ctx.strokeStyle = "rgba(34,211,238,1)";
      ctx.strokeRect(x, y, barWidth, h);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(labels[i], x + barWidth / 2, canvas.height - 15);
    });

    ctx.fillStyle = "#94a3b8";
    ctx.font = `${Math.max(10, canvas.width / 45)}px Segoe UI`;
    ctx.fillText("Nivel (dB)", canvas.width / 2, canvas.height - 3);
  }

  // ===== Evento botón =====
  button.addEventListener("click", async () => {
    running = false; // detener la onda
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    button.disabled = true;
    button.textContent = "Analizando...";
    resultText.textContent = "Procesando sonido...";
    kpiBox.style.display = "none";

    try {
      const res = await fetch(
        "https://y86gcq22ul.execute-api.us-east-1.amazonaws.com/default/analyze-audio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: "mock_base64_audio_data" }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const {
        rms_db,
        frequency_dominant,
        bands,
        levels_db,
        anomaly_detected,
        confidence,
        message,
      } = data;

      drawBars(bands, levels_db);

      const color = anomaly_detected ? "#f87171" : "#10b981";
      const label = anomaly_detected ? "Anómalo" : "Normal";

      kpiBox.innerHTML = `
        <h3 style="color:${color}; margin-bottom:6px;">Diagnóstico IA</h3>
        <ul style="list-style:none; padding-left:0; margin:0;">
          <li>🔊 <b>Nivel RMS:</b> ${rms_db ?? "N/A"} dB</li>
          <li>🎚️ <b>Frecuencia dominante:</b> ${frequency_dominant ?? "N/A"} Hz</li>
          <li>🧠 <b>Confianza IA:</b> ${(confidence * 100).toFixed(1)}%</li>
          <li>📊 <b>Estado:</b> <span style="color:${color}; font-weight:600;">${label}</span></li>
        </ul>`;
      kpiBox.style.display = "block";

      resultText.innerHTML = `<span style='color:${color};'>${message}</span>`;
      button.textContent = "Analizar";
      button.disabled = false;
    } catch (err) {
      console.error(err);
      resultText.textContent = "❌ Error al procesar el audio.";
      button.textContent = "Reintentar";
      button.disabled = false;
    }
  });
});
