// =============================================
// makeAutomatic – AI-AudioSense Demo
// Integración con carrusel existente
// =============================================


document.addEventListener("slideChanged", (e) => {
  if (e.detail.index === 2) setupAudioSense();
});

/* function setupAudioSense() {
  const container = document.querySelector(".carousel-item:nth-child(3)");
  if (!container || container.querySelector("#audioFile")) return;

  container.innerHTML += `
    <div class="ai-input">
      <input type="file" id="audioFile" accept="audio/*" />
      <button id="analyzeBtn">Analizar Audio</button>
    </div>
    <p id="audioResult"></p>
  `;

  const btn = document.getElementById("analyzeBtn");
  const input = document.getElementById("audioFile");
  const output = document.getElementById("audioResult");

  btn.addEventListener("click", async () => {
    const file = input.files[0];
    if (!file) {
      output.textContent = "Selecciona un archivo de audio primero.";
      return;
    }

    output.textContent = "Procesando...";
    const base64Audio = await toBase64(file);

    try {
      const res = await fetch(audioApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio })
      });

      const data = await res.json();
      output.textContent = data.message || JSON.stringify(data);
    } catch (err) {
      console.error("Error:", err);
      output.textContent = "Error al conectar con el servidor IA.";
    }
  });
} */

function setupAudioSense() {
  const container = document.querySelector(".carousel-item:nth-child(3)");
  if (!container || container.querySelector("#audioFile")) return;

  // Inyecta el formulario dinámicamente
  container.innerHTML += `
    <div class="ai-input">
      <label for="audioFile" class="custom-file-upload">📂 Seleccionar archivo</label>
      <input type="file" id="audioFile" accept=".wav,.mp3,.ogg,.m4a" />
      <button id="analyzeBtn">Analizar Audio</button>
    </div>
    <p class="audio-info">Formatos compatibles: <b>WAV</b>, <b>MP3</b>, <b>OGG</b>, <b>M4A</b> (máx. 10&nbsp;MB).</p>
    <p id="audioResult"></p>
  `;

  const fileInput = container.querySelector("#audioFile");
  const analyzeBtn = container.querySelector("#analyzeBtn");
  const resultEl = container.querySelector("#audioResult");

  const audioApiUrl =
    "https://y86gcq22ul.execute-api.us-east-1.amazonaws.com/prod/analyze-audio";

  analyzeBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) {
    resultEl.textContent = "⚠️ Por favor selecciona un archivo de audio.";
    return;
  }

  // ⚠️ Validación antes de procesar
  if (file.size > 5 * 1024 * 1024) { // 5 MB
    resultEl.textContent = "⚠️ El archivo es demasiado grande. Selecciona uno menor a 5 MB.";
    return;
  }

  // Indicador de carga
  resultEl.textContent = "⏳ Procesando audio...";

  try {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64Audio = e.target.result.split(",")[1];

      const response = await fetch(audioApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio }),
      });

      const data = await response.json();
      resultEl.textContent = `✅ ${data.message} (Confianza: ${(data.confidence * 100).toFixed(1)}%)`;
    };

    reader.readAsDataURL(file);
  } catch (error) {
    resultEl.textContent = "❌ Error al procesar el audio.";
    console.error("AudioSense error:", error);
  }
});

}


function toBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
}
