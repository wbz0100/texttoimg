const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

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

    // 텍스트 메트릭 측정
    const textMetrics = ctx.measureText(text);
    const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const width = Math.ceil(textMetrics.width);
    const height = Math.ceil(actualHeight);

    const padding = 20; // 텍스트와 경계 간 여유 공간
    const canvasWidth = width + padding * 2;
    const canvasHeight = height + padding * 2;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    //  개별 문자 처리
    let currentX = centerX - textMetrics.width / 2; // 초기 X 좌표 (왼쪽 정렬 기준)
    for (const char of text) {
        // 각 문자의 너비 측정
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        const charMetrics = ctx.measureText(char);
        const charWidth = charMetrics.width;

        //  특정 폰트(FFXIV_Lodestone_SSF)에만 Y축 보정 적용
        let yOffset = 0;
        if (char === "특정문자" || req.query.forceLodestone) {
            yOffset = fontSize * 0.15; // Lodestone 폰트에만 보정값 추가
        }

        // 개별 문자 출력
        ctx.fillText(char, currentX + charWidth / 2, centerY + yOffset);

        // 다음 문자의 X 좌표 갱신
        currentX += charWidth;
    }

    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
