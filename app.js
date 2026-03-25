const state = {
    data: null,
    selectedTables: [],
    selectedOps: [],
    cardCount: null,
    mode: 'kind',
    currentStep: 1,
    cards: [],
    deck: [],
    foutPile: [],
    juistPile: [],
    currentCard: null,
    round: 1,
    cardShownAt: 0,
    correctCount: 0,
    wrongCount: 0,
    correctTimes: [],
    timeLimit: 0,
    timerId: null,
};

// DOM refs
const optiesInfoTafels = document.querySelector('#info-tafels span');
const optiesInfoOps = document.querySelector('#info-ops span');
const optiesInfoKaarten = document.querySelector('#info-kaarten span');
const optiesInfoMode = document.querySelector('#info-mode span');
const optiesInfoTimer = document.querySelector('#info-timer span');
const tafelButtonsContainer = document.getElementById('tafel-buttons');
const selectAllBtn = document.getElementById('select-all');
const next1Btn = document.getElementById('next1');
const opsButtons = document.querySelectorAll('.op-btn');
const back2Btn = document.getElementById('back2');
const next2Btn = document.getElementById('next2');
const countButtonsContainer = document.getElementById('count-buttons');
const beschikbaarInfo = document.getElementById('beschikbaar-info');
const back3Btn = document.getElementById('back3');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// --- Sound effects (Web Audio API) ---

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = localStorage.getItem('soundEnabled') === 'true';

function updateSoundToggle() {
    const toggle = document.getElementById('sound-toggle');
    toggle.classList.toggle('active', soundEnabled);
    toggle.setAttribute('aria-checked', soundEnabled);
    toggle.querySelector('.sound-toggle-label').textContent = soundEnabled ? 'Aan' : 'Uit';
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundToggle();
    if (soundEnabled && audioCtx.state === 'suspended') audioCtx.resume();
}

function getPRKey() {
    const tables = [...state.selectedTables].sort((a, b) => Number(a) - Number(b)).join(',');
    const ops = [...state.selectedOps].sort().join(',');
    return `pr_${tables}_${ops}`;
}

function getAllPRKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('pr_')) keys.push(key);
    }
    return keys;
}

function getPersonalRecord() {
    const val = localStorage.getItem(getPRKey());
    return val ? Number(val) : null;
}

function setPersonalRecord(avgTime) {
    localStorage.setItem(getPRKey(), avgTime);
    updatePRDisplay();
}

function resetAllPersonalRecords() {
    getAllPRKeys().forEach(key => localStorage.removeItem(key));
    updatePRDisplay();
}

function parsePRKey(key) {
    // pr_1,2,3_multiplication,division
    const parts = key.split('_');
    const tables = parts[1].split(',');
    const ops = parts[2].split(',');
    return { tables, ops };
}

function updatePRDisplay() {
    const prKeys = getAllPRKeys();
    const prList = document.getElementById('pr-list');
    const prReset = document.getElementById('pr-reset');

    if (prKeys.length === 0) {
        prList.innerHTML = '<div class="pr-list-empty">Nog geen records</div>';
        prReset.disabled = true;
        return;
    }

    prReset.disabled = false;
    const allTables = Object.keys(state.data).sort((a, b) => Number(a) - Number(b));
    const allOps = [['multiplication', 'X'], ['division', ':']];

    // Sort by best time
    const entries = prKeys.map(key => ({
        key,
        time: Number(localStorage.getItem(key)),
        ...parsePRKey(key),
    })).sort((a, b) => a.time - b.time);

    prList.innerHTML = entries.map(entry => {
        const tafelBadges = allTables.map(t => {
            const active = entry.tables.includes(t);
            return `<span class="tafel-badge${active ? '' : ' badge-dim'}" style="--badge-color:${state.data[t].color};width:18px;height:18px;font-size:0.55rem;">${t}</span>`;
        }).join('');

        const opBadges = allOps.map(([op, label]) => {
            const active = entry.ops.includes(op);
            return `<span class="op-badge${active ? '' : ' badge-dim'}" style="width:18px;height:18px;font-size:0.55rem;">${label}</span>`;
        }).join('');

        return `<div class="pr-entry">
            <div class="pr-entry-options">
                <div class="pr-entry-badges">${tafelBadges}</div>
                <div class="pr-entry-meta">${opBadges}</div>
            </div>
            <div class="pr-entry-value">${entry.time.toFixed(2)}s</div>
        </div>`;
    }).join('');
}

function checkPersonalRecord(avgTime) {
    const prevPR = getPersonalRecord();
    const isNew = prevPR === null || avgTime < prevPR;
    if (isNew) setPersonalRecord(avgTime);
    return { isNew, prevPR };
}

function playSelectSound() {
    if (!soundEnabled) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);  // A4
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.06);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
}

function playDeselectSound() {
    if (!soundEnabled) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);  // A4
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.06);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
}

function playTapSound() {
    if (!soundEnabled) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
}

function playCorrectSound() {
    if (!soundEnabled) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, now);       // C5
    osc.frequency.setValueAtTime(659, now + 0.08); // E5
    osc.frequency.setValueAtTime(784, now + 0.16); // G5
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
}

function playWrongSound() {
    if (!soundEnabled) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
}

// Load data and init
state.data = MAALTAFELS_DATA;
init();

function init() {
    renderTafelButtons();
    renderCountButtons();
    attachEventListeners();
    updateOptiesinfo();
}

// --- Step 1: Tafel buttons ---

