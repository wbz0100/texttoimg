const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* ==============================
   Font Registration
============================== */

const fontStack = [
  { path: "src/font/FFXIV_Lodestone_SSF.ttf", family: "FFXIV_Lodestone_SSF" },
  { path: "src/font/FFXIVAppIcons.ttf", family: "FFXIVAppIcons" },
  { path: "src/font/Pretendard-SemiBold.ttf", family: "Pretendard" },
];

fontStack.forEach(({ path: fontPath, family }) => {
  registerFont(path.join(__dirname, fontPath), { family });
});

function getFont(fontSize) {
  return `bold ${fontSize}px "FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif`;
}

/* ==============================
   Constants
============================== */

const LODESTONE_RANGE = { min: 0xE020, max: 0xE0DB };
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 200;
const SIDE_PADDING = 25;

function isLodestoneChar(char) {
  const codePoint = char.codePointAt(0);
  return (
    codePoint >= LODESTONE_RANGE.min &&
    codePoint <= LODESTONE_RANGE.max
  );
}

/* ==============================
   Character Style Settings
============================== */

const charSettings = {
  "": {
    color: "#ff7b1a",
    outline: false,
  },
  "": {
    color: "#60df2e",
    outline: true,
  },
  "": {
    color: "#e03737",
    outline: true,
  },
};

/* ==============================
   Text Rendering
============================== */

function renderText(ctx, text, fontSize, canvasHeight, bottomPadding, defaultColor, defaultShadowColor) {
  let currentX = SIDE_PADDING;
  const centerY = canvasHeight / 2 + fontSize / 2 - bottomPadding / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  for (const char of text) {
    const isLodestoneUnicode = isLodestoneChar(char);
    const adjustedFontSize = fontSize;

    ctx.font = getFont(adjustedFontSize);

    const metrics = ctx.measureText(char);
    const settings = charSettings[char] || {};

    const charColor = settings.color || defaultColor;
    const outline = settings.outline || false;

    ctx.fillStyle = charColor;

    // outline 문자는 shadow 완전 제거
    ctx.shadowColor = outline ? "transparent" : defaultShadowColor;
    ctx.shadowBlur = outline ? 0 : fontSize / 5;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const yOffset = isLodestoneUnicode ? fontSize * 0.05 : 0;

    ctx.fillText(char, currentX, centerY + yOffset);

    if (outline) {
      ctx.lineWidth = fontSize * 0.04;
      ctx.strokeStyle = "black";
      ctx.strokeText(char, currentX, centerY + yOffset);
    }

    currentX += metrics.width;
  }
}

/* ==============================
   Route
============================== */

app.get("/image.png", (req, res) => {
  const text = String(req.query.text || "기본 문구");

  const fontSize = Math.min(
    Math.max(parseInt(req.query.size, 10) || 40, MIN_FONT_SIZE),
    MAX_FONT_SIZE
  );

  const defaultColor = String(req.query.color || "black");
  const defaultShadowColor = String(
    req.query.shadow || "rgba(0, 0, 0, 0.6)"
  );

  const bottomPadding = fontSize / 4.2;

  /* ==============================
     1단계: 텍스트 측정용 캔버스
  ============================== */

  const measureCanvas = createCanvas(1, 1);
  const measureCtx = measureCanvas.getContext("2d");

  let totalWidth = 0;

  for (const char of text) {
    measureCtx.font = getFont(fontSize);
    const metrics = measureCtx.measureText(char);
    totalWidth += metrics.width;
  }

  // metrics 기반 대신 안정적인 height 계산
  const canvasHeight = fontSize * 1.6 + bottomPadding;
  const canvasWidth = totalWidth + SIDE_PADDING * 2;

  /* ==============================
     2단계: 실제 렌더링 캔버스
  ============================== */

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  renderText(
    ctx,
    text,
    fontSize,
    canvasHeight,
    bottomPadding,
    defaultColor,
    defaultShadowColor
  );

  res.setHeader("Content-Type", "image/png");

  const stream = canvas.createPNGStream();

  stream.on("error", (err) => {
    console.error("PNG Stream Error:", err);
    if (!res.headersSent) {
      res.status(500).end();
    }
  });

  stream.pipe(res);
});

/* ==============================
   Server Start
============================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
