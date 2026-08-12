const CONFIG = {
  recipientName: "you",
  proposal: {
    title: "Will you go on a date with me?",
    subtitle: "This is the best way I know how to ask."
  },
  buttons: {
    yes: "YES 🥰",
    no: "NO 😏"
  },
  noMessages: [
    "Are you sure? 🥺",
    "Think about it again... 😌",
    "That's not the answer I was hoping for 👀",
    "Okay okay... I'll give you one last chance. ❤️",
    "My heart says you're reconsidering. ❤️",
    "Hmm... suspicious button behavior detected. 👀",
    "I feel like you meant YES.",
    "The NO button is getting nervous.",
    "Okay, you're really committed to this NO thing 😂"
  ],
  date: {
    date: "Saturday, 22 August",
    time: "7:00 PM",
    location: "Your surprise location",
    dressCode: "Look amazing. That's all. 😌"
  },
  music: {
    enabled: true,
    source: "assets/audio/background.mp3"
  }
};

const state = {
  currentScreen: "intro",
  noAttempts: 0,
  accepted: false,
  musicEnabled: CONFIG.music.enabled,
  dateRevealed: false,
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

const screens = {
  intro: document.querySelector('.scene-intro'),
  proposal: document.querySelector('.scene-proposal'),
  success: document.querySelector('.scene-success'),
  reveal: document.querySelector('.scene-reveal')
};

const continueButton = document.getElementById('continue-button');
const yesButton = document.getElementById('yes-button');
const noButton = document.getElementById('no-button');
const noMessage = document.getElementById('no-message');
const revealDateButton = document.getElementById('reveal-date-button');
const finalButton = document.getElementById('final-button');
const shareButton = document.getElementById('share-button');
const musicToggle = document.getElementById('music-toggle');
const decorativeHeart = document.getElementById('decorative-heart');
const proposalTitle = document.getElementById('proposal-title');
const proposalCopy = document.getElementById('proposal-copy');
const introTitle = document.getElementById('intro-title');
const dateValue = document.getElementById('date-value');
const timeValue = document.getElementById('time-value');
const locationValue = document.getElementById('location-value');
const dresscodeValue = document.getElementById('dresscode-value');
const audioElement = document.getElementById('bg-audio');
const confettiLayer = document.getElementById('confetti-layer');
const particleLayer = document.getElementById('particle-layer');
const hudBar = document.querySelector('.hud-bar');
const proposalScene = document.querySelector('.scene-proposal');
const proposalGrid = document.getElementById('proposal-grid');
const heartsHint = document.querySelector('.hint-text');

let lastHoverMove = 0;
let heartsMode = 0;
let lastTouchTapTime = 0;
let lastTouchTapX = 0;
let lastTouchTapY = 0;
let baseProposalGridMinHeight = 0;
let baseNoMessageMarginTop = 18;
let audioUnlockHandler = null;

async function init() {
  setPersonalization();
  renderProposalText();
  renderDateDetails();
  await configureAudioSource();
  loadMusicPreference();
  cacheLayoutMeasurements();
  updateHeartsHint();
  attachListeners();
  updateScreen('intro');
  if (state.reducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }
}

function cacheLayoutMeasurements() {
  const gridMinHeight = parseFloat(getComputedStyle(proposalGrid).minHeight);
  const noMessageMargin = parseFloat(getComputedStyle(noMessage).marginTop);
  baseProposalGridMinHeight = Number.isFinite(gridMinHeight) ? gridMinHeight : 220;
  baseNoMessageMarginTop = Number.isFinite(noMessageMargin) ? noMessageMargin : 18;
}

function updateHeartsHint() {
  if (heartsHint) {
    heartsHint.textContent = 'Press H or double tap for hearts';
  }
}

async function configureAudioSource() {
  const fallbackTracks = [CONFIG.music.source];
  const tracks = await getAudioTracksFromManifest(fallbackTracks);
  if (!tracks.length) {
    return;
  }

  const selectedTrack = tracks[Math.floor(Math.random() * tracks.length)];
  audioElement.src = encodeURI(selectedTrack);
  audioElement.load();
}

async function getAudioTracksFromManifest(fallbackTracks) {
  try {
    const response = await fetch('assets/audio/tracks.json', { cache: 'no-store' });
    if (!response.ok) {
      return fallbackTracks;
    }

    const manifestTracks = await response.json();
    if (!Array.isArray(manifestTracks)) {
      return fallbackTracks;
    }

    const validTracks = manifestTracks
      .map((track) => (typeof track === 'string' ? track.trim() : ''))
      .filter((track) => /\.(mp3|wav|ogg|m4a|aac)$/i.test(track));

    return validTracks.length ? validTracks : fallbackTracks;
  } catch {
    return fallbackTracks;
  }
}

function setPersonalization() {
  const urlName = getQueryParameter('name');
  if (urlName) {
    CONFIG.recipientName = decodeURIComponent(urlName.replace(/\+/g, ' '));
  }
  introTitle.textContent = `I have something important to ask you, ${CONFIG.recipientName}.`;
}

function getQueryParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderProposalText() {
  proposalTitle.textContent = CONFIG.proposal.title;
  proposalCopy.textContent = CONFIG.proposal.subtitle;
  yesButton.textContent = CONFIG.buttons.yes;
  noButton.textContent = CONFIG.buttons.no;
}

function renderDateDetails() {
  dateValue.textContent = CONFIG.date.date;
  timeValue.textContent = CONFIG.date.time;
  locationValue.textContent = CONFIG.date.location;
  dresscodeValue.textContent = CONFIG.date.dressCode;
}

function loadMusicPreference() {
  const stored = sessionStorage.getItem('proposalMusic');
  if (stored === 'on') {
    state.musicEnabled = true;
  } else if (stored === 'off') {
    state.musicEnabled = false;
  }

  if (state.musicEnabled) {
    musicToggle.textContent = '🔊 Music On';
    musicToggle.setAttribute('aria-pressed', 'true');
    tryPlayAudio();
    ensureAudioUnlockOnFirstGesture();
  } else {
    musicToggle.textContent = '🎵 Music Off';
    musicToggle.setAttribute('aria-pressed', 'false');
  }
}

function attachListeners() {
  continueButton.addEventListener('click', () => {
    updateScreen('proposal');
    tryPlayAudio();
  });

  yesButton.addEventListener('click', handleYes);
  noButton.addEventListener('click', handleNoClick);
  revealDateButton.addEventListener('click', revealDate);
  finalButton.addEventListener('click', () => {
    createFloatingHearts(24);
  });

  shareButton.addEventListener('click', shareExperience);
  musicToggle.addEventListener('click', toggleMusic);
  decorativeHeart.addEventListener('click', handleDecorativeHeart);
  decorativeHeart.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDecorativeHeart();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'h') {
      createFloatingHearts(18);
    }
  });

  document.addEventListener('pointerup', handleDoubleTapForHearts, { passive: true });

  window.addEventListener('resize', () => {
    if (state.currentScreen === 'proposal') {
      keepNoButtonVisible();
    }
  });

  document.addEventListener('pointermove', handlePointerMove);
}

