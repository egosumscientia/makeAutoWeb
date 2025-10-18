/**
 * AI-InventoryManagement — Versión final con Lambda pública y CORS funcional
 * makeAutomatic – 2025
 */

document.addEventListener("slideChanged", (e) => {
  if (e.detail.index === 3) {
    const container = document.getElementById("carousel-slide-3");
    if (!container) return;

    container.innerHTML = "";

    // ===== Layout wrapper =====
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";
    wrapper.style.gap = "8px";
    wrapper.style.padding = "6px";
    wrapper.style.color = "#f1f5f9";
    wrapper.style.fontSize = "10px";

    const demoDescription = document.createElement("p");
    demoDescription.className = "ai-demo-description";
    demoDescription.textContent =
      "Este demo muestra cómo una API con inteligencia artificial analiza y visualiza automáticamente el estado del inventario en tiempo real.";

    container.appendChild(demoDescription);

    // ===== Botón =====
    const button = document.createElement("button");
    button.textContent = "Simular Inventario";
    button.className =
      "ai-btn px-3 py-1 bg-emerald-500 text-white rounded-md shadow hover:bg-emerald-600 transition";

    // ===== Contenedor del gráfico =====
    const chartBox = document.createElement("div");
    chartBox.style.width = "72%";
    chartBox.style.maxWidth = "420px";
    chartBox.style.background = "#0f172a";
    chartBox.style.borderRadius = "8px";
    chartBox.style.padding = "10px";
    chartBox.style.boxShadow = "0 0 5px rgba(0,0,0,0.25)";
    chartBox.style.textAlign = "center";

    const chartTitle = document.createElement("h3");
    chartTitle.textContent = "Inventario Actual";
    chartTitle.style.marginBottom = "4px";
    chartTitle.style.color = "#10b981";
    chartTitle.style.fontSize = "0.9rem";
    chartTitle.style.fontWeight = "bold";
    chartTitle.style.borderBottom = "1px solid rgba(16,185,129,0.4)";
    chartTitle.style.paddingBottom = "4px";

    const canvas = document.createElement("canvas");
    canvas.id = "inventoryChart";
    canvas.style.width = "100%";

    chartBox.appendChild(chartTitle);
    chartBox.appendChild(canvas);

    // ===== Caja de resultados =====
    const resultBox = document.createElement("div");
    resultBox.id = "inventoryResult";
    resultBox.style.width = "72%";
    resultBox.style.maxWidth = "420px";
    resultBox.style.background = "#0f172a";
    resultBox.style.borderRadius = "8px";
    resultBox.style.padding = "8px 12px";
    resultBox.style.boxShadow = "0 0 5px rgba(0,0,0,0.25)";
    resultBox.style.textAlign = "left";
    resultBox.style.fontSize = "9.5px";
    resultBox.style.lineHeight = "1.2";
    resultBox.style.color = "#e2e8f0";

    // ===== Ensamblar =====
    wrapper.appendChild(button);
    wrapper.appendChild(chartBox);
    wrapper.appendChild(resultBox);
    container.appendChild(wrapper);

    // ===== Evento: click en el botón =====
    button.addEventListener("click", async () => {
      const apiUrl =
        "https://4khu7h5wdj7aivcyybxsgayuyu0lyhoy.lambda-url.us-east-1.on.aws/";
      resultBox.innerHTML = "<em>Consultando datos...</em>";

      try {
        const res = await fetch(apiUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            "Accept": "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Etiquetas abreviadas
        const shortLabels = ["Elec", "Ropa", "Hogar", "Jugu", "Libros"];
        const shortData = data.categories.slice(0, 5).map((c, i) => ({
          name: shortLabels[i],
          qty: c.qty,
        }));

        // Destruir gráfico previo
        if (window.inventoryChartInstance) {
          window.inventoryChartInstance.destroy();
        }

        const ctx = document.getElementById("inventoryChart").getContext("2d");

        // === Renderizar gráfico ===
        window.inventoryChartInstance = new Chart(ctx, {
          type: "bar",
          data: {
            labels: shortData.map((c) => c.name),
            datasets: [
              {
                label: "Cantidad",
                data: shortData.map((c) => c.qty),
                backgroundColor: "rgba(16,185,129,0.75)",
                borderColor: "rgba(16,185,129,1)",
                borderWidth: 1,
                borderRadius: 3,
                barThickness: 18,
                categoryPercentage: 0.7,
              },
            ],
          },
          options: {
            maintainAspectRatio: true,
            responsive: true,
            aspectRatio: 2.0,
            plugins: {
              legend: {
                labels: {
                  color: "#e2e8f0",
                  font: { size: 7 },
                },
              },
            },
            scales: {
              x: {
                ticks: { color: "#e2e8f0", font: { size: 8 } },
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { color: "#e2e8f0", font: { size: 7 } },
                grid: { color: "rgba(255,255,255,0.05)" },
              },
            },
          },
        });

        // === Mostrar resumen ===
        resultBox.innerHTML = `
          <h3 style="color:#10b981; text-align:center; margin-bottom:4px; font-size:0.85rem; border-bottom:1px solid rgba(16,185,129,0.4); padding-bottom:3px;">
            Resumen
          </h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1px 8px;">
            <p><b>Total:</b> ${data.summary.totalItems}</p>
            <p><b>Bajo:</b> ${data.summary.lowStock}</p>
            <p><b>Sobrestock:</b> ${data.summary.overStock}</p>
            <p><b>Rotación:</b> ${data.summary.rotationRate}</p>
            <p><b>Valor:</b> $${data.summary.totalValueUSD.toLocaleString()}</p>
          </div>
        `;
      } catch (err) {
        console.error(err);
        resultBox.innerHTML =
          "<span style='color:#f87171;'>Error al obtener datos (ver consola).</span>";
      }
    });
  }
});
