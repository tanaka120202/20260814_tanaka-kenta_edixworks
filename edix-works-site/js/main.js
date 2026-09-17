const sections = document.querySelectorAll("main section");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.body.classList.add("has-reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  sections.forEach((section) => section.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach((section) => observer.observe(section));
}

const worksGrid = document.querySelector(".works-grid");
const workCards = [...document.querySelectorAll(".work-card")];
const worksDots = document.querySelector(".works__dots");
const mobileView = window.matchMedia("(max-width: 767px)");

if (worksGrid && worksDots && workCards.length) {
  const dots = workCards.map((card, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "works__dot";
    dot.setAttribute("aria-label", `制作実績 ${index + 1} を表示`);
    dot.addEventListener("click", () => {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
    worksDots.append(dot);
    return dot;
  });

  const updateActiveDot = () => {
    if (!mobileView.matches) return;

    const center = worksGrid.scrollLeft + worksGrid.clientWidth / 2;
    const activeIndex = workCards.reduce((closestIndex, card, index) => {
      const closestCard = workCards[closestIndex];
      const cardDistance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      const closestDistance = Math.abs(
        closestCard.offsetLeft + closestCard.offsetWidth / 2 - center
      );

      return cardDistance < closestDistance ? index : closestIndex;
    }, 0);

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  };

  worksGrid.addEventListener("scroll", updateActiveDot, { passive: true });
  mobileView.addEventListener("change", updateActiveDot);
  window.addEventListener("resize", updateActiveDot);
  updateActiveDot();
}
