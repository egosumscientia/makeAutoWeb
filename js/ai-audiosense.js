// =============================================
// makeAutomatic – AI-AudioSense Demo (Enhanced)
// Works seamlessly on desktop and mobile
// Keeps HTML clean (fully injected dynamically)
// =============================================

document.addEventListener("slideChanged", (e) => {
  if (e.detail.index === 2) setupAudioSense();
});

function setupAudioSense() {
  const container = document.querySelector(".carousel-item:nth-child(3)");
  if (!container || container.querySelector("#audioFile")) return;

  // Injects the entire form and result box dynamically
  container.innerHTML += `
    <div class="ai-input">
      <label for="audioFile" class="custom-file-upload">📂 Seleccionar archivo</label>
      <input type="file" id="audioFile" accept=".wav,.mp3,.ogg,.m4a" />
      <button id="analyzeBtn">Analizar Audio</button>
    </div>
    <p class="audio-info">Formatos compatibles: <b>WAV</b>, <b>MP3</b>, <b>OGG</b>, <b>M4A</b> (máx. 5&nbsp;MB).</p>
    <div id="audioResult" class="audio-result-box">
      <p class="placeholder-text">Sube un archivo para comenzar el análisis.</p>
    </div>
  `;

  const fileInput = container.querySelector("#audioFile");
  const analyzeBtn = container.querySelector("#analyzeBtn");
  const resultEl = container.querySelector("#audioResult");

  // Inject lightweight responsive styles dynamically
  if (!document.getElementById("audioSenseStyles")) {
    const style = document.createElement("style");
    style.id = "audioSenseStyles";
    style.textContent = `
      .audio-result-box {
        margin-top: 20px;
        padding: 15px;
        border-radius: 10px;
        background-color: #111827;
        color: #e5e7eb;
        text-align: center;
        min-height: 120px;
        transition: all 0.3s ease;
        animation: fadeIn 0.5s ease;
        font-size: clamp(0.9rem, 2vw, 1rem);
        line-height: 1.4;
      }
      .audio-result-box.success { border: 1px solid #10b981; }
      .audio-result-box.error { border: 1px solid #ef4444; }
      .audio-result-box.warning { border: 1px solid #f59e0b; }
      .audio-result-box.info { border: 1px solid #3b82f6; }
      .placeholder-text { opacity: 0.7; }
      .audio-result-box small { opacity: 0.8; display: block; margin-top: 5px; font-size: 0.85em; }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* ---- Layout fixes for mobile ---- */
      .ai-input {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
      }

      .custom-file-upload {
        display: inline-block;
        width: 100%;
        text-align: center;
        background-color: #10b981;
        color: white;
        font-weight: 600;
        padding: 12px 0;
        border-radius: 10px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .custom-file-upload:active {
        opacity: 0.9;
        transform: scale(0.98);
      }

      #audioFile {
        display: none;
      }

      #analyzeBtn {
        width: 100%;
        background-color: #10b981;
        border: none;
        border-radius: 10px;
        padding: 12px 0;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
      }

      #analyzeBtn:active {
        opacity: 0.9;
        transform: scale(0.98);
      }

      @media (max-width: 400px) {
        .custom-file-upload,
        #analyzeBtn {
          font-size: 0.9rem;
          padding: 10px 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const audioApiUrl =
    "https://y86gcq22ul.execute-api.us-east-1.amazonaws.com/prod/analyze-audio";

  analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) {
      showMessage("warning", "⚠️ No has seleccionado ningún archivo.<br>Sube un archivo WAV, MP3, OGG o M4A para comenzar.");
      return;
    }

    // File size validation (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", `❌ Archivo demasiado grande: ${(file.size / (1024 * 1024)).toFixed(2)} MB.<br>Límite máximo: <b>5 MB</b>.`);
      return;
    }

    // Loading indicator
    showMessage("info", "⏳ <b>Procesando audio...</b><br>Analizando frecuencias y espectro acústico...");

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

        // Generate simulated additional data (for demo purposes)
        const fakeFreq = Math.floor(Math.random() * 3000 + 300);
        const fakeCategory = ["Ruido estable", "Vibración leve", "Golpeteo cíclico", "Motor balanceado"][Math.floor(Math.random() * 4)];
        const fakeHealth = ["Normal", "Atención requerida", "Mantenimiento recomendado"][Math.floor(Math.random() * 3)];

        showMessage(
          "success",
          `
          ✅ <b>Audio analizado correctamente.</b><br>
          Resultado simulado: <b>${data.message}</b><br>
          Nivel de confianza: <b>${(data.confidence * 100).toFixed(1)}%</b><br><br>
          <small>
            🔊 Frecuencia dominante: ${fakeFreq} Hz<br>
            🧩 Clasificación: ${fakeCategory}<br>
            ⚙️ Estado del equipo: ${fakeHealth}
          </small>
        `
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("AudioSense error:", error);
      showMessage("error", "❌ Error al procesar el audio.<br>Verifica tu conexión o intenta nuevamente.");
    }
  });

  // Utility function to update result area
  function showMessage(type, html) {
    resultEl.className = `audio-result-box ${type}`;
    resultEl.innerHTML = html;
  }
}

// Optional: helper (unused but kept for compatibility)
function toBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
}
