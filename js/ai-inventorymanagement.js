
/**
 * AI-InventoryManagement — Responsive Mobile-First
 * Optimized Chart.js scaling and mobile layout
 */

document.addEventListener("slideChanged", (e) => {
  if (e.detail.index === 3) {
    const container = document.getElementById("carousel-slide-3");
    if (!container) return;

    container.innerHTML = "";
    container.className = "ai-inventory-container";

    // ===== Main wrapper =====
    const wrapper = document.createElement("div");
    wrapper.className = "ai-inventory-wrapper";

    // ===== Legend / description =====
    const legend = document.createElement("p");
    legend.textContent =
      "Este demo muestra cómo una API con inteligencia artificial analiza y visualiza automáticamente el estado del inventario en tiempo real.";
    legend.className = "ai-inventory-legend";

    // ===== Button =====
    const button = document.createElement("button");
    button.textContent = "Simular Inventario";
    button.className = "ai-btn ai-inventory-btn";

    // ===== Chart container =====
    const chartBox = document.createElement("div");
    chartBox.className = "ai-inventory-chart-box";

    const chartTitle = document.createElement("h3");
    chartTitle.textContent = "Inventario Actual";
    chartTitle.className = "ai-inventory-chart-title";

    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "ai-inventory-canvas-wrapper";

    const canvas = document.createElement("canvas");
    canvas.id = "inventoryChart";
    canvas.className = "ai-inventory-canvas";

    canvasWrapper.appendChild(canvas);
    chartBox.appendChild(chartTitle);
    chartBox.appendChild(canvasWrapper);

    // ===== Result box =====
    const resultBox = document.createElement("div");
    resultBox.id = "inventoryResult";
    resultBox.className = "ai-inventory-result";

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

        // Short labels for mobile readability
        const shortLabels = ["Elec", "Ropa", "Hogar", "Jugu", "Libros"];
        const shortData = data.categories.slice(0, 5).map((c, i) => ({
          name: shortLabels[i],
          qty: c.qty,
        }));

        // Destroy previous chart
        if (window.inventoryChartInstance) {
          window.inventoryChartInstance.destroy();
        }

        const ctx = canvas.getContext("2d");

        // --- Responsive Chart Configuration ---
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
                barThickness: "flex",
                maxBarThickness: 35,
                categoryPercentage: 0.8,
                barPercentage: 0.9,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.8,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                ticks: {
                  color: "#e2e8f0",
                  font: { 
                    size: window.innerWidth < 768 ? 10 : 12 
                  },
                },
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { 
                  color: "#e2e8f0", 
                  font: { 
                    size: window.innerWidth < 768 ? 9 : 11 
                  }
                },
                grid: { color: "rgba(255,255,255,0.08)" },
              },
            },
          },
        });

        // --- Summary grid ---
        resultBox.innerHTML = `
          <h3 class="ai-inventory-summary-title">Resumen</h3>
          <div class="ai-inventory-summary-grid">
            <div class="ai-inventory-summary-item">
              <span class="label">Total:</span>
              <span class="value">${data.summary.totalItems}</span>
            </div>
            <div class="ai-inventory-summary-item">
              <span class="label">Bajo:</span>
              <span class="value">${data.summary.lowStock}</span>
            </div>
            <div class="ai-inventory-summary-item">
              <span class="label">Sobrestock:</span>
              <span class="value">${data.summary.overStock}</span>
            </div>
            <div class="ai-inventory-summary-item">
              <span class="label">Rotación:</span>
              <span class="value">${data.summary.rotationRate}</span>
            </div>
            <div class="ai-inventory-summary-item">
              <span class="label">Valor:</span>
              <span class="value">$${data.summary.totalValueUSD.toLocaleString()}</span>
            </div>
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
