const catalog = [
  { sku: "FS-101", name: "Papa a la francesa 9mm", format: "5 kg", price: 23110, category: "Congelados" },
  { sku: "FS-102", name: "Queso mozzarella", format: "1.5 kg", price: 29786, category: "Lacteos" },
  { sku: "FS-103", name: "Yogur natural", format: "1 kg", price: 6027, category: "Lacteos" },
  { sku: "FS-104", name: "Croquetas de pollo", format: "1 kg", price: 32134, category: "Congelados" },
  { sku: "FS-105", name: "Jugo de naranja", format: "6 unidades", price: 30244, category: "Bebidas" },
  { sku: "FS-106", name: "Pan integral tajado", format: "250 g", price: 24662, category: "Panaderia" }
];

const synonyms = new Map([
  ["Papa a la francesa 9mm", ["papas fritas", "papas a la francesa", "papa francesa"]],
  ["Queso mozzarella", ["queso mozzarella", "mozarella", "queso pizza"]],
  ["Yogur natural", ["yogur natural", "yogurt natural", "yogures"]],
  ["Croquetas de pollo", ["croquetas de pollo", "nuggets", "pollo apanado"]],
  ["Jugo de naranja", ["jugo de naranja", "zumo de naranja"]],
  ["Pan integral tajado", ["pan integral", "pan tajado"]]
]);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractQuantity(message, alias) {
  const match = message.match(new RegExp(`(\\d+)\\s+${alias}`));
  return match ? Number(match[1]) : 1;
}

export function getCatalog() {
  return catalog;
}

export function processOrder(input, cart) {
  const message = normalize(input);
  const matches = [];

  synonyms.forEach((aliases, productName) => {
    const alias = aliases.find((candidate) => message.includes(normalize(candidate)));
    if (!alias) return;
    const product = catalog.find((item) => item.name === productName);
    if (!product) return;
    matches.push({
      ...product,
      quantity: extractQuantity(message, normalize(alias))
    });
  });

  if (!matches.length) {
    return {
      reply: "No reconozco ese producto en el catalogo local. Prueba con queso mozzarella, yogur natural o papas fritas.",
      cart
    };
  }

  const nextCart = [...cart];
  const lines = matches.map((item) => {
    const subtotal = item.quantity * item.price;
    nextCart.push({ ...item, subtotal });
    return `${item.name} x${item.quantity} = ${subtotal.toLocaleString("es-CO")} COP`;
  });

  const total = nextCart.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    reply: `${lines.join(" | ")}. Total acumulado: ${total.toLocaleString("es-CO")} COP.`,
    cart: nextCart
  };
}

export function confirmOrder(cart) {
  if (!cart.length) {
    return "No hay items en la orden.";
  }

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const lines = cart.map((item) => `${item.name} x${item.quantity}`).join(", ");
  return `Orden local confirmada: ${lines}. Total final ${total.toLocaleString("es-CO")} COP.`;
}
