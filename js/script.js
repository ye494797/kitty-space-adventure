"use strict";


/* ==============================
   GAME SETTINGS
============================== */

const TARGET_SCORE = 15;
const STARTING_TIME = 60;
const STARTING_HEALTH = 4;
const PLAYER_SPEED = 6;

const STAR_SPAWN_RATE = 850;
const ASTEROID_SPAWN_RATE = 3400;
const BLACK_HOLE_SPAWN_RATE = 8500;
const OBJECT_LIFETIME = 5000;


/* ==============================
   PLAYER IMAGE PATHS
============================== */

const playerImages = {
    orange: "images/characters/orange-cat-player.png",
    black: "images/characters/black-cat-player.png",
    white: "images/characters/white-cat-player.png",
    gray: "images/characters/gray-cat-player.png"
};


/* ==============================
   SELECT HTML ELEMENTS
============================== */

const screens = document.querySelectorAll(".screen");

const characterScreen =
    document.querySelector("#character-screen");

const missionScreen =
    document.querySelector("#mission-screen");

const gameScreen =
    document.querySelector("#game-screen");

const victoryScreen =
    document.querySelector("#victory-screen");

const gameOverScreen =
    document.querySelector("#game-over-screen");


const startGameButton =
    document.querySelector("#start-game-button");

const continueButton =
    document.querySelector("#continue-button");

const startMissionButton =
    document.querySelector("#start-mission-button");


const characterCards =
    document.querySelectorAll(".character-card");

const characterFeedback =
    document.querySelector("#character-feedback");


const gameArea =
    document.querySelector("#game-area");

const player =
    document.querySelector("#player");


const healthDisplay =
    document.querySelector("#health-display");

const scoreDisplay =
    document.querySelector("#score-display");

const timerDisplay =
    document.querySelector("#timer-display");

const gameFeedback =
    document.querySelector("#game-feedback");


const victorySummary =
    document.querySelector("#victory-summary");

const loseReason =
    document.querySelector("#lose-reason");


const playAgainButton =
    document.querySelector("#play-again-button");

const tryAgainButton =
    document.querySelector("#try-again-button");

const victoryChangeCharacterButton =
    document.querySelector(
        "#victory-change-character-button"
    );

const loseChangeCharacterButton =
    document.querySelector(
        "#lose-change-character-button"
    );

const controlButtons =
    document.querySelectorAll(".control-button");


/* ==============================
   GAME STATE
============================== */

let selectedCharacter = null;
let selectedCharacterName = "";

let score = 0;
let health = STARTING_HEALTH;
let timeRemaining = STARTING_TIME;

let playerX = 0;
let playerY = 0;

let gameRunning = false;
let playerCanBeHit = true;

let movement = {
    up: false,
    down: false,
    left: false,
    right: false
};

let timerInterval = null;
let starInterval = null;
let asteroidInterval = null;
let blackHoleInterval = null;
let collisionInterval = null;
let movementAnimation = null;


/* ==============================
   SCREEN CHANGES
============================== */

