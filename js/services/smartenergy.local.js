function makeSeries(base, variation, length, noiseFactor) {
  return Array.from({ length }, (_, index) => {
    const wave = Math.sin(index / 4) * variation;
    const noise = Math.cos(index / 3) * noiseFactor;
    return Number((base + wave + noise).toFixed(1));
  });
}

let seed = 0;

function failureCountFromSeed(value) {
  return (value * 7 + 3) % 10;
}

export function nextSmartEnergySnapshot() {
  seed += 1;
  const failures = failureCountFromSeed(seed);
  const voltagePenalty = failures >= 7 ? 7 : failures >= 3 ? 4 : 1.5;
  const powerPenalty = failures >= 7 ? 10 : failures >= 3 ? 6 : 2.5;
  const voltage = makeSeries(401 - voltagePenalty + seed * 0.4, 8 + failures * 0.45, 24, 1.8 + failures * 0.18);
  const power = makeSeries(97 + powerPenalty + seed * 0.35, 12 + failures * 0.6, 24, 2.4 + failures * 0.2);
  return {
    labels: Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, "0")}:00`),
    voltage,
    power,
    failures
  };
}
