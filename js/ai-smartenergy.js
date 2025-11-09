// =============================================
// AI–SmartEnergy  — makeAutomatic demo
// Versión final sin botón (clic en gráficas)
// =============================================

document.addEventListener("smartEnergyInit", () => {
  // Evita reinicialización
  if (document.getElementById("chartVoltage")) return;
  initSmartEnergy();
});

function initSmartEnergy() {
  const slide = document.querySelector(".carousel-item:nth-child(5)");
  if (!slide) return;

  const style = document.createElement("style");
  style.textContent = `
    #ai-demo-carousel .carousel-item:nth-child(5){
      padding: 0 0 6px 0 !important;
      display:flex; flex-direction:column; align-items:center; text-align:center;
    }
    #ai-demo-carousel .carousel-item:nth-child(5) h3.ai-demo-title {
      margin-top: 0 !important;
      margin-bottom: 16px !important;
    }
    #ai-demo-carousel .carousel-item:nth-child(5) p {
      margin-top: 0 !important;
      margin-bottom: 10px !important;
      line-height: 1.3;
    }
    #ai-demo-carousel .carousel-item:nth-child(5) canvas{
      display:block !important;
      width: 85% !important;
      max-width: 190px !important;
      height:auto !important;
      margin: 6px auto !important;
    }
    @media (max-width: 500px){
      #ai-demo-carousel .carousel-item:nth-child(5) canvas{
        max-width: 160px !important;
        margin: 3px auto !important;
      }
    }
    #ai-demo-carousel #anomalyIndicator{
      font-size:.85rem;
      margin-top:2px;
      margin-bottom:2px;
      white-space:nowrap;
    }
    .hint-tap {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 3px;
    }
  `;
  document.head.appendChild(style);


  // --- Estructura HTML sin botón ---
  slide.innerHTML = `
    <h3 class="ai-demo-title" style="margin-top:2px; margin-bottom:18px;">AI–SmartEnergy</h3>
    <p style="max-width:480px; margin:0 auto 8px; color:#cbd5e1; line-height:1.3;">
      Monitoreo de potencia eléctrica en tiempo real con inteligencia artificial.
    </p>

    <canvas id="chartVoltage" height="130"></canvas>
    <canvas id="chartPower"   height="130"></canvas>

    <div id="anomalyIndicator">
      Anomalías detectadas: <b id="anomalyCount">0</b>
    </div>

    <div class="hint-tap">(toca o haz clic en una gráfica para actualizar)</div>
  `;

  const ctxV = document.getElementById("chartVoltage").getContext("2d");
  const ctxP = document.getElementById("chartPower").getContext("2d");
  const anomalyCount = document.getElementById("anomalyCount");

  // --- Generación de datos ---
  function generateWave(base, variation, points = 48) {
    return Array.from({ length: points }, (_, i) =>
      base + Math.sin(i / 6) * variation + (Math.random() - 0.5) * 1.2
    );
  }
  function generateRandomData() {
    const anomalies = Array.from({ length: 48 }, () => (Math.random() > 0.90 ? 1 : 0));
    return {
      voltage: generateWave(402, 14),
      power:   generateWave(100, 18),
      anomalies
    };
  }
  let data = generateRandomData();

  // --- Configuración compacta de Chart.js ---
  const tinyOpts = {
    responsive: true,
    maintainAspectRatio: true,
    elements: {
      line:   { borderWidth: 1.4 },
      point:  { radius: 1, hitRadius: 6 }
    },
    layout: { padding: { top: 4, bottom: 0, left: 0, right: 0 } },
    plugins: {
      legend: {
        labels: { color: "#dde1e7", boxWidth: 16, font: { size: 10 } }
      },
      tooltip: { intersect: false, mode: "index" }
    },
    scales: {
      x: { ticks: { color: "#94a3b8", font: { size: 9 }, maxRotation: 0, autoSkip: true },
           grid: { color: "rgba(148,163,184,0.12)" } },
      y: { ticks: { color: "#94a3b8", font: { size: 9 } },
           grid: { color: "rgba(148,163,184,0.12)" } }
    }
  };

  // --- Gráfico Voltaje ---
  const chartVoltage = new Chart(ctxV, {
    type: "line",
    data: {
      labels: data.voltage.map((_, i) => i),
      datasets: [{
        label: "Voltaje trifásico (V)",
        data: data.voltage,
        borderColor: "#22D3EE",
        tension: 0.25
      }]
    },
    options: tinyOpts
  });

  // --- Gráfico Potencia ---
  const chartPower = new Chart(ctxP, {
    type: "line",
    data: {
      labels: data.power.map((_, i) => i),
      datasets: [{
        label: "Potencia total (kW)",
        data: data.power,
        borderColor: "#10B981",
        borderDash: [4, 2],
        tension: 0.25
      }]
    },
    options: tinyOpts
  });

  // --- Actualización manual y efecto visual ---
  function updateCharts() {
    data = generateRandomData();
    chartVoltage.data.datasets[0].data = data.voltage;
    chartPower.data.datasets[0].data   = data.power;
    chartVoltage.update(); 
    chartPower.update();

    // Corrige glitch visual (línea blanca o tachado)
    chartVoltage.setActiveElements([]);
    chartPower.setActiveElements([]);
    chartVoltage.render();
    chartPower.render();

    // Recalcula anomalías
    const total = data.anomalies.reduce((a, b) => a + b, 0);
    anomalyCount.textContent = total;

    let colorGlow;
    if (total <= 3)        { anomalyCount.style.color = "#10B981"; colorGlow = "rgba(16,185,129,.7)"; }
    else if (total <= 6)   { anomalyCount.style.color = "#FACC15"; colorGlow = "rgba(250,204,21,.7)"; }
    else                   { anomalyCount.style.color = "#EF4444"; colorGlow = "rgba(239,68,68,.7)"; }

    // Efecto visual sincronizado
    [ctxV.canvas, ctxP.canvas].forEach(c => {
      c.style.transition = "box-shadow .35s ease";
      c.style.boxShadow  = `0 0 16px ${colorGlow}`;
      setTimeout(() => { c.style.boxShadow = "none"; }, 400);
    });

    // Notificar al carrusel para reajustar altura
    setTimeout(() => {
      const ev = new CustomEvent("slideChanged", { detail: { index: 4 } });
      document.dispatchEvent(ev);
    }, 100);
  }

  // --- Click en las gráficas para actualizar ---
  [ctxV.canvas, ctxP.canvas].forEach(c => {
    c.addEventListener("click", updateCharts);
  });

  // Ajuste inicial de altura del carrusel
  setTimeout(() => {
    const ev = new CustomEvent("slideChanged", { detail: { index: 4 } });
    document.dispatchEvent(ev);
  }, 250);
}