function renderTafelButtons() {
    const tables = Object.keys(state.data).sort((a, b) => Number(a) - Number(b));
    tafelButtonsContainer.innerHTML = '';
    for (const t of tables) {
        const btn = document.createElement('button');
        btn.className = 'toggle-btn tafel-btn';
        btn.dataset.table = t;
        btn.textContent = t;
        btn.style.setProperty('--btn-color', state.data[t].color);
        if (!state.data[t].enabled) {
            btn.disabled = true;
        } else {
            btn.addEventListener('click', () => toggleTable(t));
        }
        tafelButtonsContainer.appendChild(btn);
    }
}

function toggleTable(t) {
    const idx = state.selectedTables.indexOf(t);
    if (idx === -1) {
        state.selectedTables.push(t);
        playSelectSound();
    } else {
        state.selectedTables.splice(idx, 1);
        playDeselectSound();
    }
    updateTafelButtonStates();
    updateSelectAllLabel();
    validateStep1();
    updateOptiesinfo();
}

function updateTafelButtonStates() {
    document.querySelectorAll('.tafel-btn').forEach(btn => {
        btn.classList.toggle('active', state.selectedTables.includes(btn.dataset.table));
    });
}

function getEnabledTables() {
    return Object.keys(state.data).filter(t => state.data[t].enabled);
}

function updateSelectAllLabel() {
    const allTables = getEnabledTables();
    const allSelected = allTables.every(t => state.selectedTables.includes(t));
    selectAllBtn.textContent = allSelected ? 'Alles deselecteren' : 'Alles selecteren';
}

function selectAll() {
    const allTables = getEnabledTables();
    const allSelected = allTables.every(t => state.selectedTables.includes(t));
    if (allSelected) {
        state.selectedTables = [];
        playDeselectSound();
    } else {
        state.selectedTables = [...allTables];
        playSelectSound();
    }
    updateTafelButtonStates();
    updateSelectAllLabel();
    validateStep1();
    updateOptiesinfo();
}

function validateStep1() {
    next1Btn.disabled = state.selectedTables.length === 0;
}

// --- Step 2: Operations ---

function toggleOp(opBtn) {
    const op = opBtn.dataset.op;
    const idx = state.selectedOps.indexOf(op);
    if (idx === -1) {
        state.selectedOps.push(op);
        playSelectSound();
    } else {
        state.selectedOps.splice(idx, 1);
        playDeselectSound();
    }
    opsButtons.forEach(b => {
        b.classList.toggle('active', state.selectedOps.includes(b.dataset.op));
    });
    updateSelectAllOpsLabel();
    validateStep2();
    updateOptiesinfo();
}

function selectAllOps() {
    const allOps = ['multiplication', 'division'];
    const allSelected = allOps.every(op => state.selectedOps.includes(op));
    state.selectedOps = allSelected ? [] : [...allOps];
    allSelected ? playDeselectSound() : playSelectSound();
    opsButtons.forEach(b => {
        b.classList.toggle('active', state.selectedOps.includes(b.dataset.op));
    });
    updateSelectAllOpsLabel();
    validateStep2();
    updateOptiesinfo();
}

function updateSelectAllOpsLabel() {
    const btn = document.getElementById('select-all-ops');
    const allSelected = ['multiplication', 'division'].every(op => state.selectedOps.includes(op));
    btn.textContent = allSelected ? 'Alles deselecteren' : 'Alles selecteren';
}

function validateStep2() {
    next2Btn.disabled = state.selectedOps.length === 0;
}

// --- Step 3: Card count ---

function getAvailableCardCount() {
    return state.selectedTables.length * state.selectedOps.length * 11;
}

function renderCountButtons() {
    const counts = [10, 20, 30, 40, 50];
    countButtonsContainer.innerHTML = '';
    for (const c of counts) {
        const btn = document.createElement('button');
        btn.className = 'toggle-btn count-btn';
        btn.dataset.count = c;
        btn.textContent = c;
        btn.addEventListener('click', () => selectCount(c));
        countButtonsContainer.appendChild(btn);
    }
}

function updateCountButtons() {
    const available = getAvailableCardCount();
    beschikbaarInfo.textContent = `Je hebt ${available} kaartjes beschikbaar met je selectie.`;

    document.querySelectorAll('.count-btn').forEach(btn => {
        const c = Number(btn.dataset.count);
        btn.disabled = c > available;
        btn.classList.toggle('active', state.cardCount === c);
    });

    // Reset selection if it exceeds available
    if (state.cardCount !== null && state.cardCount > available) {
        state.cardCount = null;
    }
    validateStep3();
}

function selectCount(c) {
    const available = getAvailableCardCount();
    if (c > available) return;
    const wasSelected = state.cardCount === c;
    state.cardCount = wasSelected ? null : c;
    wasSelected ? playDeselectSound() : playSelectSound();
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.count) === state.cardCount);
    });
    validateStep3();
    updateOptiesinfo();
}

function selectMode(mode) {
    state.mode = mode;
    playTapSound();
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    updateOptiesinfo();
}

function selectTimer(seconds) {
    state.timeLimit = seconds;
    playTapSound();
    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.timer) === seconds);
    });
    updateOptiesinfo();
}

function autoSelectCount() {
    if (state.cardCount !== null) return;
    const available = getAvailableCardCount();
    if (available >= 20) {
        state.cardCount = 20;
    } else if (available >= 10) {
        state.cardCount = 10;
    }
}

function validateStep3() {
    startBtn.disabled = state.cardCount === null;
}

