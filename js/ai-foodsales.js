// AI Food Sales Demo – makeAutomatic
// Versión final para GitHub Pages (HTML con bloque manual en el index)

document.addEventListener("DOMContentLoaded", async () => {
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  if (!chatBox || !input || !sendBtn) {
    console.error("⚠️ No se encontraron los elementos del chat en el HTML.");
    return;
  }

  // Cargar datos
  const catalog = await loadCatalog("assets/data/Catalog.csv");
  const synonyms = await loadSynonyms("assets/data/synonyms.json");

  // -------- Catálogo UI --------
const showBtn = document.getElementById("show-catalog");
const listEl  = document.getElementById("catalog-list");

// render simple del catálogo
function renderCatalog(items){
  listEl.innerHTML = items.map(p => `
    <div class="item" data-name="${p.nombre}">
      <div>
        <div class="name">${p.nombre}</div>
        <div class="meta">${p.formato} · ${p.categoria} · ${p.sku}</div>
      </div>
      <div class="meta">${Number(p.precio).toLocaleString()} COP</div>
    </div>
  `).join("");

  // clic: pasar el nombre al input sin borrar el texto previo
    listEl.querySelectorAll(".item").forEach(row => {
    row.addEventListener("click", () => {
        const name = row.getAttribute("data-name");

        // si el input ya tiene texto, agregamos el nuevo nombre al final
        if (input.value.trim()) {
        input.value = input.value.trim() + " y " + name;
        } else {
        input.value = name;
        }

        input.focus();
    });
    });
}

// toggle abrir/cerrar
showBtn.addEventListener("click", ()=>{
  if(listEl.style.display === "none"){
    renderCatalog(catalog);
    listEl.style.display = "block";
    showBtn.textContent = "🔽 Ocultar catálogo";
  }else{
    listEl.style.display = "none";
    showBtn.textContent = "📦 Ver catálogo disponible";
  }
});


  // Mostrar mensajes
  function addMessage(sender, text) {
    const p = document.createElement("p");
    p.style.margin = "8px 0";
    p.style.lineHeight = "1.5";
    p.innerHTML =
      sender === "user"
        ? `<strong>🧑‍💻 Tú:</strong> ${text}`
        : `<strong>🤖 AI Food Sales:</strong> ${text}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Enviar mensaje
  sendBtn.addEventListener("click", handleMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleMessage();
  });

  function handleMessage() {
    const msg = input.value.trim();
    if (!msg) return;
    addMessage("user", msg);
    const reply = processMessage(msg, catalog, synonyms);
    setTimeout(() => addMessage("bot", reply), 300);
    input.value = "";
  }

    // -------- BOTONES EXTRA --------
  const clearBtn = document.getElementById("clear-chat");
  const confirmBtn = document.getElementById("confirm-order");

  // Limpiar chat
  clearBtn.addEventListener("click", () => {
    chatBox.innerHTML = "";
    addMessage("bot", "🧹 Chat limpiado. Puedes comenzar un nuevo pedido.");
  });

  // Confirmar orden
  confirmBtn.addEventListener("click", () => {
    const messages = chatBox.innerHTML.trim();
    if (!messages) {
      addMessage("bot", "⚠️ No hay ningún pedido para confirmar.");
      return;
    }

    const orderId = "ORD-" + Math.floor(Math.random() * 1000000);
        addMessage(
        "bot",
        `✅ <strong>Orden confirmada.</strong><br>ID de orden: <strong>${orderId}</strong><br>Tu solicitud ha sido registrada correctamente.`
        );
    });
});

// =================== FUNCIONES AUXILIARES ===================

async function loadCatalog(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.map((row) => {
      const cols = row.split(",");
      const [
        categoria,
        sku,
        nombre,
        formato,
        moneda,
        precio,
        unidad_minima,
        descuento,
        lead,
        region,
        comentarios,
      ] = cols;
      return {
        categoria,
        sku,
        nombre,
        formato,
        precio: parseFloat(precio),
        unidad_minima: parseInt(unidad_minima),
        descuento,
        lead,
        region,
        comentarios,
      };
    });
  } catch (err) {
    console.error("Error al cargar Catalog.csv:", err);
    return [];
  }
}

async function loadSynonyms(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("Error al cargar synonyms.json:", err);
    return {};
  }
}

// =================== MOTOR PRINCIPAL ===================

function processMessage(msg, catalog, synonyms) {
  msg = msg.toLowerCase();

  const results = [];

  // Buscar múltiples productos
  for (const [nombre, aliasList] of Object.entries(synonyms)) {
    if (aliasList.some(alias => msg.includes(alias.toLowerCase()))) {
      const foundProduct = catalog.find(
        p => p.nombre.toLowerCase() === nombre.toLowerCase()
      );
      if (foundProduct) results.push(foundProduct);
    }
  }

  if (results.length === 0) {
    return "No reconozco esos productos en el catálogo. Prueba con otros nombres o categorías.";
  }

  // Buscar cantidades (si hay varias, se asocian en orden de aparición)
  const qtyMatches = msg.match(/\d+/g) || [];
  const quantities = qtyMatches.map(q => parseInt(q));

  let totalGlobal = 0;
  let reply = "";

  results.forEach((prod, idx) => {
    const quantity = quantities[idx] || 1;
    const price = prod.precio * quantity;
    let discountApplied = false;
    let discountPercent = 0;

    const descMatch = prod.descuento.match(/(\d+)% a partir de (\d+)/);
    if (descMatch) {
      discountPercent = parseInt(descMatch[1]);
      const minQty = parseInt(descMatch[2]);
      if (quantity >= minQty) discountApplied = true;
    }

    const finalPrice = discountApplied
      ? price * (1 - discountPercent / 100)
      : price;

    totalGlobal += finalPrice;

    reply += `
<strong>Producto:</strong> ${prod.nombre}<br>
<strong>Cantidad:</strong> ${quantity} ${prod.formato}<br>
<strong>Precio unitario:</strong> ${prod.precio.toLocaleString()} COP<br>
<strong>Total:</strong> ${finalPrice.toLocaleString()} COP<br>
${discountApplied
  ? `✅ Descuento aplicado: ${discountPercent}%`
  : `ℹ️ Descuento disponible: ${prod.descuento}`
}<br><br>`;
  });

  reply += `<strong>💰 Total general:</strong> ${totalGlobal.toLocaleString()} COP`;
  return reply;
}
