// ====== STATE ======
let array = [];
let algorithm = null;
let isSorting = false;

// ====== DOM ELEMENTS ======
const arrayContainer = document.getElementById('array-container');
const generateBtn = document.getElementById('generate-btn');
const sizeSlider = document.getElementById('size-slider');
const speedSlider = document.getElementById('speed-slider');
const sizeDisplay = document.getElementById('size-display');
const speedDisplay = document.getElementById('speed-display');
const sortBtn = document.getElementById('sort-btn');
const algoBtns = document.querySelectorAll('.algo-btn');

// ====== CONSTANTS (CSS Var values for colors, resolved to inline values) ======
const DEFAULT_COLOR = 'var(--bar-default)';
const COMPARE_COLOR = 'var(--bar-compare)';
const SWAP_COLOR = 'var(--bar-swap)';
const SORTED_COLOR = 'var(--bar-sorted)';
const PIVOT_COLOR = 'var(--bar-pivot)';

// ====== UTILS ======
function getDelay() {
    // Non-linear delay scale: slider 1 to 100 -> ~1000ms to ~2ms
    const speed = parseInt(speedSlider.value);
    return Math.floor(1000 / Math.pow(speed, 1.3));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function disableControls() {
    isSorting = true;
    generateBtn.disabled = true;
    sizeSlider.disabled = true;
    sortBtn.disabled = true;
    algoBtns.forEach(btn => btn.disabled = true);
}

function enableControls() {
    isSorting = false;
    generateBtn.disabled = false;
    sizeSlider.disabled = false;
    sortBtn.disabled = false;
    algoBtns.forEach(btn => btn.disabled = false);
}

async function swap(i, j, bars) {
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;

    bars[i].style.height = `${array[i]}%`;
    bars[j].style.height = `${array[j]}%`;
}

// ====== INITIALIZATION & UI EVENTS ======
function createArray() {
    if (isSorting) return;

    const size = parseInt(sizeSlider.value);
    array = [];
    arrayContainer.innerHTML = '';

    for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * 95) + 5;
        array.push(value);

        const bar = document.createElement('div');
        bar.classList.add('array-bar');
        bar.style.height = `${value}%`;
        bar.style.width = `${100 / size}%`;
        bar.id = `bar-${i}`;

        arrayContainer.appendChild(bar);
    }

    // reset sort button text if algo is selected
    if (algorithm) {
        sortBtn.disabled = false;

        // Ensure buttons have default color again
        const bars = document.querySelectorAll('.array-bar');
        bars.forEach(b => b.style.backgroundColor = DEFAULT_COLOR);
    }
}

generateBtn.addEventListener('click', createArray);
sizeSlider.addEventListener('input', () => {
    sizeDisplay.textContent = sizeSlider.value;
    createArray();
});
speedSlider.addEventListener('input', () => {
    const speed = parseInt(speedSlider.value);
    const multiplier = (speed / 50).toFixed(1);
    speedDisplay.textContent = `${multiplier}x`;
});

// Initialize displays correctly on page load
sizeDisplay.textContent = sizeSlider.value;
speedDisplay.textContent = (parseInt(speedSlider.value) / 50).toFixed(1) + 'x';

algoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isSorting) return;

        algoBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        algorithm = btn.dataset.algo;
        sortBtn.textContent = `Start ${btn.textContent}`;
        sortBtn.disabled = false;
    });
});

sortBtn.addEventListener('click', async () => {
    if (!algorithm || isSorting) return;

    disableControls();

    switch (algorithm) {
        case 'bubble': await bubbleSort(); break;
        case 'quick': await quickSort(0, array.length - 1); break;
        case 'insertion': await insertionSort(); break;
        case 'merge': await mergeSort(0, array.length - 1); break;
    }

    // Final sorted animation
    const bars = document.querySelectorAll('.array-bar');
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = SORTED_COLOR;
        await sleep(15);
    }

    enableControls();
});

// ====== ALGORITHMS ======

// BUBBLE SORT
async function bubbleSort() {
    const bars = document.querySelectorAll('.array-bar');
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            bars[j].style.backgroundColor = COMPARE_COLOR;
            bars[j + 1].style.backgroundColor = COMPARE_COLOR;
            await sleep(getDelay());

            if (array[j] > array[j + 1]) {
                bars[j].style.backgroundColor = SWAP_COLOR;
                bars[j + 1].style.backgroundColor = SWAP_COLOR;
                await swap(j, j + 1, bars);
                await sleep(getDelay());
            }

            bars[j].style.backgroundColor = DEFAULT_COLOR;
            bars[j + 1].style.backgroundColor = DEFAULT_COLOR;
        }
        bars[n - 1 - i].style.backgroundColor = SORTED_COLOR;
    }
    bars[0].style.backgroundColor = SORTED_COLOR;
}