// --- Optiesinfo ---

function updateResetBtn() {
    const hasSelections = state.selectedTables.length > 0 ||
        state.selectedOps.length > 0 ||
        state.cardCount !== null;
    resetBtn.disabled = !hasSelections;
    document.getElementById('menu-reset').disabled = !hasSelections;
}

function updateOptiesinfo() {
    // Tafels — always show all, dim unselected
    const allTables = Object.keys(state.data).sort((a, b) => Number(a) - Number(b));
    optiesInfoTafels.innerHTML = allTables.map(t => {
        const selected = state.selectedTables.includes(t);
        return `<span class="tafel-badge${selected ? '' : ' badge-dim'}" style="--badge-color:${state.data[t].color}">${t}</span>`;
    }).join('');

    // Bewerkingen — always show both, dim unselected
    const allOps = [['multiplication', 'X'], ['division', ':']];
    optiesInfoOps.innerHTML = allOps.map(([op, label]) => {
        const selected = state.selectedOps.includes(op);
        return `<span class="op-badge${selected ? '' : ' badge-dim'}">${label}</span>`;
    }).join('');

    // Kaartjes
    const available = getAvailableCardCount();
    if (state.cardCount === null) {
        optiesInfoKaarten.innerHTML = `<span class="info-badge count-badge badge-dim">-</span> / <span class="info-badge count-badge badge-dim">${available}</span>`;
    } else {
        optiesInfoKaarten.innerHTML = `<span class="info-badge count-badge">${state.cardCount}</span> / <span class="info-badge count-badge badge-dim">${available}</span>`;
    }

    // Mode
    const modeLabel = state.mode === 'kind' ? 'Kind' : 'Ouder';
    optiesInfoMode.innerHTML = `<span class="info-badge mode-badge">${modeLabel}</span>`;

    // Timer
    const timerLabel = state.timeLimit > 0 ? `${state.timeLimit}s` : '∞';
    optiesInfoTimer.innerHTML = `<span class="info-badge timer-badge">${timerLabel}</span>`;

    updateResetBtn();
}

// --- Navigation ---

function goToStep(step) {
    state.currentStep = step;
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));

    if (step === 1) document.getElementById('step1').classList.add('active');
    if (step === 2) document.getElementById('step2').classList.add('active');
    if (step === 3) {
        autoSelectCount();
        updateCountButtons();
        updateOptiesinfo();
        document.getElementById('step3').classList.add('active');
    }
    if (step === 'practice') {
        document.getElementById('practice').classList.add('active');
        startPractice();
    }
    if (step === 'exercise') {
        document.getElementById('exercise').classList.add('active');
    }
}

function resetState() {
    state.selectedTables = [];
    state.selectedOps = [];
    state.cardCount = null;
    state.mode = 'kind';
    state.currentStep = 1;
    state.cards = [];
    state.deck = [];
    state.foutPile = [];
    state.juistPile = [];
    state.currentCard = null;
    state.round = 1;
    state.cardShownAt = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.correctTimes = [];
    state.timeLimit = 0;
    clearTimerBar();

    updateTafelButtonStates();
    updateSelectAllLabel();
    validateStep1();

    opsButtons.forEach(b => b.classList.remove('active'));
    updateSelectAllOpsLabel();
    validateStep2();

    document.querySelectorAll('.count-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === 'kind');
    });
    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.timer === '0');
    });
    validateStep3();

    // Restore exercise DOM — beginExercise will rebuild it per mode
    const exercise = document.getElementById('exercise');
    exercise.innerHTML = `
        <div id="exercise-progress"></div>
        <div id="active-card"></div>
        <div id="exercise-buttons">
            <div class="exercise-col">
                <button id="btn-fout" class="exercise-btn fout">Fout</button>
                <div id="pile-fout" class="pile"></div>
            </div>
            <div class="exercise-col">
                <button id="btn-juist" class="exercise-btn juist">Juist</button>
                <div id="pile-juist" class="pile"></div>
            </div>
        </div>
        <button id="btn-spieken" class="action-btn secondary spieken-btn">Spieken</button>
    `;
    document.getElementById('btn-fout').addEventListener('click', () => answerCard(false));
    document.getElementById('btn-juist').addEventListener('click', () => answerCard(true));

    updateOptiesinfo();
    goToStep(1);
}

// --- Practice ---

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function buildDeck() {
    const cards = [];
    for (const t of state.selectedTables) {
        for (const op of state.selectedOps) {
            for (const card of state.data[t][op]) {
                cards.push({ ...card, table: t, op });
            }
        }
    }
    shuffle(cards);
    return cards.slice(0, state.cardCount);
}

