const labels = ["Dulce", "Salado", "Acido", "Amargo", "Umami", "Picante", "Crujiente"];
const defaults = [0.45, 0.55, 0.35, 0.4, 0.45, 0.5, 0.55];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function createInitialProfile() {
  return { labels, values: [...defaults] };
}

export function updateProfile(message, currentValues) {
  const text = normalize(message);
  const values = [...currentValues];
  let changed = false;

  labels.forEach((label, index) => {
    const normalized = normalize(label);
    if (!text.includes(normalized)) return;
    if (text.includes("mas")) {
      values[index] = Math.min(values[index] + 0.1, 1);
      changed = true;
    }
    if (text.includes("menos")) {
      values[index] = Math.max(values[index] - 0.1, 0);
      changed = true;
    }
  });

  if (text.includes("equilibrado")) {
    return { values: [...defaults], changed: true };
  }

  return { values, changed };
}
