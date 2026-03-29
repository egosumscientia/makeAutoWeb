import "../core/site.js";
import { confirmOrder, getCatalog, processOrder } from "../services/foodsales.local.js";

const chat = document.getElementById("foodsales-chat");
const form = document.getElementById("foodsales-form");
const input = document.getElementById("foodsales-input");
const clearButton = document.getElementById("foodsales-clear");
const confirmButton = document.getElementById("foodsales-confirm");
const catalogNode = document.getElementById("foodsales-catalog");

let cart = [];

function addMessage(kind, text) {
  const node = document.createElement("p");
  node.className = `chat-message chat-message--${kind}`;
  node.textContent = text;
  chat.appendChild(node);
  chat.scrollTop = chat.scrollHeight;
}

function renderCatalog() {
  getCatalog().forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "catalog-item";

    const title = document.createElement("span");
    title.className = "catalog-item__title";

    const name = document.createElement("span");
    name.textContent = item.name;

    const price = document.createElement("span");
    price.textContent = `${item.price.toLocaleString("es-CO")} COP`;

    title.append(name, price);

    const meta = document.createElement("span");
    meta.className = "catalog-item__meta";
    meta.textContent = `${item.category} · ${item.format}`;

    button.append(title, meta);
    button.addEventListener("click", () => {
      input.value = item.name;
      input.focus();
    });
    catalogNode.appendChild(button);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  addMessage("user", message);
  const result = processOrder(message, cart);
  cart = result.cart;
  addMessage("bot", result.reply);
  input.value = "";
});

clearButton.addEventListener("click", () => {
  cart = [];
  chat.innerHTML = "";
  addMessage("bot", "Sesion local reiniciada.");
});

confirmButton.addEventListener("click", () => {
  addMessage("bot", confirmOrder(cart));
  cart = [];
});

renderCatalog();
addMessage("bot", "Asistente local listo. Prueba con: 3 quesos mozzarella y 2 yogures naturales.");
