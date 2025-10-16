// ai-ecopredict.js — versión final con etiquetas de temperatura en cada punto
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("ecoCanvas");
  const ctx = canvas.getContext("2d");
  const btn = document.getElementById("btnPredict");

  const API_URL = "https://5835qh1c9b.execute-api.us-east-1.amazonaws.com";

  let puntos = [];
  let animFrame;

  function resizeCanvas() {
    const width = canvas.clientWidth || 300;
    canvas.width = width;
    canvas.height = width * 0.75;
    if (ctx && window.lastData) drawChart(window.lastData, false);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("slideChanged", (e) => {
    if (e.detail.index === 1) setTimeout(resizeCanvas, 200);
  });

  // --- Dibujo animado de la línea ---
  const drawLineAnimated = (points, color, offset = 0, speed = 60) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    let i = 0;
    const total = points.length;

    const step = () => {
      if (i < total - 1) {
        const x1 = 50 + (i + offset) * 60;
        const y1 = 260 - (points[i].temp - 20) * 25;
        const x2 = 50 + (i + 1 + offset) * 60;
        const y2 = 260 - (points[i + 1].temp - 20) * 25;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Puntos
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x1, y1, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Texto de temperatura
        ctx.fillStyle = "#00ffd0";
        ctx.font = "11px monospace";
        ctx.fillText(`${points[i].temp.toFixed(1)}°`, x1 - 10, y1 - 10);

        puntos.push({ x: x1, y: y1, hora: points[i].hora, temp: points[i].temp });
        i++;
        animFrame = setTimeout(step, speed);
      } else {
        const x = 50 + (i + offset) * 60;
        const y = 260 - (points[i].temp - 20) * 25;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#00ffd0";
        ctx.font = "11px monospace";
        ctx.fillText(`${points[i].temp.toFixed(1)}°`, x - 10, y - 10);

        puntos.push({ x, y, hora: points[i].hora, temp: points[i].temp });
      }
    };
    step();
  };

  const drawLabels = (points) => {
    ctx.fillStyle = "#888";
    ctx.font = "10px monospace";
    points.forEach((p, i) => {
      const x = 50 + i * 60;
      ctx.fillText(p.hora, x - 10, canvas.height - 30);
    });
  };

  const drawLegend = () => {
    ctx.fillStyle = "#00bfff";
    ctx.font = "12px monospace";
    ctx.fillText("Temperatura", 50, canvas.height - 10);
  };

  const drawInfo = (region, current) => {
    ctx.fillStyle = "#00ffd0";
    ctx.font = "16px monospace";
    ctx.fillText(`📍 ${region} — ${current.temp} °C a las ${current.hora}`, 40, 30);
  };

  const drawChart = (data, animate = true) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    puntos = [];
    clearTimeout(animFrame);

    const current = data.datos_pasados[data.datos_pasados.length - 1];
    drawInfo(data.region, current);

    if (animate) {
      drawLineAnimated(data.datos_pasados, "#00bfff");
      setTimeout(() => {
        drawLineAnimated(data.prediccion, "#00bfff", data.datos_pasados.length);
      }, data.datos_pasados.length * 60);
    } else {
      const drawStatic = (points, color, offset = 0) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        points.forEach((p, i) => {
          const x = 50 + (i + offset) * 60;
          const y = 260 - (p.temp - 20) * 25;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        points.forEach((p, i) => {
          const x = 50 + (i + offset) * 60;
          const y = 260 - (p.temp - 20) * 25;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = "#00ffd0";
          ctx.font = "11px monospace";
          ctx.fillText(`${p.temp.toFixed(1)}°`, x - 10, y - 10);

          puntos.push({ x, y, hora: p.hora, temp: p.temp });
        });
      };

      drawStatic(data.datos_pasados, "#00bfff");
      drawStatic(data.prediccion, "#00bfff", data.datos_pasados.length);
    }

    drawLabels([...data.datos_pasados, ...data.prediccion]);
    drawLegend();
  };

  const fetchPrediction = async () => {
    btn.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      window.lastData = data;
      drawChart(data, true);
    } catch (err) {
      console.error("Error fetching data:", err);
      ctx.fillStyle = "#ff4444";
      ctx.fillText("Error al obtener datos", 50, 50);
    } finally {
      btn.disabled = false;
    }
  };

  btn.addEventListener("click", fetchPrediction);
  console.log("AI–EcoPredict listo con temperatura visible en cada punto.");
});
