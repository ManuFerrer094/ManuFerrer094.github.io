const colorMap = {};

const generateColorFromHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const normalized = Math.abs((hash % 100) / 100);
  const colors = ['2F4F4F', '556B2F', '708090', '778899', 'A9A9A9'];
  const colorIndex = Math.floor(normalized * colors.length);
  return colors[colorIndex];
};

export const generateShieldURL = (technology) => {
  if (!colorMap[technology]) {
    colorMap[technology] = generateColorFromHash(technology);
  }
  const badgeStyle = 'for-the-badge';
  const logoColor = 'fff';
  const logo = technology.toLowerCase();
  return `https://img.shields.io/badge/${technology}-informational?style=${badgeStyle}&logo=${logo}&logoColor=${logoColor}&color=${colorMap[technology]}`;
};

export const updateElementContent = (selector, content) => {
  document.querySelector(selector).textContent = content;
};

export const updateLinkHref = (selector, href) => {
  document.querySelector(selector).href = href;
};

export const updateElementHTML = (selector, html) => {
  document.querySelector(selector).innerHTML = html;
};

export const updateStack = (sectionId, stack) => {
  const stackContainer = document.querySelector(`#${sectionId} .about-stack`);
  const uniqueStack = Array.from(new Set(stack));
  stackContainer.innerHTML = uniqueStack.map(tech => `<img src="${generateShieldURL(tech)}" alt="${tech}">`).join('');
};

export const updateBackgroundImage = (sectionId, imageUrl) => {
  const section = document.getElementById(sectionId);
  section.style.backgroundImage = `url('${imageUrl}')`;
};
