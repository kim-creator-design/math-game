/* trig.js 내용 수정 */

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

// *** 드래그 앤 드롭을 위한 함수들 *** //

// 1. 드롭 타겟에 드래그 오버를 허용하는 함수
function allowDrop(ev) {
    ev.preventDefault(); // 브라우저의 기본 동작을 막음 (드롭 허용)
}

// 2. 드래그를 시작할 때 데이터를 전달하는 함수
function drag(ev) {
    // 드래그하는 요소의 id("빗변", "밑변", "높이")와 텍스트를 저장
    ev.dataTransfer.setData("text", ev.target.innerText);
    ev.dataTransfer.setData("id", ev.target.id);
}

// 3. 드롭했을 때 데이터를 처리하는 함수
function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text"); // 드래그한 텍스트("빗변" 등)
    const slotTop = document.getElementById("slot-top");
    const slotBottom = document.getElementById("slot-bottom");

    // 드롭한 타겟이 분자(위) 슬롯이고, 비어있으면 채움
    if (ev.target.id === "slot-top" && topValue === "") {
        topValue = data;
        slotTop.innerText = data;
        slotTop.classList.add("filled");
    } 
    // 드롭한 타겟이 분모(아래) 슬롯이고, 비어있으면 채움
    else if (ev.target.id === "slot-bottom" && bottomValue === "") {
        bottomValue = data;
        slotBottom.innerText = data;
        slotBottom.classList.add("filled");
    }

    // 두 개가 다 찼으면 정답 검사 실행
    if (topValue !== "" && bottomValue !== "") {
        setTimeout(checkAnswer, 300);
    }
}

// (resetSlots, checkAnswer 함수는 기존 로직을 그대로 사용)
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