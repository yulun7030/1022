const QUESTIONS = [
  {
    clue: "打噴嚏時，怎麼做比較衛生？",
    answer: "用手肘遮住口鼻",
    hint: "用手肘遮住口鼻，手才不容易沾到飛沫。",
    emoji: "🤧",
    sound: "sneeze",
    gif: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Handwashing.gif",
    color: "#f5c85b"
  },
  {
    clue: "過馬路前，應該先做什麼？",
    answer: "停下來左右查看",
    hint: "先停在路邊，再左右查看並走斑馬線。",
    emoji: "🚦",
    sound: "traffic",
    gif: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Japanese%20traffic%20light%20at%20normal%20cycle%202.gif",
    color: "#f28b68"
  },
  {
    clue: "刷牙時，怎麼做可以節約用水？",
    answer: "刷牙時關緊水龍頭",
    hint: "刷牙時不需要一直用水，記得先關緊水龍頭。",
    emoji: "🪥",
    sound: "brush",
    gif: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Toothbrush.gif",
    color: "#71c6a5"
  },
  {
    clue: "看到插座冒火花，應該怎麼辦？",
    answer: "不碰插座並告訴大人",
    hint: "插座可能有觸電或起火危險，立刻找大人幫忙。",
    emoji: "⚡",
    sound: "electric",
    gif: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Animated_fire.gif",
    color: "#f17662"
  },
  {
    clue: "要把喝完的寶特瓶丟掉時？",
    answer: "倒空後做好資源回收",
    hint: "先倒空瓶子，再依照回收分類處理。",
    emoji: "♻️",
    sound: "recycle",
    gif: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Recycle_symbol.gif",
    color: "#79b9df"
  },
  {
    clue: "想讓眼睛休息一下，可以怎麼做？",
    answer: "看遠方並讓眼睛休息",
    hint: "把視線移到遠方一會兒，讓眼睛放鬆一下。",
    emoji: "👀",
    sound: "rest",
    gif: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif",
    color: "#b49bd8"
  }
];

const OPTIONS = QUESTIONS.map((question) => question.answer);
const OPTION_COLORS = ["#e4f2e8", "#fff0cf", "#ffe5dc", "#e3effa", "#f0e7fa", "#e5f2f1"];
const images = [];
const places = Array(QUESTIONS.length).fill(-1);
let optionOrder = [];
let dragging = -1;
let dragOrigin = -1;
let pointerPosition = { x: 0, y: 0 };
let optionRects = [];
let cardRects = [];
let submitRect;
let canvasElement;
let resultButtonRect;
let reviewButtonRect;
let reviewNextRect;
let reviewBackRect;
let result = null;
let reviewMode = false;
let reviewCursor = 0;
let screen = "home";
let startButtonRect;
let touchPointerTime = 0;
let captionText = "";
let captionUntil = 0;
let audioContext;
let noiseBuffer;

function setup() {
  canvasElement = createCanvas(windowWidth, windowHeight).elt;
  pixelDensity(1);
  textFont("sans-serif");
  optionOrder = shuffle([...OPTIONS.keys()]);

  QUESTIONS.forEach((question, index) => {
    images[index] = loadImage(question.gif, () => {}, () => {
      images[index] = null;
    });
  });
}

function draw() {
  background("#f3f7ec");
  drawBackdrop();
  if (screen === "home") {
    drawHome();
    return;
  }

  const ui = getLayout();
  drawHeader(ui);
  drawCards(ui);
  drawOptions(ui);
  drawFooter(ui);

  if (dragging !== -1) drawDraggedOption();
  if (result) drawResult(ui);
}

