document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    const stopButton = document.getElementById('stop-button');
    const speedInput = document.getElementById('speed');
    const voicesDropdown = document.getElementById('voices');
    const textContent = document.getElementById('text-content');

    const utterance = new SpeechSynthesisUtterance();
    let allSpans = [];
    let availableVoices = [];

    function prepareText() {
        let wordIndex = 0;
        document.querySelectorAll('#text-content p').forEach(p => {
            const words = p.innerText.trim().split(/\s+/);
            p.innerHTML = words.map(word => `<span id="word-${wordIndex++}">${word}</span>`).join(' ');
        });
        allSpans = document.querySelectorAll('#text-content span');
    }

    function populateVoices() {
        availableVoices = speechSynthesis.getVoices();
        voicesDropdown.innerHTML = availableVoices.map((voice, index) => 
            `<option value="${index}">${voice.name} (${voice.lang})</option>`
        ).join('');
    }

    function updateVoice() {
        utterance.voice = availableVoices[voicesDropdown.value];
    }

    function handleBoundary(event) {
        const charIndex = event.charIndex;
        let cumulativeLength = 0;

        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        for (let i = 0; i < allSpans.length; i++) {
            cumulativeLength += allSpans[i].textContent.length + 1;  // Plus one for the space
            if (cumulativeLength > charIndex) {
                allSpans[i].classList.add('highlight');
                break;
            }
        }
    }

    function clearHighlights() {
        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    }

    function speak() {
        if (speechSynthesis.paused && speechSynthesis.speaking) {
            return speechSynthesis.resume();
        }
        if (speechSynthesis.speaking) return;
        utterance.text = Array.from(allSpans).map(span => span.textContent).join(' ');
        utterance.rate = parseFloat(speedInput.value) || 1;
        speechSynthesis.speak(utterance);
    }

    utterance.addEventListener('boundary', handleBoundary);
    utterance.addEventListener('end', clearHighlights);

    playButton.addEventListener('click', speak);
    pauseButton.addEventListener('click', () => speechSynthesis.pause());
    stopButton.addEventListener('click', () => {
        speechSynthesis.resume();
        speechSynthesis.cancel();
        clearHighlights();
    });

    voicesDropdown.addEventListener('change', updateVoice);
    speedInput.addEventListener('input', () => {
        speechSynthesis.cancel();
        clearHighlights();
        speak();
    });

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }

    prepareText();
    populateVoices();
});
