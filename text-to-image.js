const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 폰트 등록
const fontStack = [
    { path: "src/font/FFXIV_Lodestone_SSF.ttf", family: "FFXIV_Lodestone_SSF" },
    { path: "src/font/FFXIVAppIcons.ttf", family: "FFXIVAppIcons" },
    { path: "src/font/PretendardVariable.ttf", family: "Pretendard" },
];

fontStack.forEach(({ path: fontPath, family }) => {
    registerFont(path.join(__dirname, fontPath), { family });
});

// 문자별 설정
const charSettings = {
    "": { color: "#ff7b1a", outline: true, shadow: false, shadowColor: null, weight: "400" },
    "": { color: "#60df2e", outline: true, shadow: false, shadowColor: null, weight: "400" },
    "": { color: "#e03737", outline: true, shadow: false, shadowColor: null, weight: "400" },
};

// 유효한 폰트 두께 확인 함수
const isValidWeight = (weight) => {
    const validWeights = ["100", "200", "300", "400", "500", "600", "700", "800", "900", "bold", "normal", "lighter", "bolder"];
    return validWeights.includes(weight);
};

// 텍스트 렌더링 함수
function renderText(ctx, text, fontSize, canvasHeight, bottomPadding, defaultColor, defaultShadowColor) {
    let currentX = 25; // Padding
    const centerY = canvasHeight / 2 + fontSize / 2 - bottomPadding / 2;

    for (const char of text) {
        const isLodestoneUnicode = isLodestoneChar(char);
        const adjustedFontSize = isLodestoneUnicode ? fontSize * 1 : fontSize;
        const settings = charSettings[char] || {};
        
        const charColor = settings.color || defaultColor;
        const shadowColor = settings.shadowColor || defaultShadowColor;
        const outline = settings.outline || false;

        // 설정된 폰트로 텍스트 렌더링
        ctx.font = `bold ${adjustedFontSize}px "FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;
        const metrics = ctx.measureText(char);

        // 텍스트 색상 및 그림자 설정
        ctx.fillStyle = charColor;
        ctx.shadowColor = outline ? "transparent" : shadowColor; // 외곽선 문자에는 그림자 제거

        // Y축 위치 보정
        const yOffset = isLodestoneUnicode ? fontSize * 0.05 : 0;

        // 텍스트 출력
        ctx.fillText(char, currentX, centerY + yOffset);

        // 외곽선 추가
        if (outline) {
            ctx.lineWidth = fontSize * 0.04; // 외곽선 두께
            ctx.strokeStyle = "black"; // 외곽선 색상
            ctx.strokeText(char, currentX, centerY + yOffset);
        }

        currentX += metrics.width; // 다음 문자로 이동
    }
}

app.get("/image.png", (req, res) => {
    const text = req.query.text || "기본 문구";
    const defaultFontSize = parseInt(req.query.size, 10) || 40;
    const defaultColor = req.query.color || "black";
    let weight = req.query.weight || "400";
    if (!isValidWeight(weight)) weight = "400";
    const style = req.query.style || "normal";

    // 캔버스 생성
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");
    const fontFamily = "\"FFXIV_Lodestone_SSF\", \"FFXIVAppIcons\", \"Pretendard\", \"Roboto\", Arial, sans-serif";

    let totalWidth = 0;
    let maxHeight = 0;
    const charMetrics = [];

    // 텍스트 렌더링을 위한 문자별 너비 및 설정 계산
    for (const char of text) {
        const settings = charSettings[char] || {};
        settings.fontSize = settings.fontSize ?? defaultFontSize;
        settings.color = settings.color || defaultColor;
        settings.outline = settings.outline ?? true;
        settings.shadow = settings.shadow ?? false;
        settings.shadowColor = settings.shadowColor || "rgba(0, 0, 0, 1.0)";
        settings.weight = settings.weight || weight;

        ctx.font = `${style} ${settings.weight} ${settings.fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(char);
        charMetrics.push({ metrics, settings });
        totalWidth += metrics.width;
        maxHeight = Math.max(maxHeight, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    }

    // 캔버스 크기 설정
    const width = Math.ceil(totalWidth) + 20;
    const height = Math.ceil(maxHeight) + 20;
    canvas.width = width;
    canvas.height = height;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // 텍스트 그리기
    let x = 10;
    const y = height / 2;

    for (let i = 0; i < text.length; i++) {
        const { metrics, settings } = charMetrics[i];
        ctx.font = `${style} ${settings.weight} ${settings.fontSize}px ${fontFamily}`;
        ctx.fillStyle = settings.color;

        // 그림자 처리
        if (settings.shadow) {
            ctx.shadowColor = settings.shadowColor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = defaultFontSize / 5;
        } else {
            ctx.shadowColor = "transparent";
        }

        // 텍스트 출력
        ctx.fillText(text[i], x, y);

        // 외곽선 처리
        if (settings.outline) {
            ctx.lineWidth = settings.fontSize * 0.01;
            ctx.strokeStyle = "black";
            ctx.strokeText(text[i], x, y);
        }

        x += metrics.width; // 다음 문자로 이동
    }

    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