function updateScreen(name) {
  state.currentScreen = name;
  Object.keys(screens).forEach((screenKey) => {
    const screenEl = screens[screenKey];
    screenEl.hidden = false;
    if (screenKey === name) {
      screenEl.classList.add('active');
      screenEl.setAttribute('aria-hidden', 'false');
    } else {
      screenEl.classList.remove('active');
      screenEl.setAttribute('aria-hidden', 'true');
    }
  });
}

function handleYes() {
  if (state.accepted) return;
  state.accepted = true;
  updateScreen('success');
  launchCelebration();
}

function handleNoClick() {
  state.noAttempts += 1;
  updateNoMessage();
  if (state.noAttempts >= 1) {
    moveNoButton();
  }
  growYesButton();
  if (state.noAttempts === 6) {
    setTimeout(() => {
      noMessage.textContent = '...just kidding. ❤️';
    }, 1100);
  }
}

function updateNoMessage() {
  const index = Math.min(state.noAttempts - 1, CONFIG.noMessages.length - 1);
  noMessage.textContent = CONFIG.noMessages[index] || CONFIG.noMessages[CONFIG.noMessages.length - 1];
}

function getViewportFrame() {
  const margin = 18;
  const frameRect = proposalScene.getBoundingClientRect();
  const hudHeight = hudBar ? hudBar.getBoundingClientRect().height + 30 : 0;
  return {
    minLeft: margin,
    minTop: margin,
    maxLeft: frameRect.width - margin,
    maxTop: frameRect.height - margin - hudHeight
  };
}

