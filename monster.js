const allQuestions = [
    { q: "sin 30°", a: "1/2", options: ["1/2", "√2/2", "√3/2", "1"] },
    { q: "cos 30°", a: "√3/2", options: ["1/2", "√2/2", "√3/2", "1"] },
    { q: "tan 30°", a: "√3/3", options: ["√3/3", "1", "√3", "0"] },
    { q: "sin 45°", a: "√2/2", options: ["1/2", "√2/2", "√3/2", "1"] },
    { q: "cos 45°", a: "√2/2", options: ["1/2", "√2/2", "√3/2", "1"] },
    { q: "tan 45°", a: "1", options: ["√3/3", "1", "√3", "0"] },
    { q: "sin 60°", a: "√3/2", options: ["1/2", "√2/2", "√3/2", "1"] },
    { q: "cos 60°", a: "1/2", options: ["1/2", "√2/2", "√3/2", "1"] },
    { q: "tan 60°", a: "√3", options: ["√3/3", "1", "√3", "0"] }
];

let gameQuestions = [];
let currentStep = 0;
const totalSteps = 6; 

let playerPos = 25;
let targetPlayerPos = 25;
let monsterPos = 0; 
const safeZone = 85;

let isGameOver = false;
let animationId = null;
let lastTime = 0;
let isActionStarted = false; 

const processedImages = {};
let isImagesReady = false;

function removeBackground(imageSrc, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0);
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (Math.abs(data[i]-52)<75 && Math.abs(data[i+1]-73)<75 && Math.abs(data[i+2]-94)<75) {
                    data[i+3] = 0;
                }
            }
            ctx.putImageData(imageData, 0, 0); callback(canvas.toDataURL());
        } catch (e) { callback(imageSrc); }
    };
    img.onerror = () => callback(imageSrc); img.src = imageSrc;
}

function loadAndProcessImages(callback) {
    const imagesToProcess = ["cat_running.png", "cat_scared.png", "cat_caught.png", "cat_happy.png", "monster_running.png", "monster_evil.png"];
    let loadedCount = 0;
    imagesToProcess.forEach(src => {
        removeBackground(src, (dataUrl) => {
            processedImages[src] = dataUrl; loadedCount++;
            if (loadedCount === imagesToProcess.length) { isImagesReady = true; callback(); }
        });
    });
}

function getImg(src) { return processedImages[src] || src; }

function startGame(speed) {
    window.monsterSpeed = speed; 
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("main-game").style.display = "block";
    initGame(); 
}

function initGame() {
    if (!isImagesReady) {
        document.getElementById("status-text").innerText = "캐릭터 렌더링 중...";
        loadAndProcessImages(initGame);
        return;
    }

    gameQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, totalSteps);
    currentStep = 0; playerPos = 25; targetPlayerPos = 25; monsterPos = 0;
    isGameOver = false; isActionStarted = false; 
    
    document.getElementById("monster").style.left = monsterPos + "%";
    document.getElementById("player").style.left = playerPos + "%";
    document.getElementById("player-img").src = getImg("cat_running.png");
    document.getElementById("monster-img").src = getImg("monster_running.png");
    
    document.getElementById("game-board").classList.remove("hidden");
    const resultScreen = document.getElementById("result-screen");
    if (resultScreen) resultScreen.classList.add("hidden");

    // 🌟 에러 방지: 자바스크립트가 직접 버튼을 만듭니다!
    let startBtn = document.getElementById("auto-start-btn");
    if (!startBtn) {
        startBtn = document.createElement("button");
        startBtn.id = "auto-start-btn";
        startBtn.innerHTML = "🚨 추격 시작!";
        startBtn.style.cssText = "display: block; margin: 20px auto; padding: 15px 40px; font-size: 24px; background-color: #e74c3c; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
        startBtn.onclick = startAction;
        
        const gameBoard = document.getElementById("game-board");
        gameBoard.insertBefore(startBtn, gameBoard.firstChild);
    }
    startBtn.style.display = "block";
    
    document.getElementById("options-area").innerHTML = "";
    document.getElementById("monster-question").innerText = "준비가 되면 위 버튼을 누르세요!";
    document.getElementById("status-text").innerText = "대기 중...";
    
    if (animationId) cancelAnimationFrame(animationId);
}

