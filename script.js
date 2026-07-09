let score = 0;
let currentAnswer = 0;

function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1~10 랜덤 숫자
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    document.getElementById('num1').innerText = num1;
    document.getElementById('num2').innerText = num2;
    document.getElementById('operator').innerText = op;

    if (op === '+') currentAnswer = num1 + num2;
    else if (op === '-') currentAnswer = num1 - num2;
    else if (op === '*') currentAnswer = num1 * num2;
}

function checkAnswer() {
    const inputElement = document.getElementById('answer-input');
    const userAnswer = parseInt(inputElement.value);
    const resultElement = document.getElementById('result-message');

    if (isNaN(userAnswer)) return;

    if (userAnswer === currentAnswer) {
        score += 10;
        resultElement.innerText = "🎉 정답입니다! (+10점)";
        resultElement.className = "result-message correct";
    } else {
        score -= 5;
        resultElement.innerText = `❌ 틀렸습니다! 정답은 ${currentAnswer}`;
        resultElement.className = "result-message wrong";
    }

    document.getElementById('score').innerText = score;
    inputElement.value = '';
    inputElement.focus();
    generateQuestion();
}

// 엔터키 작동
document.getElementById('answer-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkAnswer();
});
document.getElementById('submit-btn').addEventListener('click', checkAnswer);

// 게임 시작시 첫 문제 생성
generateQuestion();