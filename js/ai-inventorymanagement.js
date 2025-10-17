
/**
 * AI-InventoryManagement — 60% Compact Pro
 * Mantiene proporciones, reduce altura al 60% del tamaño anterior.
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

    // ===== Legend / description =====
    const legend = document.createElement("p");
    legend.textContent =
      "Este demo muestra cómo una API con inteligencia artificial analiza y visualiza automáticamente el estado del inventario en tiempo real.";
    legend.style.fontSize = "0.8rem";
    legend.style.textAlign = "center";
    legend.style.maxWidth = "420px";
    legend.style.color = "#e2e8f0";
    legend.style.margin = "6px 0 2px 0";
    legend.style.lineHeight = "1.3";
    legend.style.opacity = "0.9";

    // ===== Button =====
    const button = document.createElement("button");
    button.textContent = "Simular Inventario";
    button.className =
      "ai-btn px-3 py-1 bg-emerald-500 text-white rounded-md shadow hover:bg-emerald-600 transition";

    // ===== Chart container =====
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
    // 🔽 60% de la altura anterior (~82px → 50px)
    canvas.style.width = "100%";
    canvas.style.height = "50px";

    chartBox.appendChild(chartTitle);
    chartBox.appendChild(canvas);

    // ===== Result box =====
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

    // ===== Assemble =====
    wrapper.appendChild(legend);
    wrapper.appendChild(button);
    wrapper.appendChild(chartBox);
    wrapper.appendChild(resultBox);
    container.appendChild(wrapper);

    // ===== Event: Button click =====
    button.addEventListener("click", async () => {
      const apiUrl = "https://g6274s7qce.execute-api.us-east-1.amazonaws.com";
      resultBox.innerHTML = "<em>Consultando datos...</em>";

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Etiquetas cortas
        const shortLabels = ["Elec", "Ropa", "Hogar", "Jugu", "Libros"];
        const shortData = data.categories.slice(0, 5).map((c, i) => ({
          name: shortLabels[i],
          qty: c.qty,
        }));

        // Destruir gráfico anterior si existe
        if (window.inventoryChartInstance) {
          window.inventoryChartInstance.destroy();
        }

        const ctx = document.getElementById("inventoryChart").getContext("2d");

        // --- Chart ---
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
            maintainAspectRatio: false,
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
                ticks: {
                  color: "#e2e8f0",
                  font: { size: 8 },
                  align: "center",
                  crossAlign: "center",
                },
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

        // --- Summary box ---
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
          "<span style='color:#f87171;'>Error al obtener datos.</span>";
      }
    });
  }
});
