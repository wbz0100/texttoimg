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

// 외곽선이 필요한 문자
const outlineChars = ["", ""];

// 텍스트 렌더링 함수
function renderText(ctx, text, fontSize, canvasHeight, bottomPadding, defaultColor) {
    let currentX = 25; // Padding
    const centerY = canvasHeight / 2 + fontSize / 2 - bottomPadding / 2;

    for (const char of text) {
        const isLodestoneUnicode = isLodestoneChar(char);
        const adjustedFontSize = isLodestoneUnicode ? fontSize * 0.9 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px "FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;
        const metrics = ctx.measureText(char);

        // 특정 문자의 색상 설정
        ctx.fillStyle = customColors[char] || defaultColor;

        // Y축 위치 보정
        const yOffset = isLodestoneUnicode ? -fontSize * 0 : 0;

        // 그림자 설정
        if (outlineChars.includes(char)) {
            ctx.shadowColor = "transparent"; // 외곽선 문자에는 그림자 제거
        } else {
            ctx.shadowColor = "rgba(0, 0, 0, 1)"; // 일반 문자에 그림자 적용
        }

        // 텍스트 출력
        ctx.fillText(char, currentX, centerY + yOffset);

        // 외곽선 추가 (특정 문자만)
        if (outlineChars.includes(char)) {
            ctx.lineWidth = fontSize * 0.04; // 외곽선 두께를 동적으로 설정
            ctx.strokeStyle = "black"; // 외곽선 색상
            ctx.strokeText(char, currentX, centerY + yOffset); // 외곽선 렌더링
        }

        currentX += metrics.width; // 다음 문자로 이동
    }
}

// 특정 문자의 여부 확인
function isLodestoneChar(char) {
    const codePoint = char.codePointAt(0);
    return codePoint >= 0xE020 && codePoint <= 0xE0DB;
}

app.get("/image.png", (req, res) => {
    const text = req.query.text || "기본 문구";
    const fontSize = parseInt(req.query.size, 10) || 40;
    const defaultColor = req.query.color || "black";

    // 동적 패딩 계산
    const bottomPadding = fontSize / 4.2;

    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    // 텍스트 크기 계산
    let totalWidth = 0;
    let maxHeight = 0;

    for (const char of text) {
        const isLodestoneUnicode = isLodestoneChar(char);
        const adjustedFontSize = isLodestoneUnicode ? fontSize * 0.9 : fontSize;

        ctx.font = `bold ${adjustedFontSize}px "FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;
        const metrics = ctx.measureText(char);
        totalWidth += metrics.width;

        const charHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        maxHeight = Math.max(maxHeight, charHeight);
    }

    // 캔버스 크기 설정
    const canvasWidth = totalWidth + 25 * 2; // Padding
    const canvasHeight = maxHeight + 25 * 2 + bottomPadding;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 기본 스타일 설정
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.shadowBlur = 20; // 그림자 블러 효과
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 텍스트 렌더링
    renderText(ctx, text, fontSize, canvasHeight, bottomPadding, defaultColor);

    // 이미지 응답
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