function showScreen(screenToShow) {
    screens.forEach(function (screen) {
        screen.classList.remove("screen--active");
    });

    screenToShow.classList.add("screen--active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ==============================
   START BUTTON
============================== */

startGameButton.addEventListener(
    "click",
    function () {
        showScreen(characterScreen);
    }
);


/* ==============================
   CHARACTER SELECTION
============================== */

characterCards.forEach(function (card) {
    card.addEventListener(
        "click",
        function () {
            characterCards.forEach(
                function (otherCard) {
                    otherCard.classList.remove(
                        "is-selected"
                    );

                    otherCard.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                }
            );

            card.classList.add("is-selected");

            card.setAttribute(
                "aria-pressed",
                "true"
            );

            selectedCharacter =
                card.dataset.character;

            selectedCharacterName =
                card.dataset.name;

            player.src =
                playerImages[selectedCharacter];

            player.alt =
                `${selectedCharacterName} flying in space`;

            characterFeedback.textContent =
                `${selectedCharacterName} is ready for the mission!`;

            continueButton.disabled = false;
        }
    );
});


continueButton.addEventListener(
    "click",
    function () {
        if (!selectedCharacter) {
            characterFeedback.textContent =
                "Please choose an astronaut before continuing.";

            return;
        }

        showScreen(missionScreen);
    }
);


/* ==============================
   START MISSION
============================== */

startMissionButton.addEventListener(
    "click",
    startGame
);


function startGame() {
    stopGameSystems();
    resetGame();

    showScreen(gameScreen);

    requestAnimationFrame(function () {
        clearGameObjects();
        centerPlayer();
        updateDisplays();

        gameRunning = true;

        gameFeedback.textContent =
            `Go, ${selectedCharacterName}! Collect 15 stars!`;

        gameFeedback.className =
            "game-feedback";

        startTimer();
        startSpawning();
        startCollisionChecking();
        movePlayer();
    });
}


/* ==============================
   RESET GAME
============================== */

function resetGame() {
    score = 0;
    health = STARTING_HEALTH;
    timeRemaining = STARTING_TIME;

    playerCanBeHit = true;

    movement = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    player.classList.remove("is-hit");
}


function centerPlayer() {
    playerX =
        (gameArea.clientWidth - player.offsetWidth) / 2;

    playerY =
        (gameArea.clientHeight - player.offsetHeight) / 2;

    updatePlayerPosition();
}


function updatePlayerPosition() {
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}


/* ==============================
   KEYBOARD MOVEMENT
============================== */

document.addEventListener(
    "keydown",
    function (event) {
        const key = event.key.toLowerCase();

        const movementKeys = [
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
            "w",
            "a",
            "s",
            "d"
        ];

        if (movementKeys.includes(key)) {
            event.preventDefault();
        }

        if (key === "arrowup" || key === "w") {
            movement.up = true;
        }

        if (key === "arrowdown" || key === "s") {
            movement.down = true;
        }

        if (key === "arrowleft" || key === "a") {
            movement.left = true;
        }

        if (key === "arrowright" || key === "d") {
            movement.right = true;
        }
    }
);


document.addEventListener(
    "keyup",
    function (event) {
        const key = event.key.toLowerCase();

        if (key === "arrowup" || key === "w") {
            movement.up = false;
        }

        if (key === "arrowdown" || key === "s") {
            movement.down = false;
        }

        if (key === "arrowleft" || key === "a") {
            movement.left = false;
        }

        if (key === "arrowright" || key === "d") {
            movement.right = false;
        }
    }
);


/* ==============================
   MOBILE MOVEMENT
============================== */

controlButtons.forEach(function (button) {
    const direction =
        button.dataset.direction;

    button.addEventListener(
        "pointerdown",
        function (event) {
            event.preventDefault();

            movement[direction] = true;

            button.classList.add(
                "is-active"
            );
        }
    );

    function stopMovement(event) {
        event.preventDefault();

        movement[direction] = false;

        button.classList.remove(
            "is-active"
        );
    }

    button.addEventListener(
        "pointerup",
        stopMovement
    );

    button.addEventListener(
        "pointercancel",
        stopMovement
    );

    button.addEventListener(
        "pointerleave",
        stopMovement
    );
});


/* ==============================
   PLAYER MOVEMENT LOOP
============================== */

function movePlayer() {
    if (!gameRunning) {
        return;
    }

    if (movement.up) {
        playerY -= PLAYER_SPEED;
    }

    if (movement.down) {
        playerY += PLAYER_SPEED;
    }

    if (movement.left) {
        playerX -= PLAYER_SPEED;
    }

    if (movement.right) {
        playerX += PLAYER_SPEED;
    }

    keepPlayerInsideGameArea();
    updatePlayerPosition();

    movementAnimation =
        requestAnimationFrame(movePlayer);
}


function keepPlayerInsideGameArea() {
    const maxX =
        gameArea.clientWidth - player.offsetWidth;

    const maxY =
        gameArea.clientHeight - player.offsetHeight;

    playerX = Math.max(
        0,
        Math.min(playerX, maxX)
    );

    playerY = Math.max(
        0,
        Math.min(playerY, maxY)
    );
}


/* ==============================
   TIMER
============================== */

function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(
        function () {
            if (!gameRunning) {
                return;
            }

            timeRemaining -= 1;

            updateTimerDisplay();

            if (
                timeRemaining <= 10 &&
                timeRemaining > 0
            ) {
                gameFeedback.textContent =
                    `Hurry! Only ${timeRemaining} seconds left!`;

                gameFeedback.className =
                    "game-feedback is-danger";
            }

            if (timeRemaining <= 0) {
                endGame(false, "time");
            }
        },
        1000
    );
}


/* ==============================
   SPAWN OBJECTS
============================== */

function startSpawning() {
    spawnObject("star");

    starInterval = setInterval(
        function () {
            spawnObject("star");
        },
        STAR_SPAWN_RATE
    );

    asteroidInterval = setInterval(
        function () {
            spawnObject("asteroid");
        },
        ASTEROID_SPAWN_RATE
    );

    blackHoleInterval = setInterval(
        function () {
            spawnObject("black-hole");
        },
        BLACK_HOLE_SPAWN_RATE
    );
}


function spawnObject(type) {
    if (!gameRunning) {
        return;
    }

    const object =
        document.createElement("img");

    object.classList.add(
        "game-object",
        `game-object--${type}`
    );

    object.dataset.objectType = type;
    object.draggable = false;

    if (type === "star") {
        object.src =
            "images/icons/star.png";

        object.alt =
            "Collectible star";
    }

    if (type === "asteroid") {
        object.src =
            "images/icons/asteroid.png";

        object.alt =
            "Asteroid hazard";
    }

    if (type === "black-hole") {
        object.src =
            "images/icons/black-hole.png";

        object.alt =
            "Black hole hazard";
    }

    gameArea.appendChild(object);

    requestAnimationFrame(function () {
        const maxX = Math.max(
            0,
            gameArea.clientWidth -
                object.offsetWidth
        );

        const maxY = Math.max(
            0,
            gameArea.clientHeight -
                object.offsetHeight
        );

        object.style.left =
            `${Math.floor(Math.random() * maxX)}px`;

        object.style.top =
            `${Math.floor(Math.random() * maxY)}px`;
    });

    setTimeout(
        function () {
            if (object.isConnected) {
                object.remove();
            }
        },
        OBJECT_LIFETIME
    );
}


/* ==============================
   COLLISION DETECTION
============================== */

function startCollisionChecking() {
    clearInterval(collisionInterval);

    collisionInterval = setInterval(
        function () {
            if (!gameRunning) {
                return;
            }

            const objects =
                document.querySelectorAll(
                    ".game-object"
                );

            objects.forEach(
                function (object) {
                    if (
                        isColliding(
                            player,
                            object
                        )
                    ) {
                        handleCollision(
                            object
                        );
                    }
                }
            );
        },
        45
    );
}


function isColliding(
    firstElement,
    secondElement
) {
    const first =
        firstElement.getBoundingClientRect();

    const second =
        secondElement.getBoundingClientRect();

    const padding = 20;

    return !(
        first.right - padding <
            second.left + padding ||
        first.left + padding >
            second.right - padding ||
        first.bottom - padding <
            second.top + padding ||
        first.top + padding >
            second.bottom - padding
    );
}


function handleCollision(object) {
    const type =
        object.dataset.objectType;

    if (type === "star") {
        object.remove();
        collectStar();

        return;
    }

    if (!playerCanBeHit) {
        return;
    }

    if (type === "asteroid") {
        object.remove();

        loseHealth(
            1,
            "Ouch! You hit an asteroid."
        );
    }

    if (type === "black-hole") {
        object.remove();

        loseHealth(
            1,
            "Oh no! A black hole pulled you in."
        );
    }
}


/* ==============================
   SCORE
============================== */

function collectStar() {
    score += 1;

    updateScoreDisplay();

    gameFeedback.textContent =
        `Star collected! ${score} of ${TARGET_SCORE}`;

    gameFeedback.className =
        "game-feedback is-success";

    if (score >= TARGET_SCORE) {
        endGame(true);
    }
}


/* ==============================
   HEALTH
============================== */

function loseHealth(amount, message) {
    playerCanBeHit = false;

    health = Math.max(
        0,
        health - amount
    );

    updateHealthDisplay();

    gameFeedback.textContent =
        message;

    gameFeedback.className =
        "game-feedback is-danger";

    player.classList.add(
        "is-hit"
    );

    setTimeout(
        function () {
            player.classList.remove(
                "is-hit"
            );
        },
        400
    );

    setTimeout(
        function () {
            playerCanBeHit = true;
        },
        1500
    );

    if (health <= 0) {
        endGame(false, "health");
    }
}


/* ==============================
   UPDATE DISPLAYS
============================== */

function updateDisplays() {
    updateHealthDisplay();
    updateScoreDisplay();
    updateTimerDisplay();
}


function updateHealthDisplay() {
    healthDisplay.innerHTML = "";

    for (
        let index = 0;
        index < health;
        index += 1
    ) {
        const heart =
            document.createElement("img");

        heart.src =
            "images/icons/heart.png";

        heart.alt =
            "Life";

        healthDisplay.appendChild(
            heart
        );
    }

    if (health === 0) {
        healthDisplay.textContent = "0";
    }
}


function updateScoreDisplay() {
    scoreDisplay.textContent =
        `${score} / ${TARGET_SCORE}`;
}


function updateTimerDisplay() {
    timerDisplay.textContent =
        timeRemaining;
}


/* ==============================
   WIN OR LOSE
============================== */

function endGame(
    playerWon,
    reason
) {
    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    stopGameSystems();

    if (playerWon) {
        victorySummary.textContent =
            `${selectedCharacterName} completed the mission with ${timeRemaining} seconds remaining.`;

        showScreen(victoryScreen);

        return;
    }

    if (reason === "health") {
        loseReason.textContent =
            "You lost all of your lives.";
    } else {
        loseReason.textContent =
            "You ran out of time.";
    }

    showScreen(gameOverScreen);
}


/* ==============================
   RESTART BUTTONS
============================== */

playAgainButton.addEventListener(
    "click",
    startGame
);

tryAgainButton.addEventListener(
    "click",
    startGame
);


victoryChangeCharacterButton.addEventListener(
    "click",
    returnToCharacterSelection
);

loseChangeCharacterButton.addEventListener(
    "click",
    returnToCharacterSelection
);


function returnToCharacterSelection() {
    stopGameSystems();
    clearGameObjects();

    selectedCharacter = null;
    selectedCharacterName = "";

    continueButton.disabled = true;

    characterFeedback.textContent =
        "Choose one astronaut to continue.";

    characterCards.forEach(
        function (card) {
            card.classList.remove(
                "is-selected"
            );

            card.setAttribute(
                "aria-pressed",
                "false"
            );
        }
    );

    showScreen(characterScreen);
}


/* ==============================
   STOP GAME SYSTEMS
============================== */

function stopGameSystems() {
    gameRunning = false;

    clearInterval(timerInterval);
    clearInterval(starInterval);
    clearInterval(asteroidInterval);
    clearInterval(blackHoleInterval);
    clearInterval(collisionInterval);

    if (movementAnimation) {
        cancelAnimationFrame(
            movementAnimation
        );
    }

    timerInterval = null;
    starInterval = null;
    asteroidInterval = null;
    blackHoleInterval = null;
    collisionInterval = null;
    movementAnimation = null;
}


/* ==============================
   CLEAR OBJECTS
============================== */

function clearGameObjects() {
    const objects =
        gameArea.querySelectorAll(
            ".game-object"
        );

    objects.forEach(
        function (object) {
            object.remove();
        }
    );
}


/* ==============================
   RESPONSIVE POSITION
============================== */

window.addEventListener(
    "resize",
    function () {
        if (!gameRunning) {
            return;
        }

        keepPlayerInsideGameArea();
        updatePlayerPosition();
    }
);