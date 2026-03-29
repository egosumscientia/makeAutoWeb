const scenarios = [
  {
    region: "Planta Norte",
    summary: "Temperatura estable y humedad controlada durante el siguiente turno.",
    points: [21, 22, 22, 23, 24, 24, 23, 22]
  },
  {
    region: "Centro de Distribucion",
    summary: "Aumento termico moderado en la tarde. Se recomienda revisar ventilacion.",
    points: [19, 20, 21, 24, 26, 27, 25, 22]
  },
  {
    region: "Camara Fria",
    summary: "Oscilacion ligera con riesgo bajo. La curva vuelve a rango al final del periodo.",
    points: [6, 5, 5, 4, 4, 5, 6, 6]
  }
];

let index = 0;

export function nextScenario() {
  const scenario = scenarios[index % scenarios.length];
  index += 1;
  return {
    ...scenario,
    labels: ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]
  };
}
