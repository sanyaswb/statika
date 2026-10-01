(() => {
  const form = document.getElementById("feedback-form");
  const commentField = document.getElementById("feedback-comment");
  const message = document.getElementById("feedback-message");
  const layer = document.getElementById("comments-layer");
  const generator = document.querySelector("body > .container");
  const ratingInputs = [...form.querySelectorAll('input[name="rating"]')];
  const notes = [];
  const colors = ["#fff0a8", "#ffd9e5", "#d9f5de", "#dcecff", "#f2ddff"];

  function randomBetween(min, max) {
    return min + Math.random() * Math.max(0, max - min);
  }

  function showSelectedStars(rating) {
    ratingInputs.forEach((input, index) => {
      input.parentElement.classList.toggle("active", index < rating);
    });
  }

  function isThankYou(comment) {
    return comment.toLocaleLowerCase("uk-UA").trim().replace(/[!?.…\s]+$/gu, "") === "дякую";
  }

  function useMobileLayout() {
    const card = generator.getBoundingClientRect();
    return Math.max(card.left, window.innerWidth - card.right) < 175;
  }

  function placeMobile(note, index) {
    const width = Math.min(220, layer.clientWidth - 20);
    note.style.width = `${width}px`;
    const previous = notes[index - 1];
    const top = previous ? parseFloat(previous.style.top) + previous.offsetHeight + randomBetween(18, 32) : 16;
    const left = randomBetween(10, layer.clientWidth - width - 10);
    note.style.left = `${left}px`;
    note.style.top = `${top}px`;
    layer.style.minHeight = `${top + note.offsetHeight + 20}px`;
  }

  function placeDesktop(note) {
    const card = generator.getBoundingClientRect();
    const sideWidth = Math.max(card.left, window.innerWidth - card.right);
    const width = Math.min(210, sideWidth - 26);
    note.style.width = `${width}px`;
    const sides = [];
    if (card.left >= width + 24) sides.push([12, card.left - width - 12]);
    if (window.innerWidth - card.right >= width + 24) {
      sides.push([card.right + 12, window.innerWidth - width - 12]);
    }
    let left = 12;
    let top = 12;
    for (let attempt = 0; attempt < 30; attempt++) {
      const side = sides[Math.floor(Math.random() * sides.length)];
      left = randomBetween(side[0], side[1]);
      top = randomBetween(12, window.innerHeight - note.offsetHeight - 12);
      const clear = notes.every(other => {
        if (other === note) return true;
        const otherLeft = parseFloat(other.style.left);
        const otherTop = parseFloat(other.style.top);
        return left + width + 14 < otherLeft || left > otherLeft + other.offsetWidth + 14 ||
          top + note.offsetHeight + 14 < otherTop || top > otherTop + other.offsetHeight + 14;
      });
      if (clear) break;
    }
    note.style.left = `${left}px`;
    note.style.top = `${top}px`;
  }

  function placeNote(note, index) {
    if (layer.classList.contains("mobile")) placeMobile(note, index);
    else placeDesktop(note);
  }

  function layoutNotes() {
    layer.classList.toggle("mobile", useMobileLayout());
    layer.style.minHeight = "";
    notes.forEach(placeNote);
  }

  function animateNote(note) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !note.animate) return;
    const origin = form.getBoundingClientRect();
    const target = note.getBoundingClientRect();
    const dx = origin.left + origin.width / 2 - (target.left + target.width / 2);
    const dy = origin.top + origin.height / 2 - (target.top + target.height / 2);
    note.animate([
      { opacity: 0, transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(0.6)` },
      { opacity: 1, transform: `rotate(${note.style.getPropertyValue("--tilt")}) scale(1)` }
    ], { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" });
  }

  function addComment(comment, rating) {
    const note = document.createElement("article");
    note.className = "floating-comment";
    note.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    const tilt = randomBetween(5, 15) * (Math.random() < 0.5 ? -1 : 1);
    note.style.setProperty("--tilt", `${tilt}deg`);

    const stars = document.createElement("div");
    stars.className = "note-stars";
    stars.setAttribute("aria-label", `Оцінка: ${rating} з 5`);
    stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
    const text = document.createElement("p");
    text.textContent = comment;
    note.append(stars, text);

    const wasMobile = layer.classList.contains("mobile");
    notes.push(note);
    layer.appendChild(note);
    if (wasMobile !== useMobileLayout()) layoutNotes();
    else placeNote(note, notes.length - 1);
    animateNote(note);
    if (layer.classList.contains("mobile")) {
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      note.scrollIntoView({ behavior: motion, block: "nearest" });
    }
  }

  ratingInputs.forEach(input => {
    input.addEventListener("change", () => showSelectedStars(Number(input.value)));
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const comment = commentField.value.trim();
    if (!comment) {
      message.textContent = "Напишіть коментар.";
      commentField.focus();
      return;
    }
    const rating = Number(form.querySelector('input[name="rating"]:checked').value);
    addComment(comment, rating);
    message.textContent = isThankYou(comment) ? "Дівчина с пиздякою!" : "Дякуємо за відгук!";
    form.reset();
    showSelectedStars(0);
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutNotes, 120);
  });
  layer.classList.toggle("mobile", useMobileLayout());
})();
