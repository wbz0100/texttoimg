const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 폰트 등록
const fontStack = [
    { path: "src/font/FFXIV_Lodestone_SSF.ttf", family: "FFXIV_Lodestone_SSF" },
    { path: "src/font/FFXIVAppIcons.ttf", family: "FFXIVAppIcons" },
    { path: "src/font/Pretendard-SemiBold.ttf", family: "Pretendard" },
];
fontStack.forEach(({ path: fontPath, family }) => {
    registerFont(path.join(__dirname, fontPath), { family });
});

// 특정 문자의 색상 설정
const customColors = {
    "": "#ff7b1a",
    "": "#60df2e",
    "": "#e03737",
};

// 기본 설정 상수
const DEFAULT_COLOR = "black";
const DEFAULT_FONT_SIZE = 40;
const PADDING = 25;
const BOTTOM_PADDING = fontSize / 4;
const FONT_FAMILY = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;

// 텍스트 크기 계산 함수
function calculateTextSize(ctx, text, fontSize) {
    let totalWidth = 0;
    let maxHeight = 0;

    for (const char of text) {
        const isLodestoneUnicode = isLodestoneChar(char);
        const adjustedFontSize = isLodestoneUnicode ? fontSize * 0.9 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px ${FONT_FAMILY}`;
        const metrics = ctx.measureText(char);
        totalWidth += metrics.width;

        const charHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        maxHeight = Math.max(maxHeight, charHeight);
    }

    return { totalWidth, maxHeight };
}

// 특정 문자의 여부 확인
function isLodestoneChar(char) {
    const codePoint = char.codePointAt(0);
    return codePoint >= 0xE020 && codePoint <= 0xE0DB;
}

// 텍스트 렌더링 함수
function renderText(ctx, text, fontSize, canvasHeight, defaultColor) {
    let currentX = PADDING;
    const centerY = canvasHeight / 2 + fontSize / 2 - BOTTOM_PADDING / 2;

    for (const char of text) {
        const isLodestoneUnicode = isLodestoneChar(char);
        const adjustedFontSize = isLodestoneUnicode ? fontSize * 0.9 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px ${FONT_FAMILY}`;
        const metrics = ctx.measureText(char);

        // 특정 문자의 색상 설정
        ctx.fillStyle = customColors[char] || defaultColor;

        // Y축 위치 보정
        const yOffset = isLodestoneUnicode ? -fontSize * 0 : 0;

        ctx.fillText(char, currentX, centerY + yOffset);
        currentX += metrics.width;
    }
}

app.get("/image.png", (req, res) => {
    const text = req.query.text || "기본 문구";
    const fontSize = parseInt(req.query.size, 10) || DEFAULT_FONT_SIZE;
    const defaultColor = req.query.color || DEFAULT_COLOR;

    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    // 텍스트 크기 계산
    const { totalWidth, maxHeight } = calculateTextSize(ctx, text, fontSize);

    // 캔버스 크기 설정
    const canvasWidth = totalWidth + PADDING * 2;
    const canvasHeight = maxHeight + PADDING * 2 + BOTTOM_PADDING;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 기본 스타일 설정
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    // 그림자 효과 추가
    ctx.shadowColor = "rgba(0, 0, 0, 1)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 텍스트 렌더링
    renderText(ctx, text, fontSize, canvasHeight, defaultColor);

    // 이미지 응답
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
