(function () {
  const script = document.currentScript;

  if (script) {
    try {
      const scriptUrl = new URL(script.src);
      window._myScriptBingGoogle = scriptUrl.origin;
    } catch (e) {
      window._myScriptBingGoogle = 'INVALID_URL';
    }
  }
})();
