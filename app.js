const state = {
    data: null,
    selectedTables: [],
    selectedOps: [],
    cardCount: null,
    currentStep: 1,
    cards: [],
    deck: [],
    foutPile: [],
    juistPile: [],
    currentCard: null,
    round: 1,
};

// DOM refs
const optiesInfoTafels = document.querySelector('#info-tafels span');
const optiesInfoOps = document.querySelector('#info-ops span');
const optiesInfoKaarten = document.querySelector('#info-kaarten span');
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
    } else {
        state.selectedTables.splice(idx, 1);
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
    } else {
        state.selectedTables = [...allTables];
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
    } else {
        state.selectedOps.splice(idx, 1);
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
    state.cardCount = state.cardCount === c ? null : c;
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.count) === state.cardCount);
    });
    validateStep3();
    updateOptiesinfo();
}

function validateStep3() {
    startBtn.disabled = state.cardCount === null;
}

// --- Optiesinfo ---

function updateOptiesinfo() {
    // Tafels
    if (state.selectedTables.length === 0) {
        optiesInfoTafels.innerHTML = '-';
    } else {
        const sorted = [...state.selectedTables].sort((a, b) => Number(a) - Number(b));
        optiesInfoTafels.innerHTML = sorted.map(t =>
            `<span class="tafel-badge" style="background:${state.data[t].color}">${t}</span>`
        ).join(' ');
    }

    // Bewerkingen
    if (state.selectedOps.length === 0) {
        optiesInfoOps.textContent = '-';
    } else {
        const labels = state.selectedOps.map(op =>
            op === 'multiplication' ? 'X' : ':'
        );
        optiesInfoOps.textContent = labels.join(' en ');
    }

    // Kaartjes
    if (state.cardCount === null) {
        optiesInfoKaarten.textContent = '-';
    } else {
        optiesInfoKaarten.textContent = state.cardCount;
    }
}

// --- Navigation ---

function goToStep(step) {
    state.currentStep = step;
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));

    if (step === 1) document.getElementById('step1').classList.add('active');
    if (step === 2) document.getElementById('step2').classList.add('active');
    if (step === 3) {
        updateCountButtons();
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
    state.currentStep = 1;
    state.cards = [];
    state.deck = [];
    state.foutPile = [];
    state.juistPile = [];
    state.currentCard = null;
    state.round = 1;

    updateTafelButtonStates();
    updateSelectAllLabel();
    validateStep1();

    opsButtons.forEach(b => b.classList.remove('active'));
    validateStep2();

    document.querySelectorAll('.count-btn').forEach(btn => btn.classList.remove('active'));
    validateStep3();

    // Restore exercise DOM if it was replaced by finish screen
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

    // Show "Beginnen!" button after deal animation completes
    const beginBtn = document.getElementById('begin-btn');
    beginBtn.style.display = 'none';
    setTimeout(() => {
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

    goToStep('exercise');
    showNextCard();
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
    const remaining = state.deck.length + 1;

    if (!progress.textContent.startsWith('Ronde')) {
        progress.textContent = `Ronde ${state.round} — nog ${remaining} kaartje${remaining === 1 ? '' : 's'}`;
    }

    // Reset card appearance
    activeCardEl.className = '';
    activeCardEl.style.background = state.data[state.currentCard.table].color;
    activeCardEl.textContent = state.currentCard.front;

    // Small delay to allow CSS reset before showing
    requestAnimationFrame(() => {
        activeCardEl.style.opacity = '1';
        activeCardEl.style.transform = 'translateX(0) rotate(0)';
    });
}

function answerCard(correct) {
    if (!state.currentCard) return;

    const activeCardEl = document.getElementById('active-card');
    const card = state.currentCard;
    state.currentCard = null;

    // Slide animation
    activeCardEl.classList.add(correct ? 'slide-right' : 'slide-left');

    // Add to pile
    if (correct) {
        state.juistPile.push(card);
    } else {
        state.foutPile.push(card);
    }
    updatePiles();

    // After animation, show next card
    setTimeout(() => {
        const progress = document.getElementById('exercise-progress');
        const remaining = state.deck.length;
        if (remaining > 0) {
            progress.textContent = `Ronde ${state.round} — nog ${remaining} kaartje${remaining === 1 ? '' : 's'}`;
        }
        showNextCard();
    }, 300);
}

function updatePiles() {
    renderPile('pile-fout', state.foutPile);
    renderPile('pile-juist', state.juistPile);
}

function renderPile(pileId, cards) {
    const pile = document.getElementById(pileId);
    pile.innerHTML = '';

    // Show top few cards as stacked visual
    const show = cards.slice(-4);
    show.forEach((card, i) => {
        const el = document.createElement('div');
        el.className = 'pile-card';
        el.style.background = state.data[card.table].color;
        el.style.setProperty('--pile-rot', `${(Math.random() - 0.5) * 12}deg`);
        el.style.bottom = (i * 3) + 'px';
        el.textContent = card.front;
        pile.appendChild(el);
    });

    // Count label
    const count = document.createElement('div');
    count.className = 'pile-count';
    count.textContent = cards.length > 0 ? cards.length : '';
    pile.appendChild(count);
}

function showFinished() {
    const exercise = document.getElementById('exercise');
    exercise.innerHTML = `
        <div class="finish-screen">
            <div class="finish-icon">&#10003;</div>
            <h2>Alles juist!</h2>
            <p>${state.cards.length} kaartjes geoefend in ${state.round} ronde${state.round === 1 ? '' : 's'}</p>
        </div>
    `;
    launchConfetti();
}

function launchConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 70,
            origin: { x: 0, y: 0.6 },
            colors: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'],
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 70,
            origin: { x: 1, y: 0.6 },
            colors: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'],
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();

    // Big center burst
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#818cf8'],
    });
}

function confirmReset() {
    if (confirm('Wil je opnieuw beginnen? Alle selecties worden gewist.')) {
        resetState();
    }
}

// --- Event listeners ---

function attachEventListeners() {
    selectAllBtn.addEventListener('click', selectAll);
    next1Btn.addEventListener('click', () => goToStep(2));
    opsButtons.forEach(btn => btn.addEventListener('click', () => toggleOp(btn)));
    document.getElementById('select-all-ops').addEventListener('click', selectAllOps);
    back2Btn.addEventListener('click', () => goToStep(1));
    next2Btn.addEventListener('click', () => goToStep(3));
    back3Btn.addEventListener('click', () => goToStep(2));
    startBtn.addEventListener('click', () => goToStep('practice'));
    document.getElementById('begin-btn').addEventListener('click', beginExercise);
    document.getElementById('btn-fout').addEventListener('click', () => answerCard(false));
    document.getElementById('btn-juist').addEventListener('click', () => answerCard(true));
    resetBtn.addEventListener('click', confirmReset);
}