function drawHome() {
  const compact = width < 640;
  const centerX = width / 2;
  const titleSize = compact ? 28 : 42;
  const mascotY = height * (compact ? 0.39 : 0.38);
  const bob = sin(frameCount * 0.045) * 5;

  noStroke();
  fill("#e4efe0");
  rect(0, 0, width, compact ? 56 : 68);
  fill("#eb8a5d");
  rect(18, compact ? 13 : 17, 6, compact ? 30 : 34, 4);
  fill("#678a70");
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(compact ? 12 : 14);
  text("生活技能任務  /  01", 34, compact ? 28 : 34);
  textStyle(NORMAL);

  fill("#e9c765");
  rect(centerX - (compact ? 62 : 72), height * 0.13, compact ? 124 : 144, 28, 14);
  fill("#5c5536");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(compact ? 11 : 12);
  text("準備好出發了嗎？", centerX, height * 0.13 + 14);

  fill("#244b3c");
  textSize(titleSize);
  text("生活好習慣小偵探", centerX, height * (compact ? 0.22 : 0.23));
  fill("#678a70");
  textStyle(NORMAL);
  textSize(compact ? 14 : 18);
  text("六個生活線索，找出最棒的好習慣！", centerX, height * (compact ? 0.275 : 0.295));

  push();
  translate(centerX, mascotY + bob);
  fill("#fffefa");
  rect(-68, -52, 136, 104, 28);
  fill("#f2d88f");
  rect(-56, -40, 112, 80, 20);
  textSize(compact ? 57 : 68);
  text("🕵️", 0, 0);
  pop();

  const clueIcons = ["🤧", "🚦", "🪥", "⚡", "♻️", "👀"];
  const iconGap = min(compact ? 48 : 62, (width - 72) / clueIcons.length);
  clueIcons.forEach((icon, index) => {
    const x = centerX + (index - (clueIcons.length - 1) / 2) * iconGap;
    const y = height * (compact ? 0.51 : 0.52) + sin(frameCount * 0.035 + index) * 3;
    fill(index % 2 === 0 ? "#fffefa" : "#e7efe5");
    rect(x - 18, y - 18, 36, 36, 12);
    textSize(20);
    text(icon, x, y + 1);
  });

  fill("#315644");
  textStyle(BOLD);
  textSize(compact ? 14 : 17);
  text("拖曳答案配對情境，完成六個小任務", centerX, height * (compact ? 0.59 : 0.61));
  textStyle(NORMAL);

  const buttonWidth = min(compact ? 270 : 310, width - 48);
  startButtonRect = {
    x: centerX - buttonWidth / 2,
    y: height * (compact ? 0.67 : 0.70),
    w: buttonWidth,
    h: compact ? 54 : 62
  };
  fill("#bd694b");
  rect(startButtonRect.x, startButtonRect.y + 5, startButtonRect.w, startButtonRect.h, 15);
  fill("#e9825d");
  rect(startButtonRect.x, startButtonRect.y, startButtonRect.w, startButtonRect.h, 15);
  fill(255);
  textStyle(BOLD);
  textSize(compact ? 18 : 20);
  text("開始偵探任務  →", centerX, startButtonRect.y + startButtonRect.h / 2);

  fill("#547665");
  textStyle(NORMAL);
  textSize(compact ? 12 : 14);
  text("答錯也沒關係，交卷後會有小提示！", centerX, height * (compact ? 0.79 : 0.82));
  fill("#91a78f");
  textSize(compact ? 10 : 12);
  text("觀察情境  ·  配對答案  ·  看看你得幾分", centerX, height * (compact ? 0.86 : 0.89));
  textStyle(NORMAL);
}

