
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -1; //pipes moving left speed (slower)
let velocityY = 0; //bird jump speed
let gravity = 0.2; //reduced gravity for slower gameplay

let gameOver = false;
let quizScore = 0;

// Question system variables
let questionActive = false;
let currentQuestion = null;
let currentQuestionPipe = null;
let collisionHandled = false;
let askedQuestions = []; // Track which pipes have been asked
let lastPipeTime = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "/flappy-bird/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "/flappy-bird/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "/flappy-bird/bottompipe.png";

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }

    // Pause game if question is active
    if (questionActive) {
        // Still draw the current state
        context.clearRect(0, 0, board.width, board.height);
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        }
        
        context.fillStyle = "white";
        context.font="45px sans-serif";
        context.fillText("Quiz Score: " + Math.floor(quizScore), 5, 45);
        return;
    }
    
    // Place pipes automatically at intervals (prevent overlapping)
    let currentTime = Date.now();
    if (currentTime - lastPipeTime > 2000) {
        placePipes();
        lastPipeTime = currentTime;
    }

    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (detectCollision(bird, pipe)) {
            // Trigger question when collision detected (only once per pipe)
            if (!collisionHandled && !askedQuestions.includes(pipe.id)) {
                showQuestion(pipe);
                collisionHandled = true;
                askedQuestions.push(pipe.id);
            }
            return; // Stop update until question is answered
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //quiz score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText("Quiz Score: " + Math.floor(quizScore), 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver || questionActive) {
        return;
    }
    
    // Check if there are already pipes on screen to prevent overlapping
    if (pipeArray.length > 0) {
        let lastPipe = pipeArray[pipeArray.length - 1];
        if (lastPipe.x > boardWidth - 150) {
            return; // Don't place new pipes too close to existing ones
        }
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    // Get a random question for this pipe set
    let pipeQuestion = getRandomQuestion();

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false,
        question : pipeQuestion,
        id : Date.now() + Math.random() // Unique ID for this pipe
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false,
        question : pipeQuestion,
        id : topPipe.id // Same ID for pipe pair
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        if (!questionActive) {
            velocityY = -6;
        }

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            quizScore = 0;
            gameOver = false;
            questionActive = false;
            collisionHandled = false;
            askedQuestions = [];
            lastPipeTime = 0;
            const gameOverContainer = document.getElementById("gameOverContainer");
            if (gameOverContainer) {
                gameOverContainer.classList.add("hidden");
            }
            const modal = document.getElementById("questionModal");
            if (modal) {
                modal.classList.add("hidden");
            }
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function showQuestion(pipe) {
    questionActive = true;
    currentQuestion = pipe.question;
    currentQuestionPipe = pipe;

    const modal = document.getElementById("questionModal");
    const questionText = document.getElementById("questionText");
    const optionsContainer = document.getElementById("optionsContainer");
    const feedbackMessage = document.getElementById("feedbackMessage");

    // Clear previous content
    optionsContainer.innerHTML = "";
    feedbackMessage.innerHTML = "";
    feedbackMessage.className = "feedback-message";

    // Set question text
    questionText.textContent = currentQuestion.question;

    // Create option buttons
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.className = "option-button";
        button.textContent = option;
        button.onclick = () => checkAnswer(index, button);
        optionsContainer.appendChild(button);
    });

    // Show modal
    modal.classList.remove("hidden");
}

function checkAnswer(selectedIndex, button) {
    const modal = document.getElementById("questionModal");
    const optionsContainer = document.getElementById("optionsContainer");
    const feedbackMessage = document.getElementById("feedbackMessage");
    const buttons = document.querySelectorAll(".option-button");

    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    if (selectedIndex === currentQuestion.correct) {
        // Correct answer - increment quiz score
        quizScore += 1;
        button.classList.add("correct");
        feedbackMessage.classList.add("correct");
        feedbackMessage.textContent = "✓ Correct! +1 Point";

        // Hide modal and resume game after a short delay
        setTimeout(() => {
            modal.classList.add("hidden");
            questionActive = false;
            collisionHandled = false; // Reset collision flag to allow new collisions
        }, 800);
    } else {
        // Incorrect answer
        button.classList.add("incorrect");
        // Show correct answer
        buttons[currentQuestion.correct].classList.add("correct");
        feedbackMessage.classList.add("incorrect");
        feedbackMessage.textContent = "✗ Incorrect! Game Over!";

        // End game after a short delay
        setTimeout(() => {
            modal.classList.add("hidden");
            gameOver = true;
            questionActive = false;
            collisionHandled = false;
            endGame();
        }, 1500);
    }
}

function endGame() {
    const finalScoreElement = document.getElementById("finalScore");
    const gameOverContainer = document.getElementById("gameOverContainer");
    if (finalScoreElement) {
        finalScoreElement.textContent = Math.floor(quizScore);
    }
    if (gameOverContainer) {
        gameOverContainer.classList.remove("hidden");
    }
}