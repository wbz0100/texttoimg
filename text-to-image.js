const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const port = process.env.PORT || 4000;

// 폰트 등록
const fontStack = [
    { path: "src/font/FFXIV_Lodestone_SSF.ttf", family: "FFXIV_Lodestone_SSF" },
    { path: "src/font/FFXIVAppIcons.ttf", family: "FFXIVAppIcons" },
    { path: "src/font/Pretendard-Medium.ttf", family: "Pretendard" },
];

fontStack.forEach(({ path: fontPath, family }) => {
    registerFont(path.join(__dirname, fontPath), { family });
});

app.get("/image.png", (req, res) => {
    const text = req.query.text || "기본 문구";
    const fontSize = parseInt(req.query.size, 10) || 40;
    const color = req.query.color || "black";

    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    // 기본 폰트 설정
    const fontFamily = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;

    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    // 텍스트 전체 크기 측정
    let totalWidth = 0;
    let maxHeight = 0;

    for (const char of text) {
        // 특정 문자 처리: Lodestone 폰트는 크기 조정
        const isLodestone = char === "특정문자" || req.query.forceLodestone;
        const adjustedFontSize = isLodestone ? fontSize * 0.8 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(char);

        totalWidth += metrics.width;
        maxHeight = Math.max(
            maxHeight,
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
        );
    }

    const padding = 20;
    const canvasWidth = totalWidth + padding * 2;
    const canvasHeight = maxHeight + padding * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;

    let currentX = padding;
    const centerY = canvasHeight / 2 + maxHeight / 2;

    for (const char of text) {
        // Lodestone 폰트 처리
        const isLodestone = char === "특정문자" || req.query.forceLodestone;
        const adjustedFontSize = isLodestone ? fontSize * 0.8 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(char);

        const yOffset = isLodestone
            ? maxHeight / 2 - (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2
            : 0;

        // 개별 문자 출력
        ctx.fillText(char, currentX, centerY + yOffset);

        // 다음 문자 X 위치 갱신
        currentX += metrics.width;
    }

    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});
