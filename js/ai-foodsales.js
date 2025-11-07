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
  const listEl = document.getElementById("catalog-list");

  // render simple del catálogo
  function renderCatalog(items) {
    listEl.innerHTML = items
      .map(
        (p) => `
      <div class="item" data-name="${p.nombre}">
        <div>
          <div class="name">${p.nombre}</div>
          <div class="meta">${p.formato} · ${p.categoria} · ${p.sku}</div>
        </div>
        <div class="meta">${Number(p.precio).toLocaleString()} COP</div>
      </div>
    `
      )
      .join("");

    // clic: reemplazar el texto del input por el nombre del producto
    listEl.querySelectorAll(".item").forEach((row) => {
      row.addEventListener("click", () => {
        const name = row.getAttribute("data-name");
        input.value = name;
        input.focus();
      });
    });
  }

  // toggle abrir/cerrar catálogo
  showBtn.addEventListener("click", () => {
    if (listEl.style.display === "none") {
      renderCatalog(catalog);
      listEl.style.display = "block";
      showBtn.textContent = "🔽 Ocultar catálogo";
    } else {
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
    window.__cart = []; // limpiar carrito
    addMessage("bot", "🧹 Chat limpiado. Puedes comenzar un nuevo pedido.");
  });

  // Confirmar orden
  confirmBtn.addEventListener("click", () => {
    const cart = window.__cart || [];
    if (cart.length === 0) {
      addMessage("bot", "⚠️ No hay ningún pedido para confirmar.");
      return;
    }

    const totalFinal = cart.reduce((s, i) => s + i.subtotal, 0);
    const orderId = "ORD-" + Math.floor(Math.random() * 1000000);

    const resumen = cart
      .map(
        (i) =>
          `${i.nombre} (${i.cantidad}) × ${i.precio.toLocaleString()} = ${i.subtotal.toLocaleString()} COP`
      )
      .join("<br>");

    addMessage(
      "bot",
      `
✅ <strong>Orden confirmada.</strong><br>
ID de orden: <strong>${orderId}</strong><br>
${resumen}<br>
💰 <strong>Total final:</strong> ${totalFinal.toLocaleString()} COP
  `
    );

    window.__cart = [];
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

// carrito global
window.__cart = window.__cart || [];

// función principal
function processMessage(msg, catalog, synonyms) {
  msg = msg.toLowerCase();
  const results = [];

  // buscar productos mencionados (más flexible)
  for (const [nombre, aliasList] of Object.entries(synonyms)) {
    for (const alias of aliasList) {
      if (msg.includes(alias.toLowerCase())) {
        const found = catalog.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
        if (found && !results.some(r => r.nombre === found.nombre)) {
          results.push(found);
        }
        break; // deja de revisar más alias del mismo producto
      }
    }
  }

  if (results.length === 0)
    return "No reconozco esos productos en el catálogo.";

  // buscar cantidad por producto
  const quantities = [];
  for (const [nombre, aliasList] of Object.entries(synonyms)) {
    for (const alias of aliasList) {
      const re = new RegExp(`(\\d+(?:[\\.,]\\d+)?)\\s*(?:${alias})`, "i");
      const m = msg.match(re);
      if (m) {
        quantities.push(parseFloat(m[1].replace(",", ".")));
        break;
      }
    }
  }
  if (quantities.length === 0) quantities.push(1);

  let totalGlobal = 0;
  let reply = "";

  results.forEach((prod, idx) => {
    const quantity = quantities[idx] || 1;
    const subtotal = prod.precio * quantity;
    totalGlobal += subtotal;

    // acumular en carrito
    window.__cart.push({
      nombre: prod.nombre,
      cantidad: quantity,
      precio: prod.precio,
      subtotal: subtotal,
    });

    reply += `
<strong>Producto:</strong> ${prod.nombre}<br>
<strong>Cantidad:</strong> ${quantity}<br>
<strong>Precio unitario:</strong> ${prod.precio.toLocaleString()} COP<br>
<strong>Total:</strong> ${subtotal.toLocaleString()} COP<br><br>`;
  });

  reply += `<strong>💰 Total general:</strong> ${totalGlobal.toLocaleString()} COP`;
  return reply;
}