function getLayout() {
  const compact = width < 640;
  const columns = compact ? 2 : 3;
  const rows = Math.ceil(QUESTIONS.length / columns);
  const margin = compact ? 14 : min(34, width * 0.035);
  const gap = compact ? 9 : 14;
  const headerHeight = compact ? 94 : 110;
  const footerHeight = compact ? 60 : 70;
  const optionRows = compact ? 3 : 2;
  const optionGap = compact ? 8 : 12;
  const optionHeight = constrain((height * 0.18) / optionRows, 40, compact ? 52 : 64);
  const optionsY = height - footerHeight - optionRows * optionHeight - (optionRows - 1) * optionGap;
  const cardsY = headerHeight;
  const cardsHeight = max(90, optionsY - cardsY - 18);
  const cardWidth = (width - margin * 2 - gap * (columns - 1)) / columns;
  const cardHeight = (cardsHeight - gap * (rows - 1)) / rows;
  const optionColumns = compact ? 2 : 3;
  const optionWidth = (width - margin * 2 - optionGap * (optionColumns - 1)) / optionColumns;

  cardRects = QUESTIONS.map((question, index) => {
    const column = index % columns;
    const row = floor(index / columns);
    return {
      x: margin + column * (cardWidth + gap),
      y: cardsY + row * (cardHeight + gap),
      w: cardWidth,
      h: cardHeight
    };
  });

  optionRects = [];
  let visibleIndex = 0;
  optionOrder.forEach((optionIndex) => {
    if (places.includes(optionIndex)) return;
    const column = visibleIndex % optionColumns;
    const row = floor(visibleIndex / optionColumns);
    optionRects[optionIndex] = {
      x: margin + column * (optionWidth + optionGap),
      y: optionsY + row * (optionHeight + optionGap),
      w: optionWidth,
      h: optionHeight
    };
    visibleIndex += 1;
  });

  const buttonWidth = min(compact ? 220 : 250, width - margin * 2);
  submitRect = {
    x: (width - buttonWidth) / 2,
    y: height - footerHeight + (footerHeight - (compact ? 44 : 50)) / 2,
    w: buttonWidth,
    h: compact ? 44 : 50
  };

  return { compact, columns, rows, margin, gap, optionsY, optionHeight };
}

function drawHeader(ui) {
  noStroke();
  fill("#e4efe0");
  rect(0, 0, width, ui.compact ? 94 : 110);
  fill("#eb8a5d");
  rect(ui.margin, ui.compact ? 12 : 15, ui.compact ? 5 : 7, ui.compact ? 43 : 52, 4);
  fill("#678a70");
  textAlign(LEFT, CENTER);
  textSize(ui.compact ? 10 : 12);
  text("生活技能任務  /  01", ui.margin + 13, ui.compact ? 17 : 20);
  fill("#244b3c");
  textStyle(BOLD);
  textSize(ui.compact ? 18 : 25);
  text("生活好習慣小偵探", ui.margin + 13, ui.compact ? 43 : 52);
  textStyle(NORMAL);
  const progress = places.filter((place) => place !== -1).length;
  fill("#fffdf5");
  rect(width - ui.margin - (ui.compact ? 86 : 112), ui.compact ? 22 : 25, ui.compact ? 86 : 112, ui.compact ? 28 : 34, 14);
  fill("#547665");
  textAlign(CENTER, CENTER);
  textSize(ui.compact ? 11 : 14);
  text(`線索 ${progress} / 6`, width - ui.margin - (ui.compact ? 43 : 56), ui.compact ? 36 : 42);
  fill(millis() < captionUntil ? "#315644" : "#91a78f");
  textAlign(CENTER, CENTER);
  textSize(ui.compact ? 11 : 13);
  const subtitle = millis() < captionUntil ? `🔊 ${captionText}` : "點選題目或答案聽朗讀";
  text(subtitle, width / 2, ui.compact ? 80 : 96, width - ui.margin * 2, 22);
}

function drawBackdrop() {
  noStroke();
  fill("#e8f1e4");
  ellipse(width - 24, 112, 110, 110);
  fill("#f9e9c9");
  ellipse(18, height - 18, 112, 112);
  fill("#d9e9dc");
  for (let index = 0; index < 9; index += 1) {
    ellipse(24 + index * 31, 108 + (index % 2) * 12, 3, 3);
  }
}

