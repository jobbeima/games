const allColors = [
    { name: "Red", value: "#ff3b30" },
    { name: "Orange", value: "#ff9500" },
    { name: "Yellow", value: "#ffcc00" },
    { name: "Green", value: "#34c759" },
    { name: "Blue", value: "#007aff" },
    { name: "Purple", value: "#af52de" },
    { name: "Pink", value: "#ff2d55" },
    { name: "Brown", value: "#a2845e" },
    { name: "Gray", value: "#8e8e93" }
];

const gameLengthSeconds = 60;
const highScoreKey = "ColorMatchHighScore";

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const timeRemainingElement = document.getElementById("time-remaining");
const timerFillElement = document.getElementById("timer-fill");
const roundLabelElement = document.getElementById("round-label");
const choicesElement = document.getElementById("choices");
const feedbackElement = document.getElementById("feedback");
const activeGameElement = document.getElementById("active-game");
const gameOverElement = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const newHighScoreElement = document.getElementById("new-high-score");
const playAgainButton = document.getElementById("play-again");

let score = 0;
let round = 0;
let timeRemaining = gameLengthSeconds;
let isGameOver = false;
let timerId = null;
let feedbackTimeoutId = null;

function readHighScore() {
    return Number(window.localStorage.getItem(highScoreKey) || 0);
}

function writeHighScore(nextScore) {
    window.localStorage.setItem(highScoreKey, String(nextScore));
}

function shuffled(list) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
}

function generateChoices(count) {
    const selected = shuffled(allColors).slice(0, count);
    const correctIndex = Math.floor(Math.random() * selected.length);
    const result = selected.map((item, index) => {
        if (index === correctIndex) {
            return {
                title: item.name,
                displayName: item.name,
                displayColor: item.value,
                isCorrect: true
            };
        }

        const wrongPool = allColors.filter((color) => color.name !== item.name);
        const wrong = wrongPool[Math.floor(Math.random() * wrongPool.length)];
        return {
            title: item.name,
            displayName: wrong.name,
            displayColor: wrong.value,
            isCorrect: false
        };
    });

    return shuffled(result);
}

function updateScoreboard() {
    const highScore = readHighScore();
    scoreElement.textContent = String(score);
    highScoreElement.textContent = String(highScore);
    timeRemainingElement.textContent = `${timeRemaining}s`;
    timerFillElement.style.width = `${(timeRemaining / gameLengthSeconds) * 100}%`;
    roundLabelElement.textContent = `Round ${round}`;
}

function showFeedback(isCorrect) {
    feedbackElement.textContent = isCorrect ? "Correct!" : "Wrong";
    feedbackElement.className = `feedback ${isCorrect ? "correct" : "wrong"}`;

    window.clearTimeout(feedbackTimeoutId);
    feedbackTimeoutId = window.setTimeout(() => {
        feedbackElement.className = "feedback hidden";
    }, 500);
}

function nextRound() {
    round += 1;
    const choices = generateChoices(4);
    choicesElement.replaceChildren();

    for (const choice of choices) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice-button";
        button.textContent = choice.title;
        button.style.color = choice.displayColor;
        button.setAttribute("aria-label", `${choice.title} in ${choice.displayName}`);
        button.addEventListener("click", () => handleSelection(choice));
        choicesElement.appendChild(button);
    }

    updateScoreboard();
}

function handleSelection(choice) {
    if (isGameOver) {
        return;
    }

    if (choice.isCorrect) {
        score += 1;
    } else {
        score = Math.max(0, score - 1);
    }

    if (score > readHighScore()) {
        writeHighScore(score);
    }

    showFeedback(choice.isCorrect);
    updateScoreboard();
    window.setTimeout(() => {
        if (!isGameOver) {
            nextRound();
        }
    }, 500);
}

function stopTimer() {
    if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
    }
}

function endGame() {
    isGameOver = true;
    stopTimer();
    finalScoreElement.textContent = `Final score: ${score}`;
    const isHighScore = score >= readHighScore() && score > 0;
    newHighScoreElement.classList.toggle("hidden", !isHighScore);
    activeGameElement.classList.add("hidden");
    gameOverElement.classList.remove("hidden");
}

function startTimer() {
    stopTimer();
    timerId = window.setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining -= 1;
            updateScoreboard();
        }

        if (timeRemaining === 0) {
            if (score > readHighScore()) {
                writeHighScore(score);
            }
            endGame();
        }
    }, 1000);
}

function startGame() {
    score = 0;
    round = 0;
    timeRemaining = gameLengthSeconds;
    isGameOver = false;
    activeGameElement.classList.remove("hidden");
    gameOverElement.classList.add("hidden");
    updateScoreboard();
    nextRound();
    startTimer();
}

highScoreElement.textContent = String(readHighScore());
playAgainButton.addEventListener("click", startGame);
startGame();