function moveNoButton() {
  // On first move, move NO into frame 2 layer so it stays inside this frame only.
  if (!noButton._isFixed) {
    const sceneRect = proposalScene.getBoundingClientRect();
    const rect = noButton.getBoundingClientRect();
    noButton._isFixed = true;
    proposalScene.appendChild(noButton);
    noButton.style.position = 'absolute';
    noButton.style.right = 'auto';
    noButton.style.bottom = 'auto';
    noButton.style.zIndex = '100';
    noButton.style.left = `${rect.left - sceneRect.left}px`;
    noButton.style.top = `${rect.top - sceneRect.top}px`;
    noButton.offsetHeight; // flush layout so transition starts from here
  }

  const sceneRect = proposalScene.getBoundingClientRect();
  const noRect = noButton.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const yesCenterX = yesRect.left - sceneRect.left + yesRect.width / 2;
  const yesCenterY = yesRect.top - sceneRect.top + yesRect.height / 2;
  const frame = getViewportFrame();
  const maxLeft = Math.max(frame.minLeft, frame.maxLeft - noRect.width);
  const maxTop = Math.max(frame.minTop, frame.maxTop - noRect.height);
  const safeDistance = 160;

  let newLeft = parseFloat(noButton.style.left) || 0;
  let newTop = parseFloat(noButton.style.top) || 0;

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidateLeft = Math.round(frame.minLeft + Math.random() * (maxLeft - frame.minLeft));
    const candidateTop = Math.round(frame.minTop + Math.random() * (maxTop - frame.minTop));
    const dx = candidateLeft - yesCenterX;
    const dy = candidateTop - yesCenterY;
    if (Math.sqrt(dx * dx + dy * dy) > safeDistance || attempt > 15) {
      newLeft = candidateLeft;
      newTop = candidateTop;
      break;
    }
  }

  noButton.style.left = `${Math.max(frame.minLeft, Math.min(newLeft, maxLeft))}px`;
  noButton.style.top = `${Math.max(frame.minTop, Math.min(newTop, maxTop))}px`;
}

function keepNoButtonVisible() {
  if (!noButton._isFixed) return;
  const noRect = noButton.getBoundingClientRect();
  const frame = getViewportFrame();
  const maxLeft = Math.max(frame.minLeft, frame.maxLeft - noRect.width);
  const maxTop = Math.max(frame.minTop, frame.maxTop - noRect.height);
  const currentLeft = parseFloat(noButton.style.left) || 0;
  const currentTop = parseFloat(noButton.style.top) || 0;
  noButton.style.left = `${Math.min(Math.max(currentLeft, frame.minLeft), maxLeft)}px`;
  noButton.style.top = `${Math.min(Math.max(currentTop, frame.minTop), maxTop)}px`;
}

function growYesButton() {
  const scale = Math.min(1 + state.noAttempts * 0.18, 2.2);
  yesButton.style.transformOrigin = 'left center';
  yesButton.style.transform = `scale(${scale})`;

  const grownHeight = yesButton.offsetHeight * scale;
  const extraHeight = Math.max(0, grownHeight - yesButton.offsetHeight);
  proposalGrid.style.minHeight = `${Math.round(baseProposalGridMinHeight + extraHeight + 12)}px`;
  noMessage.style.marginTop = `${Math.round(baseNoMessageMarginTop + Math.min(extraHeight, 64))}px`;
}