function startAction() {
    isActionStarted = true;
    lastTime = performance.now();
    document.getElementById("auto-start-btn").style.display = "none";
    document.getElementById("status-text").innerText = "괴물이 쫓아옵니다! 빨리 정답을 고르세요!";
    loadQuestion();
    animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
    if (isGameOver || !isActionStarted) return; 
    
    const deltaTime = time - lastTime; lastTime = time;
    const currentMonsterSpeed = window.monsterSpeed || 8.0; 
    monsterPos += (currentMonsterSpeed * deltaTime) / 1000;
    
    if (playerPos < targetPlayerPos) {
        playerPos += (15 * deltaTime) / 1000; 
        if (playerPos > targetPlayerPos) playerPos = targetPlayerPos;
    }
    
    document.getElementById("monster").style.left = monsterPos + "%";
    document.getElementById("player").style.left = playerPos + "%";
    
    const distance = playerPos - monsterPos;
    let catImg = "cat_running.png"; let monsterImg = "monster_running.png";
    if (distance <= 25) { catImg = "cat_scared.png"; monsterImg = "monster_evil.png"; }
    
    document.getElementById("player-img").src = getImg(catImg);
    document.getElementById("monster-img").src = getImg(monsterImg);
    
    if (monsterPos >= playerPos - 8) { endGame(false, "몬스터에게 따라잡혔습니다!"); return; }
    if (playerPos >= safeZone) { endGame(true, "🎉 탈출 성공! 특수각 마스터!"); return; }
    
    animationId = requestAnimationFrame(gameLoop);
}

function loadQuestion() {
    if (currentStep >= totalSteps) return;
    const qData = gameQuestions[currentStep];
    document.getElementById("monster-question").innerText = qData.q;
    
    const shuffledOptions = qData.options.sort(() => Math.random() - 0.5);
    const optionsArea = document.getElementById("options-area");
    optionsArea.innerHTML = ""; 

    shuffledOptions.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, qData.a);
        optionsArea.appendChild(btn);
    });
}

function checkAnswer(selected, correct) {
    if (isGameOver) return;
    if (selected === correct) {
        currentStep++;
        targetPlayerPos = 25 + (currentStep / totalSteps) * (safeZone - 25);
        if (currentStep < totalSteps) loadQuestion(); 
        else {
            document.getElementById("options-area").innerHTML = "";
            document.getElementById("monster-question").innerText = "안전지대로 달리는 중... 🏃💨";
        }
    } else {
        endGame(false, "🩸 오답! 괴물에게 잡혔습니다...");
    }
}

function endGame(isWin, msg) {
    isGameOver = true; cancelAnimationFrame(animationId);
    document.getElementById("game-board").classList.add("hidden");
    
    const resultScreen = document.getElementById("result-screen");
    const resultMsg = document.getElementById("result-msg");
    if(resultScreen) resultScreen.classList.remove("hidden");

    if (isWin) {
        resultMsg.innerText = msg; resultMsg.style.color = "#2ecc71";
        document.getElementById("status-text").innerText = "게임 클리어!";
        document.getElementById("player-img").src = getImg("cat_happy.png"); 
    } else {
        document.getElementById("monster").style.left = document.getElementById("player").style.left;
        document.getElementById("player-img").src = getImg("cat_caught.png"); 
        document.getElementById("monster-img").src = getImg("monster_evil.png"); 
        resultMsg.innerText = msg; resultMsg.style.color = "#e74c3c";
        document.getElementById("status-text").innerText = "게임 오버!";
    }
}