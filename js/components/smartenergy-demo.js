import "../core/site.js";
import { nextSmartEnergySnapshot } from "../services/smartenergy.local.js";
import { clearCanvas, getCanvasTextSize, setupCanvas } from "./chart-helpers.js";

const voltageCanvas = document.getElementById("smartenergy-voltage");
const powerCanvas = document.getElementById("smartenergy-power");
const refreshButton = document.getElementById("smartenergy-refresh");
const anomaliesNode = document.getElementById("smartenergy-anomalies");
const statBanner = anomaliesNode.closest(".stat-banner");

function getStateTone(failures) {
  if (failures === 0) {
    return {
      className: "smartenergy-chart--ok",
      fill: "rgba(0, 255, 156, 0.08)"
    };
  }

  if (failures <= 4) {
    return {
      className: "smartenergy-chart--warn",
      fill: "rgba(255, 214, 10, 0.08)"
    };
  }

  return {
    className: "smartenergy-chart--risk",
    fill: "rgba(255, 92, 92, 0.1)"
  };
}

function drawSeries(canvas, color, label, values, toneFill) {
  const { ctx, width, height } = setupCanvas(canvas);
  const padding = 28;
  clearCanvas(ctx, width, height);
  ctx.fillStyle = "#0f1820";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = toneFill;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(145, 166, 181, 0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const gridLines = 4;
  for (let index = 1; index <= gridLines; index += 1) {
    const y = padding + ((height - padding * 2) / gridLines) * index;
    ctx.strokeStyle = "rgba(145, 166, 181, 0.08)";
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const range = max - min || 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#9aa4ad";
  ctx.font = `${getCanvasTextSize(width, 10, 12)}px Segoe UI`;
  ctx.fillText(label, padding, 18);
}

function updateFailureState(failures) {
  anomaliesNode.textContent = String(failures);
  statBanner.classList.remove("stat-banner--ok", "stat-banner--warn", "stat-banner--risk");
  [voltageCanvas, powerCanvas].forEach((canvas) => canvas.classList.remove("smartenergy-chart--ok", "smartenergy-chart--warn", "smartenergy-chart--risk"));

  const tone = getStateTone(failures);

  if (failures === 0) {
    statBanner.classList.add("stat-banner--ok");
  } else if (failures <= 4) {
    statBanner.classList.add("stat-banner--warn");
  } else {
    statBanner.classList.add("stat-banner--risk");
  }

  [voltageCanvas, powerCanvas].forEach((canvas) => canvas.classList.add(tone.className));
  return tone;
}

function render() {
  const snapshot = nextSmartEnergySnapshot();
  const tone = updateFailureState(snapshot.failures);
  drawSeries(voltageCanvas, "#00e7ff", "Voltaje (V)", snapshot.voltage, tone.fill);
  drawSeries(powerCanvas, "#00ff9c", "Potencia (kW)", snapshot.power, tone.fill);
}

refreshButton.addEventListener("click", render);
window.addEventListener("resize", render);
render();
