// List of names to pick from
const names = ['Mathieu', 'Shri', 'Jaime', 'Daniel', 'Gabriel', 'German', 'Nayibi'];

// DOM elements
const nameDisplay = document.getElementById('nameDisplay');
const pickButton = document.getElementById('pickButton');
const animationToggle = document.getElementById('animationToggle');
const sparklesContainer = document.getElementById('sparkles');
const namesGrid = document.getElementById('namesGrid');

// State variables
let isPickingInProgress = false;
let lastPickedName = null;

// Initialize the application
function init() {
    createNameChips();
    setupEventListeners();
    showWelcomeAnimation();
}

// Create name chips in the grid
function createNameChips() {
    namesGrid.innerHTML = '';
    names.forEach(name => {
        const chip = document.createElement('div');
        chip.className = 'name-chip';
        chip.textContent = name;
        chip.addEventListener('click', () => highlightName(name));
        namesGrid.appendChild(chip);
    });
}

// Setup event listeners
function setupEventListeners() {
    pickButton.addEventListener('click', pickRandomName);
    
    // Add keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (!isPickingInProgress) {
                pickRandomName();
            }
        }
    });
    
    // Add fun hover effects to name display
    nameDisplay.addEventListener('mouseenter', () => {
        if (!isPickingInProgress) {
            createMiniSparkles();
        }
    });
}

// Show welcome animation
function showWelcomeAnimation() {
    setTimeout(() => {
        nameDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            nameDisplay.style.transform = 'scale(1)';
        }, 200);
    }, 500);
}

// Main function to pick a random name
async function pickRandomName() {
    if (isPickingInProgress) return;
    
    isPickingInProgress = true;
    pickButton.disabled = true;
    
    // Add picking class for animations
    pickButton.classList.add('picking');
    nameDisplay.classList.add('picking');
    
    // Change button text
    const buttonText = pickButton.querySelector('.button-text');
    buttonText.textContent = '🎲 Picking...';
    
    if (animationToggle.checked) {
        await dramaticReveal();
    } else {
        await quickPick();
    }
    
    // Reset button
    pickButton.classList.remove('picking');
    nameDisplay.classList.remove('picking');
    buttonText.textContent = '🎯 Pick Again!';
    pickButton.disabled = false;
    isPickingInProgress = false;
}

// Dramatic reveal with suspense
async function dramaticReveal() {
    const shuffleCount = 15;
    const shuffleSpeed = 150;
    
    // Shuffle through names quickly
    for (let i = 0; i < shuffleCount; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        updateNameDisplay(randomName, false);
        highlightName(randomName);
        await sleep(shuffleSpeed - (i * 5)); // Speed up gradually
    }
    
    // Final dramatic pause
    updateNameDisplay('🎉', false);
    await sleep(500);
    
    // Reveal the final name
    const finalName = getRandomName();
    await revealFinalName(finalName);
}

// Quick pick without animation
async function quickPick() {
    updateNameDisplay('🎲', false);
    await sleep(200);
    
    const finalName = getRandomName();
    await revealFinalName(finalName);
}

// Reveal the final chosen name with effects
async function revealFinalName(name) {
    updateNameDisplay(name, true);
    highlightName(name);
    createCelebrationSparkles();
    playSuccessAnimation();
    lastPickedName = name;
}

// Get a random name (ensures different from last pick if possible)
function getRandomName() {
    if (names.length === 1) return names[0];
    
    let availableNames = names.filter(name => name !== lastPickedName);
    if (availableNames.length === 0) availableNames = names;
    
    return availableNames[Math.floor(Math.random() * availableNames.length)];
}

// Update the name display
function updateNameDisplay(content, isFinalName = false) {
    nameDisplay.innerHTML = '';
    
    if (isFinalName) {
        const nameElement = document.createElement('span');
        nameElement.className = 'picked-name';
        nameElement.textContent = content;
        nameDisplay.appendChild(nameElement);
    } else {
        const element = document.createElement('span');
        element.className = 'question-mark';
        element.textContent = content;
        nameDisplay.appendChild(element);
    }
}

// Highlight the selected name in the grid
function highlightName(name) {
    const chips = document.querySelectorAll('.name-chip');
    chips.forEach(chip => {
        chip.classList.remove('selected');
        if (chip.textContent === name) {
            chip.classList.add('selected');
        }
    });
}

// Create celebration sparkles
function createCelebrationSparkles() {
    const sparkleCount = 20;
    
    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            createSparkle();
        }, i * 50);
    }
}

// Create mini sparkles for hover effect
function createMiniSparkles() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createSparkle(true);
        }, i * 100);
    }
}

// Create a single sparkle
function createSparkle(isSmall = false) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Random position around the center
    const angle = Math.random() * 2 * Math.PI;
    const distance = isSmall ? 50 + Math.random() * 30 : 80 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    sparkle.style.setProperty('--tx', `${tx}px`);
    sparkle.style.setProperty('--ty', `${ty}px`);
    
    // Random colors
    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#FFA500', '#DA70D6'];
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    if (isSmall) {
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
    }
    
    sparklesContainer.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 800);
}

// Play success animation
function playSuccessAnimation() {
    // Add a celebration bounce to the name display
    nameDisplay.style.animation = 'none';
    setTimeout(() => {
        nameDisplay.style.animation = 'zoomIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }, 10);
    
    // Add screen shake effect
    document.body.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 300);
}

// Utility function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add some fun easter eggs
let clickCount = 0;
nameDisplay.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 5) {
        createCelebrationSparkles();
        clickCount = 0;
        
        // Show a fun message
        const originalContent = nameDisplay.innerHTML;
        nameDisplay.innerHTML = '<span class="picked-name">🎉 You found an easter egg! 🎉</span>';
        setTimeout(() => {
            nameDisplay.innerHTML = originalContent;
        }, 2000);
    }
});

// Add sound effects (visual feedback since we can't guarantee audio)
function addVisualSoundEffect() {
    const effect = document.createElement('div');
    effect.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
        width: 200px;
        height: 200px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: pulse 0.3s ease-out;
    `;
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 300);
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);

// Add some fun console messages for developers
console.log('🎲 Welcome to the Fun Name Picker! 🎉');
console.log('Built with love and lots of sparkles ✨');
console.log('Try clicking the name display 5 times for a surprise! 🎁'); 