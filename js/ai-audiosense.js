/**
 * AI-AudioSense – Stable Classic
 * Reversión a tamaños normales + fix anti-estiramiento del canvas.
 * - Sin escalado del contenedor
 * - Gráficos a tamaño legible (~420x260)
 * - Canvas con dimensiones fijas (no se deforma verticalmente)
 * - No se tocan HTML ni CSS
 */

document.addEventListener("slideChanged", (e) => {
  // Slide "AI-AudioSense" es el 3er item en tu index.html
  if (e.detail.index !== 2) return;

  const container = document.querySelector(".carousel-item:nth-child(3)");
  if (!container) return;

  // Limpia y revierte cualquier estilo que haya quedado de versiones previas
  container.innerHTML = "";
  container.style.removeProperty("transform");
  container.style.removeProperty("transform-origin");
  container.style.removeProperty("margin-top");
  container.style.removeProperty("min-height");
  container.style.removeProperty("overflow");

  // ──────────────────────────────────────────────────────────────
  // Cabecera breve
  const desc = document.createElement("p");
  desc.textContent =
    "Analiza sonidos industriales para detectar patrones anómalos en motores, compresores o líneas de producción.";
  desc.style.marginBottom = "1rem";
  container.appendChild(desc);

  // ──────────────────────────────────────────────────────────────
  // Onda decorativa (tamaño clásico, no responsive para evitar saltos)
  const WAVE_W = 420;
  const WAVE_H = 100;

  const waveCanvas = document.createElement("canvas");
  waveCanvas.width = WAVE_W;   // atributo → tamaño real de lienzo
  waveCanvas.height = WAVE_H;  // atributo → tamaño real de lienzo
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

  // ──────────────────────────────────────────────────────────────
  // Botón principal
  const button = document.createElement("button");
  button.textContent = "Analizar Audio";
  button.className = "ai-btn";
  button.style.display = "inline-block";
  button.style.margin = "12px 0 12px 0";
  container.appendChild(button);

  // ──────────────────────────────────────────────────────────────
  // Canvas del gráfico (tamaño fijo y legible; anti-stretch)
  const CHART_W = 420;  // ancho real del lienzo
  const CHART_H = 260;  // alto real del lienzo

  const chartCanvas = document.createElement("canvas");
  chartCanvas.id = "audioCanvas";
  chartCanvas.width = CHART_W;   // 🔒 fija tamaño real
  chartCanvas.height = CHART_H;  // 🔒 fija tamaño real
  chartCanvas.style.display = "none";
  chartCanvas.style.borderRadius = "8px";
  chartCanvas.style.margin = "0 auto";
  chartCanvas.style.display = "none";
  chartCanvas.style.maxWidth = "100%"; // por si el contenedor es más estrecho
  container.appendChild(chartCanvas);

  // ──────────────────────────────────────────────────────────────
  // Panel KPI
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

  // Texto de estado
  const resultText = document.createElement("p");
  resultText.id = "audioResult";
  resultText.style.margin = "6px 0 0 0";
  container.appendChild(resultText);

  // ──────────────────────────────────────────────────────────────
  // Acción
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Analizando...";
    resultText.textContent = "Procesando sonido...";
    chartCanvas.style.display = "none";
    kpiBox.style.display = "none";

    try {
      const apiUrl = "https://g6274s7qce.execute-api.us-east-1.amazonaws.com";
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Simulación de inferencia (valores plausibles)
      const rms = (60 + Math.random() * 20).toFixed(1);
      const freq = (120 + Math.random() * 500).toFixed(0);
      const anomaly = (Math.random() * 25).toFixed(1);
      const label = anomaly > 15 ? "Anómalo" : "Normal";
      const color = anomaly > 15 ? "#f87171" : "#10b981";
      const machineType = ["Motor", "Compresor", "Ventilador", "Bomba"][
        Math.floor(Math.random() * 4)
      ];

      // Destruye instancias previas si las hubiera
      if (window.audioChart) {
        try { window.audioChart.destroy(); } catch {}
      }

      // Muestra el gráfico a tamaño fijo y estable
      chartCanvas.style.display = "block";
      const ctx = chartCanvas.getContext("2d");

      window.audioChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.categories.map((c) => c.name),
          datasets: [{
            label: "Nivel (dB)",
            data: data.categories.map((c) => c.qty / 10),
            backgroundColor: "rgba(34,211,238,0.8)",
            borderColor: "rgba(34,211,238,1)",
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: {
          // 🔒 clave: NO responsive, NO maintainAspectRatio → respeta width/height del canvas
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
      kpiBox.innerHTML = `
        <h3 style="color:${color}; margin-bottom:6px;">Diagnóstico IA</h3>
        <ul style="list-style:none; padding-left:0; margin:0;">
          <li>🔊 <b>Nivel RMS:</b> ${rms} dB</li>
          <li>🎚️ <b>Frecuencia dominante:</b> ${freq} Hz</li>
          <li>🧠 <b>Probabilidad de anomalía:</b> ${anomaly}%</li>
          <li>⚙️ <b>Equipo detectado:</b> ${machineType}</li>
          <li>📊 <b>Estado:</b> <span style="color:${color}; font-weight:600;">${label}</span></li>
        </ul>
      `;
      kpiBox.style.display = "block";

      resultText.innerHTML =
        "<span style='color:#10b981;'>✅ Análisis completado con éxito.</span>";
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
