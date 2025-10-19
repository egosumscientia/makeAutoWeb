// =============================================
// makeAutomatic - Carousel Navigation
// Demo projects carousel with slide events
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  // Get carousel elements
  const items = document.querySelectorAll(".carousel-item");
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const inner = document.querySelector(".carousel-inner");
  let index = 0;

  // Initialize first slide
  if (items.length > 0) items[0].classList.add("active");
  inner.style.transform = "translateX(0)";

  // Slide transition with custom event dispatch
  function showSlide(i) {
    items.forEach(item => item.classList.remove("active"));
    items[i].classList.add("active");
    inner.style.transform = `translateX(-${i * 100}%)`;
    
    // Dispatch slideChanged event for other components
    const event = new CustomEvent("slideChanged", { detail: { index: i } });
    document.dispatchEvent(event);
  }

  // Navigation button handlers
  nextBtn.addEventListener("click", () => {
    index = (index + 1) % items.length;
    showSlide(index);
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + items.length) % items.length;
    showSlide(index);
  });
});

// EcoPredict initialization on slide 2
document.addEventListener("slideChanged", (e) => {
  if (e.detail.index === 1) {
    console.log("Showing slide 2: EcoPredict");
    document.dispatchEvent(new CustomEvent("ecoPredictInit"));
  }
});

// Bloquea la referencia vertical de las flechas a una altura base medida una sola vez
window.addEventListener("load", () => {
  const car = document.querySelector(".carousel");
  const active = document.querySelector(".carousel-item.active") || document.querySelector(".carousel-item");
  if (!car || !active) return;
  // Medimos una base razonable (sin animaciones); si prefieres fija, comenta estas dos líneas
  const base = Math.max(520, Math.min(700, active.getBoundingClientRect().height));
  car.style.setProperty("--carousel-base-h", base + "px");
});

// Si quieres que se reajuste al rotar el móvil, descomenta:
/*
window.addEventListener("resize", () => {
  const car = document.querySelector(".carousel");
  const active = document.querySelector(".carousel-item.active");
  if (!car || !active) return;
  const base = Math.max(520, Math.min(700, active.getBoundingClientRect().height));
  car.style.setProperty("--carousel-base-h", base + "px");
});
*/
