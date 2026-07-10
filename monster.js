// 특수각 문제 데이터
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

// 게임 상태 변수
let playerPos = 25;
let targetPlayerPos = 25;
let monsterPos = 0; // 시작 위치를 더 왼쪽으로 이동 (5 -> 0)
const safeZone = 85;

let isGameOver = false;
let animationId = null;
let lastTime = 0;

// ==========================================
// AI 이미지 배경(rgb 52, 73, 94) 투명화 로직
// ==========================================
const processedImages = {};
let isImagesReady = false;

function removeBackground(imageSrc, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const targetR = 52, targetG = 73, targetB = 94; // 트랙 배경색 #34495e
            const tolerance = 75; // AI 노이즈를 고려한 넉넉한 허용 오차
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i + 1], b = data[i + 2];
                if (Math.abs(r - targetR) < tolerance && 
                    Math.abs(g - targetG) < tolerance && 
                    Math.abs(b - targetB) < tolerance) {
                    data[i + 3] = 0; // Alpha 투명하게
                }
            }
            ctx.putImageData(imageData, 0, 0);
            callback(canvas.toDataURL());
        } catch (e) {
            callback(imageSrc); // CORS 에러 등의 경우 원본 반환
        }
    };
    img.onerror = () => callback(imageSrc);
    img.src = imageSrc;
}

function loadAndProcessImages(callback) {
    const imagesToProcess = ["cat_running.png", "cat_scared.png", "cat_caught.png", "cat_happy.png", "monster_running.png", "monster_evil.png"];
    let loadedCount = 0;
    
    imagesToProcess.forEach(src => {
        removeBackground(src, (dataUrl) => {
            processedImages[src] = dataUrl;
            loadedCount++;
            if (loadedCount === imagesToProcess.length) {
                isImagesReady = true;
                callback();
            }
        });
    });
}

function getImg(src) {
    return processedImages[src] || src;
}

// ==========================================
// 게임 로직
// ==========================================

function initGame() {
    if (!isImagesReady) {
        document.getElementById("status-text").innerText = "캐릭터 렌더링 중... 잠시만 기다려주세요!";
        loadAndProcessImages(initGame);
        return;
    }

    gameQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, totalSteps);
    currentStep = 0;
    
    playerPos = 25;
    targetPlayerPos = 25;
    monsterPos = 0; // 시작 위치 더 왼쪽으로 (5 -> 0)
    isGameOver = false;
    lastTime = performance.now();
    
    document.getElementById("monster").style.left = monsterPos + "%";
    document.getElementById("player").style.left = playerPos + "%";
    
    document.getElementById("player-img").src = getImg("cat_running.png");
    document.getElementById("monster-img").src = getImg("monster_running.png");
    
    document.getElementById("game-board").classList.remove("hidden");
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("status-text").innerText = "괴물이 쫓아옵니다! 빨리 정답을 고르세요!";
    
    loadQuestion();
    
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(time) {
    if (isGameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    const monsterSpeed = 4.0; // 추격 속도 4로 상향
    monsterPos += (monsterSpeed * deltaTime) / 1000;
    
    if (playerPos < targetPlayerPos) {
        playerPos += (15 * deltaTime) / 1000; 
        if (playerPos > targetPlayerPos) playerPos = targetPlayerPos;
    }
    
    document.getElementById("monster").style.left = monsterPos + "%";
    document.getElementById("player").style.left = playerPos + "%";
    
    // 표정 변화
    const distance = playerPos - monsterPos;
    let catImg = "cat_running.png";
    let monsterImg = "monster_running.png";

    if (distance <= 15) {
        catImg = "cat_scared.png";
        monsterImg = "monster_evil.png";
    } else if (distance <= 25) {
        catImg = "cat_scared.png";
        monsterImg = "monster_evil.png";
    }
    
    document.getElementById("player-img").src = getImg(catImg);
    document.getElementById("monster-img").src = getImg(monsterImg);
    
    // 충돌
    if (monsterPos >= playerPos - 12) { 
        endGame(false, "몬스터에게 따라잡혔습니다!");
        return;
    }
    
    if (playerPos >= safeZone) {
        endGame(true, "🎉 탈출 성공! 특수각 마스터!");
        return;
    }
    
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
        
        if (currentStep < totalSteps) {
            loadQuestion(); 
        } else {
            document.getElementById("options-area").innerHTML = "";
            document.getElementById("monster-question").innerText = "안전지대로 달리는 중... 🏃💨";
        }
    } else {
        endGame(false, "🩸 오답! 괴물에게 잡혔습니다...");
    }
}

function endGame(isWin, msg) {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    
    document.getElementById("game-board").classList.add("hidden");
    const resultScreen = document.getElementById("result-screen");
    const resultMsg = document.getElementById("result-msg");

    resultScreen.classList.remove("hidden");

    if (isWin) {
        resultMsg.innerText = msg;
        resultMsg.style.color = "#2ecc71";
        document.getElementById("status-text").innerText = "게임 클리어!";
        document.getElementById("monster-img").src = getImg("monster_running.png"); 
        document.getElementById("player-img").src = getImg("cat_happy.png"); 
    } else {
        document.getElementById("monster").style.left = document.getElementById("player").style.left;
        document.getElementById("player-img").src = getImg("cat_caught.png"); 
        document.getElementById("monster-img").src = getImg("monster_evil.png"); 
        resultMsg.innerText = msg;
        resultMsg.style.color = "#e74c3c";
        document.getElementById("status-text").innerText = "게임 오버!";
    }
}

// 게임 시작 트리거
initGame();