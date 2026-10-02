self.addEventListener('message', (event) => {
  const { pattern, flags, text, maxMatches } = event.data;

  try {
    const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    const matches = [];
    let truncated = false;

    for (const match of text.matchAll(regex)) {
      if (matches.length >= maxMatches) {
        truncated = true;
        break;
      }
      matches.push({ full: match[0], groups: match.slice(1) });
    }

    self.postMessage({ matches, truncated });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
});
