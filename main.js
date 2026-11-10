(function () {
  const ID = "mrjeffagency.sideterminal";
  const ICON = "side-term-icon";
  let session = null;      // Executor uuid
  let useAlpine = true;
  let els = {};
  let history = [], hIdx = 0;
  let styleEl = null;

  const css = `
  .${ICON}::before{content:">_";font-family:monospace;font-weight:bold;font-size:15px;display:flex;align-items:center;justify-content:center;height:100%}
  .st-wrap{display:flex;flex-direction:column;height:100%;width:100%;background:var(--primary-color);color:var(--primary-text-color)}
  .st-bar{display:flex;gap:6px;padding:6px;border-bottom:1px solid var(--border-color,#8885)}
  .st-bar button{flex:1;padding:6px;border:0;border-radius:4px;background:var(--secondary-color);color:var(--secondary-text-color);font-size:12px}
  .st-out{flex:1;overflow:auto;margin:0;padding:8px;font:12px/1.4 monospace;white-space:pre-wrap;word-break:break-all;user-select:text;-webkit-user-select:text}
  .st-err{color:#ff6b6b}.st-cmd{color:#7ee787}.st-sys{opacity:.6}
  .st-in{display:flex;border-top:1px solid var(--border-color,#8885)}
  .st-in input{flex:1;min-width:0;padding:10px;border:0;outline:0;background:transparent;color:inherit;font:13px monospace}
  .st-in button{border:0;padding:0 12px;background:var(--secondary-color);color:var(--secondary-text-color)}
  `;

  function getExecutor() {
    try { if (window.Executor) return window.Executor; } catch (e) {}
    try { return acode.require("Executor"); } catch (e) {}
    try { return cordova.plugins.Executor; } catch (e) {}
    return null;
  }

  function print(text, cls) {
    if (!els.out) return;
    const s = document.createElement("span");
    if (cls) s.className = cls;
    s.textContent = text;
    els.out.appendChild(s);
    if (els.out.childNodes.length > 3000) els.out.removeChild(els.out.firstChild);
    els.out.scrollTop = els.out.scrollHeight;
  }

  function startSession() {
    const ex = getExecutor();
    if (!ex) { print("Executor not available in this Acode version.\n", "st-err"); return; }
    stopSession();
    print(`[${useAlpine ? "Alpine" : "Android"} shell started]\n`, "st-sys");
    const cb = (type, data) => {
      if (type === "stdout") print(data);
      else if (type === "stderr") print(data, "st-err");
      else if (type === "exit") { print(`\n[session ended: ${data}]\n`, "st-sys"); session = null; }
    };
    const cmd = useAlpine ? "sh" : "sh";
    // start(command, onData, alpine)
    ex.start(cmd, cb, useAlpine).then((uuid) => {
      session = uuid;
      send("export PS1='$ '; cd \"$HOME\" 2>/dev/null; pwd");
    }).catch((e) => print("Failed to start: " + e + "\n", "st-err"));
  }

  function stopSession() {
    const ex = getExecutor();
    if (ex && session) { try { ex.stop(session); } catch (e) {} }
    session = null;
  }

  function send(line) {
    const ex = getExecutor();
    if (!ex || !session) { print("No session. Tap Restart.\n", "st-err"); return; }
    ex.write(session, line + "\n").catch(() => {});
  }

  function submit() {
    const v = els.input.value;
    els.input.value = "";
    if (!v.trim()) return;
    history.push(v); hIdx = history.length;
    print("$ " + v + "\n", "st-cmd");
    if (v.trim() === "clear") { els.out.textContent = ""; return; }
    send(v);
  }

  function build(container) {
    container.classList.add("st-wrap");
    container.innerHTML = `
      <div class="st-bar">
        <button data-a="restart">Restart</button>
        <button data-a="shell">Shell: Alpine</button>
        <button data-a="clear">Clear</button>
        <button data-a="int">^C</button>
      </div>
      <pre class="st-out"></pre>
      <div class="st-in"><input placeholder="command" autocapitalize="off" autocomplete="off" spellcheck="false"><button data-a="run">&#9654;</button></div>`;
    els.out = container.querySelector(".st-out");
    els.input = container.querySelector("input");
    els.shellBtn = container.querySelector('[data-a="shell"]');
    container.addEventListener("click", (e) => {
      const a = e.target.dataset && e.target.dataset.a;
      if (a === "restart") { startSession(); }
      else if (a === "clear") { els.out.textContent = ""; }
      else if (a === "run") { submit(); els.input.focus(); }
      else if (a === "int") {
        const ex = getExecutor();
        if (ex && session) { try { ex.stop(session); } catch (e) {} session = null; print("^C\n", "st-sys"); startSession(); }
      } else if (a === "shell") {
        useAlpine = !useAlpine;
        els.shellBtn.textContent = "Shell: " + (useAlpine ? "Alpine" : "Android");
        startSession();
      }
    });
    els.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); submit(); }
      else if (e.key === "ArrowUp" && history.length) { hIdx = Math.max(0, hIdx - 1); els.input.value = history[hIdx] || ""; e.preventDefault(); }
      else if (e.key === "ArrowDown" && history.length) { hIdx = Math.min(history.length, hIdx + 1); els.input.value = history[hIdx] || ""; e.preventDefault(); }
    });
  }

  if (window.acode) {
    acode.setPluginInit(ID, async () => {
      styleEl = document.createElement("style");
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
      const sidebarApps = acode.require("sidebarApps");
      let started = false;
      sidebarApps.add(ICON, ID, "Terminal", (container) => { build(container); },
        false,
        () => { if (!started) { started = true; startSession(); } if (els.input) els.input.focus(); });
    });
    acode.setPluginUnmount(ID, () => {
      stopSession();
      try { acode.require("sidebarApps").remove(ID); } catch (e) {}
      if (styleEl) styleEl.remove();
    });
  }
})();
