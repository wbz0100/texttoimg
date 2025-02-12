const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 📌 폰트 등록
const fontStack = [
    { path: "src/font/FFXIV_Lodestone_SSF.ttf", family: "FFXIV_Lodestone_SSF" },
    { path: "src/font/FFXIVAppIcons.ttf", family: "FFXIVAppIcons" },
    { path: "src/font/Pretendard-Medium.ttf", family: "Pretendard" }
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

    // 📌 기본 폰트 설정
    const fontFamily = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;

    // 📌 텍스트 크기 측정 (한 글자씩)
    let totalWidth = 0;
    let maxHeight = 0;
    const charMetrics = [];

    for (const char of text) {
        const codePoint = char.codePointAt(0);
        const isSpecial = codePoint >= 0xE020 && codePoint <= 0xE0DB;
        const adjustedFontSize = isSpecial ? fontSize * 0.9 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(char);
        totalWidth += metrics.width;
        maxHeight = Math.max(maxHeight, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
        charMetrics.push({ char, width: metrics.width, ascent: metrics.actualBoundingBoxAscent, adjustedFontSize });
    }

    // 📌 캔버스 크기 설정
    const padding = 20;
    const canvasWidth = totalWidth + padding * 2;
    const canvasHeight = maxHeight + padding * 2;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 📌 텍스트 렌더링
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;

    let currentX = padding;
    const baseY = padding + maxHeight;

    for (const { char, width, ascent, adjustedFontSize } of charMetrics) {
        ctx.font = `bold ${adjustedFontSize}px ${fontFamily}`;
        ctx.fillText(char, currentX, baseY - (maxHeight - ascent));
        currentX += width; // 다음 문자 위치 갱신
    }

    // 📌 이미지 응답
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
