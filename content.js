const replacement = "cocaine";
const capitalized = "Cocaine";

const pattern = /\b(?:["'“”])?(artificial[-\s]?intelligence|a\.i\.|ai)(?:["'“”])?\b(?=[\s\-.,;:!?/)]|$)/gi;
const brandPattern = /\bOpenAI\b/g;

function isURL(text, index) {
  const slice = text.slice(Math.max(0, index - 20), index + 20);
  return /(https?:\/\/|www\.|\.com|\/[a-z])/i.test(slice);
}

function isSentenceStart(text, index) {
  for (let i = index - 1; i >= 0; i--) {
    const char = text[i];
    if (".!?".includes(char) || char === "\n") return true;
    if (char.trim()) return false;
  }
  return true;
}

function replaceText(text) {
  text = text.replace(brandPattern, "OpenCocaine")

  text = text.replace(pattern, (match, _group, offset, fullText) => {
    const isStart = isSentenceStart(fullText, offset)
    const after = fullText.slice(offset + match.length)
    const afterMatch = after.match(/^\s+([A-Z][a-z]+)/)
    const nextIsCapitalized = !!afterMatch

    return (!isURL(fullText, offset) && (isStart || nextIsCapitalized)) ? capitalized : replacement
  })

  text = text.replace(/\b(an)\s+(cocaine)\b/gi, (match, article, word) => {
    const isCapitalized = article[0] === "A";
    return (isCapitalized ? "A" : "a") + " " + word;
  });

  return text
}

function fixLinks(node) {
  if (node.nodeName === "A" && node.href && node.href.startsWith("http")) {
    node.href = node.href
      .replace(/\.(ai)\b/gi, ".cocaine")
      .replace(/\b(artificial[\-_]?intelligence|a\.i\.|ai)\b/gi, replacement);
  }
}

function walk(node) {
  if (
    node.nodeType === Node.TEXT_NODE &&
    node.parentNode &&
    !["SCRIPT", "STYLE"].includes(node.parentNode.nodeName)
  ) {
    node.textContent = replaceText(node.textContent);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    fixLinks(node);
    if (node.shadowRoot) walk(node.shadowRoot);
    for (let child of node.childNodes) walk(child);
  }
}

walk(document.body);

const observer = new MutationObserver(mutations => {
  for (let m of mutations) {
    for (let node of m.addedNodes) {
      if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
        walk(node);
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});

const reapply = () => walk(document.body);
document.addEventListener("mousemove", reapply);
document.addEventListener("scroll", reapply);
document.addEventListener("focusin", reapply);