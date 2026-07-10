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

// 게임 초기화
function initGame() {
    // 문제 리스트 섞기
    gameQuestions = allQuestions.sort(() => Math.random() - 0.5).slice(0, totalSteps);
    currentStep = 0;
    updateTrack();
    loadQuestion();
}

// 문제 화면에 표시
function loadQuestion() {
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
    if (selected === correct) {
        // 정답! 주인공 전진
        currentStep++;
        updateTrack();
        
        if (currentStep >= totalSteps) {
            endGame(true); // 탈출 성공
        } else {
            loadQuestion(); // 다음 문제
        }
    } else {
        // 오답! 즉시 게임 오버
        endGame(false);
    }
}

// 달리기 트랙 위치 업데이트 (괴물과 주인공이 동시에 역동적으로 이동!)
function updateTrack() {
    const monster = document.getElementById("monster");
    const player = document.getElementById("player");
    
    // 총 6단계 동안 이동할 진행률 (0% ~ 55%)
    const progress = (currentStep / totalSteps) * 55; 
    
    // 괴물은 처음에 5%에서 시작해서 주인공과 함께 전진
    monster.style.left = (5 + progress) + "%";
    
    // 주인공은 처음에 25%에서 시작해서 괴물과 20% 간격을 유지하며 함께 전진
    player.style.left = (25 + progress) + "%";
}

// 게임 종료 처리 (잡혔을 때 괴물이 돌진하는 연출 유지)
function endGame(isWin) {
    document.getElementById("game-board").classList.add("hidden");
    const resultScreen = document.getElementById("result-screen");
    const resultMsg = document.getElementById("result-msg");
    const monster = document.getElementById("monster");
    const player = document.getElementById("player");

    resultScreen.classList.remove("hidden");

   // (앞부분 생략) ...
    if (isWin) {
        resultMsg.innerText = "🎉 탈출 성공! 특수각 마스터!";
        resultMsg.style.color = "#2ecc71";
    } else {
        // 오답 시 괴물이 순식간에 고양이의 위치를 덮침!
        monster.style.left = player.style.left;
        player.innerText = "😿"; // 뼈(💀) 대신 엉엉 우는 고양이로 변경
        resultMsg.innerText = "🩸 괴물에게 잡혔습니다... (오답)";
        resultMsg.style.color = "#e74c3c";
        document.getElementById("status-text").innerText = "게임 오버!";
    }
}

// 게임 시작
initGame();