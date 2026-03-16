import { initSharedExperience } from "../main.js";
import { agentData, implementationSteps, kpiData, marketPills } from "../data.js";
import { initAgentsPanels } from "../ui/agents.js";

const METRICS_TICKER_LOOPS = 4;

function renderTicker() {
  const track = document.querySelector("[data-metrics-track]");
  if (!track) return;

  track.replaceChildren();
  const repeatedKpis = [];
  for (let loop = 0; loop < METRICS_TICKER_LOOPS; loop += 1) {
    repeatedKpis.push(...kpiData);
  }

  const createLoop = () => {
    const loop = document.createElement("div");
    loop.className = "metrics-loop";

    repeatedKpis.forEach((item, index) => {
      const node = document.createElement("div");
      node.className = "metrics-item";
      node.innerHTML = `<strong>${item.value}</strong><span>${item.label}</span>`;
      loop.append(node);

      if (index < repeatedKpis.length - 1) {
        const dot = document.createElement("span");
        dot.className = "metrics-dot";
        dot.setAttribute("aria-hidden", "true");
        loop.append(dot);
      }
    });

    return loop;
  };

  track.append(createLoop(), createLoop());
}

function renderKpis() {
  const container = document.querySelector("[data-kpi-grid]");
  if (!container) return;

  kpiData.forEach((item) => {
    const card = document.createElement("article");
    card.className = "stat-card reveal";
    card.innerHTML = `
      <p class="value">${item.value}</p>
      <h3>${item.label}</h3>
      <p>${item.description}</p>
    `;
    container.append(card);
  });
}

function renderSteps() {
  const container = document.querySelector("[data-steps-grid]");
  if (!container) return;

  implementationSteps.forEach((step, index) => {
    const card = document.createElement("article");
    card.className = "step-card reveal";
    card.innerHTML = `
      <div class="step-bar"></div>
      <p class="index">0${index + 1}</p>
      <h3>${step.title}</h3>
      <p>${step.description}</p>
    `;
    container.append(card);
  });
}

function renderMarkets() {
  const container = document.querySelector("[data-market-pills]");
  if (!container) return;

  marketPills.forEach((label) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = label;
    container.append(pill);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTicker();
  renderKpis();
  renderSteps();
  renderMarkets();
  initAgentsPanels({
    stageElement: document.querySelector("[data-agents-stage]"),
    agents: agentData
  });
  initSharedExperience();
});
