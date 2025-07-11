// List of names to pick from
const names = ['Mathieu', 'Shri', 'Jaime', 'Daniel', 'Gabriel', 'German', 'Nayibi'];

// DOM elements
const nameDisplay = document.getElementById('nameDisplay');
const pickButton = document.getElementById('pickButton');
const animationToggle = document.getElementById('animationToggle');
const sparklesContainer = document.getElementById('sparkles');
const namesGrid = document.getElementById('namesGrid');
const nameInput = document.getElementById('nameInput');
const addNameBtn = document.getElementById('addNameBtn');
const noRepeatToggle = document.getElementById('noRepeatToggle');
const resetNamesBtn = document.getElementById('resetNamesBtn');
const namesCounter = document.getElementById('namesCounter');

// State variables
let isPickingInProgress = false;
let lastPickedName = null;
let usedNames = new Set(); // Track used names when no-repeat is enabled

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
        chip.dataset.name = name;
        
        // Name text
        const nameText = document.createElement('span');
        nameText.className = 'name-text';
        nameText.textContent = name;
        chip.appendChild(nameText);
        
        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'name-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit name';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editName(chip, name);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '❌';
        deleteBtn.title = 'Delete name';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteName(name);
        });
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        chip.appendChild(actions);
        
        // Click to highlight
        chip.addEventListener('click', () => highlightName(name));
        
        // Update visual state based on used names
        updateChipState(chip, name);
        
        namesGrid.appendChild(chip);
    });
}

// Setup event listeners
function setupEventListeners() {
    pickButton.addEventListener('click', pickRandomName);
    
    // Name management listeners
    addNameBtn.addEventListener('click', addName);
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addName();
        }
    });
    
    // No-repeat functionality listeners
    noRepeatToggle.addEventListener('change', toggleNoRepeat);
    resetNamesBtn.addEventListener('click', resetAllNames);
    
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
    
    // Mark name as used if no-repeat is enabled
    if (noRepeatToggle.checked) {
        usedNames.add(name);
        updateNameChips();
        updateNamesCounter();
    }
}

