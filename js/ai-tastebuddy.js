/**
 * AI-TestBuddy – Canvas puro funcional y 100% responsive
 * makeAutomatic – 2025
 */

document.addEventListener("slideChanged", (e) => {
  if (e.detail.index !== 0) return; // solo slide 1

  const container = document.querySelector(".carousel-item:nth-child(1)");
  if (!container) return;
  container.innerHTML = "";

  // ===== Título =====
  const title = document.createElement("h3");
  title.textContent = "AI–TasteBuddy";
  title.style.color = "#22d3ee";
  title.style.textAlign = "center";
  title.style.marginBottom = "0.5rem";
  title.style.fontSize = window.innerWidth < 360 ? "1rem" : "1.25rem";
  container.appendChild(title);

  // ===== Descripción =====
  const desc = document.createElement("p");
  desc.textContent =
    "Demo interactiva de makeAutomatic donde una IA adapta preferencias humanas en un vector visual.";
  desc.style.textAlign = "center";
  desc.style.marginBottom = "1rem";
  desc.style.fontSize = window.innerWidth < 360 ? "0.85rem" : "0.95rem";
  container.appendChild(desc);

  // ===== Canvas radar =====
  const canvas = document.createElement("canvas");
  const maxWidth = container.clientWidth || window.innerWidth;
  canvas.width = Math.min(maxWidth * 0.9, 340);
  canvas.height = Math.min(maxWidth * 0.6, 220);
  canvas.style.display = "block";
  canvas.style.margin = "0 auto 12px auto";
  canvas.style.background = "#0f172a";
  canvas.style.borderRadius = "8px";
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // ===== Input + botón =====
  const div = document.createElement("div");
  div.style.textAlign = "center";
  div.style.marginTop = "0.5rem";
  container.appendChild(div);

  const input = document.createElement("input");
  input.placeholder = "'más picante', 'menos umami', 'equilibrado'";
  input.style.padding = "6px 8px";
  input.style.border = "1px solid #22d3ee";
  input.style.borderRadius = "6px";
  input.style.background = "#0f172a";
  input.style.color = "#e2e8f0";
  input.style.width = "210px";
  input.style.touchAction = "manipulation";
  div.appendChild(input);

  const button = document.createElement("button");
  button.textContent = "Enviar";
  button.className = "ai-btn";
  button.style.marginLeft = "8px";
  button.style.minHeight = "36px";
  button.style.touchAction = "manipulation";
  div.appendChild(button);

  const reply = document.createElement("p");
  reply.style.textAlign = "center";
  reply.style.color = "#e2e8f0";
  reply.style.fontSize = "0.9rem";
  reply.style.marginTop = "8px";
  container.appendChild(reply);

  // ===== Datos base =====
  const labels = ["dulce", "salado", "ácido", "amargo", "umami", "picante", "crujiente"];
  const baseValues = [0.45, 0.55, 0.35, 0.4, 0.45, 0.5, 0.5];
  let values = [...baseValues];

  function drawRadar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 10;
    const radius = Math.min(canvas.width / 3, 80);
    const levels = 5;

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;

    // círculos
    for (let l = 1; l <= levels; l++) {
      const r = (radius / levels) * l;
      ctx.beginPath();
      for (let i = 0; i <= labels.length; i++) {
        const ang = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // radiales
    ctx.beginPath();
    for (let i = 0; i < labels.length; i++) {
      const ang = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(ang), cy + radius * Math.sin(ang));
    }
    ctx.stroke();

    // etiquetas
    ctx.fillStyle = "#94a3b8";
    ctx.font = (window.innerWidth < 360 ? "10px" : "11px") + " Segoe UI";
    for (let i = 0; i < labels.length; i++) {
      const ang = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const x = cx + (radius + 18) * Math.cos(ang);
      const y = cy + (radius + 18) * Math.sin(ang);
      ctx.textAlign = "center";
      ctx.fillText(labels[i], x, y);
    }

    // vector
    ctx.beginPath();
    for (let i = 0; i <= values.length; i++) {
      const val = values[i % values.length];
      const ang = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const r = val * radius;
      const x = cx + r * Math.cos(ang);
      const y = cy + r * Math.sin(ang);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(34,211,238,0.3)";
    ctx.strokeStyle = "rgba(34,211,238,0.9)";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // puntos
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      const ang = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const r = val * radius;
      const x = cx + r * Math.cos(ang);
      const y = cy + r * Math.sin(ang);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#22d3ee";
      ctx.fill();
    }
  }

  drawRadar();

  // ===== Interacción IA =====
  button.addEventListener("click", () => {
    const msg = input.value.toLowerCase().trim();
    let changed = false;

    input.value = "";

    labels.forEach((taste, i) => {
      if (msg.includes(taste)) {
        if (msg.includes("más") || msg.includes("incrementar")) {
          values[i] = Math.min(values[i] + 0.1, 1);
          changed = true;
        } else if (msg.includes("menos") || msg.includes("reducir")) {
          values[i] = Math.max(values[i] - 0.1, 0);
          changed = true;
        }
      }
    });

    if (msg.includes("equilibrado")) {
      values = [...baseValues];
      changed = true;
    }

    if (changed) {
      drawRadar();
      reply.innerHTML = "✅ Preferencias actualizadas.";
    } else {
      reply.innerHTML = "⚠️ No se detectaron cambios.";
    }
  });
});

// dibujar al cargar por primera vez
document.dispatchEvent(new CustomEvent("slideChanged", { detail: { index: 0 } }));
