import "../core/site.js";
import { createInitialProfile, updateProfile } from "../services/tastebuddy.local.js";

const canvas = document.getElementById("tastebuddy-canvas");
const form = document.getElementById("tastebuddy-form");
const input = document.getElementById("tastebuddy-input");
const status = document.getElementById("tastebuddy-status");
const profile = createInitialProfile();

function drawRadar() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, rect.width, rect.height);

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const radius = Math.min(rect.width, rect.height) * 0.34;
  const levelCount = 5;
  const fontSize = rect.width < 420 ? 10 : 12;

  ctx.strokeStyle = "rgba(0, 231, 255, 0.16)";
  for (let level = 1; level <= levelCount; level += 1) {
    const scale = (radius / levelCount) * level;
    ctx.beginPath();
    profile.labels.forEach((_, index) => {
      const angle = (Math.PI * 2 * index) / profile.labels.length - Math.PI / 2;
      const x = centerX + Math.cos(angle) * scale;
      const y = centerY + Math.sin(angle) * scale;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  ctx.fillStyle = "#9aa4ad";
  ctx.font = `${fontSize}px Segoe UI`;
  profile.labels.forEach((label, index) => {
    const angle = (Math.PI * 2 * index) / profile.labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * (radius + 22);
    const y = centerY + Math.sin(angle) * (radius + 22);
    ctx.textAlign = "center";
    ctx.fillText(label, x, y);
  });

  ctx.beginPath();
  profile.values.forEach((value, index) => {
    const angle = (Math.PI * 2 * index) / profile.labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * (radius * value);
    const y = centerY + Math.sin(angle) * (radius * value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 231, 255, 0.12)";
  ctx.strokeStyle = "rgba(0, 231, 255, 0.78)";
  ctx.lineWidth = 1.8;
  ctx.fill();
  ctx.stroke();

  profile.values.forEach((value, index) => {
    const angle = (Math.PI * 2 * index) / profile.labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * (radius * value);
    const y = centerY + Math.sin(angle) * (radius * value);
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 255, 156, 0.88)";
    ctx.fill();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  const result = updateProfile(message, profile.values);
  profile.values = result.values;
  status.textContent = result.changed ? "Perfil actualizado." : "No se detectaron cambios validos.";
  drawRadar();
  input.value = "";
});

window.addEventListener("resize", drawRadar);
drawRadar();
