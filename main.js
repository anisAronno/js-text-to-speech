const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById('pause-button');
const stopButton = document.getElementById('stop-button');
const speedInput = document.getElementById('speed');
const textContent = document.getElementById('text-content');

const utterance = new SpeechSynthesisUtterance();
let currentHighlightedId;  // Track the ID of the currently highlighted span

function prepareText() {
    let wordIndex = 0;  // Initialize word index to create unique IDs
    document.querySelectorAll('#text-content p').forEach(p => {
        const words = p.innerText.trim().split(/\s+/);
        p.innerHTML = words.map(word => {
            let spanId = `word-${wordIndex++}`;  // Create a unique ID for each span
            return `<span id="${spanId}">${word}</span>`;
        }).join(' ');
    });
}

utterance.addEventListener('boundary', event => {
    const charIndex = event.charIndex;
    let cumulativeLength = 0;
    let targetId;

    document.querySelectorAll('#text-content span').forEach(span => {
        cumulativeLength += span.textContent.length + 1; // Account for spaces
        if (cumulativeLength > charIndex && !targetId) {
            targetId = span.id;  // Find the ID of the span where the boundary falls
        }
    });

    // Highlight the target word
    if (currentHighlightedId) {
        document.getElementById(currentHighlightedId)?.classList.remove('highlight');
    }
    currentHighlightedId = targetId;
    document.getElementById(currentHighlightedId)?.classList.add('highlight');
});

function playText() {
    if (speechSynthesis.paused && speechSynthesis.speaking) {
        return speechSynthesis.resume();
    }
    if (speechSynthesis.speaking) return;
    utterance.text = document.getElementById('text-content').innerText;  // Set utterance text
    utterance.rate = parseFloat(speedInput.value) || 1;
    speechSynthesis.speak(utterance);
}

function pauseText() {
    if (speechSynthesis.speaking) speechSynthesis.pause();
}

function stopText() {
    speechSynthesis.resume();
    speechSynthesis.cancel();
    if (currentHighlightedId) {
        document.getElementById(currentHighlightedId)?.classList.remove('highlight');
        currentHighlightedId = null;
    }
}

playButton.addEventListener('click', playText);
pauseButton.addEventListener('click', pauseText);
stopButton.addEventListener('click', stopText);
speedInput.addEventListener('input', () => {
    stopText();
    playText();
});

prepareText();  // Prepare text content when the script loads
