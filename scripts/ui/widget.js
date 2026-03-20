import { Conversation } from "@elevenlabs/client";

const MAX_MESSAGES = 10;

/* ════════════════════════════════════════
   BARS VISUALIZER
   Drives the 5 voice-bar elements via Web Audio API.
   Intercepts RTCPeerConnection to tap the remote audio
   stream from ElevenLabs WebRTC.
   Falls back to a per-bar simulated envelope.
════════════════════════════════════════ */
function createBarsVisualizer(barEls) {
  let rafId      = null;
  let speaking   = false;
  let audioCtx   = null, analyser = null, dataArray = null, connected = false;
  let observer   = null;
  let restoreRTC = null;

  try {
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.70;
    dataArray = new Uint8Array(analyser.frequencyBinCount); // 64 bins
    audioCtx.resume().catch(() => {});

    /* ── Intercept RTCPeerConnection to capture remote audio ── */
    const OrigRTCPC = window.RTCPeerConnection;
    window.RTCPeerConnection = function (...args) {
      const pc = new OrigRTCPC(...args);
      pc.addEventListener("track", (e) => {
        if (e.track.kind === "audio" && e.streams[0] && !connected) {
          try {
            audioCtx.createMediaStreamSource(e.streams[0]).connect(analyser);
            /* Do NOT connect analyser→destination: WebRTC handles playback */
            connected = true;
            audioCtx.resume().catch(() => {});
          } catch (_) {}
        }
      });
      return pc;
    };
    window.RTCPeerConnection.prototype = OrigRTCPC.prototype;
    restoreRTC = () => { window.RTCPeerConnection = OrigRTCPC; };

    /* ── Fallback: also watch for <audio> elements ── */
    const tryConnectEl = () => {
      if (connected) return;
      for (const el of document.querySelectorAll("audio")) {
        if (el._bvDone) continue;
        try {
          audioCtx.createMediaElementSource(el).connect(analyser);
          analyser.connect(audioCtx.destination);
          el._bvDone = true;
          connected  = true;
          break;
        } catch (_) { el._bvDone = true; }
      }
    };
    observer = new MutationObserver(tryConnectEl);
    observer.observe(document.body, { childList: true, subtree: true });
    tryConnectEl();
  } catch (_) { /* AudioContext unavailable */ }

  const n = barEls.length;

  function draw() {
    rafId = requestAnimationFrame(draw);

    let levels;

    if (analyser && connected) {
      analyser.getByteFrequencyData(dataArray);
      /* Map voice-range bins (1-15) to the 5 bars, 3 bins each */
      const START = 1, BINS_PER_BAR = 3;
      levels = Array.from({ length: n }, (_, i) => {
        let s = 0;
        for (let j = START + i * BINS_PER_BAR; j < START + (i + 1) * BINS_PER_BAR; j++) {
          s += dataArray[j] || 0;
        }
        return (s / BINS_PER_BAR) / 255;
      });
    } else {
      /* Simulated multi-frequency envelope */
      const t = performance.now() / 1000;
      const freqs = [6.1, 9.4, 13.7, 9.8, 6.5]; // different rate per bar
      levels = freqs.map((f, i) => {
        if (!speaking) return 0.04 + 0.03 * Math.sin(t * 1.2 + i);
        const env  = 0.38 + 0.22 * Math.sin(t * 2.3 + i * 0.9);
        const harm = 0.20 * Math.sin(t * f)  + 0.10 * Math.sin(t * f * 1.6);
        const noise = 0.06 * (Math.random() - 0.5);
        return Math.max(0.05, Math.min(1, env + harm + noise));
      });
    }

    barEls.forEach((bar, i) => {
      /* Exaggerated: scale range 0.12 → 3.5 */
      const scale = 0.12 + levels[i] * 3.38;
      bar.style.transform = `scaleY(${scale.toFixed(3)})`;
      bar.style.opacity   = (0.35 + levels[i] * 0.65).toFixed(3);
    });
  }

  return {
    setSpeaking(val) { speaking = Boolean(val); },

    start() {
      if (rafId) return;
      /* Disable CSS keyframe animations — JS takes over */
      barEls.forEach(b => { b.style.animation = "none"; });
      draw();
    },

    stop() {
      if (rafId)      { cancelAnimationFrame(rafId); rafId = null; }
      if (observer)   { observer.disconnect(); observer = null; }
      if (restoreRTC) { restoreRTC(); restoreRTC = null; }
      if (audioCtx)   { audioCtx.close().catch(() => {}); audioCtx = null; }
      analyser  = null;
      dataArray = null;
      connected = false;
      /* Restore CSS animations */
      barEls.forEach(b => {
        b.style.animation = "";
        b.style.transform = "";
        b.style.opacity   = "";
      });
    }
  };
}