function startPractice() {
    state.cards = buildDeck();

    const deckInfo = document.getElementById('deck-info');
    deckInfo.textContent = `${state.cards.length} kaartjes geschud!`;

    const cardArea = document.getElementById('card-area');
    cardArea.innerHTML = '';

    const areaW = cardArea.offsetWidth;
    const cardW = 140;
    const cardH = 70;

    // Calculate grid layout centered in the area
    const cols = Math.max(1, Math.floor(areaW / (cardW * 0.55)));
    const rows = Math.ceil(state.cards.length / cols);
    const spacingX = cardW * 0.5;
    const spacingY = cardH * 0.4;
    const totalW = (cols - 1) * spacingX + cardW;
    const totalH = (rows - 1) * spacingY + cardH;
    const offsetX = (areaW - totalW) / 2;

    // Resize card area to fit content
    cardArea.style.height = totalH + 20 + 'px';

    // Start position (center of area) for the animation origin
    const startX = areaW / 2 - cardW / 2;
    const startY = totalH / 2 - cardH / 2;

    const dealDuration = 80 + state.cards.length * 50;

    state.cards.forEach((card, i) => {
        const el = document.createElement('div');
        el.className = 'card';
        el.textContent = card.front;
        el.style.background = state.data[card.table].color;

        // Target position in a scattered grid
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Center the last row if it has fewer items
        const itemsInRow = row === rows - 1 ? state.cards.length - row * cols : cols;
        const rowOffsetX = (areaW - ((itemsInRow - 1) * spacingX + cardW)) / 2;
        const colInRow = row === rows - 1 ? i - row * cols : col;

        const x = rowOffsetX + colInRow * spacingX + (Math.random() - 0.5) * 8;
        const y = 10 + row * spacingY + (Math.random() - 0.5) * 6;
        const rot = (Math.random() - 0.5) * 12;

        // Start at center, animate to final position
        el.style.left = startX + 'px';
        el.style.top = startY + 'px';
        el.style.setProperty('--deal-rot', `${rot}deg`);

        cardArea.appendChild(el);

        // Stagger: move to position + fade in
        setTimeout(() => {
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.classList.add('dealt');
        }, 80 + i * 50);
    });

    // Show PR panel + "Beginnen!" button after deal animation completes
    const practicePR = document.getElementById('practice-pr');
    const beginBtn = document.getElementById('begin-btn');
    practicePR.style.display = 'none';
    beginBtn.style.display = 'none';

    const pr = getPersonalRecord();
    if (pr !== null) {
        practicePR.innerHTML = `Je huidige persoonlijk record is <strong class="practice-pr-value">${pr.toFixed(2)}s</strong>. Succes!`;
    }

    setTimeout(() => {
        if (pr !== null) practicePR.style.display = '';
        beginBtn.style.display = '';
    }, dealDuration + 400);
}

// --- Exercise ---

function beginExercise() {
    state.deck = [...state.cards];
    shuffle(state.deck);
    state.foutPile = [];
    state.juistPile = [];
    state.round = 1;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.correctTimes = [];
    state.exerciseStartedAt = performance.now();

    // Set up exercise DOM based on mode
    const timerBarHtml = state.timeLimit > 0 ? '<div class="timer-bar-container"><div id="timer-bar" class="timer-bar"></div></div>' : '';
    const exercise = document.getElementById('exercise');
    if (state.mode === 'kind') {
        exercise.innerHTML = `
            <div id="exercise-progress"></div>
            ${timerBarHtml}
            <div id="active-card"></div>
            <div id="mc-buttons" class="mc-grid"></div>
            <div id="exercise-buttons" class="exercise-piles-only">
                <div class="exercise-col">
                    <div class="pile-label fout-label">Fout</div>
                    <div id="pile-fout" class="pile"></div>
                </div>
                <div class="exercise-col">
                    <div class="pile-label juist-label">Juist</div>
                    <div id="pile-juist" class="pile"></div>
                </div>
            </div>
        `;
    } else {
        exercise.innerHTML = `
            <div id="exercise-progress"></div>
            ${timerBarHtml}
            <div id="active-card"></div>
            <div id="exercise-buttons">
                <div class="exercise-col">
                    <button id="btn-fout" class="exercise-btn fout">Fout</button>
                    <div id="pile-fout" class="pile"></div>
                </div>
                <div class="exercise-col">
                    <button id="btn-juist" class="exercise-btn juist">Juist</button>
                    <div id="pile-juist" class="pile"></div>
                </div>
            </div>
            <button id="btn-spieken" class="action-btn secondary spieken-btn">Spieken</button>
        `;
        document.getElementById('btn-fout').addEventListener('click', () => answerCard(false));
        document.getElementById('btn-juist').addEventListener('click', () => answerCard(true));
    }

    goToStep('exercise');
    showNextCard();
}

function mcConfettiFromBtn(btn) {
    const rect = btn.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
        particleCount: 40,
        spread: 60,
        startVelocity: 20,
        origin: { x, y },
        colors: ['#22c55e', '#4ade80', '#34d399', '#a3e635', '#fbbf24'],
        ticks: 60,
        scalar: 0.8,
    });
}

function mcShakeBtn(btn) {
    btn.classList.add('mc-wrong');
    setTimeout(() => btn.classList.remove('mc-wrong'), 500);
}

function generateMCOptions(card) {
    const correctAnswer = card.back;
    const correctNum = Number(correctAnswer);

    // Collect all possible answers from the same table + operation
    const tableData = state.data[card.table][card.op];
    let pool = tableData.map(c => Number(c.back)).filter(n => n !== correctNum && (correctNum === 0 || n !== 0));

    // If not enough distractors from same table, add from other selected tables
    if (pool.length < 3) {
        for (const t of state.selectedTables) {
            if (t === card.table) continue;
            for (const op of state.selectedOps) {
                const extras = state.data[t][op].map(c => Number(c.back)).filter(n => correctNum === 0 || n !== 0);
                pool.push(...extras);
            }
        }
        pool = pool.filter(n => n !== correctNum);
    }

    // Deduplicate
    pool = [...new Set(pool)];
    shuffle(pool);

    const distractors = pool.slice(0, 3);

    // If still not enough (very unlikely), generate nearby numbers
    while (distractors.length < 3) {
        const offset = distractors.length + 1;
        const candidate = correctNum + offset * (Math.random() > 0.5 ? 1 : -1);
        if (candidate > 0 && candidate !== correctNum && !distractors.includes(candidate)) {
            distractors.push(candidate);
        }
    }

    const options = [correctNum, ...distractors];
    shuffle(options);
    return options.map(n => String(n));
}

