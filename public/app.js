const storageKey = "mill-creek-files-state";

const scenes = {
  cabin: {
    label: "Cabin",
    evidence: ["door", "shelf", "chimney"],
  },
  road: {
    label: "Road",
    evidence: ["truck", "lastHouse", "mud"],
  },
  town: {
    label: "Town",
    evidence: ["autopsy", "name", "burial"],
  },
};

const evidence = {
  door: {
    title: "Open door",
    detail: "Neighbors said Old Crow bolted everything, making the open cabin door hard to dismiss.",
    x: "60%",
    y: "48%",
  },
  shelf: {
    title: "Empty shelf",
    detail: "The carved trinkets he bartered with were missing from the cabin after his death.",
    x: "74%",
    y: "57%",
  },
  chimney: {
    title: "Cold chimney",
    detail: "The hunter found the chimney cold, suggesting Old Crow had been dead before discovery day.",
    x: "55%",
    y: "26%",
  },
  truck: {
    title: "Unknown truck",
    detail: "A neighbor saw an unfamiliar truck idling on the dirt road two nights running, then never again.",
    x: "32%",
    y: "62%",
  },
  lastHouse: {
    title: "Last house",
    detail: "Old Crow lived half a mile past the last house, outside the habits of ordinary town notice.",
    x: "48%",
    y: "42%",
  },
  mud: {
    title: "Muddy road",
    detail: "In rain, Mill Creek's single road turned to soup, limiting who could reach the cabin unseen.",
    x: "70%",
    y: "72%",
  },
  autopsy: {
    title: "No autopsy worth the name",
    detail: "The death was treated as old man, lived alone, these things happen.",
    x: "30%",
    y: "44%",
  },
  name: {
    title: "Forgotten name",
    detail: "Almost nobody remembered his real name, making official neglect easier.",
    x: "55%",
    y: "35%",
  },
  burial: {
    title: "Unmarked plot",
    detail: "Old Crow was buried in an unmarked plot, and Mill Creek moved on.",
    x: "76%",
    y: "57%",
  },
};

const defaultState = {
  scene: "cabin",
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
    empty.textContent = "No case details found yet.";
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
