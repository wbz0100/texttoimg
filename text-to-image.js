const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

//  폰트 우선순위대로 등록
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

    // 우선순위 폰트 스택 설정
    const fontFamily = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif`;

    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    
    // 텍스트 메트릭을 활용하여 패딩을 최소화
    const textMetrics = ctx.measureText(text);
    const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const width = Math.ceil(textMetrics.width);
    const height = Math.ceil(actualHeight);  // 실제 높이만 사용

    canvas.width = width;
    canvas.height = height;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "left";

    // 🎯 패딩 제거 효과: 텍스트를 정확히 위에 배치
    ctx.textBaseline = "alphabetic";  
    ctx.fillStyle = color;

    // `actualBoundingBoxAscent`를 사용해 정확한 y 위치 조정
    ctx.fillText(text, 0, textMetrics.actualBoundingBoxAscent);

    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
