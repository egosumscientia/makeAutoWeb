// cloud-demo.js
// makeAutomatic Cloud Demo – conecta el frontend con AWS API Gateway y DynamoDB

const API_URL = "https://wt98co3rrb.execute-api.us-east-1.amazonaws.com/products";

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("cloud-modal");
  const openBtn = document.getElementById("cloud-btn");
  const closeBtn = document.getElementById("close-cloud-modal");
  const productList = document.getElementById("product-list");

  if (!openBtn || !modal) return; // si la sección no existe, no hace nada

  openBtn.addEventListener("click", async () => {
    document.body.classList.add("modal-open"); // 🔹 evita scroll del fondo
    modal.style.display = "flex";
    productList.innerHTML = "<p>Cargando productos...</p>";

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      productList.innerHTML = data
        .map(
          (p) => `
          <div style="border:1px solid #00b4d8; padding:10px; border-radius:8px; margin:8px 0;">
            <h4 style="color:#00b4d8; margin:0;">${p.name}</h4>
            <p>${p.description}</p>
            <p><strong>Categoría:</strong> ${p.category}</p>
            <p><strong>Precio:</strong> $${p.price}</p>
          </div>
        `
        )
        .join("");
    } catch (err) {
      productList.innerHTML = "<p style='color:red;'>Error al cargar los datos.</p>";
    }
  });

  closeBtn.addEventListener("click", () => {
    document.body.classList.remove("modal-open"); // 🔹 reestablece scroll
    modal.style.display = "none";
  });
});
