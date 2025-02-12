const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 폰트 우선순위대로 등록
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

    const fontFamily = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;

    // 초기 캔버스 생성 (사이즈 측정용)
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    // 텍스트 메트릭 측정
    const textMetrics = ctx.measureText(text);
    const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const width = Math.ceil(textMetrics.width);
    const height = Math.ceil(actualHeight);

    // 최종 캔버스 크기 설정
    canvas.width = width;
    canvas.height = height;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic"; // 기본 텍스트 기준 설정
    ctx.fillStyle = color;

    // 폰트별로 Y축 위치 조정
    let yOffset = textMetrics.actualBoundingBoxAscent;

    // 🎯 FFXIVAppIcons만 Y축 조정 적용
    if (text.includes("아이콘") || req.query.forceIcons) {
        yOffset += fontSize * 0.2; // FFXIVAppIcons의 여백 조정
    }

    // 나머지 폰트는 Y축 보정 없이 출력
    ctx.fillText(text, 0, yOffset);

    // 이미지 응답 처리
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
