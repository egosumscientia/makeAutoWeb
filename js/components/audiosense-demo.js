import "../core/site.js";
import { nextAudioAnalysis } from "../services/audiosense.local.js";
import { clearCanvas, drawAxes, setupCanvas } from "./chart-helpers.js";

const waveCanvas = document.getElementById("audiosense-wave");
const barsCanvas = document.getElementById("audiosense-bars");
const runButton = document.getElementById("audiosense-run");
const summaryNode = document.getElementById("audiosense-summary");

function getAudioState(sample) {
  if (!sample.anomaly) {
    return {
      className: "chart-signal--ok",
      fill: "rgba(0, 255, 156, 0.08)"
    };
  }

  if (sample.confidence < 0.9) {
    return {
      className: "chart-signal--warn",
      fill: "rgba(255, 214, 10, 0.08)"
    };
  }

  return {
    className: "chart-signal--risk",
    fill: "rgba(255, 92, 92, 0.1)"
  };
}

function drawWave(sample, toneFill) {
  const { ctx, width, height } = setupCanvas(waveCanvas);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b1218";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = toneFill;
  ctx.fillRect(0, 0, width, height);
  const centerY = height / 2;

  ctx.strokeStyle = sample.anomaly ? "#ff8a5b" : "#00e7ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < width; x += 1) {
    const wave = Math.sin(x / 18) * (sample.anomaly ? 28 : 18) + Math.cos(x / 33) * 8;
    const y = centerY + wave;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawBars(sample, toneFill) {
  const { ctx, width, height } = setupCanvas(barsCanvas);
  const padding = 34;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0b1218";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = toneFill;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(145, 166, 181, 0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const max = Math.max(...sample.bands.map((band) => band.value)) * 1.1;
  const barWidth = (width - padding * 2) / sample.bands.length - 12;

  sample.bands.forEach((band, index) => {
    const x = padding + index * (barWidth + 12) + 6;
    const barHeight = (band.value / max) * (height - padding * 2);
    const y = height - padding - barHeight;
    ctx.fillStyle = sample.anomaly ? "#ff8a5b" : "#00e7ff";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#8ea0ad";
    ctx.fillText(band.label, x, height - 12);
  });
}

function renderSummary(sample) {
  summaryNode.innerHTML = "";
  summaryNode.classList.remove("metric-list--ok", "metric-list--warn", "metric-list--risk");
  [
    ["RMS", `${sample.rmsDb} dB`],
    ["Frecuencia dominante", `${sample.dominantHz} Hz`],
    ["Confianza", `${Math.round(sample.confidence * 100)}%`],
    ["Estado", sample.anomaly ? "Anomalo" : "Normal"],
    ["Lectura", sample.message]
  ].forEach(([label, value]) => {
    const line = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label;
    line.append(strong, document.createTextNode(value));
    summaryNode.appendChild(line);
  });

  if (!sample.anomaly) {
    summaryNode.classList.add("metric-list--ok");
  } else if (sample.confidence < 0.9) {
    summaryNode.classList.add("metric-list--warn");
  } else {
    summaryNode.classList.add("metric-list--risk");
  }
}

function render() {
  const sample = nextAudioAnalysis();
  const tone = getAudioState(sample);
  [waveCanvas, barsCanvas].forEach((canvas) => {
    canvas.classList.remove("chart-signal--ok", "chart-signal--warn", "chart-signal--risk");
    canvas.classList.add(tone.className);
  });
  drawWave(sample, tone.fill);
  drawBars(sample, tone.fill);
  renderSummary(sample);
}

runButton.addEventListener("click", render);
window.addEventListener("resize", render);
render();
