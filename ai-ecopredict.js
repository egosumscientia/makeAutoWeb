// =============================================
// makeAutomatic - AI-EcoPredict (Predicción Temporal)
// =============================================

console.log("ai-ecopredict.js con eje temporal activo");

// --- Configuración base ---
const ecoLabels = [];
const ecoValues = [];
const numPoints = 5; // cantidad de puntos de predicción
const intervalMinutes = 10; // intervalo entre predicciones
const startTime = new Date();

// Generar etiquetas de tiempo (ej: 14:00, 14:10, 14:20, ...)
for (let i = 0; i < numPoints; i++) {
  const t = new Date(startTime.getTime() + i * intervalMinutes * 60000);
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  ecoLabels.push(`${hh}:${mm}`);
  ecoValues.push({
    Temperatura: 20 + Math.random() * 5,
    Humedad: 55 + Math.random() * 10,
  });
}

function drawEcoGraph(data) {
  const canvas = document.getElementById("ecoCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const left = 80;
  const right = width - 40;
  const bottom = height - 60;
  const top = 60;
  const graphWidth = right - left;

  // Escalas
  const maxTemp = Math.max(...data.map(d => d.Temperatura)) + 2;
  const minTemp = Math.min(...data.map(d => d.Temperatura)) - 2;
  const maxHum = Math.max(...data.map(d => d.Humedad)) + 5;
  const minHum = Math.min(...data.map(d => d.Humedad)) - 5;

  // Eje X
  ctx.strokeStyle = "#334155";
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  const step = graphWidth / (data.length - 1);

  // === TEMPERATURA ===
  ctx.strokeStyle = "#22D3EE";
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = left + i * step;
    const y =
      bottom - ((d.Temperatura - minTemp) / (maxTemp - minTemp)) * (bottom - top);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // === HUMEDAD ===
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = 2;
  ctx.beginPath();
  data.forEach((d, i) => {
    const x = left + i * step;
    const y =
      bottom - ((d.Humedad - minHum) / (maxHum - minHum)) * (bottom - top);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Puntos
  data.forEach((d, i) => {
    const x = left + i * step;
    const yTemp =
      bottom - ((d.Temperatura - minTemp) / (maxTemp - minTemp)) * (bottom - top);
    const yHum =
      bottom - ((d.Humedad - minHum) / (maxHum - minHum)) * (bottom - top);

    ctx.fillStyle = "#22D3EE";
    ctx.beginPath();
    ctx.arc(x, yTemp, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(x, yHum, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Etiquetas de tiempo (X)
  ctx.font = "13px monospace";
  ctx.fillStyle = "#94A3B8";
  ctx.textAlign = "center";
  data.forEach((_, i) => {
    const x = left + i * step;
    ctx.fillText(ecoLabels[i], x, bottom + 20);
  });

  // Valores numéricos
  ctx.font = "12px monospace";
  ctx.fillStyle = "#22D3EE";
  data.forEach((d, i) => {
    const x = left + i * step;
    const yTemp =
      bottom - ((d.Temperatura - minTemp) / (maxTemp - minTemp)) * (bottom - top);
    ctx.fillText(`${d.Temperatura.toFixed(1)}°C`, x, yTemp - 10);
  });

  ctx.fillStyle = "#10B981";
  data.forEach((d, i) => {
    const x = left + i * step;
    const yHum =
      bottom - ((d.Humedad - minHum) / (maxHum - minHum)) * (bottom - top);
    ctx.fillText(`${d.Humedad.toFixed(0)}%`, x, yHum - 10);
  });

  // Título
  ctx.fillStyle = "#22D3EE";
  ctx.font = "18px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Predicción ambiental en el tiempo", 20, 30);

  // Leyenda
  ctx.font = "13px monospace";
  ctx.fillStyle = "#22D3EE";
  ctx.fillText("Temperatura", left, top - 15);
  ctx.fillStyle = "#10B981";
  ctx.fillText("Humedad", left + 150, top - 15);
}

// === Simular llamada a Lambda ===
async function fetchEcoPredict() {
  console.log("Simulando predicción futura...");

  // Desplazar los datos y agregar un nuevo punto futuro
  ecoValues.shift();
  const t = new Date(startTime.getTime() + ecoValues.length * intervalMinutes * 60000);
  const newTemp = ecoValues[ecoValues.length - 1].Temperatura + (Math.random() * 2 - 1);
  const newHum = ecoValues[ecoValues.length - 1].Humedad + (Math.random() * 4 - 2);

  ecoValues.push({ Temperatura: newTemp, Humedad: newHum });
  ecoLabels.shift();
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  ecoLabels.push(`${hh}:${mm}`);

  drawEcoGraph(ecoValues);
}

// --- Inicialización ---
document.addEventListener("slideChanged", (e) => {
  if (e.detail.index === 1) {
    console.log("Mostrando slide 2: EcoPredict temporal");
    drawEcoGraph(ecoValues);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnPredict");
  if (!btn) return;
  btn.addEventListener("click", () => fetchEcoPredict());
});
