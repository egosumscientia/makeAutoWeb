/**
 * AI-AudioSense – Final AWS Lambda Connected Version
 * - Usa POST hacia API Gateway con AWS_PROXY
 * - Muestra resultados reales de Lambda (rms, freq, bands, dB)
 * - Compatible con Chart.js
 */

document.addEventListener("slideChanged", (e) => {
  if (e.detail.index !== 2) return;

  const container = document.querySelector(".carousel-item:nth-child(3)");
  if (!container) return;

  container.innerHTML = "";

  // Descripción
  const desc = document.createElement("p");
  desc.textContent =
    "Analiza sonidos industriales para detectar patrones anómalos en motores, compresores o líneas de producción.";
  desc.style.marginBottom = "1rem";
  container.appendChild(desc);

  // Onda decorativa
  const WAVE_W = 420;
  const WAVE_H = 100;
  const waveCanvas = document.createElement("canvas");
  waveCanvas.width = WAVE_W;
  waveCanvas.height = WAVE_H;
  waveCanvas.style.display = "block";
  waveCanvas.style.margin = "0 auto 16px auto";
  waveCanvas.style.borderRadius = "8px";
  waveCanvas.style.background = "#0f172a";
  container.appendChild(waveCanvas);

  const wctx = waveCanvas.getContext("2d");
  let t = 0;
  (function animWave() {
    wctx.clearRect(0, 0, WAVE_W, WAVE_H);
    wctx.beginPath();
    wctx.strokeStyle = "#22d3ee";
    wctx.lineWidth = 2;
    for (let x = 0; x < WAVE_W; x++) {
      const y =
        WAVE_H / 2 +
        Math.sin((x + t) * 0.04) * (WAVE_H * 0.22) *
        Math.sin(t * 0.02 + x * 0.012);
      if (x === 0) wctx.moveTo(x, y);
      else wctx.lineTo(x, y);
    }
    wctx.stroke();
    t += 1.2;
    requestAnimationFrame(animWave);
  })();

  // Botón
  const button = document.createElement("button");
  button.textContent = "Analizar Audio";
  button.className = "ai-btn";
  button.style.display = "inline-block";
  button.style.margin = "12px 0 12px 0";
  container.appendChild(button);

  // Canvas del gráfico
  const CHART_W = 420;
  const CHART_H = 260;
  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "audioCanvas";
  chartCanvas.width = CHART_W;
  chartCanvas.height = CHART_H;
  chartCanvas.style.display = "none";
  chartCanvas.style.borderRadius = "8px";
  chartCanvas.style.margin = "0 auto";
  chartCanvas.style.maxWidth = "100%";
  container.appendChild(chartCanvas);

  // Caja KPI
  const kpiBox = document.createElement("div");
  kpiBox.id = "audioKPIBox";
  kpiBox.style.display = "none";
  kpiBox.style.margin = "12px auto 8px auto";
  kpiBox.style.maxWidth = "560px";
  kpiBox.style.background = "#0f172a";
  kpiBox.style.borderRadius = "8px";
  kpiBox.style.padding = "10px 14px";
  kpiBox.style.textAlign = "left";
  kpiBox.style.fontSize = "0.9rem";
  kpiBox.style.color = "#e2e8f0";
  kpiBox.style.boxShadow = "0 0 8px rgba(0,0,0,0.3)";
  container.appendChild(kpiBox);

  const resultText = document.createElement("p");
  resultText.id = "audioResult";
  resultText.style.margin = "6px 0 0 0";
  container.appendChild(resultText);

  // Acción del botón
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Analizando...";
    resultText.textContent = "Procesando sonido...";
    chartCanvas.style.display = "none";
    kpiBox.style.display = "none";

    try {
      const apiUrl = "https://y86gcq22ul.execute-api.us-east-1.amazonaws.com/default/analyze-audio";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: "mock_base64_audio_data" })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const { rms_db, frequency_dominant, bands, levels_db, anomaly_detected, confidence, message } = data;

      if (window.audioChart) {
        try { window.audioChart.destroy(); } catch {}
      }

      chartCanvas.style.display = "block";
      const ctx = chartCanvas.getContext("2d");

      window.audioChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: bands,
          datasets: [{
            label: "Nivel (dB)",
            data: levels_db,
            backgroundColor: "rgba(34,211,238,0.8)",
            borderColor: "rgba(34,211,238,1)",
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e2e8f0", font: { size: 11 } } },
            tooltip: { intersect: false, mode: "index" }
          },
          scales: {
            x: {
              ticks: { color: "#e2e8f0", font: { size: 10 } },
              grid: { color: "rgba(255,255,255,0.06)" }
            },
            y: {
              ticks: { color: "#e2e8f0", font: { size: 10 } },
              grid: { color: "rgba(255,255,255,0.06)" },
              beginAtZero: true
            }
          },
          layout: { padding: { left: 6, right: 6, top: 6, bottom: 6 } }
        }
      });

      // KPI
      const color = anomaly_detected ? "#f87171" : "#10b981";
      const label = anomaly_detected ? "Anómalo" : "Normal";

      kpiBox.innerHTML = `
        <h3 style="color:${color}; margin-bottom:6px;">Diagnóstico IA</h3>
        <ul style="list-style:none; padding-left:0; margin:0;">
          <li>🔊 <b>Nivel RMS:</b> ${rms_db ?? "N/A"} dB</li>
          <li>🎚️ <b>Frecuencia dominante:</b> ${frequency_dominant ?? "N/A"} Hz</li>
          <li>🧠 <b>Confianza IA:</b> ${(confidence * 100).toFixed(1)}%</li>
          <li>📊 <b>Estado:</b> <span style="color:${color}; font-weight:600;">${label}</span></li>
        </ul>
      `;
      kpiBox.style.display = "block";

      resultText.innerHTML = `<span style='color:${color};'>${message}</span>`;
      button.textContent = "Reanalizar";
      button.disabled = false;

    } catch (err) {
      console.error(err);
      resultText.textContent = "❌ Error al procesar el audio.";
      button.textContent = "Reintentar";
      button.disabled = false;
    }
  });
});