function drawCards(ui) {
  cardRects.forEach((cardRect, index) => {
    const question = QUESTIONS[index];
    const placedOption = places[index];
    const imageHeight = max(38, cardRect.h * 0.39);
    const clueHeight = max(28, cardRect.h * 0.25);
    const slotHeight = max(29, cardRect.h * 0.24);
    const imageY = cardRect.y + 7;
    const imageW = min(cardRect.w * 0.64, imageHeight * 1.65);
    const imageX = cardRect.x + (cardRect.w - imageW) / 2;

    noStroke();
    fill("#dce8dc");
    rect(cardRect.x, cardRect.y + 3, cardRect.w, cardRect.h, 9);
    fill("#fffefa");
    rect(cardRect.x, cardRect.y, cardRect.w, cardRect.h, 9);
    fill(question.color);
    rect(cardRect.x, cardRect.y, cardRect.w, 7, 4);
    fill("#fffdf5");
    ellipse(cardRect.x + 20, cardRect.y + 23, 22, 22);
    fill("#315644");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(ui.compact ? 10 : 12);
    text(index + 1, cardRect.x + 20, cardRect.y + 23);
    textStyle(NORMAL);

    if (images[index]) {
      drawContainedImage(images[index], imageX, imageY, imageW, imageHeight - 4);
    } else {
      drawAnimatedEmoji(question.emoji, imageX, imageY, imageW, imageHeight - 4, index);
    }

    fill("#29473d");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(ui.compact ? 12 : 15);
    textWrap(WORD);
    text(question.clue, cardRect.x + 8, imageY + imageHeight, cardRect.w - 16, clueHeight);
    textStyle(NORMAL);

    const slot = {
      x: cardRect.x + 8,
      y: cardRect.y + cardRect.h - slotHeight - 7,
      w: cardRect.w - 16,
      h: slotHeight
    };
    noFill();
    stroke(placedOption === -1 ? "#a9bfb3" : question.color);
    strokeWeight(2);
    drawingContext.setLineDash(placedOption === -1 ? [5, 4] : []);
    rect(slot.x, slot.y, slot.w, slot.h, 9);
    drawingContext.setLineDash([]);
    noStroke();
    fill(placedOption === -1 ? "#88a095" : "#244b3c");
    textAlign(CENTER, CENTER);
    textStyle(placedOption === -1 ? NORMAL : BOLD);
    textSize(ui.compact ? 11 : 14);
    text(placedOption === -1 ? "拖曳答案到這裡" : OPTIONS[placedOption], slot.x + 4, slot.y + 2, slot.w - 8, slot.h - 4);
    textStyle(NORMAL);

    if (result) {
      const isCorrect = placedOption === index;
      fill(isCorrect ? "#24845b" : "#d75e4c");
      textSize(ui.compact ? 11 : 13);
      textAlign(RIGHT, TOP);
      text(isCorrect ? "答對" : "再想想", cardRect.x + cardRect.w - 8, cardRect.y + 9);
    }
  });
}

function drawOptions(ui) {
  optionOrder.forEach((optionIndex) => {
    const optionRect = optionRects[optionIndex];
    if (!optionRect || optionIndex === dragging) return;
    noStroke();
    fill("#d2e2d4");
    rect(optionRect.x, optionRect.y + 3, optionRect.w, optionRect.h, 9);
    fill(OPTION_COLORS[optionIndex]);
    rect(optionRect.x, optionRect.y, optionRect.w, optionRect.h, 9);
    fill("#fffefa");
    ellipse(optionRect.x + 17, optionRect.y + optionRect.h / 2, 23, 23);
    fill("#638571");
    textStyle(BOLD);
    textSize(11);
    text(optionIndex + 1, optionRect.x + 17, optionRect.y + optionRect.h / 2);
    fill("#315644");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(ui.compact ? 11 : 14);
    text(OPTIONS[optionIndex], optionRect.x + 34, optionRect.y + 4, optionRect.w - 40, optionRect.h - 8);
    textStyle(NORMAL);
  });
}

