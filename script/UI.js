let health = 100;
let healthBarElement;
let healthText;

export function createHealthBar() {
    // Create a container for the health bar
    const healthBarContainer = document.createElement('div');
    healthBarContainer.style.position = 'absolute';
    healthBarContainer.style.bottom = '10px';
    healthBarContainer.style.left = '50%';
    healthBarContainer.style.transform = 'translate(-50%, 0)';
    healthBarContainer.style.width = '200px';
    healthBarContainer.style.height = '20px';
    healthBarContainer.style.backgroundColor = '#ccc';
    document.body.appendChild(healthBarContainer);

    // Create the health icon
    const healthIcon = document.createElement('img');
    healthIcon.src = 'sprite/health.jpg'; // Replace with the path to your health icon
    healthIcon.style.position = 'absolute';
    healthIcon.style.left = '-30px'; // Adjust as needed
    healthIcon.style.top = '0px'; // Adjust as needed
    healthIcon.style.width = '20px';
    healthIcon.style.height = '20px';
    healthBarContainer.appendChild(healthIcon);

    // Create the health bar
    healthBarElement = document.createElement('div');
    healthBarElement.style.width = `${health * 2}px`; // Multiply by 2 to scale the health to the width of the container
    healthBarElement.style.height = '20px';
    healthBarElement.style.backgroundColor = 'green';
    healthBarContainer.appendChild(healthBarElement);

    // Create the health text
    healthText = document.createElement('div');
    healthText.textContent = `${health} HP`;
    healthText.style.position = 'absolute';
    healthText.style.left = '50%';
    healthText.style.top = '50%';
    healthText.style.transform = 'translate(-50%, -50%)';
    healthText.style.color = 'white';
    healthBarElement.appendChild(healthText);
}

function updateHealthBar() {
    healthBarElement.style.width = `${health * 2}px`;
    healthText.textContent = `${health} HP`;

    // Change the color of the health bar based on the player's health
    if (health > 75) {
        healthBarElement.style.backgroundColor = 'green';
    } else if (health > 50) {
        healthBarElement.style.backgroundColor = 'yellow';
    } else if (health > 25) {
        healthBarElement.style.backgroundColor = 'orange';
    } else {
        healthBarElement.style.backgroundColor = 'red';
    }
}

function takeDamage(amount) {
    health -= amount;
    updateHealthBar();
}

//Bullets Bar 
let bullets = 25, maxBullets = 25;
let bulletsBarElement;
let bulletsText;

export function createBulletsBar() {
    // Create a container for the bullets bar
    const bulletsBarContainer = document.createElement('div');
    bulletsBarContainer.style.position = 'absolute';
    bulletsBarContainer.style.bottom = '40px';
    bulletsBarContainer.style.right = '50%';
    bulletsBarContainer.style.transform = 'translate(50%, 0)';
    bulletsBarContainer.style.width = '200px';
    bulletsBarContainer.style.height = '20px';
    bulletsBarContainer.style.backgroundColor = '#ccc';
    document.body.appendChild(bulletsBarContainer);

    // Create the bullets icon
    const bulletsIcon = document.createElement('img');
    bulletsIcon.src = 'sprite/bullet.png'; // Replace with the path to your bullets icon
    bulletsIcon.style.position = 'absolute';
    bulletsIcon.style.left = '-30px'; // Adjust as needed
    bulletsIcon.style.top = '0px'; // Adjust as needed
    bulletsIcon.style.width = '20px';
    bulletsIcon.style.height = '20px';
    bulletsBarContainer.appendChild(bulletsIcon);

    // Create the bullets bar
    bulletsBarElement = document.createElement('div');
    bulletsBarElement.style.width = `100%`; // Multiply by 2 to scale the bullets to the width of the container
    bulletsBarElement.style.height = '20px';
    bulletsBarElement.style.backgroundColor = 'yellow';
    bulletsBarContainer.appendChild(bulletsBarElement);

    // Create the bullets text
    bulletsText = document.createElement('div');
    bulletsText.textContent = `${bullets} / ${maxBullets}`;
    bulletsText.style.position = 'absolute';
    bulletsText.style.left = '50%';
    bulletsText.style.top = '50%';
    bulletsText.style.transform = 'translate(-50%, -50%)';
    bulletsText.style.color = 'black';
    bulletsBarElement.appendChild(bulletsText);
}

function updateBulletsBar() {
    let bulletsPercent = (bullets / maxBullets) * 100;
    bulletsBarElement.style.width = `${bulletsPercent}%`;
    bulletsText.textContent = `${bullets} / ${maxBullets}`;
}

export function takeBullets(amount) {
    bullets -= amount;
    updateBulletsBar();
}

let reloadTimeout;
let reloadTimerInterval;
let lastReloadTime = 0; // Add this line
const reloadCooldown = 2000; // Cooldown time in milliseconds

export function reloadBullets() {
    const currentTime = Date.now();

    // Check if enough time has passed since the last reload
    if (!reloadTimeout && currentTime - lastReloadTime >= reloadCooldown) {
        let remainingTime = reloadCooldown / 1000;
        bulletsText.textContent = `Reload in: ${remainingTime.toFixed(1)}`;

        // Start the reload timer
        reloadTimerInterval = setInterval(() => {
            remainingTime -= 0.1;
            bulletsText.textContent = `Reload in: ${remainingTime.toFixed(1)}`;
        }, 100);

        reloadTimeout = setTimeout(() => {
            bullets = maxBullets;
            updateBulletsBar();
            reloadTimeout = null;
            lastReloadTime = currentTime; // Update the last reload time

            //Stop the reload timer
            clearInterval(reloadTimerInterval);
        }, reloadCooldown);
    }
}

export { bullets }