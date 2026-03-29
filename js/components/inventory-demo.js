import "../core/site.js";
import { nextInventoryCut } from "../services/inventory.local.js";
import { getCanvasTextSize } from "./chart-helpers.js";

const canvas = document.getElementById("inventory-canvas");
const button = document.getElementById("inventory-refresh");
const summaryNode = document.getElementById("inventory-summary");

function getInventoryState(cut) {
  return cut.palette;
}

function setupInventoryCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const computed = window.getComputedStyle(canvas);
  const cssWidth = Math.max(canvas.clientWidth || Math.round(canvas.getBoundingClientRect().width) || 500, 320);
  const cssHeight = Math.max(Math.round(parseFloat(computed.height)) || 220, 150);
  canvas.width = Math.round(cssWidth * ratio);
  canvas.height = Math.round(cssHeight * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, width: cssWidth, height: cssHeight };
}

function drawChart(cut, toneFill, barColor) {
  const { ctx, width, height } = setupInventoryCanvas();
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
  ctx.font = `${getCanvasTextSize(width, 9, 12)}px Segoe UI`;

  const max = Math.max(...cut.categories.map((item) => item.qty)) * 1.1;
  const barWidth = Math.max(((width - padding * 2) / cut.categories.length) - 16, 16);

  cut.categories.forEach((item, index) => {
    const x = padding + index * (barWidth + 16) + 8;
    const barHeight = (item.qty / max) * (height - padding * 2);
    const y = height - padding - barHeight;
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.strokeStyle = "rgba(230, 237, 243, 0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#8ea0ad";
    const label = width < 420 ? item.name.slice(0, 5) : item.name;
    ctx.fillText(label, x, height - 12);
  });
}

function renderSummary(cut) {
  summaryNode.innerHTML = "";
  summaryNode.classList.remove("metric-list--ok", "metric-list--warn", "metric-list--risk");
  [
    ["Items", cut.summary.totalItems],
    ["Bajo stock", cut.summary.lowStock],
    ["Sobrestock", cut.summary.overStock],
    ["Rotacion", cut.summary.rotationRate],
    ["Valor", `$${cut.summary.totalValueUSD.toLocaleString("en-US")}`]
  ].forEach(([label, value]) => {
    const line = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label;
    line.append(strong, document.createTextNode(String(value)));
    summaryNode.appendChild(line);
  });

  if (cut.state === "ok") {
    summaryNode.classList.add("metric-list--ok");
  } else if (cut.state === "warn") {
    summaryNode.classList.add("metric-list--warn");
  } else {
    summaryNode.classList.add("metric-list--risk");
  }
}

function render() {
  const cut = nextInventoryCut();
  const tone = getInventoryState(cut);
  canvas.classList.remove("chart-signal--ok", "chart-signal--warn", "chart-signal--risk");
  canvas.classList.add(tone.className);
  drawChart(cut, tone.fill, tone.barColor);
  renderSummary(cut);
}

button.addEventListener("click", render);
window.addEventListener("resize", render);
render();