function startTimerBar() {
    if (state.timeLimit <= 0) return;
    clearTimerBar();
    const bar = document.getElementById('timer-bar');
    if (!bar) return;
    const duration = state.timeLimit * 1000;
    const start = performance.now();
    bar.style.width = '100%';
    bar.className = 'timer-bar';

    function tick() {
        const elapsed = performance.now() - start;
        const fraction = Math.max(0, 1 - elapsed / duration);
        bar.style.width = (fraction * 100) + '%';
        bar.style.transitionDuration = '0s';

        if (fraction <= 0.25) {
            bar.className = 'timer-bar danger';
        } else if (fraction <= 0.5) {
            bar.className = 'timer-bar warning';
        }

        if (fraction <= 0) {
            state.timerId = null;
            onTimerExpired();
            return;
        }
        state.timerId = requestAnimationFrame(tick);
    }
    state.timerId = requestAnimationFrame(tick);
}

function clearTimerBar() {
    if (state.timerId) {
        cancelAnimationFrame(state.timerId);
        state.timerId = null;
    }
}

function onTimerExpired() {
    if (!state.currentCard) return;
    playWrongSound();

    // Register the wrong answer and fly card to pile immediately
    answerCard(false, true);

    // Show countdown overlay before showing next card
    const exercise = document.getElementById('exercise');
    const overlay = document.createElement('div');
    overlay.className = 'timeout-overlay';
    overlay.innerHTML = '<div class="timeout-text">Net te laat!</div><div class="timeout-countdown">Volgende vraag in <span id="timeout-num">3</span></div>';
    exercise.appendChild(overlay);

    const numEl = overlay.querySelector('#timeout-num');
    let count = 3;
    numEl.classList.add('timeout-num-pop');

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.textContent = count;
            numEl.classList.remove('timeout-num-pop');
            void numEl.offsetHeight;
            numEl.classList.add('timeout-num-pop');
        } else {
            clearInterval(countdownInterval);
            overlay.remove();
            showNextCard();
        }
    }, 1000);
}

function showNextCard() {
    const activeCardEl = document.getElementById('active-card');
    const progress = document.getElementById('exercise-progress');

    if (state.deck.length === 0) {
        // Round finished — check fout pile
        if (state.foutPile.length === 0) {
            showFinished();
            return;
        }
        // Move fout pile back to deck
        state.round++;
        state.deck = [...state.foutPile];
        shuffle(state.deck);
        state.foutPile = [];
        updatePiles();
        progress.textContent = `Ronde ${state.round} — ${state.deck.length} kaartje${state.deck.length === 1 ? '' : 's'} opnieuw`;
    }

    state.currentCard = state.deck.shift();
    state.cardShownAt = performance.now();
    const remaining = state.deck.length + 1;

    if (!progress.textContent.startsWith('Ronde')) {
        progress.textContent = `Ronde ${state.round} — nog ${remaining} kaartje${remaining === 1 ? '' : 's'}`;
    }

    const bg = state.data[state.currentCard.table].color;

    // Build card with front and back faces
    activeCardEl.style.transition = 'none';
    activeCardEl.style.opacity = '0';
    activeCardEl.style.transform = 'none';
    activeCardEl.innerHTML = `
        <div id="active-card-inner">
            <div class="card-face card-front" style="background:${bg}">${state.currentCard.front}</div>
            <div class="card-face card-back" style="background:${bg}">${state.currentCard.back}</div>
        </div>
    `;

    // Force reflow, then fade in
    activeCardEl.offsetHeight;
    activeCardEl.style.transition = 'opacity 0.25s ease';
    requestAnimationFrame(() => {
        activeCardEl.style.opacity = '1';
    });

    // Render MC buttons in kind mode
    if (state.mode === 'kind') {
        const mcContainer = document.getElementById('mc-buttons');
        const options = generateMCOptions(state.currentCard);
        mcContainer.innerHTML = '';
        for (const opt of options) {
            const btn = document.createElement('button');
            btn.className = 'mc-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                if (!state.currentCard) return;
                const correct = opt === state.currentCard.back;
                if (correct) {
                    btn.classList.add('mc-correct');
                    mcConfettiFromBtn(btn);
                    answerCard(true);
                } else {
                    mcShakeBtn(btn);
                    answerCard(false);
                }
            });
            mcContainer.appendChild(btn);
        }
    }

    startTimerBar();
}

