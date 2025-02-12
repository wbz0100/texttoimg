const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 폰트 등록
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

    // 기본 폰트 설정
    const fontFamily = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;

    // 텍스트 크기 측정
    let totalWidth = 0;
    let maxHeight = 0;
    for (const char of text) {
        const codePoint = char.codePointAt(0);
        const isLodestoneUnicode = codePoint >= 0xE020 && codePoint <= 0xE0DB;
        const adjustedFontSize = isLodestoneUnicode ? fontSize * 0.8 : fontSize;

        // 폰트 크기를 개별 문자에 맞춰 설정
        ctx.font = `bold ${adjustedFontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(char);
        totalWidth += metrics.width;

        const charHeight =
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        maxHeight = Math.max(maxHeight, charHeight);
    }

    // 캔버스 크기 설정
    const padding = 25;
    const bottomPadding = 2; // 추가 여백
    const canvasWidth = totalWidth + padding * 2;
    const canvasHeight = maxHeight + padding * 2 + bottomPadding;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;

    // 🎨 그림자 효과 추가
    ctx.shadowColor = "rgba(0, 0, 0, 1)"; // 그림자 색상
    ctx.shadowBlur = 10;                     // 그림자 블러 정도
    ctx.shadowOffsetX = 0;                  // 그림자 X축 위치
    ctx.shadowOffsetY = 0;                  // 그림자 Y축 위치

    let currentX = padding;
    const centerY = canvasHeight / 2 + maxHeight / 2 - bottomPadding / 2;

    // 텍스트 렌더링
    for (const char of text) {
        const codePoint = char.codePointAt(0);
        const isLodestoneUnicode = codePoint >= 0xE020 && codePoint <= 0xE0DB;
        const adjustedFontSize = isLodestoneUnicode ? fontSize * 0.8 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(char);

        // 특정 문자만 Y축 위치 보정
        const yOffset = isLodestoneUnicode
            ? -fontSize * 0.05 // Lodestone 범위의 Y축 보정
            : 0;

        // 개별 문자 출력
        ctx.fillText(char, currentX, centerY + yOffset);
        currentX += metrics.width; // 다음 문자 X 위치 갱신
    }

    // 이미지 응답
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
