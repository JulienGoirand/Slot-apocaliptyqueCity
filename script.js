const symbols = [
    "A", "A", "A", "A", "A", "A", "A", "A", 
    "B", "B", "B", "B", "B", "B", "B", "B", 
    "C", "C", "C", "C", "C", "C", "C", "C",  
    "D", "D", "D", "D", "D", "D",
    "B", "B", "B", "B", 
    "C", "C", "C", "C",  
    "D", "D", "D", "D", "D", "D", "D", 
    "E", "E", "E", "E", 
    "F", "F", "F", 
    "G", "G", "G",  
    "H", "H", "H",  
    "I", "I", "I",  
    "J", "J", "J", "J",
    "K", "K", "K", "K", 
    "L", "L"  // "L" est le plus rare
];

const symbolValues = {
    "A": 0.5,
    "B": 0.8,
    "C": 1.8,
    "D": 2,
    "E": 3,
    "F": 4,
    "G": 5,
    "H": 5,
    "I": 6,
    "J": 6,
    "L": 0,
    "K": 7
};

let balance = 10000.00;
let lastGain = 0.00;
let bet = 0.10;
let autoSpinCount = 0;
let autoSpinInterval = null;
let freeSpins = 0;
let isBonusActive = false;
let totalBonusGain = 0.00;

let totalBets = 0; // Total des mises placées
let totalWins = 0; // Total des gains retournés
let rtpList = [];  // Liste pour stocker les RTP calculés

const betValues = [0.10, 0.25, 0.50, 1, 2, 5, 10, 25, 50, 100];

const cells = document.querySelectorAll(".cell");
const balanceSpan = document.getElementById("balance");
const lastGainSpan = document.getElementById("lastGain");
const betSpan = document.getElementById("bet");
const spinButton = document.getElementById("spinButton");
const autoSpinButton = document.getElementById("autoSpinButton");
const increaseBetButton = document.getElementById("increaseBet");
const decreaseBetButton = document.getElementById("decreaseBet");
const bonusButton = document.getElementById("bonusButton");
const freeSpinsDisplay = document.createElement('div');

const ambianceMusic = document.getElementById("ambianceMusic");
const playMusicButton = document.getElementById("playMusicButton");
const gunSound = document.getElementById("gunSound");
const spinSound = document.getElementById("spinSound");
const gainSound = document.getElementById("gainSound");

const bonusOverlay = document.getElementById("bonusOverlay");
const bonusSpinsText = document.getElementById("bonusSpins");
const superBonusOverlay = document.createElement('div'); // Crée un overlay pour les bonus
superBonusOverlay.className = 'overlay';
superBonusOverlay.style.display = 'none';
superBonusOverlay.style.justifyContent = 'center';
superBonusOverlay.style.alignItems = 'center';
superBonusOverlay.style.position = 'fixed';
superBonusOverlay.style.top = '0';
superBonusOverlay.style.left = '0';
superBonusOverlay.style.width = '100%';
superBonusOverlay.style.height = '100%';
superBonusOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
superBonusOverlay.style.zIndex = '1000';
document.body.appendChild(superBonusOverlay);

const bonusSpinOverlay = document.createElement('div'); // Overlay pour les spins supplémentaires
bonusSpinOverlay.className = 'overlay';
bonusSpinOverlay.style.display = 'none';
bonusSpinOverlay.style.justifyContent = 'center';
bonusSpinOverlay.style.alignItems = 'center';
bonusSpinOverlay.style.position = 'fixed';
bonusSpinOverlay.style.top = '0';
bonusSpinOverlay.style.left = '0';
bonusSpinOverlay.style.width = '100%';
bonusSpinOverlay.style.height = '100%';
bonusSpinOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
bonusSpinOverlay.style.zIndex = '1000';
bonusSpinOverlay.innerHTML = `
    <div class="overlay-content" style="text-align: center; color: #fff; background-color: #333; padding: 20px; border-radius: 10px; width: 300px;">
        <h1 style="margin-bottom: 20px;">Bravo !</h1>
        <p style="font-size: 1.5em; margin-bottom: 20px;">Vous avez gagné + 2 F/S !</p>
        <button class="continue-button" style="padding: 10px 20px; font-size: 1.2em; background-color: #555; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Continuer</button>
    </div>
`;
document.body.appendChild(bonusSpinOverlay);

