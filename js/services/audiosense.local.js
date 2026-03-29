const samples = [
  {
    rmsDb: 63,
    dominantHz: 420,
    confidence: 0.93,
    anomaly: false,
    message: "Firma acustica consistente con operacion normal.",
    bands: [
      { label: "Bass", value: 34 },
      { label: "Low Mid", value: 49 },
      { label: "Mid", value: 52 },
      { label: "High Mid", value: 40 },
      { label: "High", value: 28 }
    ]
  },
  {
    rmsDb: 71,
    dominantHz: 690,
    confidence: 0.88,
    anomaly: true,
    message: "Se detecta un pico atipico en bandas medias y altas.",
    bands: [
      { label: "Bass", value: 32 },
      { label: "Low Mid", value: 58 },
      { label: "Mid", value: 74 },
      { label: "High Mid", value: 68 },
      { label: "High", value: 43 }
    ]
  },
  {
    rmsDb: 66,
    dominantHz: 510,
    confidence: 0.9,
    anomaly: false,
    message: "El patron sugiere carga normal con vibracion controlada.",
    bands: [
      { label: "Bass", value: 29 },
      { label: "Low Mid", value: 46 },
      { label: "Mid", value: 49 },
      { label: "High Mid", value: 39 },
      { label: "High", value: 31 }
    ]
  }
];

let index = 0;

export function nextAudioAnalysis() {
  const sample = samples[index % samples.length];
  index += 1;
  return sample;
}
