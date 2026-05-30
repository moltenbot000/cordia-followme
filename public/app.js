const storageKey = "harborwell-files-state";

const scenes = {
  lighthouse: {
    label: "Lighthouse",
    evidence: ["battery", "lens", "stair"],
  },
  pier: {
    label: "Pier",
    evidence: ["mud", "bell", "rope"],
  },
  archive: {
    label: "Archive",
    evidence: ["logbook", "lockbox", "map"],
  },
};

const evidence = {
  battery: {
    title: "Battery receipt",
    detail: "Replacement date is two weeks early. Same lockbox number appears on volunteer records.",
    x: "28%",
    y: "58%",
  },
  lens: {
    title: "Lens smear",
    detail: "Oil smear runs upward, so the lamp was wiped after the beacon stopped.",
    x: "55%",
    y: "31%",
  },
  stair: {
    title: "Blocked stair",
    detail: "Scrapes on the service stair match Malik's old brass key, not a forced entry tool.",
    x: "73%",
    y: "68%",
  },
  mud: {
    title: "Low-tide mud",
    detail: "Nora's boot print sits on a shelf exposed only before 11:20 p.m.",
    x: "24%",
    y: "66%",
  },
  bell: {
    title: "Chapel bell echo",
    detail: "Two bells on the dispatch tape place the caller east of the marina.",
    x: "62%",
    y: "24%",
  },
  rope: {
    title: "Fresh rope fibers",
    detail: "Fibers on Pier 3 match the ferry stern line, cut with a clean blade.",
    x: "78%",
    y: "60%",
  },
  logbook: {
    title: "Rewritten logbook",
    detail: "Ink pressure changes on the 11:17 entry. The original time was scraped off.",
    x: "30%",
    y: "40%",
  },
  lockbox: {
    title: "Lockbox 14",
    detail: "Only three volunteers used this box: Nora, Malik, and the night archivist.",
    x: "50%",
    y: "64%",
  },
  map: {
    title: "Marked channel map",
    detail: "Red pencil route avoids the lighthouse beam and lines up with Ferry 6's last radar ping.",
    x: "74%",
    y: "35%",
  },
};

const defaultState = {
  scene: "lighthouse",
  foundEvidence: [],
  notes: "",
};

const elements = {
  clearNotesButton: document.querySelector("#clear-notes"),
  evidenceList: document.querySelector("#evidence-list"),
  foundCount: document.querySelector("#found-count"),
  navLinks: document.querySelectorAll(".nav a"),
  notesField: document.querySelector("#notes-field"),
  saveState: document.querySelector("#save-state"),
  sceneArt: document.querySelector(".scene-art"),
  sceneStage: document.querySelector("#scene-stage"),
  sceneTabs: document.querySelectorAll(".scene-tabs button"),
};

let state = loadState();
let saveTimer;

function loadState() {
  try {
    const storedState = JSON.parse(localStorage.getItem(storageKey));
    return { ...defaultState, ...storedState };
  } catch {
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  elements.saveState.textContent = "Notebook saved";
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    elements.saveState.textContent = "Notebook autosaves";
  }, 1600);
}

function render() {
  elements.notesField.value = state.notes;
  elements.foundCount.textContent = state.foundEvidence.length;
  renderScene();
  renderEvidenceLog();
}

function renderScene() {
  const scene = scenes[state.scene];
  elements.sceneStage.dataset.scene = state.scene;
  elements.sceneArt.setAttribute("aria-label", `${scene.label} investigation scene`);
  elements.sceneArt.replaceChildren();

  scene.evidence.forEach((id) => {
    const clue = evidence[id];
    const button = document.createElement("button");
    button.className = "hotspot";
    button.type = "button";
    button.dataset.evidence = id;
    button.style.setProperty("--x", clue.x);
    button.style.setProperty("--y", clue.y);
    button.textContent = clue.title;
    button.ariaPressed = state.foundEvidence.includes(id) ? "true" : "false";
    button.addEventListener("click", () => findEvidence(id));
    elements.sceneArt.append(button);
  });

  elements.sceneTabs.forEach((tab) => {
    tab.setAttribute("aria-selected", tab.dataset.scene === state.scene ? "true" : "false");
  });
}

function renderEvidenceLog() {
  elements.evidenceList.replaceChildren();

  if (state.foundEvidence.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No evidence found yet.";
    elements.evidenceList.append(empty);
    return;
  }

  state.foundEvidence.forEach((id) => {
    const clue = evidence[id];
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    title.textContent = clue.title;
    detail.textContent = clue.detail;
    item.append(title, detail);
    elements.evidenceList.append(item);
  });
}

function findEvidence(id) {
  if (!state.foundEvidence.includes(id)) {
    state = { ...state, foundEvidence: [...state.foundEvidence, id] };
    saveState();
  }
  render();
}

elements.sceneTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state = { ...state, scene: tab.dataset.scene };
    saveState();
    render();
  });
});

elements.notesField.addEventListener("input", () => {
  state = { ...state, notes: elements.notesField.value };
  saveState();
});

elements.clearNotesButton.addEventListener("click", () => {
  state = { ...state, notes: "" };
  saveState();
  render();
  elements.notesField.focus();
});

window.addEventListener("hashchange", updateCurrentNavLink);

function updateCurrentNavLink() {
  const currentHash = window.location.hash || "#case";
  elements.navLinks.forEach((link) => {
    link.setAttribute("aria-current", link.getAttribute("href") === currentHash ? "page" : "false");
  });
}

render();
updateCurrentNavLink();