function drawFooter() {
  const filled = places.filter((place) => place !== -1).length;
  noStroke();
  fill("#bd694b");
  rect(submitRect.x, submitRect.y + 4, submitRect.w, submitRect.h, 10);
  fill("#e9825d");
  rect(submitRect.x, submitRect.y, submitRect.w, submitRect.h, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(width < 640 ? 15 : 17);
  text(result ? "再玩一次" : "交卷看成績", submitRect.x, submitRect.y, submitRect.w, submitRect.h);
  textStyle(NORMAL);
  if (!result) {
    fill("#71877c");
    textSize(width < 640 ? 10 : 12);
    textAlign(LEFT, CENTER);
    text(`${filled} / 6 已完成`, 14, submitRect.y + submitRect.h / 2);
  }
}

function drawResult(ui) {
  const correct = places.filter((place, index) => place === index).length;
  const percent = Math.round((correct / QUESTIONS.length) * 100);
  if (reviewMode) {
    drawWrongAnswerReview(ui);
    return;
  }
  const panelW = min(440, width - 32);
  const panelH = ui.compact ? 206 : 220;
  const panelX = (width - panelW) / 2;
  const panelY = (height - panelH) / 2;
  const passed = percent >= 80;

  noStroke();
  fill(255, 246);
  rect(0, 0, width, height);
  fill(passed ? "#e4f3e9" : "#fff0e6");
  rect(panelX, panelY, panelW, panelH, 20);
  textAlign(CENTER, CENTER);
  fill(passed ? "#24794f" : "#9d6746");
  textStyle(BOLD);
  textSize(ui.compact ? 23 : 30);
  text(`${percent}%`, panelX, panelY + 20, panelW, 46);
  textStyle(NORMAL);
  fill("#365648");
  textSize(ui.compact ? 13 : 16);
  const feedback = passed
    ? "太棒了！你是生活好習慣小達人！繼續保持！"
    : `答對 ${correct} 題，再試一次，你會越來越熟練！`;
  text(feedback, panelX + 20, panelY + 66, panelW - 40, 48);
  const buttonY = panelY + panelH - 51;
  resultButtonRect = { x: panelX + panelW * 0.55, y: buttonY, w: panelW * 0.38, h: 38 };
  reviewButtonRect = { x: panelX + panelW * 0.07, y: buttonY, w: panelW * 0.43, h: 38 };
  if (correct < QUESTIONS.length) {
    fill("#e2a85d");
    rectRound(reviewButtonRect, 11);
    fill("#4a3926");
    textStyle(BOLD);
    textSize(ui.compact ? 12 : 14);
    text("看錯題提示", reviewButtonRect.x, reviewButtonRect.y, reviewButtonRect.w, reviewButtonRect.h);
  }
  fill(passed ? "#24794f" : "#9d6746");
  rectRound(resultButtonRect, 11);
  fill(255);
  textStyle(BOLD);
  textSize(ui.compact ? 12 : 14);
  text("再玩一次", resultButtonRect.x, resultButtonRect.y, resultButtonRect.w, resultButtonRect.h);
  textStyle(NORMAL);
}

function drawWrongAnswerReview(ui) {
  const wrongIndices = places
    .map((place, index) => (place === index ? -1 : index))
    .filter((index) => index !== -1);
  const questionIndex = wrongIndices[reviewCursor];
  const question = QUESTIONS[questionIndex];
  const panelW = min(480, width - 32);
  const panelH = ui.compact ? 280 : 300;
  const panelX = (width - panelW) / 2;
  const panelY = (height - panelH) / 2;

  noStroke();
  fill(255, 246);
  rect(0, 0, width, height);
  fill("#fff9e9");
  rect(panelX, panelY, panelW, panelH, 18);
  fill(question.color);
  rect(panelX, panelY, panelW, 8, 4);

  fill("#678a70");
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(ui.compact ? 12 : 14);
  text(`錯題回顧  ${reviewCursor + 1} / ${wrongIndices.length}`, panelX + 20, panelY + 28);
  reviewBackRect = { x: panelX + panelW - 100, y: panelY + 14, w: 82, h: 30 };
  fill("#e4efe0");
  rectRound(reviewBackRect, 9);
  fill("#315644");
  textAlign(CENTER, CENTER);
  textSize(12);
  text("回到成績", reviewBackRect.x, reviewBackRect.y, reviewBackRect.w, reviewBackRect.h);

  fill("#29473d");
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(ui.compact ? 17 : 20);
  text(question.clue, panelX + 20, panelY + 64, panelW - 40, 54);
  textStyle(NORMAL);

  fill("#b04f42");
  textSize(ui.compact ? 13 : 15);
  const selectedAnswer = places[questionIndex] === -1 ? "尚未作答" : OPTIONS[places[questionIndex]];
  text(`你的答案：${selectedAnswer}`, panelX + 20, panelY + 128, panelW - 40, 34);
  fill("#24794f");
  textStyle(BOLD);
  text(`正確答案：${question.answer}`, panelX + 20, panelY + 165, panelW - 40, 34);
  textStyle(NORMAL);

  fill("#f5edcf");
  rect(panelX + 16, panelY + 207, panelW - 32, 45, 9);
  fill("#6f582d");
  textSize(ui.compact ? 12 : 14);
  text(`小提示：${question.hint}`, panelX + 25, panelY + 211, panelW - 50, 38);

  reviewNextRect = { x: panelX + panelW * 0.2, y: panelY + panelH - 49, w: panelW * 0.6, h: 36 };
  fill("#e9825d");
  rectRound(reviewNextRect, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(14);
  text(reviewCursor === wrongIndices.length - 1 ? "完成回顧" : "下一題提示", reviewNextRect.x, reviewNextRect.y, reviewNextRect.w, reviewNextRect.h);
  textStyle(NORMAL);
}

function drawAnimatedEmoji(emoji, x, y, w, h, index) {
  const bob = sin(frameCount * 0.06 + index) * 3;
  textAlign(CENTER, CENTER);
  textSize(min(h * 0.8, 54));
  text(emoji, x + w / 2, y + h / 2 + bob);
}

function drawContainedImage(img, x, y, w, h) {
  const scaleFactor = min(w / img.width, h / img.height);
  const drawW = img.width * scaleFactor;
  const drawH = img.height * scaleFactor;
  image(img, x + (w - drawW) / 2, y + (h - drawH) / 2, drawW, drawH);
}

function drawDraggedOption() {
  const optionRect = optionRects[dragging] || { w: width * 0.42, h: 48 };
  const x = constrain(pointerPosition.x - optionRect.w / 2, 8, width - optionRect.w - 8);
  const y = constrain(pointerPosition.y - optionRect.h / 2, 8, height - optionRect.h - 8);
  noStroke();
  fill("#b8d9c4");
  rect(x, y, optionRect.w, optionRect.h, 9);
  fill("#244b3c");
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(width < 640 ? 12 : 15);
  text(OPTIONS[dragging], x + 7, y + 4, optionRect.w - 14, optionRect.h - 8);
  textStyle(NORMAL);
}

function rectRound(bounds, radius) {
  rect(bounds.x, bounds.y, bounds.w, bounds.h, radius);
}

function announce(message, sound = "tap", queueSpeech = false, questionIndex = null) {
  captionText = message;
  captionUntil = millis() + 4500;
  if (questionIndex === null) {
    playSound(sound);
  } else {
    playQuestionSound(questionIndex);
    window.setTimeout(() => playSound(sound), 260);
  }

  if ("speechSynthesis" in window) {
    if (!queueSpeech) window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "zh-TW";
    speech.rate = 0.88;
    speech.pitch = 1.08;
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices.find((voice) => voice.lang === "zh-TW") || voices.find((voice) => voice.lang.startsWith("zh")) || null;
    window.speechSynthesis.speak(speech);
  }
}

function playSound(kind) {
  if (!prepareAudio()) return;

  const patterns = {
    tap: [[660, 0.07, "sine"]],
    select: [[523, 0.09, "triangle"], [659, 0.1, "triangle"]],
    correct: [[523, 0.1, "sine"], [659, 0.1, "sine"], [784, 0.18, "sine"]],
    wrong: [[330, 0.12, "triangle"], [262, 0.18, "triangle"]],
    submit: [[392, 0.11, "sine"], [523, 0.11, "sine"], [659, 0.2, "sine"]],
    hint: [[587, 0.12, "sine"], [784, 0.17, "sine"]],
    start: [[392, 0.1, "triangle"], [523, 0.1, "triangle"], [659, 0.1, "triangle"], [784, 0.22, "sine"]]
  };
  let startAt = audioContext.currentTime + 0.015;
  patterns[kind].forEach(([frequency, duration, waveform]) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
    startAt += duration * 0.78;
  });
}

function prepareAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return true;
}

