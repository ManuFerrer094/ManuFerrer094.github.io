export const updateElementContent = (selector, content) => {
document.querySelector(selector).textContent = content;
};

export const updateLinkHref = (selector, href) => {
document.querySelector(selector).href = href;
};

export const updateElementHTML = (selector, html) => {
document.querySelector(selector).innerHTML = html;
};

export const generateRandomColor = () => {
const colors = ['brightgreen', 'green', 'yellowgreen', 'yellow', 'orange', 'red', 'blue', 'lightgrey'];
const randomIndex = Math.floor(Math.random() * colors.length);
return colors.splice(randomIndex, 1)[0];
};

export const generateShieldURL = (technology) => {
const randomColor = generateRandomColor();
return `https://img.shields.io/badge/${technology}-informational?style=for-the-badge&logo=${technology}&logoColor=white&color=${randomColor}`;
};      

export const updateStack = (sectionId, stack) => {
const stackContainer = document.querySelector(`#${sectionId} .about-stack`);
const uniqueStack = Array.from(new Set(stack)); // Remove duplicate technologies
stackContainer.innerHTML = uniqueStack.map(tech => `<img src="${generateShieldURL(tech)}" alt="${tech}">`).join('');
};

export const updateBackgroundImage = (sectionId, imageUrl) => {
const section = document.getElementById(sectionId);
section.style.backgroundImage = `url('${imageUrl}')`;
};