// INSERTION SORT
async function insertionSort() {
    const bars = document.querySelectorAll('.array-bar');
    const n = array.length;

    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;

        bars[i].style.backgroundColor = COMPARE_COLOR;
        await sleep(getDelay());

        while (j >= 0 && array[j] > key) {
            bars[j].style.backgroundColor = COMPARE_COLOR;
            bars[j + 1].style.backgroundColor = SWAP_COLOR;

            array[j + 1] = array[j];
            bars[j + 1].style.height = `${array[j + 1]}%`;

            await sleep(getDelay());

            bars[j].style.backgroundColor = DEFAULT_COLOR;
            bars[j + 1].style.backgroundColor = DEFAULT_COLOR;
            j--;
        }

        array[j + 1] = key;
        bars[j + 1].style.height = `${key}%`;
        bars[i].style.backgroundColor = DEFAULT_COLOR;
    }
}

// QUICK SORT
async function quickSort(left, right) {
    if (left < right) {
        let pivotIndex = await partition(left, right);
        await quickSort(left, pivotIndex - 1);
        await quickSort(pivotIndex + 1, right);
    } else if (left >= 0 && right >= 0 && left < array.length && right < array.length) {
        const bars = document.querySelectorAll('.array-bar');
        bars[left].style.backgroundColor = SORTED_COLOR;
        bars[right].style.backgroundColor = SORTED_COLOR;
    }
}

async function partition(left, right) {
    const bars = document.querySelectorAll('.array-bar');
    let pivot = array[right];
    bars[right].style.backgroundColor = PIVOT_COLOR;

    let i = left - 1;

    for (let j = left; j < right; j++) {
        bars[j].style.backgroundColor = COMPARE_COLOR;
        await sleep(getDelay());

        if (array[j] < pivot) {
            i++;
            bars[i].style.backgroundColor = SWAP_COLOR;
            bars[j].style.backgroundColor = SWAP_COLOR;
            await swap(i, j, bars);
            await sleep(getDelay());
            bars[i].style.backgroundColor = DEFAULT_COLOR;
        }
        bars[j].style.backgroundColor = DEFAULT_COLOR;
    }

    i++;
    bars[i].style.backgroundColor = SWAP_COLOR;
    bars[right].style.backgroundColor = SWAP_COLOR;
    await swap(i, right, bars);
    await sleep(getDelay());

    bars[i].style.backgroundColor = SORTED_COLOR;
    bars[right].style.backgroundColor = DEFAULT_COLOR;

    return i;
}

// MERGE SORT
async function mergeSort(left, right) {
    if (left >= right) return;
    const mid = left + Math.floor((right - left) / 2);
    await mergeSort(left, mid);
    await mergeSort(mid + 1, right);
    await merge(left, mid, right);
}

async function merge(left, mid, right) {
    const bars = document.querySelectorAll('.array-bar');
    let n1 = mid - left + 1;
    let n2 = right - mid;

    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = array[left + i];
    for (let j = 0; j < n2; j++) R[j] = array[mid + 1 + j];

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
        bars[left + i].style.backgroundColor = COMPARE_COLOR;
        bars[mid + 1 + j].style.backgroundColor = COMPARE_COLOR;
        await sleep(getDelay());

        if (L[i] <= R[j]) {
            array[k] = L[i];
            bars[k].style.height = `${array[k]}%`;
            i++;
        } else {
            array[k] = R[j];
            bars[k].style.height = `${array[k]}%`;
            j++;
        }

        bars[k].style.backgroundColor = SWAP_COLOR;
        await sleep(getDelay());

        for (let x = left; x <= right; x++) bars[x].style.backgroundColor = DEFAULT_COLOR;
        k++;
    }

    while (i < n1) {
        bars[left + i].style.backgroundColor = COMPARE_COLOR;
        await sleep(getDelay());
        array[k] = L[i];
        bars[k].style.height = `${array[k]}%`;
        bars[k].style.backgroundColor = SWAP_COLOR;
        await sleep(getDelay());
        for (let x = left; x <= right; x++) bars[x].style.backgroundColor = DEFAULT_COLOR;
        i++; k++;
    }

    while (j < n2) {
        bars[mid + 1 + j].style.backgroundColor = COMPARE_COLOR;
        await sleep(getDelay());
        array[k] = R[j];
        bars[k].style.height = `${array[k]}%`;
        bars[k].style.backgroundColor = SWAP_COLOR;
        await sleep(getDelay());
        for (let x = left; x <= right; x++) bars[x].style.backgroundColor = DEFAULT_COLOR;
        j++; k++;
    }
}

// Initialize
createArray();
