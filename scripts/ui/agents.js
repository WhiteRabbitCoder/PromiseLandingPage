const PANEL_CLASSES = ["a1", "a2", "a3"];

function createWaveform() {
  const wrap = document.createElement("div");
  wrap.className = "waveform";
  const heights = [18, 28, 50, 65, 82, 95, 105, 95, 78, 62, 45, 58, 72, 86, 70, 52, 38, 52, 68, 82, 66, 46, 32, 48, 60];
  heights.forEach((h, i) => {
    const bar = document.createElement("div");
    bar.className = "wbar";
    bar.style.height = h + "px";
    bar.style.setProperty("--d", (1 + (i % 5) * 0.18) + "s");
    bar.style.animationDelay = (i * 0.06) + "s";
    wrap.append(bar);
  });
  return wrap;
}

function createDotGrid() {
  const wrap = document.createElement("div");
  wrap.className = "dotgrid";
  for (let i = 0; i < 80; i++) {
    wrap.append(document.createElement("span"));
  }
  return wrap;
}

function createStripes() {
  const wrap = document.createElement("div");
  wrap.className = "stripes";
  return wrap;
}

function createChatBubbles() {
  const wrap = document.createElement("div");
  wrap.className = "chat-bubbles";
  for (let i = 0; i < 4; i++) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    wrap.append(bubble);
  }
  return wrap;
}

function createPanel(agent, index) {
  const panel = document.createElement("div");
  panel.className = `a-panel ${PANEL_CLASSES[index]}`;

  // Accent line
  const accent = document.createElement("div");
  accent.className = "a-accent";
  panel.append(accent);

  // Ghost letter
  const ghost = document.createElement("span");
  ghost.className = "a-ghost";
  ghost.textContent = agent.name.charAt(0);
  panel.append(ghost);

  // Decorative elements
  if (index === 0) panel.append(createWaveform());
  if (index === 1) panel.append(createDotGrid());
  if (index === 2) {
    panel.append(createStripes());
    panel.append(createChatBubbles());
  }

  // Content
  const content = document.createElement("div");
  content.className = "a-content";

  content.innerHTML = `
    <div class="a-index">${agent.index} · ${agent.channel}</div>
    <h3 class="a-name">${agent.nameHtml}</h3>
    <p class="a-type">${agent.role}</p>
    <p class="a-desc">${agent.description}</p>
  `;

  panel.append(content);
  return panel;
}

export function initAgentsPanels({ stageElement, agents }) {
  if (!stageElement || !agents?.length) return;

  const panels = [];
  agents.forEach((agent, index) => {
    const panel = createPanel(agent, index);
    stageElement.append(panel);
    panels.push(panel);
  });

  // Hover interaction: expand hovered panel, shrink others
  panels.forEach((panel) => {
    panel.addEventListener("mouseenter", () => {
      stageElement.classList.add("hovering");
      panels.forEach((p) => p.classList.remove("expanded"));
      panel.classList.add("expanded");
    });
  });

  stageElement.addEventListener("mouseleave", () => {
    stageElement.classList.remove("hovering");
    panels.forEach((p) => p.classList.remove("expanded"));
  });
}