function normalizeConfig(userConfig = {}) {
  const envAgentId =
    import.meta.env.VITE_ELEVENLABS_AGENT_ID || import.meta.env.VITE_AGENT_ID || "";
  return {
    agentId: userConfig.agentId || envAgentId,
    title:   userConfig.title   || "Promi, agente asesor",
    logoSrc: userConfig.logoSrc || "./assets/brand/ISOLOGO-CLARO.png"
  };
}

export function initPromiseVoiceWidget(userConfig = {}) {
  if (document.querySelector("[data-promise-widget-root]")) return;

  const config = normalizeConfig(userConfig);

  /* ── Root ── */
  const root = document.createElement("aside");
  root.className = "promise-widget";
  root.dataset.promiseWidgetRoot = "true";
  root.dataset.widgetMode = "text";

  /* ── Panel ── */
  const panel = document.createElement("div");
  panel.className = "widget-panel";

  /* ── Header ── */
  const head = document.createElement("header");
  head.className = "widget-head";

  const headLogo = document.createElement("img");
  headLogo.className = "widget-head-logo";
  headLogo.src = config.logoSrc;
  headLogo.alt = "Promi";

  const headInfo = document.createElement("div");
  headInfo.className = "widget-head-info";

  const titleEl = document.createElement("strong");
  titleEl.className = "widget-title";
  titleEl.textContent = config.title;

  const statusEl = document.createElement("span");
  statusEl.className = "widget-status";
  statusEl.textContent = "Elige un modo para comenzar";

  headInfo.append(titleEl, statusEl);

  const closeBtn = document.createElement("button");
  closeBtn.className = "widget-close-btn";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Cerrar asistente");
  closeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

  head.append(headLogo, headInfo, closeBtn);

  /* ── Tabs ── */
  const tabs = document.createElement("div");
  tabs.className = "widget-tabs";

  const textTab = document.createElement("button");
  textTab.type = "button";
  textTab.className = "widget-tab active";
  textTab.dataset.mode = "text";
  textTab.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Texto`;

  const voiceTab = document.createElement("button");
  voiceTab.type = "button";
  voiceTab.className = "widget-tab";
  voiceTab.dataset.mode = "voice";
  voiceTab.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Voz`;

  tabs.append(textTab, voiceTab);

  /* ════════════════════════════════════════
     TEXT PANE
  ════════════════════════════════════════ */
  const textPane = document.createElement("div");
  textPane.className = "widget-pane widget-pane--text";

  const chat = document.createElement("div");
  chat.className = "widget-chat";
  chat.setAttribute("aria-live", "polite");

  const chatPlaceholder = document.createElement("div");
  chatPlaceholder.className = "widget-chat-placeholder";
  chatPlaceholder.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <p>Inicia la conversación para chatear con Promi</p>`;
  chat.append(chatPlaceholder);

  const textFoot = document.createElement("div");
  textFoot.className = "widget-text-foot";

  const btnStartText = document.createElement("button");
  btnStartText.type = "button";
  btnStartText.className = "widget-primary-btn";
  btnStartText.textContent = "Iniciar chat";

  const textForm = document.createElement("form");
  textForm.className = "widget-form";
  textForm.hidden = true;

  const textInput = document.createElement("input");
  textInput.className = "widget-input";
  textInput.type = "text";
  textInput.name = "widgetPrompt";
  textInput.placeholder = "Escribe tu mensaje...";
  textInput.autocomplete = "off";

  const sendBtn = document.createElement("button");
  sendBtn.type = "submit";
  sendBtn.className = "widget-send-btn";
  sendBtn.setAttribute("aria-label", "Enviar mensaje");
  sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  textForm.append(textInput, sendBtn);

  const btnStopText = document.createElement("button");
  btnStopText.type = "button";
  btnStopText.className = "widget-stop-btn";
  btnStopText.textContent = "Detener";
  btnStopText.hidden = true;

  textFoot.append(btnStartText, textForm, btnStopText);
  textPane.append(chat, textFoot);

  /* ════════════════════════════════════════
     VOICE PANE
  ════════════════════════════════════════ */
  const voicePane = document.createElement("div");
  voicePane.className = "widget-pane widget-pane--voice";
  voicePane.hidden = true;

  const voiceStage = document.createElement("div");
  voiceStage.className = "widget-voice-stage";
  voiceStage.setAttribute("aria-hidden", "true");

  const voiceBars = document.createElement("div");
  voiceBars.className = "voice-bars";
  for (let i = 0; i < 5; i++) {
    const bar = document.createElement("span");
    bar.className = "voice-bar";
    voiceBars.append(bar);
  }

  voiceStage.append(voiceBars);

  const voiceFoot = document.createElement("div");
  voiceFoot.className = "widget-voice-foot";

  const btnStartVoice = document.createElement("button");
  btnStartVoice.type = "button";
  btnStartVoice.className = "widget-primary-btn";
  btnStartVoice.textContent = "Iniciar conversación de voz";

  const voiceActiveControls = document.createElement("div");
  voiceActiveControls.className = "widget-voice-active-controls";
  voiceActiveControls.hidden = true;

  const btnMic = document.createElement("button");
  btnMic.type = "button";
  btnMic.className = "widget-action-btn";
  btnMic.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 10v2a7 7 0 01-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Silenciar`;

  const btnStopVoice = document.createElement("button");
  btnStopVoice.type = "button";
  btnStopVoice.className = "widget-action-btn widget-action-btn--danger";
  btnStopVoice.textContent = "Detener";

  voiceActiveControls.append(btnMic, btnStopVoice);
  voiceFoot.append(btnStartVoice, voiceActiveControls);
  voicePane.append(voiceStage, voiceFoot);

  /* ── Assemble panel ── */
  panel.append(head, tabs, textPane, voicePane);

  /* ════════════════════════════════════════
     LAUNCHER BUBBLE
  ════════════════════════════════════════ */
  const launcher = document.createElement("div");
  launcher.className = "widget-launcher";

  const launcherBadge = document.createElement("div");
  launcherBadge.className = "widget-launcher-badge";
  launcherBadge.textContent = "Habla con Promi";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "widget-toggle";
  toggleBtn.type = "button";
  toggleBtn.setAttribute("aria-label", "Abrir asistente Promi");
  toggleBtn.innerHTML = `
    <span class="toggle-ring toggle-ring-1"></span>
    <span class="toggle-ring toggle-ring-2"></span>
    <span class="toggle-ring toggle-ring-3"></span>
    <img src="${config.logoSrc}" alt="Promi" class="toggle-logo" />`;

  launcher.append(launcherBadge, toggleBtn);

  root.append(panel, launcher);
  document.body.append(root);

  /* ════════════════════════════════════════
     STATE
  ════════════════════════════════════════ */
  let conversation  = null;
  let selectedMode  = "text";
  let micMuted      = false;
  let userMsgCount  = 0;
  let limitReached  = false;
  let visualizer    = null;

  /* ── Helpers ── */
  const openWidget  = () => root.classList.add("open");
  const closeWidget = () => root.classList.remove("open");

  function setStatus(text) { statusEl.textContent = text; }

  function addChatMessage(message, author = "bot") {
    if (!message) return;
    const ph = chat.querySelector(".widget-chat-placeholder");
    if (ph) ph.remove();
    const item = document.createElement("p");
    item.className = `widget-msg ${author}`;
    item.textContent = String(message);
    chat.append(item);
    chat.scrollTop = chat.scrollHeight;
  }

  function enterConnectedTextUi() {
    btnStartText.hidden  = true;
    textForm.hidden      = false;
    btnStopText.hidden   = false;
    textInput.disabled   = false;
    sendBtn.disabled     = false;
    textInput.focus();
  }

  function enterConnectedVoiceUi() {
    btnStartVoice.hidden         = true;
    voiceActiveControls.hidden   = false;
  }

  function resetTextUi() {
    btnStartText.hidden  = false;
    btnStartText.disabled = false;
    textForm.hidden      = true;
    btnStopText.hidden   = true;
  }

  function resetVoiceUi() {
    btnStartVoice.hidden         = false;
    btnStartVoice.disabled       = false;
    voiceActiveControls.hidden   = true;
    root.classList.remove("agent-speaking");
    root.classList.remove("voice-listening");
    micMuted = false;
    btnMic.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 10v2a7 7 0 01-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Silenciar`;
    if (visualizer) { visualizer.stop(); visualizer = null; }
  }

  function syncMode() {
    root.dataset.widgetMode = selectedMode;
    textTab.classList.toggle("active",  selectedMode === "text");
    voiceTab.classList.toggle("active", selectedMode === "voice");
    textPane.hidden  = selectedMode !== "text";
    voicePane.hidden = selectedMode !== "voice";
  }

  function resetAll() {
    conversation = null;
    userMsgCount = 0;
    limitReached = false;
    resetTextUi();
    resetVoiceUi();
    setStatus("Elige un modo para comenzar");
  }

  /* ════════════════════════════════════════
     LIMIT REACHED
  ════════════════════════════════════════ */
  async function handleLimitReached() {
    if (limitReached) return;
    limitReached = true;

    addChatMessage("Has llegado al límite de la demo (10 mensajes). ¡Gracias por probar Promi!", "bot");
    textInput.disabled = true;
    sendBtn.disabled   = true;
    setStatus("Demo finalizada");

    await new Promise(r => setTimeout(r, 2800));
    if (conversation) {
      try { await conversation.endSession(); } catch (_) {}
    }
    conversation = null;
    resetAll();
    await new Promise(r => setTimeout(r, 600));
    closeWidget();
  }

  /* ════════════════════════════════════════
     START / STOP
  ════════════════════════════════════════ */
  async function startConversation(mode) {
    if (!config.agentId) {
      alert("No se encontró AGENT_ID. Configura VITE_ELEVENLABS_AGENT_ID.");
      return;
    }

    if (mode === "text") btnStartText.disabled  = true;
    else                 btnStartVoice.disabled = true;

    setStatus(mode === "voice" ? "Conectando en modo voz..." : "Conectando en modo texto...");

    if (mode === "voice") {
      visualizer = createBarsVisualizer(Array.from(voiceBars.children));
      visualizer.start();
    }

    try {
      if (mode === "voice") {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      conversation = await Conversation.startSession({
        agentId:        config.agentId,
        connectionType: mode === "voice" ? "webrtc" : "websocket",
        ...(mode === "text" ? { textOnly: true } : {}),

        onConnect: () => {
          setStatus(mode === "voice" ? "Conectada · en voz" : "Conectada · escríbeme");
          if (mode === "text") {
            enterConnectedTextUi();
          } else {
            enterConnectedVoiceUi();
          }
        },

        onDisconnect: () => {
          conversation = null;
          if (!limitReached) {
            if (mode === "text") resetTextUi();
            else                 resetVoiceUi();
            setStatus("Desconectado");
          }
        },

        onModeChange: (modePayload) => {
          if (mode !== "voice") return;
          const val = modePayload?.mode || String(modePayload);
          if (val === "speaking") {
            root.classList.add("agent-speaking");
            root.classList.remove("voice-listening");
            visualizer?.setSpeaking(true);
          } else if (val === "listening") {
            root.classList.remove("agent-speaking");
            root.classList.add("voice-listening");
            visualizer?.setSpeaking(false);
          } else {
            root.classList.remove("agent-speaking");
            root.classList.remove("voice-listening");
            visualizer?.setSpeaking(false);
          }
        },

        onMessage: (payload) => {
          if (mode !== "text") return;
          const source = payload?.source === "user" ? "user" : "bot";
          addChatMessage(payload?.message, source);
        },

        onError: (error) => {
          setStatus("Error en la conversación");
          alert(`Error: ${error?.message || String(error)}`);
        }
      });
    } catch (error) {
      conversation = null;
      if (mode === "text") resetTextUi();
      else                 resetVoiceUi();
      alert(`No se pudo iniciar: ${error?.message || String(error)}`);
    }
  }

  async function stopConversation() {
    try {
      if (conversation) await conversation.endSession();
    } catch (_) {}
    resetAll();
  }

  /* ════════════════════════════════════════
     MODE SWITCH
  ════════════════════════════════════════ */
  async function changeMode(nextMode) {
    if (selectedMode === nextMode) return;
    if (conversation) await stopConversation();
    selectedMode = nextMode;
    syncMode();
    setStatus("Elige un modo para comenzar");
  }

  /* ════════════════════════════════════════
     EVENT LISTENERS
  ════════════════════════════════════════ */
  toggleBtn.addEventListener("click", () => root.classList.toggle("open"));
  closeBtn.addEventListener("click", closeWidget);

  /* ── Logo follows cursor — page-wide with rAF lerp ── */
  const toggleLogo = toggleBtn.querySelector(".toggle-logo");
  let lgTgtX = 0, lgTgtY = 0, lgCurX = 0, lgCurY = 0;
  const MAX = 8;

  window.addEventListener("mousemove", (e) => {
    const r  = toggleBtn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    const d  = Math.hypot(dx, dy) || 1;
    lgTgtX = (dx / d) * MAX;
    lgTgtY = (dy / d) * MAX;
  });

  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma === null || e.beta === null) return;
    // Map tilt angles (gamma ~ x-axis, beta ~ y-axis)
    // Standard phone tilt: resting state can vary, but let's clamp loosely at 45 degrees
    const g = Math.max(-45, Math.min(45, e.gamma));
    // For beta (pitch), normal resting is usually ~ 45deg up, but we'll use a relative baseline or just simple mapping
    const b = Math.max(-45, Math.min(45, e.beta - 45)); // Assumes holding phone at 45 degree angle

    lgTgtX = (g / 45) * MAX;
    lgTgtY = (b / 45) * MAX;
  });

  (function animateLogo() {
    lgCurX += (lgTgtX - lgCurX) * 0.1;
    lgCurY += (lgTgtY - lgCurY) * 0.1;
    toggleLogo.style.transform = `translate(${lgCurX.toFixed(2)}px, ${lgCurY.toFixed(2)}px)`;
    requestAnimationFrame(animateLogo);
  })();

  tabs.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-mode]");
    if (btn) {
      if (btn.dataset.mode === "voice") {
        let overlayMsg = panel.querySelector(".voice-demo-msg");
        if (!overlayMsg) {
          overlayMsg = document.createElement("div");
          overlayMsg.className = "voice-demo-msg";
          overlayMsg.textContent = "Después de nuestra demo, podrás hablar con Promi";
          Object.assign(overlayMsg.style, {
            position: "absolute",
            top: "5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-surface, #fff)",
            color: "var(--color-text, #000)",
            border: "1px solid var(--color-outline, #ddd)",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 999,
            textAlign: "center",
            width: "max-content",
            maxWidth: "90%",
            opacity: "0",
            transition: "opacity 0.3s ease"
          });
          panel.appendChild(overlayMsg);
          // force reflow
          void overlayMsg.offsetWidth;
        }
        overlayMsg.style.opacity = "1";
        clearTimeout(overlayMsg.hideTimeout);
        overlayMsg.hideTimeout = setTimeout(() => {
          overlayMsg.style.opacity = "0";
        }, 3000);
        return;
      }
      await changeMode(btn.dataset.mode);
    }
  });

  btnStartText.addEventListener("click",  () => startConversation("text"));
  btnStopText.addEventListener("click",   stopConversation);
  btnStartVoice.addEventListener("click", () => startConversation("voice"));
  btnStopVoice.addEventListener("click",  stopConversation);

  btnMic.addEventListener("click", () => {
    if (!conversation?.setMicMuted) return;
    micMuted = !micMuted;
    conversation.setMicMuted(micMuted);
    btnMic.innerHTML = micMuted
      ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Activar mic`
      : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 10v2a7 7 0 01-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Silenciar`;
  });

  textInput.addEventListener("input", () => {
    if (conversation?.sendUserActivity) conversation.sendUserActivity();
  });

  textForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (limitReached) return;
    const text = textInput.value.trim();
    if (!text || !conversation?.sendUserMessage) return;

    userMsgCount++;
    addChatMessage(text, "user");
    conversation.sendUserMessage(text);
    textInput.value = "";

    if (userMsgCount >= MAX_MESSAGES) {
      await handleLimitReached();
    }
  });

  /* ── Init ── */
  syncMode();

  window.addEventListener("beforeunload", () => {
    if (conversation?.endSession) conversation.endSession().catch(() => {});
  });
}

window.initPromiseVoiceWidget = initPromiseVoiceWidget;