// Écouteur pour le bouton "Commencer" du bonus
document.querySelector('.start-bonus-button').addEventListener("click", startBonus);
// Écouteur pour le bouton "Continuer" de l'overlay des spins supplémentaires
bonusSpinOverlay.querySelector('.continue-button').addEventListener('click', () => {
    bonusSpinOverlay.style.display = 'none';
    spin(); // Continue les spins après avoir affiché l'overlay
});

spinButton.addEventListener("click", spin);
autoSpinButton.addEventListener("click", startAutoSpin);
increaseBetButton.addEventListener("click", () => adjustBet(1));
decreaseBetButton.addEventListener("click", () => adjustBet(-1));
bonusButton.addEventListener("click", showBonusOverlay);
playMusicButton.addEventListener("click", toggleMusic);

// Désactiver les roues multiplicatrices par défaut
document.querySelectorAll('.wheel').forEach(wheel => wheel.style.display = 'none');

// Configuration du texte affichant les Free Spins restants
freeSpinsDisplay.style.position = 'absolute';
freeSpinsDisplay.style.top = '50%';
freeSpinsDisplay.style.right = '10px';
freeSpinsDisplay.style.transform = 'translateY(-50%)';
freeSpinsDisplay.style.color = 'red';
freeSpinsDisplay.style.fontSize = '3em';
freeSpinsDisplay.style.display = 'none';
document.body.appendChild(freeSpinsDisplay);

// Élément pour afficher le RTP et les statistiques
const statsDisplay = document.createElement('div');
statsDisplay.style.position = 'absolute';
statsDisplay.style.left = '10px';
statsDisplay.style.top = '50%';
statsDisplay.style.transform = 'translateY(-50%)';
statsDisplay.style.color = 'white';
statsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
statsDisplay.style.padding = '10px';
statsDisplay.style.borderRadius = '10px';
statsDisplay.innerHTML = `
    <div>RTP: <span id="rtp-display">Calcul en cours...</span>%</div>
    <div>Total Bets: <span id="total-bets">0</span>€</div>
    <div>Total Wins: <span id="total-wins">0</span>€</div>
    <div>Average RTP: <span id="average-rtp">0</span>%</div>
`;
document.body.appendChild(statsDisplay);

function adjustBet(amount) {
    let currentIndex = betValues.indexOf(bet);
    currentIndex = Math.max(0, Math.min(betValues.length - 1, currentIndex + amount));
    bet = betValues[currentIndex];
    betSpan.textContent = bet.toFixed(2);
}

