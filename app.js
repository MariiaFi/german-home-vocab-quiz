/**
 * Deutsch lernen — Haushaltsgegenstände
 * Wortschatz + Quiz mit 3 Modi, Hell/Dunkel-Modus, Web Speech API
 * Reines Vanilla JavaScript, offline-fähig.
 */

// ========== WORTSCHATZ — 36 WÖRTER ==========
const VOCAB = [
    { de: "Stuhl", ipa: "[ʃtuːl]", ru: "стул" },
    { de: "Tisch", ipa: "[tɪʃ]", ru: "стол" },
    { de: "Bett", ipa: "[bɛt]", ru: "кровать" },
    { de: "Schrank", ipa: "[ʃʁaŋk]", ru: "шкаф" },
    { de: "Sofa", ipa: "[ˈzoːfa]", ru: "диван" },
    { de: "Lampe", ipa: "[ˈlampə]", ru: "лампа" },
    { de: "Teppich", ipa: "[ˈtɛpɪç]", ru: "ковер" },
    { de: "Vorhänge", ipa: "[ˈfoːɐ̯hɛŋə]", ru: "шторы" },
    { de: "Kissen", ipa: "[ˈkɪsn̩]", ru: "подушка" },
    { de: "Spiegel", ipa: "[ˈʃpiːɡl̩]", ru: "зеркало" },
    { de: "Regal", ipa: "[ʁeˈɡaːl]", ru: "полка" },
    { de: "Schreibtisch", ipa: "[ˈʃʁaɪ̯ptɪʃ]", ru: "письменный стол" },
    { de: "Sessel", ipa: "[ˈzɛsl̩]", ru: "кресло" },
    { de: "Pflanze", ipa: "[ˈp͡flant͡sə]", ru: "растение" },
    { de: "Uhr", ipa: "[uːɐ̯]", ru: "часы" },
    { de: "Fernseher", ipa: "[ˈfɛʁnˌzeːɐ]", ru: "телевизор" },
    { de: "Kühlschrank", ipa: "[ˈkyːlˌʃʁaŋk]", ru: "холодильник" },
    { de: "Backofen", ipa: "[ˈbakˌʔoːfn̩]", ru: "духовка" },
    { de: "Spüle", ipa: "[ˈʃpyːlə]", ru: "раковина" },
    { de: "Schüssel", ipa: "[ˈʃʏsl̩]", ru: "миска" },
    { de: "Teller", ipa: "[ˈtɛlɐ]", ru: "тарелка" },
    { de: "Glas", ipa: "[ɡlaːs]", ru: "стакан" },
    { de: "Gabel", ipa: "[ˈɡaːbl̩]", ru: "вилка" },
    { de: "Messer", ipa: "[ˈmɛsɐ]", ru: "нож" },
    { de: "Löffel", ipa: "[ˈlœfl̩]", ru: "ложка" },
    { de: "Pfanne", ipa: "[ˈp͡fanə]", ru: "сковорода" },
    { de: "Topf", ipa: "[tɔp͡f]", ru: "кастрюля" },
    { de: "Waschmaschine", ipa: "[ˈvaʃmaˌʃiːnə]", ru: "стиральная машина" },
    { de: "Staubsauger", ipa: "[ˈʃtaʊ̯pˌzaʊ̯ɡɐ]", ru: "пылесос" },
    { de: "Bügeleisen", ipa: "[ˈbyːɡl̩ˌʔaɪ̯zn̩]", ru: "утюг" },
    { de: "Nachttisch", ipa: "[ˈnaxtˌtɪʃ]", ru: "тумбочка" },
    { de: "Decke", ipa: "[ˈdɛkə]", ru: "одеяло" },
    { de: "Kleiderbügel", ipa: "[ˈklaɪ̯dɐˌbyːɡl̩]", ru: "вешалка" },
    { de: "Tür", ipa: "[tyːɐ̯]", ru: "дверь" },
    { de: "Fenster", ipa: "[ˈfɛnstɐ]", ru: "окно" },
    { de: "Kommode", ipa: "[kɔˈmoːdə]", ru: "комод" }
];

// ========== GLOBALER ZUSTAND ==========
let currentScreen = 'dict';
let quizMode = 'ru2de';
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let mistakesIds = [];
let totalQuestions = 0;

const appContent = document.getElementById('appContent');
const themeToggle = document.getElementById('themeToggle');
const backToDictBtn = document.getElementById('backToDictBtn');

