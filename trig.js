const questions = [
    { title: "sin (사인)", top: "높이", bottom: "빗변" },
    { title: "cos (코사인)", top: "밑변", bottom: "빗변" },
    { title: "tan (탄젠트)", top: "높이", bottom: "밑변" }
];

let currentLevel = 0;
let topValue = "";
let bottomValue = "";

function loadQuestion() {
    document.getElementById("question-title").innerText = questions[currentLevel].title;
    resetSlots();
    document.getElementById("message").innerText = "";
}

function selectWord(word) {
    const slotTop = document.getElementById("slot-top");
    const slotBottom = document.getElementById("slot-bottom");

    // 분자(위쪽)가 비어있으면 먼저 채움
    if (topValue === "") {
        topValue = word;
        slotTop.innerText = word;
        slotTop.classList.add("filled");
    } 
    // 분자가 차있고 분모(아래쪽)가 비어있으면 채움
    else if (bottomValue === "") {
        bottomValue = word;
        slotBottom.innerText = word;
        slotBottom.classList.add("filled");
        
        // 두 개가 다 찼으니 정답 검사 실행
        setTimeout(checkAnswer, 300);
    }
}

function resetSlots() {
    topValue = "";
    bottomValue = "";
    const slotTop = document.getElementById("slot-top");
    const slotBottom = document.getElementById("slot-bottom");
    
    slotTop.innerText = "분자 (?)";
    slotTop.classList.remove("filled");
    
    slotBottom.innerText = "분모 (?)";
    slotBottom.classList.remove("filled");
}

function checkAnswer() {
    const correctTop = questions[currentLevel].top;
    const correctBottom = questions[currentLevel].bottom;
    const msgElement = document.getElementById("message");

    if (topValue === correctTop && bottomValue === correctBottom) {
        msgElement.innerText = "🎉 정답입니다! 완벽해요!";
        msgElement.className = "message success-msg";
        
        setTimeout(() => {
            currentLevel++;
            if (currentLevel < questions.length) {
                loadQuestion();
            } else {
                msgElement.innerText = "🏆 모든 공식을 마스터했습니다!";
                document.getElementById("question-title").innerText = "CLEAR!";
            }
        }, 1500);
    } else {
        msgElement.innerText = "❌ 앗, 다시 생각해 볼까요?";
        msgElement.className = "message error-msg";
        setTimeout(() => {
            resetSlots();
            msgElement.innerText = "";
        }, 1200);
    }
}

// 게임 시작
loadQuestion();