function spin() {
    if (balance < bet && freeSpins === 0) {
        alert("Pas assez de balance pour tourner");
        return;
    }

    if (freeSpins > 0) {
        freeSpins--;
        freeSpinsDisplay.textContent = `F/S: ${freeSpins}`;
    } else {
        balance -= bet;
        balanceSpan.textContent = balance.toFixed(2);
    }

    totalBets += bet;

    clearHighlights();

    // Play the spin sound
    spinSound.play().catch(error => {
        console.log("Error playing the spin sound:", error);
    });

    cells.forEach((cell, index) => {
        const oldSymbol = cell.querySelector("img");
        if (oldSymbol) {
            oldSymbol.classList.add("old-symbol");
        }
        cell.classList.add("flipping");
    });

    let delay = 0;
    cells.forEach((cell, index) => {
        setTimeout(() => {
            const oldSymbol = cell.querySelector("img");
            if (oldSymbol) {
                oldSymbol.remove();
            }
            const newSymbol = getRandomSymbol();
            cell.innerHTML = `<img src="images/${newSymbol}.jpg" alt="${newSymbol}">`;
            cell.classList.remove("flipping");
        }, delay);
        delay += 100; // delay between each card flip
    });

    setTimeout(() => {
        const winningLines = calculateWinningLines();
        highlightWinningLines(winningLines);

        // Add splash animation to winning lines with gun sound
        addSplashAnimation(winningLines);

        const wheelsToSpin = winningLines.length;
        let totalMultiplier = 1;

        if (wheelsToSpin > 0) {
            spinWheels(wheelsToSpin, multipliers => {
                totalMultiplier = multipliers.reduce((acc, curr) => acc * curr, 1);
                lastGain = calculateWinnings(winningLines, totalMultiplier);
                totalBonusGain += lastGain;

                // Mise à jour de l'affichage du dernier gain
                lastGainSpan.textContent = lastGain.toFixed(2);
                gainSound.play().catch(error => {
                    console.log("Error playing the gain sound:", error);
                });

                totalWins += lastGain;
                updateStatsDisplay();

                if (isBonusActive) {
                    checkForExtraSpins(); // Vérifie si 3 "L" sont obtenus pendant le bonus
                } else {
                    // Activation du super bonus si 3 "L" sont obtenus dans le jeu normal
                    const hasThreeL = winningLines.some(line => line.length >= 3 && line.every(index => cells[index].querySelector("img").alt === "L"));
                    if (hasThreeL) {
                        activateApocaWheelsBonus();
                    }
                }

                checkForSuperBonus();

                // Vérifie si les spins gratuits sont terminés pour afficher l'overlay final
                if (freeSpins === 0 && isBonusActive) {
                    setTimeout(endApocaWheelsBonus, 500); // Délai pour finir les animations
                }
            });
        } else {
            lastGain = calculateWinnings(winningLines, totalMultiplier);
            totalBonusGain += lastGain;

            // Mise à jour de l'affichage du dernier gain
            lastGainSpan.textContent = lastGain.toFixed(2);
            gainSound.play().catch(error => {
                console.log("Error playing the gain sound:", error);
            });

            totalWins += lastGain;
            updateStatsDisplay();

            if (isBonusActive) {
                checkForExtraSpins(); // Vérifie si 3 "L" sont obtenus pendant le bonus
            } else {
                // Activation du super bonus si 3 "L" sont obtenus dans le jeu normal
                const hasThreeL = winningLines.some(line => line.length >= 3 && line.every(index => cells[index].querySelector("img").alt === "L"));
                if (hasThreeL) {
                    activateApocaWheelsBonus();
                }
            }

            checkForSuperBonus();

            // Vérifie si les spins gratuits sont terminés pour afficher l'overlay final
            if (freeSpins === 0 && isBonusActive) {
                setTimeout(endApocaWheelsBonus, 500); // Délai pour finir les animations
            }
        }
    }, delay + 500); // ensure all flips are done before calculating results
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function clearHighlights() {
    cells.forEach(cell => cell.classList.remove("highlight"));
}

function calculateWinningLines() {
    const lines = [
        [0, 1, 2, 3, 4],  // Ligne horizontale 1
        [5, 6, 7, 8, 9],  // Ligne horizontale 2
        [10, 11, 12, 13, 14],  // Ligne horizontale 3
        [15, 16, 17, 18, 19],  // Ligne horizontale 4
        [0, 5, 10, 15],  // Ligne verticale 1
        [1, 6, 11, 16],  // Ligne verticale 2
        [2, 7, 12, 17],  // Ligne verticale 3
        [3, 8, 13, 18],  // Ligne verticale 4
        [4, 9, 14, 19],  // Ligne verticale 5
        [0, 6, 12, 18],  // Diagonale 1
        [4, 8, 12, 16],  // Diagonale 2
        [1, 7, 13, 19],  // Diagonale 3
        [3, 7, 11],      // Diagonale supplémentaire 1
        [3, 9, 15],      // Diagonale supplémentaire 2
        [5, 11, 17],     // Diagonale supplémentaire 3
        [10, 14, 18]     // Diagonale supplémentaire 4
    ];

    let winningLines = [];
    lines.forEach(line => {
        let currentSymbol = cells[line[0]].querySelector("img").alt;
        let currentStreak = 1;

        for (let i = 1; i < line.length; i++) {
            const symbol = cells[line[i]].querySelector("img").alt;
            if (symbol === currentSymbol && symbol !== "") {
                currentStreak++;
            } else {
                if (currentStreak >= 3) {
                    winningLines.push(line.slice(i - currentStreak, i));
                }
                currentSymbol = symbol;
                currentStreak = 1;
            }
        }
        if (currentStreak >= 3) {
            winningLines.push(line.slice(line.length - currentStreak, line.length));
        }
    });

    return winningLines;
}

function highlightWinningLines(winningLines) {
    winningLines.forEach(line => {
        const symbol = cells[line[0]].querySelector("img").alt;
        const gain = symbolValues[symbol] * bet;
        line.forEach(index => {
            cells[index].classList.add("highlight");
            displayGainOnSymbol(cells[index], gain);
        });
    });
}

function displayGainOnSymbol(cell, gain) {
    const gainText = document.createElement("div");
    gainText.className = "gain-text";
    gainText.textContent = `+${gain.toFixed(2)}€`;
    cell.appendChild(gainText);
    setTimeout(() => {
        gainText.remove();
    }, 2000); // Remove after animation
}

function addSplashAnimation(winningLines) {
    let delay = 0;
    winningLines.forEach(line => {
        line.forEach(index => {
            setTimeout(() => {
                const splash = document.createElement("div");
                splash.className = "splash";
                cells[index].appendChild(splash);
                gunSound.play().catch(error => {
                    console.log("Error playing the gun sound:", error);
                });
            }, delay);
            delay += 300; // delay between each splash
        });
    });
}

function calculateWinnings(winningLines, multiplier) {
    let winnings = 0;
    winningLines.forEach(line => {
        const symbol = cells[line[0]].querySelector("img").alt;
        winnings += symbolValues[symbol] * bet;
    });
    return winnings * multiplier;
}

function spinWheels(count, callback) {
    if (!isBonusActive) {
        // Si le bonus n'est pas actif, ne pas tourner les roues
        callback([1]); // Pas de multiplicateur appliqué
        return;
    }

    let multipliers = [];
    let completedSpins = 0;

    for (let i = 0; i < count; i++) {
        const wheel = document.getElementById(`wheel${i + 1}`);
        animateWheel(wheel, (multiplier) => {
            multipliers.push(multiplier);
            completedSpins++;
            if (completedSpins === count) {
                callback(multipliers);
            }
        });
    }
}

function animateWheel(wheel, callback) {
    const numbers = wheel.querySelectorAll('.wheel-number');
    const spinDuration = 3000; // 3 seconds

    const initialRotation = getRotation(wheel);
    const finalRotation = initialRotation + 360 * 5 + Math.floor(Math.random() * 360); // Spin 5 times plus random rotation

    wheel.style.transition = `transform ${spinDuration}ms ease-out`;
    wheel.style.transform = `rotate(${finalRotation}deg)`;

    setTimeout(() => {
        const selectedNumberIndex = Math.floor(((finalRotation % 360) + 45) / 90) % 4;
        const selectedMultiplier = parseFloat(numbers[selectedNumberIndex].textContent);
        callback(selectedMultiplier);
    }, spinDuration);
}

function getRotation(element) {
    const transform = window.getComputedStyle(element).getPropertyValue('transform');
    if (transform === 'none') return 0;
    const values = transform.split('(')[1].split(')')[0].split(',');
    const a = values[0];
    const b = values[1];
    const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return angle < 0 ? angle + 360 : angle;
}

function startAutoSpin() {
    if (autoSpinInterval) {
        clearInterval(autoSpinInterval);
        autoSpinInterval = null;
        autoSpinButton.textContent = "Auto Spin";
    } else {
        autoSpinCount = 10; // Number of auto spins
        autoSpinButton.textContent = "Stop Auto Spin";
        autoSpinInterval = setInterval(() => {
            if (autoSpinCount <= 0) {
                clearInterval(autoSpinInterval);
                autoSpinInterval = null;
                autoSpinButton.textContent = "Auto Spin";
            } else {
                spin();
                autoSpinCount--;
            }
        }, 3000); // Delay between spins
    }
}

function showBonusOverlay() {
    const cost = bet * 100; // Coût du bonus: 100x la mise par spin
    if (balance >= cost) {
        balance -= cost;
        balanceSpan.textContent = balance.toFixed(2);

        // Ajouter le coût du bonus aux statistiques pour le RTP
        totalBets += cost;
        updateStatsDisplay();

        const spins = Math.floor(Math.random() * 8) + 8; // Nombre de spins aléatoire entre 8 et 15
        bonusSpinsText.textContent = spins; // Affichage du nombre de Free Spins
        bonusOverlay.style.display = 'flex';
    } else {
        alert("Pas assez de balance pour activer le bonus.");
    }
}

function startBonus() {
    bonusOverlay.style.display = 'none';
    activateApocaWheelsBonus();
}

function activateApocaWheelsBonus() {
    isBonusActive = true;
    freeSpins = parseInt(bonusSpinsText.textContent);
    totalBonusGain = 0.00;

    // Désactiver le changement de pari pendant le bonus
    increaseBetButton.disabled = true;
    decreaseBetButton.disabled = true;

    // Activer les roues multiplicatrices
    document.querySelectorAll('.wheel').forEach(wheel => wheel.style.display = 'block');

    // Afficher le nombre de free spins restants
    freeSpinsDisplay.textContent = `F/S: ${freeSpins}`;
    freeSpinsDisplay.style.display = 'block';

    // Démarrer le premier spin bonus
    spin();
}

function endApocaWheelsBonus() {
    isBonusActive = false;
    freeSpins = 0;

    // Réactiver le changement de pari après le bonus
    increaseBetButton.disabled = false;
    decreaseBetButton.disabled = false;

    // Désactiver les roues multiplicatrices et l'affichage des Free Spins
    document.querySelectorAll('.wheel').forEach(wheel => wheel.style.display = 'none');
    freeSpinsDisplay.style.display = 'none';

    // Afficher l'overlay de fin de bonus après un léger délai pour s'assurer que tout est bien terminé
    setTimeout(showEndBonusOverlay, 500);
}

function showEndBonusOverlay() {
    // Créer l'élément overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '1000';

    // Contenu de l'overlay
    overlay.innerHTML = `
        <div class="overlay-content" style="text-align: center; color: #fff; background-color: #333; padding: 20px; border-radius: 10px; width: 300px;">
            <h1 style="margin-bottom: 20px;">Apocalyptique City</h1>
            <p style="font-size: 1.5em; margin-bottom: 20px;">Total Gain</p>
            <p style="font-size: 2em; margin-bottom: 30px;">${totalBonusGain.toFixed(2)}€</p>
            <button class="continue-button" style="padding: 10px 20px; font-size: 1.2em; background-color: #555; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Continuer</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Ajouter l'événement pour le bouton "Continuer"
    overlay.querySelector('.continue-button').addEventListener('click', () => {
        // Ajouter les gains totaux à la balance
        balance += totalBonusGain;
        balanceSpan.textContent = balance.toFixed(2);

        // Supprimer l'overlay
        overlay.remove();
    });
}

function checkForSuperBonus() {
    const lSymbols = [...cells].filter(cell => cell.querySelector("img").alt === "L");
    if (lSymbols.length >= 3) {
        lSymbols.forEach(symbol => symbol.classList.add("pulse-animation"));
        setTimeout(() => {
            lSymbols.forEach(symbol => symbol.classList.remove("pulse-animation"));
            if (!isBonusActive) {
                activateApocaWheelsBonus();
            } else {
                freeSpins += 2; // Ajouter 2 spins supplémentaires
                freeSpinsDisplay.textContent = `F/S: ${freeSpins}`;
                bonusSpinOverlay.style.display = 'flex'; // Afficher l'overlay de notification
            }
        }, 2000);
    }
}

function checkForExtraSpins() {
    const lSymbols = [...cells].filter(cell => cell.querySelector("img").alt === "L");
    if (lSymbols.length >= 3) {
        freeSpins += 2; // Ajouter 2 spins supplémentaires
        freeSpinsDisplay.textContent = `F/S: ${freeSpins}`;
        bonusSpinOverlay.style.display = 'flex'; // Afficher l'overlay de notification
    }
}

function toggleMusic() {
    if (ambianceMusic.paused) {
        ambianceMusic.play().catch(error => {
            console.log("Error playing the ambiance music:", error);
        });
        playMusicButton.textContent = "Pause Music";
    } else {
        ambianceMusic.pause();
        playMusicButton.textContent = "Play Music";
    }
}

function updateStatsDisplay() {
    const rtp = calculateRTP();
    const averageRTP = calculateAverageRTP();

    document.getElementById("rtp-display").textContent = rtp.toFixed(2);
    document.getElementById("total-bets").textContent = totalBets.toFixed(2);
    document.getElementById("total-wins").textContent = totalWins.toFixed(2);
    document.getElementById("average-rtp").textContent = averageRTP.toFixed(2);
}

function calculateRTP() {
    if (totalBets === 0) {
        return 0; // Évite la division par zéro si aucune mise n'a été placée
    }
    const rtp = (totalWins / totalBets) * 100;
    rtpList.push(rtp); // Enregistre le RTP dans la liste
    return rtp;
}

function calculateAverageRTP() {
    if (rtpList.length === 0) {
        return 0; // Évite la division par zéro si aucun RTP n'a été enregistré
    }
    const totalRTP = rtpList.reduce((acc, curr) => acc + curr, 0);
    return totalRTP / rtpList.length;
}

// Mettre à jour les statistiques pour l'affichage initial
updateStatsDisplay();