function playQuestionSound(questionIndex) {
  if (!prepareAudio()) return;
  const sound = QUESTIONS[questionIndex].sound;

  if (sound === "sneeze") {
    playNoiseBurst(0.2, "bandpass", 1150, 0.065, 0);
    playTone(320, 0.22, "triangle", 0.025, 205);
  } else if (sound === "traffic") {
    playTone(880, 0.12, "sine", 0);
    playTone(660, 0.12, "sine", 0.2);
    playTone(880, 0.12, "sine", 0.4);
  } else if (sound === "brush") {
    for (let index = 0; index < 4; index += 1) {
      playNoiseBurst(0.11, "highpass", index % 2 ? 2200 : 1500, 0.035, index * 0.14);
    }
  } else if (sound === "electric") {
    for (let index = 0; index < 7; index += 1) {
      const delay = index * 0.055 + random(0.015);
      playNoiseBurst(random(0.025, 0.06), "highpass", random(1700, 3600), 0.055, delay);
      if (index % 2 === 0) playTone(random(1050, 1650), 0.055, "square", delay, random(680, 920), 0.045);
    }
  } else if (sound === "recycle") {
    playTone(740, 0.12, "sine", 0);
    playTone(990, 0.12, "sine", 0.13);
    playTone(1180, 0.18, "sine", 0.27);
  } else if (sound === "rest") {
    playTone(740, 0.28, "sine", 0);
    playTone(587, 0.34, "sine", 0.19);
    playTone(494, 0.42, "sine", 0.4);
  }
}