const dictTemplate = document.getElementById('dict-screen-template');
const quizTemplate = document.getElementById('quiz-screen-template');

// ========== INITIALISIERUNG ==========
function initApp() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }

    renderDictScreen();

    themeToggle.addEventListener('click', toggleTheme);
    backToDictBtn.addEventListener('click', () => {
        if (currentScreen !== 'dict') renderDictScreen();
    });
}

// ========== THEMA ==========
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ========== WEB SPEECH API (DEUTSCH) ==========
function speakGerman(text) {
    if (!window.speechSynthesis) {
        alert('Web Speech API wird nicht unterstützt.');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.85; // Etwas langsamer für bessere Verständlichkeit
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// ========== WÖRTERBUCH ANZEIGEN ==========
function renderDictScreen() {
    currentScreen = 'dict';
    const clone = dictTemplate.content.cloneNode(true);
    appContent.innerHTML = '';
    appContent.appendChild(clone);

    const vocabGrid = document.getElementById('vocabGrid');
    const searchInput = document.getElementById('searchInput');
    const sortAz = document.getElementById('sortAzBtn');
    const sortRandom = document.getElementById('sortRandomBtn');
    const startQuizBtn = document.getElementById('startQuizFromDict');

    let currentVocab = [...VOCAB];

    function displayVocab(array) {
        vocabGrid.innerHTML = '';
        array.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'vocab-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="de-word">${item.de}</div>
                <div class="ipa">${item.ipa}</div>
                <div class="ru-word">${item.ru}</div>
                <button class="speak-btn" data-de="${item.de}">🔊 Sprechen</button>
            `;
            vocabGrid.appendChild(card);
        });

        document.querySelectorAll('.speak-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                speakGerman(btn.dataset.de);
            });
        });
    }

    displayVocab(currentVocab);

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = VOCAB.filter(item => 
            item.de.toLowerCase().includes(query) || 
            item.ru.toLowerCase().includes(query)
        );
        displayVocab(filtered);
    });

    sortAz.addEventListener('click', () => {
        const sorted = [...currentVocab].sort((a, b) => a.de.localeCompare(b.de));
        displayVocab(sorted);
    });

    sortRandom.addEventListener('click', () => {
        const shuffled = [...currentVocab].sort(() => Math.random() - 0.5);
        displayVocab(shuffled);
    });

    startQuizBtn.addEventListener('click', () => {
        renderQuizScreen('ru2de');
    });
}

// ========== QUIZ-FRAGEN GENERIEREN ==========
function generateQuizQuestions(mode) {
    const questions = [];
    const usedIndices = new Set();
    const questionCount = Math.min(10, VOCAB.length);
    
    while (questions.length < questionCount) {
        let randomIndex = Math.floor(Math.random() * VOCAB.length);
        if (usedIndices.has(randomIndex)) continue;
        usedIndices.add(randomIndex);

        const word = VOCAB[randomIndex];
        let questionType = mode;
        if (mode === 'mixed') {
            questionType = Math.random() < 0.5 ? 'ru2de' : 'de2ru';
        }

        const isRu2De = (questionType === 'ru2de');
        
        let correctAnswer, questionText, options;
        
        if (isRu2De) {
            questionText = word.ru;
            correctAnswer = word.de;
            let otherOptions = [];
            while (otherOptions.length < 3) {
                let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
                if (rand.de !== correctAnswer && !otherOptions.includes(rand.de)) {
                    otherOptions.push(rand.de);
                }
            }
            options = [correctAnswer, ...otherOptions];
        } else {
            questionText = word.de;
            correctAnswer = word.ru;
            let otherOptions = [];
            while (otherOptions.length < 3) {
                let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
                if (rand.ru !== correctAnswer && !otherOptions.includes(rand.ru)) {
                    otherOptions.push(rand.ru);
                }
            }
            options = [correctAnswer, ...otherOptions];
        }

        options = shuffleArray(options);

        questions.push({
            vocabIndex: randomIndex,
            questionText,
            correctAnswer,
            options,
            type: isRu2De ? 'ru2de' : 'de2ru'
        });
    }
    return questions;
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ========== QUIZ ANZEIGEN ==========
function renderQuizScreen(mode = 'ru2de') {
    currentScreen = 'quiz';
    quizMode = mode;
    currentQuestions = generateQuizQuestions(quizMode);
    currentQuestionIndex = 0;
    score = 0;
    mistakesIds = [];
    totalQuestions = currentQuestions.length;

    const clone = quizTemplate.content.cloneNode(true);
    appContent.innerHTML = '';
    appContent.appendChild(clone);

    const modeTitle = document.getElementById('quizModeTitle');
    const modeNames = {
        'ru2de': 'Russisch → Deutsch',
        'de2ru': 'Deutsch → Russisch',
        'mixed': 'Gemischt'
    };
    modeTitle.textContent = `Quiz: ${modeNames[quizMode]}`;

    document.getElementById('backToDictFromQuiz').addEventListener('click', renderDictScreen);
    document.getElementById('backToDictFromResult').addEventListener('click', renderDictScreen);
    
    updateProgressAndScore();
    renderQuestion(currentQuestionIndex);

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        } else {
            showQuizResult();
        }
        updateProgressAndScore();
    });

    document.getElementById('retryMistakesBtn')?.addEventListener('click', retryMistakes);
    document.getElementById('playAgainBtn')?.addEventListener('click', () => renderQuizScreen(quizMode));
}

function updateProgressAndScore() {
    const progressBar = document.getElementById('progressBar');
    const scoreCounter = document.getElementById('scoreCounter');
    if (progressBar) {
        const percent = (currentQuestionIndex / totalQuestions) * 100;
        progressBar.style.width = `${percent}%`;
    }
    if (scoreCounter) {
        scoreCounter.textContent = `Richtig: ${score} / ${totalQuestions}`;
    }
}

function renderQuestion(index) {
    const q = currentQuestions[index];
    if (!q) return;

    const questionWordEl = document.getElementById('questionWord');
    const optionsContainer = document.getElementById('optionsContainer');
    const nextBtn = document.getElementById('nextBtn');

    questionWordEl.textContent = q.questionText;
    
    if (q.type === 'de2ru') {
        const wordData = VOCAB[q.vocabIndex];
        if (wordData) {
            questionWordEl.innerHTML = `${wordData.de} <span style="font-size: 1rem; color: var(--text-secondary);">${wordData.ipa}</span>`;
        }
    }

    optionsContainer.innerHTML = '';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.addEventListener('click', (e) => handleAnswer(e, q.correctAnswer, q.vocabIndex));
        optionsContainer.appendChild(btn);
    });

    nextBtn.disabled = true;
}

function handleAnswer(event, correctAnswer, vocabIndex) {
    const selectedBtn = event.target;
    const allOptions = document.querySelectorAll('.option-btn');
    const nextBtn = document.getElementById('nextBtn');

    allOptions.forEach(btn => btn.disabled = true);

    const isCorrect = (selectedBtn.textContent === correctAnswer);
    
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('wrong');
        allOptions.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        if (!mistakesIds.includes(vocabIndex)) {
            mistakesIds.push(vocabIndex);
        }
    }

    updateProgressAndScore();
    nextBtn.disabled = false;
}

function showQuizResult() {
    document.querySelector('.quiz-card').classList.add('hidden');
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.classList.remove('hidden');
    
    const resultStats = document.getElementById('resultStats');
    const percent = Math.round((score / totalQuestions) * 100);
    resultStats.innerHTML = `✅ ${score} / ${totalQuestions} (${percent}%)`;
}

function retryMistakes() {
    if (mistakesIds.length === 0) {
        alert('Keine Fehler! Ausgezeichnete Arbeit!');
        renderQuizScreen(quizMode);
        return;
    }
    
    const mistakeWords = mistakesIds.map(id => VOCAB[id]);
    const mistakeQuestions = [];
    
    mistakeWords.forEach((word, idx) => {
        let otherOptions = [];
        while (otherOptions.length < 3) {
            let rand = VOCAB[Math.floor(Math.random() * VOCAB.length)];
            if (rand.de !== word.de && !otherOptions.includes(rand.de)) {
                otherOptions.push(rand.de);
            }
        }
        let options = [word.de, ...otherOptions];
        options = shuffleArray(options);
        mistakeQuestions.push({
            vocabIndex: mistakesIds[idx],
            questionText: word.ru,
            correctAnswer: word.de,
            options,
            type: 'ru2de'
        });
    });

    currentQuestions = mistakeQuestions;
    currentQuestionIndex = 0;
    score = 0;
    mistakesIds = [];
    totalQuestions = currentQuestions.length;

    document.querySelector('.quiz-card').classList.remove('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    renderQuestion(0);
    updateProgressAndScore();
    document.getElementById('quizModeTitle').textContent = 'Quiz: Fehler korrigieren';
}

// ========== START ==========
document.addEventListener('DOMContentLoaded', initApp);
