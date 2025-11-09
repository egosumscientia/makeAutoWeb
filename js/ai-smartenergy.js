// =============================================
// AI–SmartEnergy  — makeAutomatic demo
// Versión compacta y 100% embebida
// =============================================

document.addEventListener("smartEnergyInit", () => {
  // Evita reinicialización
  if (document.getElementById("chartVoltage")) return;
  initSmartEnergy();
});

function initSmartEnergy() {
  const slide = document.querySelector(".carousel-item:nth-child(5)");
  if (!slide) return;

  // --- Estilos locales, tamaño pequeño y responsivo ---
  const style = document.createElement("style");
  style.textContent = `
    /* Contenedor del slide */
    #ai-demo-carousel .carousel-item:nth-child(5){
      padding: 6px 0 10px 0 !important;
      display:flex; flex-direction:column; align-items:center; text-align:center;
    }
    /* Canvases: muy compactos */
    #ai-demo-carousel .carousel-item:nth-child(5) canvas{
      display:block !important;
      width: 78% !important;       /* relativo al carrusel */
      max-width: 180px !important; /* desktop compacto */
      height:auto !important;
      margin: 6px auto !important;
    }
    /* Móvil más pequeño aún */
    @media (max-width: 500px){
      #ai-demo-carousel .carousel-item:nth-child(5) canvas{
        max-width: 150px !important;
        margin: 4px auto !important;
      }
    }
    /* Indicador de anomalías y botón */
    #ai-demo-carousel #anomalyIndicator{
      font-size:.9rem; margin-top:6px;
    }
    #ai-demo-carousel #btnRefresh{
      transform: scale(.70); padding:2px 10px; font-size:.80rem; line-height:1rem;
      margin-top:6px;
    }
  `;
  document.head.appendChild(style);

  // --- Estructura HTML mínima ---
  slide.innerHTML = `
    <h3 class="ai-demo-title">AI–SmartEnergy</h3>
    <p style="max-width:480px; margin:2px auto 8px; color:#cbd5e1">
      Monitoreo de potencia eléctrica en tiempo real con inteligencia artificial.
    </p>

    <canvas id="chartVoltage" height="130"></canvas>
    <canvas id="chartPower"   height="130"></canvas>

    <div id="anomalyIndicator">
      Anomalías detectadas: <b id="anomalyCount">0</b>
    </div>

    <div class="ai-input" style="margin-top:6px;">
      <button id="btnRefresh" class="ai-secondary-btn">🔄 Actualizar datos</button>
    </div>
  `;

  const ctxV = document.getElementById("chartVoltage").getContext("2d");
  const ctxP = document.getElementById("chartPower").getContext("2d");
  const anomalyCount = document.getElementById("anomalyCount");
  const btn = document.getElementById("btnRefresh");

  // --- Generación de datos (compacta) ---
  function generateWave(base, variation, points = 48) {
    return Array.from({ length: points }, (_, i) =>
      base + Math.sin(i / 6) * variation + (Math.random() - 0.5) * 1.2
    );
  }
  function generateRandomData() {
    // 10% de probabilidad para permitir verdes
    const anomalies = Array.from({ length: 48 }, () => (Math.random() > 0.90 ? 1 : 0));
    return {
      voltage: generateWave(402, 14),
      power:   generateWave(100, 18),
      anomalies
    };
  }
  let data = generateRandomData();

  // --- Opciones comunes super-compactas para Chart.js ---
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

  // --- Actualización manual + brillo sincronizado por criticidad ---
  function updateCharts() {
    // Nuevos datos
    data = generateRandomData();
    chartVoltage.data.datasets[0].data = data.voltage;
    chartPower.data.datasets[0].data   = data.power;
    chartVoltage.update(); chartPower.update();

    // Anomalías y color de nivel
    const total = data.anomalies.reduce((a, b) => a + b, 0);
    anomalyCount.textContent = total;

    let colorGlow;
    if (total <= 3)        { anomalyCount.style.color = "#10B981"; colorGlow = "rgba(16,185,129,.7)"; }
    else if (total <= 6)   { anomalyCount.style.color = "#FACC15"; colorGlow = "rgba(250,204,21,.7)"; }
    else                   { anomalyCount.style.color = "#EF4444"; colorGlow = "rgba(239,68,68,.7)"; }

    // Efecto visual breve
    [document.getElementById("chartVoltage"), document.getElementById("chartPower")]
      .forEach(c => {
        c.style.transition = "box-shadow .35s ease";
        c.style.boxShadow  = `0 0 16px ${colorGlow}`;
        setTimeout(() => { c.style.boxShadow = "none"; }, 400);
      });

    // Asegura que el carrusel reajuste la altura al cambiar contenido
    setTimeout(() => {
      const ev = new CustomEvent("slideChanged", { detail: { index: 4 } });
      document.dispatchEvent(ev);
    }, 100);
  }

  // Botón: única fuente de actualización
  btn.addEventListener("click", updateCharts);

  // Pequeño realce en hover
  btn.addEventListener("mouseenter", () => btn.style.filter = "brightness(1.25)");
  btn.addEventListener("mouseleave", () => btn.style.filter = "brightness(1)");

  // Ajuste de altura inicial del carrusel tras renderizado
  setTimeout(() => {
    const ev = new CustomEvent("slideChanged", { detail: { index: 4 } });
    document.dispatchEvent(ev);
  }, 250);
}