function handlePointerMove(event) {
  if (state.currentScreen !== 'proposal') return;
  if (event.pointerType !== 'mouse') return;
  const rect = noButton.getBoundingClientRect();
  const dx = rect.left + rect.width / 2 - event.clientX;
  const dy = rect.top + rect.height / 2 - event.clientY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 120 && Date.now() - lastHoverMove > 700) {
    lastHoverMove = Date.now();
    const moveIntent = Math.min(4, state.noAttempts + 1);
    if (moveIntent >= 2) {
      moveNoButton();
      noMessage.textContent = CONFIG.noMessages[Math.min(moveIntent - 1, CONFIG.noMessages.length - 1)];
    }
  }
}

function revealDate() {
  state.dateRevealed = true;
  updateScreen('reveal');
  createFloatingHearts(18);
}

function shareExperience() {
  const shareData = {
    title: 'A special date proposal',
    text: `I have a nice date planned. Open the link and see!`,
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    alert('Sharing is not supported on this browser, but you can copy the link manually.');
  }
}

function toggleMusic() {
  state.musicEnabled = !state.musicEnabled;
  sessionStorage.setItem('proposalMusic', state.musicEnabled ? 'on' : 'off');
  musicToggle.textContent = state.musicEnabled ? '🔊 Music On' : '🎵 Music Off';
  musicToggle.setAttribute('aria-pressed', String(state.musicEnabled));
  if (state.musicEnabled) {
    tryPlayAudio();
  } else {
    audioElement.pause();
  }
}

function tryPlayAudio() {
  if (!state.musicEnabled) return;
  if (!audioElement.src) return;
  audioElement.play().catch(() => {
    ensureAudioUnlockOnFirstGesture();
  });
}

function ensureAudioUnlockOnFirstGesture() {
  if (!state.musicEnabled) return;

  if (audioUnlockHandler) {
    document.removeEventListener('pointerdown', audioUnlockHandler);
    document.removeEventListener('keydown', audioUnlockHandler);
  }

  audioUnlockHandler = () => {
    if (state.musicEnabled) {
      tryPlayAudio();
    }
    if (audioUnlockHandler) {
      document.removeEventListener('pointerdown', audioUnlockHandler);
      document.removeEventListener('keydown', audioUnlockHandler);
      audioUnlockHandler = null;
    }
  };

  document.addEventListener('pointerdown', audioUnlockHandler, { once: true });
  document.addEventListener('keydown', audioUnlockHandler, { once: true });
}

function handleDoubleTapForHearts(event) {
  if (event.pointerType !== 'touch') return;

  const now = Date.now();
  const withinTime = now - lastTouchTapTime <= 320;
  const withinDistance = Math.abs(event.clientX - lastTouchTapX) <= 28 && Math.abs(event.clientY - lastTouchTapY) <= 28;

  if (withinTime && withinDistance) {
    createFloatingHearts(18);
    lastTouchTapTime = 0;
    return;
  }

  lastTouchTapTime = now;
  lastTouchTapX = event.clientX;
  lastTouchTapY = event.clientY;
}

function launchCelebration() {
  if (!state.reducedMotion) {
    triggerConfetti(64);
  }
  createFloatingHearts(24);
}

function createFloatingHearts(count) {
  if (state.reducedMotion) return;
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.className = 'particle';
    heart.textContent = ['❤️', '💕', '💖'][Math.floor(Math.random() * 3)];
    heart.style.left = `${Math.random() * 90 + 5}%`;
    heart.style.top = `${Math.random() * 60 + 20}%`;
    heart.style.fontSize = `${Math.random() * 18 + 16}px`;
    heart.style.animation = `heartPop 1200ms ease forwards`;
    particleLayer.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  }
}

function triggerConfetti(amount) {
  for (let i = 0; i < amount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = Math.random() * 9 + 8;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.4}px`;
    piece.style.background = `hsl(${Math.random() * 340 + 20}, 90%, 70%)`;
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${-Math.random() * 20 - 5}%`;
    piece.style.setProperty('--x', `${Math.random() * 160 - 80}px`);
    piece.style.animation = `confettiFall ${Math.random() * 1.4 + 1.1}s ease-in forwards`;
    confettiLayer.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

function handleDecorativeHeart() {
  heartsMode = (heartsMode + 1) % 3;
  decorativeHeart.textContent = ['❤️', '💕', '💖'][heartsMode];
  createFloatingHearts(8);
}

init();
