import { WORDS } from "./words.js";

const CATEGORIES = [];
WORDS.forEach((w) => {
  if (!CATEGORIES.includes(w.pos)) CATEGORIES.push(w.pos);
});

let filterCat = "all";
let direction = "ko2ru";
let queue = [];
let masteredCount = 0;
let totalCount = 0;
let current = null;
let flipped = false;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue() {
  const pool = WORDS.filter((w) => filterCat === "all" || w.pos === filterCat);
  queue = shuffle(pool).map((w) => ({ ...w, box: 0 }));
  totalCount = queue.length;
  masteredCount = 0;
  nextCard();
}

function nextCard() {
  flipped = false;
  if (queue.length === 0) {
    current = null;
    render();
    return;
  }
  current = queue.shift();
  render();
}

function insertAhead(item, minOffset, maxOffset) {
  const offset = minOffset + Math.floor(Math.random() * (maxOffset - minOffset + 1));
  const pos = Math.min(offset, queue.length);
  queue.splice(pos, 0, item);
}

function rate(level) {
  if (!current) return;
  const item = current;
  if (level === "again") {
    item.box = 0;
    insertAhead(item, 2, 4);
  } else if (level === "hard") {
    insertAhead(item, 5, 8);
  } else if (level === "good") {
    item.box = (item.box || 0) + 1;
    if (item.box >= 2) {
      masteredCount++;
    } else {
      insertAhead(item, 10, 16);
    }
  } else if (level === "easy") {
    masteredCount++;
  }
  nextCard();
}

function flip() {
  if (!current) return;
  flipped = !flipped;
  render();
}

function counts() {
  const map = {};
  WORDS.forEach((w) => {
    map[w.pos] = (map[w.pos] || 0) + 1;
  });
  return map;
}

function renderControls() {
  const catSelect = document.getElementById("catSelect");
  const cnt = counts();
  catSelect.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = `Все категории (${WORDS.length})`;
  catSelect.appendChild(allOpt);

  CATEGORIES.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = `${cat} (${cnt[cat]})`;
    catSelect.appendChild(opt);
  });

  catSelect.value = filterCat;
  catSelect.onchange = () => {
    filterCat = catSelect.value;
    buildQueue();
  };

  const dirChips = document.getElementById("dirChips");
  dirChips.innerHTML = "";
  [
    ["ko2ru", "한국어 → RU"],
    ["ru2ko", "RU → 한국어"],
  ].forEach(([val, label]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (direction === val ? " active" : "");
    chip.textContent = label;
    chip.onclick = () => {
      direction = val;
      renderControls();
      flipped = false;
      render();
    };
    dirChips.appendChild(chip);
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  document.getElementById("catLabel").textContent =
    filterCat === "all" ? "Все категории" : filterCat;
  document.getElementById("statLeft").textContent =
    "осталось: " + (queue.length + (current ? 1 : 0));
  document.getElementById("statMastered").textContent =
    "выучено: " + masteredCount + " / " + totalCount;

  const pct = totalCount ? Math.round((masteredCount / totalCount) * 100) : 0;
  document.getElementById("progressFill").style.width = pct + "%";

  const area = document.getElementById("cardArea");
  area.innerHTML = "";

  if (!current) {
    const done = document.createElement("div");
    done.className = "card done-screen";
    done.innerHTML = `
      <div class="big">🎉</div>
      <div class="msg">Готово! Выучено ${masteredCount} из ${totalCount}.</div>
    `;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "restart-btn";
    btn.textContent = "Начать заново";
    btn.onclick = buildQueue;
    done.appendChild(btn);
    area.appendChild(done);
    return;
  }

  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", "Перевернуть карточку");
  card.onclick = flip;

  const front = direction === "ko2ru" ? current.ko : current.ru;
  const back =
    direction === "ko2ru"
      ? `<div class="translit">${escapeHtml(current.translit)}</div><div class="ru">${escapeHtml(current.ru)}</div>`
      : `<div class="main-word">${escapeHtml(current.ko)}</div><div class="translit">${escapeHtml(current.translit)}</div>`;

  if (!flipped) {
    card.innerHTML = `
      <div class="main-word">${escapeHtml(front)}</div>
      <div class="hint">нажми, чтобы перевернуть</div>
    `;
  } else {
    card.innerHTML = back;
  }
  area.appendChild(card);

  if (flipped) {
    const rateRow = document.createElement("div");
    rateRow.className = "rate-row";
    [
      ["again", "Again", "rate-again"],
      ["hard", "Hard", "rate-hard"],
      ["good", "Good", "rate-good"],
      ["easy", "Easy", "rate-easy"],
    ].forEach(([level, label, cls]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rate-btn " + cls;
      btn.textContent = label;
      btn.onclick = (e) => {
        e.stopPropagation();
        rate(level);
      };
      rateRow.appendChild(btn);
    });
    area.appendChild(rateRow);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    flip();
  }
  if (flipped) {
    if (e.key === "1") rate("again");
    if (e.key === "2") rate("hard");
    if (e.key === "3") rate("good");
    if (e.key === "4") rate("easy");
  }
});

renderControls();
buildQueue();