function playTone(frequency, duration, waveform, delay = 0, endFrequency = frequency, volume = 0.09) {
  if (!prepareAudio()) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startAt = audioContext.currentTime + 0.02 + delay;
  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(max(1, endFrequency), startAt + duration);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

function playNoiseBurst(duration, filterType, frequency, volume, delay = 0) {
  if (!prepareAudio()) return;
  if (!noiseBuffer) {
    noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) samples[index] = random(-1, 1);
  }
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  const startAt = audioContext.currentTime + 0.02 + delay;
  source.buffer = noiseBuffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, startAt);
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + min(0.01, duration * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start(startAt, random(0, 0.5), duration);
  source.stop(startAt + duration + 0.01);
}

function pointerDown(event) {
  if (screen === "home") {
    if (inside(pointerPosition, startButtonRect)) {
      screen = "quiz";
      announce("偵探任務開始！把答案拖到正確的情境。", "start");
    }
    return false;
  }

  if (result) {
    if (reviewMode) {
      if (inside(pointerPosition, reviewBackRect)) {
        reviewMode = false;
        announce("回到成績畫面。", "tap");
      } else if (inside(pointerPosition, reviewNextRect)) {
        const wrongCount = places.filter((place, index) => place !== index).length;
        if (reviewCursor < wrongCount - 1) reviewCursor += 1;
        else reviewMode = false;
        if (reviewMode) {
          const wrongIndices = places.map((place, index) => (place === index ? -1 : index)).filter((index) => index !== -1);
          const question = QUESTIONS[wrongIndices[reviewCursor]];
          announce(`小提示：${question.hint}`, "hint");
        } else {
          announce("錯題回顧完成，做得好！", "correct");
        }
      }
      return false;
    }
    if (inside(pointerPosition, reviewButtonRect) && places.some((place, index) => place !== index)) {
      reviewMode = true;
      reviewCursor = 0;
      const firstWrong = places.findIndex((place, index) => place !== index);
      announce(`小提示：${QUESTIONS[firstWrong].hint}`, "hint");
      return false;
    }
    if (inside(pointerPosition, resultButtonRect)) {
      resetQuiz();
      announce("新的一輪開始囉！", "start");
    }
    return false;
  }
  if (inside(pointerPosition, submitRect)) {
    result = true;
    const correct = places.filter((place, index) => place === index).length;
    announce(`交卷完成！你答對 ${correct} 題，共六題。`, "submit");
    return false;
  }

  for (let index = 0; index < QUESTIONS.length; index += 1) {
    const slot = getSlotRect(cardRects[index]);
    if (places[index] !== -1 && inside(pointerPosition, slot)) {
      dragging = places[index];
      dragOrigin = index;
      places[index] = -1;
      return false;
    }
    if (inside(pointerPosition, cardRects[index])) {
      announce(`第 ${index + 1} 題：${QUESTIONS[index].clue}`, "tap", false, index);
      return false;
    }
  }

  for (const optionIndex of optionOrder) {
    if (optionRects[optionIndex] && inside(pointerPosition, optionRects[optionIndex])) {
      dragging = optionIndex;
      dragOrigin = places.indexOf(optionIndex);
      announce(OPTIONS[optionIndex], "select", false, optionIndex);
      return false;
    }
  }
  return false;
}