// Get a random name (considers no-repeat mode and last pick avoidance)
function getRandomName() {
    let availableNames;
    
    if (noRepeatToggle.checked) {
        // No-repeat mode: only pick from unused names
        availableNames = names.filter(name => !usedNames.has(name));
        
        // If all names are used, auto-reset
        if (availableNames.length === 0) {
            autoResetNames();
            availableNames = names.filter(name => !usedNames.has(name));
        }
    } else {
        // Normal mode: avoid last pick if possible
        if (names.length === 1) return names[0];
        availableNames = names.filter(name => name !== lastPickedName);
        if (availableNames.length === 0) availableNames = names;
    }
    
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
        if (chip.dataset.name === name) {
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

// ==== NO-REPEAT FUNCTIONALITY ====

// Toggle no-repeat mode
function toggleNoRepeat() {
    const isEnabled = noRepeatToggle.checked;
    
    // Show/hide reset button
    resetNamesBtn.style.display = isEnabled ? 'block' : 'none';
    
    // Show/hide names counter
    namesCounter.style.display = isEnabled ? 'block' : 'none';
    
    if (isEnabled) {
        // Enable no-repeat mode
        updateNamesCounter();
        updateNameChips();
        showNotification('No-repeat mode enabled! Names will be marked as used after being picked.', 'info');
    } else {
        // Disable no-repeat mode - reset all names
        usedNames.clear();
        updateNameChips();
        showNotification('No-repeat mode disabled. All names are now available again.', 'info');
    }
}

// Reset all names to available state
function resetAllNames() {
    showConfirmationModal(
        'Reset All Names',
        'Are you sure you want to reset all names? This will make all names available for picking again.',
        () => {
            usedNames.clear();
            updateNameChips();
            updateNamesCounter();
            showNotification('All names reset! Everyone is available to be picked again.', 'success');
            
            // Clear the name display
            updateNameDisplay('?', false);
        }
    );
}

// Auto-reset when all names are used
function autoResetNames() {
    usedNames.clear();
    showNotification('All names were used! Auto-resetting for a new round.', 'info');
}

// Update visual state of name chips
function updateNameChips() {
    const chips = document.querySelectorAll('.name-chip');
    chips.forEach(chip => {
        const name = chip.dataset.name;
        updateChipState(chip, name);
    });
}

// Update individual chip state
function updateChipState(chip, name) {
    if (noRepeatToggle.checked && usedNames.has(name)) {
        chip.classList.add('used');
    } else {
        chip.classList.remove('used');
    }
}

// Update the names counter display
function updateNamesCounter() {
    if (!noRepeatToggle.checked) {
        namesCounter.style.display = 'none';
        return;
    }
    
    const totalNames = names.length;
    const usedCount = usedNames.size;
    const availableCount = totalNames - usedCount;
    
    namesCounter.textContent = `${availableCount} of ${totalNames} names remaining`;
    namesCounter.style.display = 'block';
}

// ==== NAME MANAGEMENT FUNCTIONS ====

// Add a new name
function addName() {
    const newName = nameInput.value.trim();
    
    // Validation
    if (!newName) {
        showNotification('Please enter a name!', 'error');
        return;
    }
    
    if (newName.length > 50) {
        showNotification('Name must be 50 characters or less!', 'error');
        return;
    }
    
    // Check for duplicates (case-insensitive)
    if (names.some(name => name.toLowerCase() === newName.toLowerCase())) {
        showNotification('This name already exists!', 'error');
        return;
    }
    
    // Add the name
    names.push(newName);
    nameInput.value = '';
    createNameChips();
    
    // Update counter if no-repeat is enabled
    if (noRepeatToggle.checked) {
        updateNamesCounter();
    }
    
    // Show success message
    showNotification(`"${newName}" added successfully!`, 'success');
    
    // Add a little sparkle effect
    createMiniSparkles();
}

// Delete a name
function deleteName(nameToDelete) {
    // Check if this is the last name
    if (names.length <= 1) {
        showNotification('You must have at least one name!', 'error');
        return;
    }
    
    // Show confirmation modal
    showConfirmationModal(
        'Delete Name',
        `Are you sure you want to delete "${nameToDelete}"?`,
        () => {
            // Remove from array
            const index = names.indexOf(nameToDelete);
            if (index > -1) {
                names.splice(index, 1);
                
                // Remove from used names if it was marked as used
                usedNames.delete(nameToDelete);
                
                createNameChips();
                
                // Update counter if no-repeat is enabled
                if (noRepeatToggle.checked) {
                    updateNamesCounter();
                }
                
                showNotification(`"${nameToDelete}" deleted successfully!`, 'success');
                
                // Clear the name display if it was showing the deleted name
                const displayedName = nameDisplay.querySelector('.picked-name');
                if (displayedName && displayedName.textContent === nameToDelete) {
                    updateNameDisplay('?', false);
                }
            }
        }
    );
}

// Edit a name
function editName(chipElement, currentName) {
    chipElement.classList.add('editing');
    
    // Create input field
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentName;
    input.maxLength = 50;
    chipElement.appendChild(input);
    
    // Focus and select text
    input.focus();
    input.select();
    
    // Function to save the edit
    const saveEdit = () => {
        const newName = input.value.trim();
        
        // Validation
        if (!newName) {
            showNotification('Name cannot be empty!', 'error');
            input.focus();
            return;
        }
        
        if (newName.length > 50) {
            showNotification('Name must be 50 characters or less!', 'error');
            input.focus();
            return;
        }
        
        // Check for duplicates (case-insensitive) - but allow same name
        if (newName.toLowerCase() !== currentName.toLowerCase() && 
            names.some(name => name.toLowerCase() === newName.toLowerCase())) {
            showNotification('This name already exists!', 'error');
            input.focus();
            return;
        }
        
        // Update the name
        const index = names.indexOf(currentName);
        if (index > -1) {
            names[index] = newName;
            
            // Update used names if the old name was marked as used
            if (usedNames.has(currentName)) {
                usedNames.delete(currentName);
                usedNames.add(newName);
            }
            
            createNameChips();
            
            // Update counter if no-repeat is enabled
            if (noRepeatToggle.checked) {
                updateNamesCounter();
            }
            
            showNotification(`Name updated to "${newName}"!`, 'success');
            
            // Update the display if it was showing the old name
            const displayedName = nameDisplay.querySelector('.picked-name');
            if (displayedName && displayedName.textContent === currentName) {
                updateNameDisplay(newName, true);
            }
        }
    };
    
    // Function to cancel edit
    const cancelEdit = () => {
        chipElement.classList.remove('editing');
        input.remove();
    };
    
    // Event listeners
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
    
    input.addEventListener('blur', saveEdit);
}

// Show confirmation modal
function showConfirmationModal(title, message, onConfirm) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
        <div class="confirmation-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirmation-buttons">
                <button class="confirm-btn">Yes, Delete</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const confirmBtn = modal.querySelector('.confirm-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };
    
    confirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
    
    cancelBtn.addEventListener('click', closeModal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 25px;
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        z-index: 1001;
        transform: translateX(100px);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        backdrop-filter: blur(10px);
        ${type === 'success' ? 'background: linear-gradient(45deg, #4ecdc4, #44a08d);' : ''}
        ${type === 'error' ? 'background: linear-gradient(45deg, #ff6b6b, #ee5a6f);' : ''}
        ${type === 'info' ? 'background: linear-gradient(45deg, #667eea, #764ba2);' : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', init);

// Add some fun console messages for developers
console.log('🎲 Welcome to the Fun Name Picker! 🎉');
console.log('Built with love and lots of sparkles ✨');
console.log('Try clicking the name display 5 times for a surprise! 🎁'); 