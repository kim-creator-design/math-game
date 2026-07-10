// 특수각 문제 데이터 (보기에 분수는 보기 좋게 작성)
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
const totalSteps = 6; // 6문제를 연속으로 맞춰야 탈출 성공!

// 게임 상태 변수
let playerPos = 25;
let targetPlayerPos = 25;
let monsterPos = 5;
const safeZone = 85;

let isGameOver = false;
let animationId = null;
let lastTime = 0;

// 게임 초기화
function initGame() {
    // 문제 리스트 섞기
    gameQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, totalSteps);
    currentStep = 0;
    
    playerPos = 25;
    targetPlayerPos = 25;
    monsterPos = 5;
    isGameOver = false;
    lastTime = performance.now();
    
    document.getElementById("monster").style.left = monsterPos + "%";
    document.getElementById("player").style.left = playerPos + "%";
    document.getElementById("player").innerText = "🐱";
    
    document.getElementById("game-board").classList.remove("hidden");
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("status-text").innerText = "괴물이 쫓아옵니다! 빨리 정답을 고르세요!";
    
    loadQuestion();
    
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

// 실시간 게임 루프 (괴물의 추격)
function gameLoop(time) {
    if (isGameOver) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    // 몬스터는 초당 약 1.8% 이동 (난이도 조절)
    const monsterSpeed = 1.8; // % per second
    monsterPos += (monsterSpeed * deltaTime) / 1000;
    
    // 플레이어는 목표 위치를 향해 부드럽게 이동
    if (playerPos < targetPlayerPos) {
        playerPos += (15 * deltaTime) / 1000; // 초당 15% 속도로 도약
        if (playerPos > targetPlayerPos) playerPos = targetPlayerPos;
    }
    
    document.getElementById("monster").style.left = monsterPos + "%";
    document.getElementById("player").style.left = playerPos + "%";
    
    // 충돌 확인 (몬스터가 플레이어를 잡음)
    // 캐릭터 크기를 고려해 몬스터가 플레이어의 위치에 근접했는지 확인 (-3% 정도 여유)
    if (monsterPos >= playerPos - 3) { 
        endGame(false, "몬스터에게 따라잡혔습니다!");
        return;
    }
    
    // 승리 확인 (안전지대 도달)
    if (playerPos >= safeZone) {
        endGame(true, "🎉 탈출 성공! 특수각 마스터!");
        return;
    }
    
    animationId = requestAnimationFrame(gameLoop);
}

// 문제 화면에 표시
function loadQuestion() {
    if (currentStep >= totalSteps) return;
    
    const qData = gameQuestions[currentStep];
    document.getElementById("monster-question").innerText = qData.q;
    
    // 보기 버튼들 섞어서 화면에 넣기
    const shuffledOptions = qData.options.sort(() => Math.random() - 0.5);
    const optionsArea = document.getElementById("options-area");
    optionsArea.innerHTML = ""; // 기존 버튼 지우기

    shuffledOptions.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, qData.a);
        optionsArea.appendChild(btn);
    });
}

// 정답 확인 로직
function checkAnswer(selected, correct) {
    if (isGameOver) return;
    
    if (selected === correct) {
        // 정답! 주인공 전진 목표 업데이트
        currentStep++;
        targetPlayerPos = 25 + (currentStep / totalSteps) * (safeZone - 25);
        
        if (currentStep < totalSteps) {
            loadQuestion(); // 다음 문제
        } else {
            // 모든 문제를 맞히면 안전지대 도착까지 잠시 대기
            document.getElementById("options-area").innerHTML = "";
            document.getElementById("monster-question").innerText = "안전지대로 달리는 중... 🏃💨";
        }
    } else {
        // 오답! 즉시 게임 오버
        endGame(false, "🩸 오답! 괴물에게 잡혔습니다...");
    }
}

// 게임 종료 처리
function endGame(isWin, msg) {
    isGameOver = true;
    cancelAnimationFrame(animationId);
    
    document.getElementById("game-board").classList.add("hidden");
    const resultScreen = document.getElementById("result-screen");
    const resultMsg = document.getElementById("result-msg");
    const monster = document.getElementById("monster");
    const player = document.getElementById("player");

    resultScreen.classList.remove("hidden");

    if (isWin) {
        resultMsg.innerText = msg;
        resultMsg.style.color = "#2ecc71";
        document.getElementById("status-text").innerText = "게임 클리어!";
    } else {
        // 오답 시 괴물이 순식간에 고양이의 위치를 덮침!
        monster.style.left = player.style.left;
        player.innerText = "😿"; // 뼈(💀) 대신 엉엉 우는 고양이로 변경
        resultMsg.innerText = msg;
        resultMsg.style.color = "#e74c3c";
        document.getElementById("status-text").innerText = "게임 오버!";
    }
}

// 게임 시작
initGame();