function pointerUp() {
  if (dragging === -1) return false;
  let destination = -1;
  for (let index = 0; index < cardRects.length; index += 1) {
    if (inside(pointerPosition, getSlotRect(cardRects[index]))) {
      destination = index;
      break;
    }
  }

  if (destination !== -1) {
    const displaced = places[destination];
    if (dragOrigin !== -1 && dragOrigin !== destination) places[dragOrigin] = displaced;
    places[destination] = dragging;
    if (destination === dragging) {
      announce(`答對了！${QUESTIONS[destination].hint}`, "correct", true, destination);
    } else {
      announce(`再想一想。${QUESTIONS[destination].hint}`, "wrong", true, destination);
    }
  } else if (dragOrigin !== -1) {
    places[dragOrigin] = -1;
    announce("答案已放回選項區。", "tap");
  }
  dragging = -1;
  dragOrigin = -1;
  return false;
}

function getSlotRect(rect) {
  const slotHeight = max(29, rect.h * 0.24);
  return { x: rect.x + 8, y: rect.y + rect.h - slotHeight - 7, w: rect.w - 16, h: slotHeight };
}

function inside(point, rect) {
  return rect && point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
}

function updatePointer(event) {
  const pointer = event?.changedTouches?.[0] || event?.touches?.[0] || event;
  const bounds = canvasElement.getBoundingClientRect();
  pointerPosition = {
    x: (pointer.clientX - bounds.left) * (width / bounds.width),
    y: (pointer.clientY - bounds.top) * (height / bounds.height)
  };
}

function resetQuiz() {
  places.fill(-1);
  optionOrder = shuffle([...OPTIONS.keys()]);
  dragging = -1;
  dragOrigin = -1;
  result = null;
  reviewMode = false;
  reviewCursor = 0;
  captionText = "";
  captionUntil = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed(event) {
  if (millis() - touchPointerTime < 700) return false;
  updatePointer(event);
  return pointerDown(event);
}

function mouseDragged(event) {
  if (millis() - touchPointerTime < 700) return false;
  updatePointer(event);
  return false;
}

function mouseReleased(event) {
  if (millis() - touchPointerTime < 700) return false;
  updatePointer(event);
  return pointerUp();
}

function touchStarted(event) {
  touchPointerTime = millis();
  updatePointer(event);
  return pointerDown(event);
}

function touchMoved(event) {
  touchPointerTime = millis();
  updatePointer(event);
  return false;
}

function touchEnded(event) {
  touchPointerTime = millis();
  updatePointer(event);
  return pointerUp();
}
