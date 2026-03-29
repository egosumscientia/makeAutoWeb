import "../core/site.js";
import { nextScenario } from "../services/ecopredict.local.js";
import { clearCanvas, getCanvasTextSize, setupCanvas } from "./chart-helpers.js";

const canvas = document.getElementById("ecopredict-canvas");
const button = document.getElementById("ecopredict-next");
const summary = document.getElementById("ecopredict-summary");

function render() {
  const scenario = nextScenario();
  const { ctx, width, height } = setupCanvas(canvas);
  const padding = 34;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#071017";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(145, 166, 181, 0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const min = Math.min(...scenario.points) - 1;
  const max = Math.max(...scenario.points) + 1;
  const range = max - min || 1;
  const fontSize = getCanvasTextSize(width, 10, 12);
  const showAllLabels = width >= 420;

  ctx.fillStyle = "#d9e6ef";
  ctx.font = `${fontSize}px Segoe UI`;
  ctx.fillText(`${scenario.region}`, padding, 18);

  ctx.strokeStyle = "#00ff9c";
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0, 255, 156, 0.18)";
  ctx.shadowBlur = 0;
  const positions = scenario.points.map((value, index) => {
    const x = padding + (index / (scenario.points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return {
      x,
      y,
      label: scenario.labels[index],
      valid: Number.isFinite(value) && Number.isFinite(x) && Number.isFinite(y)
    };
  });

  const validPositions = positions.filter((position) => position.valid);
  if (validPositions.length > 1) {
    ctx.beginPath();
    validPositions.forEach(({ x, y }, index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  positions.forEach(({ x, y, label }, index) => {
    ctx.fillStyle = "#00e7ff";
    ctx.beginPath();
    ctx.arc(x, y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    if (showAllLabels || index % 2 === 0 || index === scenario.labels.length - 1) {
      ctx.fillStyle = "#8ea0ad";
      ctx.fillText(label, x - 14, height - 12);
    }
  });

  summary.textContent = `${scenario.region}: ${scenario.summary}`;
}

button.addEventListener("click", render);
window.addEventListener("resize", render);
render();