function answerCard(correct, deferNext) {
    if (!state.currentCard) return;
    clearTimerBar();

    const elapsed = (performance.now() - state.cardShownAt) / 1000;
    if (correct) {
        state.correctCount++;
        state.correctTimes.push(elapsed);
        playCorrectSound();
    } else {
        state.wrongCount++;
        if (!deferNext) playWrongSound();
    }

    const activeCardEl = document.getElementById('active-card');
    const card = state.currentCard;
    state.currentCard = null;

    // Determine target pile and calculate where the new card will land
    const pileId = correct ? 'pile-juist' : 'pile-fout';
    const pileEl = document.getElementById(pileId);
    const pile = correct ? state.juistPile : state.foutPile;
    const step = 4; // must match renderPile step
    const pileCardW = 80;
    const pileCardH = 40;

    // Position of pile top-left in viewport
    const pileRect = pileEl.getBoundingClientRect();
    // The new card will be at index pile.length, centered in pile
    const targetTop = pileRect.top + pile.length * step;
    const targetLeft = pileRect.left + pileRect.width / 2 - pileCardW / 2;

    const cardRect = activeCardEl.getBoundingClientRect();
    const rot = (Math.random() - 0.5) * 8;

    // Scale: active card (320x160) -> pile card (80x40) — both 2:1, exact 0.25
    const scale = pileCardW / cardRect.width;

    // Translation: from active card center to target pile card center
    const dx = (targetLeft + pileCardW / 2) - (cardRect.left + cardRect.width / 2);
    const dy = (targetTop + pileCardH / 2) - (cardRect.top + cardRect.height / 2);

    // Animate: shrink and fly to exact pile position
    activeCardEl.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    activeCardEl.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${rot}deg)`;

    // Add to pile with fixed rotation
    card.pileRot = rot;
    if (correct) {
        state.juistPile.push(card);
    } else {
        state.foutPile.push(card);
    }

    // After animation lands, render pile (replaces flying card seamlessly) and show next
    setTimeout(() => {
        updatePiles();
        if (!deferNext) {
            const progress = document.getElementById('exercise-progress');
            const remaining = state.deck.length;
            if (remaining > 0) {
                progress.textContent = `Ronde ${state.round} — nog ${remaining} kaartje${remaining === 1 ? '' : 's'}`;
            }
            showNextCard();
        }
    }, 420);
}

function updatePiles() {
    renderPile('pile-fout', state.foutPile);
    renderPile('pile-juist', state.juistPile);
}

function renderPile(pileId, cards) {
    const pile = document.getElementById(pileId);
    pile.innerHTML = '';

    const step = 4;

    // Show all cards stacked with small vertical offset
    cards.forEach((card, i) => {
        const el = document.createElement('div');
        el.className = 'pile-card';
        el.style.background = state.data[card.table].color;
        el.style.setProperty('--pile-rot', `${card.pileRot}deg`);
        el.style.top = (i * step) + 'px';
        el.textContent = card.front;
        pile.appendChild(el);
    });

    // Set pile height to fit all cards
    pile.style.height = cards.length > 0 ? (cards.length - 1) * step + 44 + 'px' : '';

    // Count label
    const count = document.createElement('div');
    count.className = 'pile-count';
    count.textContent = cards.length > 0 ? cards.length : '';
    pile.appendChild(count);
}

function formatTotalTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function getStarRating() {
    const foutRatio = state.wrongCount / (state.correctCount + state.wrongCount);
    if (foutRatio === 0) return 3;
    if (foutRatio <= 0.15) return 2;
    return 1;
}

function getMotivation(stars) {
    const msgs3 = ['Waanzinnig!', 'Perfecte score!', 'Kampioen!', 'Ongelooflijk!', 'Supergoed!'];
    const msgs2 = ['Heel goed gedaan!', 'Knap werk!', 'Bijna perfect!', 'Sterk bezig!'];
    const msgs1 = ['Goed gedaan!', 'Goed geoefend!', 'Blijven oefenen!', 'Het lukt je!'];
    const pool = stars === 3 ? msgs3 : stars === 2 ? msgs2 : msgs1;
    return pool[Math.floor(Math.random() * pool.length)];
}

function showFinished() {
    const avgTimeNum = state.correctTimes.length > 0
        ? state.correctTimes.reduce((a, b) => a + b, 0) / state.correctTimes.length
        : 0;
    const avgTime = avgTimeNum.toFixed(2);
    const totalTime = formatTotalTime(performance.now() - state.exerciseStartedAt);
    const stars = getStarRating();
    const motivation = getMotivation(stars);
    const prResult = state.correctTimes.length > 0 ? checkPersonalRecord(avgTimeNum) : { isNew: false, prevPR: null };

    const starsHtml = [1, 2, 3].map(i =>
        `<span class="finish-star ${i <= stars ? 'star-earned' : 'star-empty'}" style="animation-delay:${i * 0.5}s">⭐</span>`
    ).join('');

    const prClass = prResult.isNew ? ' has-pr' : '';
    const prBadgeHtml = prResult.isNew ? '<span class="pr-badge stagger-in" style="animation-delay:1s">Nieuw PR!</span>' : '';

    let prDeltaHtml = '';
    if (prResult.prevPR !== null) {
        const delta = avgTimeNum - prResult.prevPR;
        const deltaAbs = Math.abs(delta).toFixed(2);
        const isFaster = delta < 0;
        const prefix = isFaster ? '-' : '+';
        const deltaClass = isFaster ? 'pr-delta-faster' : 'pr-delta-slower';
        prDeltaHtml = `<div class="pr-delta ${deltaClass} stagger-in" style="animation-delay:1.1s">${prefix}${deltaAbs}s</div>`;
    }

    const exercise = document.getElementById('exercise');
    exercise.innerHTML = `
        <div class="finish-screen">
            <div class="finish-icon bounce-in">🏆</div>
            <div class="finish-stars">${starsHtml}</div>
            <h2 class="finish-motivation">${motivation}</h2>
            <p>${state.cards.length} kaartjes geoefend in ${state.round} ronde${state.round === 1 ? '' : 's'}</p>
            <div class="finish-stats">
                <div class="stat-item stat-juist stagger-in" style="animation-delay:0.6s">
                    <div class="stat-value">${state.correctCount}</div>
                    <div class="stat-label">Juist</div>
                </div>
                <div class="stat-item stat-fout stagger-in" style="animation-delay:0.75s">
                    <div class="stat-value">${state.wrongCount}</div>
                    <div class="stat-label">Fout</div>
                </div>
                <div class="stat-item stat-tijd${prClass} stagger-in" style="animation-delay:0.9s">
                    <div class="stat-value">${avgTime}s</div>
                    <div class="stat-label">Gem. per juist</div>
                    ${prDeltaHtml}
                    ${prBadgeHtml}
                </div>
                <div class="stat-item stat-totaal stagger-in" style="animation-delay:1.05s">
                    <div class="stat-value">${totalTime}</div>
                    <div class="stat-label">Totale tijd</div>
                </div>
            </div>
            <div class="finish-buttons">
                <button id="btn-restart-same" class="action-btn primary">Oefen opnieuw met dezelfde opties</button>
                <button id="btn-restart-new" class="action-btn secondary">Begin helemaal opnieuw</button>
            </div>
        </div>
    `;
    document.getElementById('btn-restart-same').addEventListener('click', restartWithSameOptions);
    document.getElementById('btn-restart-new').addEventListener('click', resetState);

    // Trophy confetti on tap/click (only with 3 stars)
    if (stars === 3) {
        const trophy = exercise.querySelector('.finish-icon');
        let trophyConfettiId = null;

        function startTrophyConfetti() {
            if (trophyConfettiId) return;
            const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
            (function burst() {
                const rect = trophy.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                confetti({ particleCount: 12, spread: 360, origin: { x, y }, colors, startVelocity: 20, gravity: 0.6, ticks: 60 });
                trophyConfettiId = requestAnimationFrame(burst);
            })();
        }

        function stopTrophyConfetti() {
            if (trophyConfettiId) {
                cancelAnimationFrame(trophyConfettiId);
                trophyConfettiId = null;
            }
        }

        trophy.style.cursor = 'pointer';
        trophy.style.userSelect = 'none';
        trophy.style.webkitUserSelect = 'none';
        trophy.addEventListener('pointerdown', (e) => { e.preventDefault(); startTrophyConfetti(); });
        trophy.addEventListener('pointerup', stopTrophyConfetti);
        trophy.addEventListener('pointerleave', stopTrophyConfetti);
        trophy.addEventListener('pointercancel', stopTrophyConfetti);
    }

    // Telemetry
    const totalMs = performance.now() - state.exerciseStartedAt;
    const sorted = [...state.selectedTables].sort((a, b) => Number(a) - Number(b));
    window.va?.('event', {
        name: 'round_completed',
        data: {
            mode: state.mode,
            tables: sorted.join(','),
            ops: state.selectedOps.join(','),
            cardCount: state.cards.length,
            rounds: state.round,
            correct: state.correctCount,
            wrong: state.wrongCount,
            avgTimePerCorrect: Number(avgTime),
            totalTimeSec: Math.round(totalMs / 1000),
        },
    });

    if (typeof gtag === 'function') {
        gtag('event', 'round_completed', {
            mode: state.mode,
            tables: sorted.join(','),
            ops: state.selectedOps.join(','),
            card_count: state.cards.length,
            rounds: state.round,
            correct: state.correctCount,
            wrong: state.wrongCount,
            avg_time_per_correct: Number(avgTime),
            total_time_sec: Math.round(totalMs / 1000),
        });
    }

    launchConfetti(stars);
}

function restartWithSameOptions() {
    state.cards = buildDeck();
    state.foutPile = [];
    state.juistPile = [];
    state.currentCard = null;
    state.round = 1;
    goToStep('practice');
}

function launchConfetti(stars) {
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

    // Star animation delays: 0.55s, 0.8s, 1.05s (delay + pop duration)
    const starTimings = [500, 1000, 1500];

    for (let i = 0; i < stars; i++) {
        if (stars === 3 && i === 2) {
            // Third star: 1.5s confetti stream
            setTimeout(() => {
                const end = Date.now() + 500;
                (function stream() {
                    confetti({ particleCount: 8, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors });
                    confetti({ particleCount: 8, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors });
                    if (Date.now() < end) requestAnimationFrame(stream);
                })();
            }, starTimings[i]);
        } else {
            setTimeout(() => {
                confetti({ particleCount: 30, angle: 60, spread: 50, origin: { x: 0, y: 0.6 }, colors });
                confetti({ particleCount: 30, angle: 120, spread: 50, origin: { x: 1, y: 0.6 }, colors });
            }, starTimings[i]);
        }
    }
}

function spieken() {
    if (!state.currentCard) return;
    const inner = document.getElementById('active-card-inner');
    if (!inner || inner.classList.contains('flipped')) return;

    inner.classList.add('flipped');

    // Flip back after showing the answer
    setTimeout(() => {
        inner.classList.remove('flipped');
    }, 500);
}

function confirmReset() {
    if (confirm('Wil je opnieuw beginnen? Alle selecties worden gewist.')) {
        resetState();
    }
}

// --- Event listeners ---

function attachEventListeners() {
    selectAllBtn.addEventListener('click', selectAll);
    next1Btn.addEventListener('click', () => { playTapSound(); goToStep(2); });
    opsButtons.forEach(btn => btn.addEventListener('click', () => toggleOp(btn)));
    document.getElementById('select-all-ops').addEventListener('click', selectAllOps);
    back2Btn.addEventListener('click', () => { playTapSound(); goToStep(1); });
    next2Btn.addEventListener('click', () => { playTapSound(); goToStep(3); });
    back3Btn.addEventListener('click', () => { playTapSound(); goToStep(2); });
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMode(btn.dataset.mode));
    });
    document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.addEventListener('click', () => selectTimer(Number(btn.dataset.timer)));
    });
    startBtn.addEventListener('click', () => { playTapSound(); goToStep('practice'); });
    document.getElementById('begin-btn').addEventListener('click', () => { playTapSound(); beginExercise(); });
    document.getElementById('btn-fout').addEventListener('click', () => answerCard(false));
    document.getElementById('btn-juist').addEventListener('click', () => answerCard(true));
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-spieken') spieken();
    });
    resetBtn.addEventListener('click', confirmReset);

    // Menu
    const menuBtn = document.getElementById('menu-btn');
    const menuDropdown = document.getElementById('menu-dropdown');
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => {
        menuDropdown.style.display = 'none';
    });
    document.getElementById('menu-reset').addEventListener('click', confirmReset);

    // Settings
    const settingsOverlay = document.getElementById('settings-overlay');
    updateSoundToggle();
    updatePRDisplay();
    document.getElementById('settings-btn').addEventListener('click', () => {
        updatePRDisplay();
        settingsOverlay.style.display = 'flex';
    });
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
    document.getElementById('pr-reset').addEventListener('click', () => {
        if (confirm('Wil je je persoonlijk record wissen?')) {
            resetAllPersonalRecords();
        }
    });
    document.getElementById('settings-close').addEventListener('click', () => {
        settingsOverlay.style.display = 'none';
    });
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) settingsOverlay.style.display = 'none';
    });

    // Feedback
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackSuccess = document.getElementById('feedback-success');
    document.getElementById('menu-feedback').addEventListener('click', () => {
        feedbackOverlay.style.display = 'flex';
    });
    document.getElementById('feedback-cancel').addEventListener('click', () => {
        feedbackOverlay.style.display = 'none';
    });
    document.getElementById('feedback-close').addEventListener('click', () => {
        feedbackOverlay.style.display = 'none';
        feedbackForm.style.display = '';
        feedbackSuccess.style.display = 'none';
        feedbackForm.reset();
    });
    feedbackOverlay.addEventListener('click', (e) => {
        if (e.target === feedbackOverlay) {
            feedbackOverlay.style.display = 'none';
        }
    });
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = feedbackForm.querySelector('[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Versturen...';
        try {
            await fetch(feedbackForm.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(feedbackForm))),
            });
            feedbackForm.style.display = 'none';
            feedbackSuccess.style.display = '';
        } catch {
            alert('Versturen mislukt. Probeer later opnieuw.');
        }
        btn.disabled = false;
        btn.textContent = 'Verstuur';
    });

    // Info
    const infoOverlay = document.getElementById('info-overlay');
    document.getElementById('menu-info').addEventListener('click', () => {
        infoOverlay.style.display = 'flex';
    });
    document.getElementById('info-close').addEventListener('click', () => {
        infoOverlay.style.display = 'none';
    });
    infoOverlay.addEventListener('click', (e) => {
        if (e.target === infoOverlay) {
            infoOverlay.style.display = 'none';
        }
    });

    // Install
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
    });

    const installOverlay = document.getElementById('install-overlay');
    const installInstructions = document.getElementById('install-instructions');
    const menuInstallBtn = document.getElementById('menu-install');
    const installBanner = document.getElementById('install-banner');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);

    // Only show install options on mobile and not already installed
    if (isStandalone || !isMobile) {
        menuInstallBtn.style.display = 'none';
    } else {
        installBanner.style.display = 'flex';
    }

    function triggerInstall() {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then(() => {
                deferredInstallPrompt = null;
            });
        } else {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIOS) {
                installInstructions.innerHTML = `
                    <p>Volg deze stappen om Maaltafels L2 als app te installeren:</p>
                    <p><strong>1.</strong> Tik op het deel-icoon <span class="install-icon">⎙</span> onderaan in Safari</p>
                    <p><strong>2.</strong> Scroll naar beneden en tik op <strong>"Zet op beginscherm"</strong> (of <strong>"Add to Home Screen"</strong>)</p>
                    <p><strong>3.</strong> Tik op <strong>"Voeg toe"</strong></p>
                `;
            } else {
                installInstructions.innerHTML = `
                    <p>Volg deze stappen om Maaltafels L2 als app te installeren:</p>
                    <p><strong>1.</strong> Open het menu van je browser <span class="install-icon">⋮</span></p>
                    <p><strong>2.</strong> Tik op <strong>"App installeren"</strong> of <strong>"Toevoegen aan startscherm"</strong></p>
                `;
            }
            installOverlay.style.display = 'flex';
        }
    }

    function dismissBanner() {
        installBanner.style.display = 'none';
    }

    menuInstallBtn.addEventListener('click', triggerInstall);
    document.getElementById('install-banner-btn').addEventListener('click', () => {
        dismissBanner();
        triggerInstall();
    });
    document.getElementById('install-banner-close').addEventListener('click', dismissBanner);
    document.getElementById('install-close').addEventListener('click', () => {
        installOverlay.style.display = 'none';
    });
    installOverlay.addEventListener('click', (e) => {
        if (e.target === installOverlay) {
            installOverlay.style.display = 'none';
        }
    });
}
