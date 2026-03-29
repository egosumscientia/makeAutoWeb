const inventoryCuts = [
  {
    state: "ok",
    palette: {
      fill: "rgba(0, 255, 156, 0.08)",
      barColor: "#00ff9c",
      className: "chart-signal--ok"
    },
    summary: {
      totalItems: 1240,
      lowStock: 0,
      overStock: 0,
      rotationRate: "2.6x",
      totalValueUSD: 18400
    },
    categories: [
      { name: "Lacteos", qty: 320 },
      { name: "Snacks", qty: 250 },
      { name: "Bebidas", qty: 280 },
      { name: "Congelados", qty: 190 },
      { name: "Panaderia", qty: 200 }
    ]
  },
  {
    state: "warn",
    palette: {
      fill: "rgba(255, 214, 10, 0.08)",
      barColor: "#ffd60a",
      className: "chart-signal--warn"
    },
    summary: {
      totalItems: 1110,
      lowStock: 0,
      overStock: 2,
      rotationRate: "3.1x",
      totalValueUSD: 17250
    },
    categories: [
      { name: "Lacteos", qty: 270 },
      { name: "Snacks", qty: 225 },
      { name: "Bebidas", qty: 240 },
      { name: "Congelados", qty: 155 },
      { name: "Panaderia", qty: 220 }
    ]
  },
  {
    state: "risk",
    palette: {
      fill: "rgba(255, 92, 92, 0.1)",
      barColor: "#ff5c5c",
      className: "chart-signal--risk"
    },
    summary: {
      totalItems: 1340,
      lowStock: 4,
      overStock: 1,
      rotationRate: "2.2x",
      totalValueUSD: 20120
    },
    categories: [
      { name: "Lacteos", qty: 350 },
      { name: "Snacks", qty: 260 },
      { name: "Bebidas", qty: 310 },
      { name: "Congelados", qty: 210 },
      { name: "Panaderia", qty: 210 }
    ]
  }
];

let index = 0;

export function nextInventoryCut() {
  const cut = inventoryCuts[index % inventoryCuts.length];
  index += 1;
  return cut;
}
