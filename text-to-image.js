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
    const forceFont = req.query.forceFont; // 강제 적용할 폰트 (선택 사항)

    // 우선순위 폰트 스택 설정
    const fontFamily = forceFont
        ? `"${forceFont}"`
        : `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif"`;

    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    ctx.font = `regular ${fontSize}px ${fontFamily}`;

    // 텍스트 메트릭을 활용하여 텍스트 크기 측정
    const textMetrics = ctx.measureText(text);
    const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const width = Math.ceil(textMetrics.width);
    const height = Math.ceil(actualHeight);  // 실제 높이만 사용

    // 캔버스 크기 설정
    canvas.width = width;
    canvas.height = height;
    ctx.font = `regular ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "left";

    //  텍스트를 정확히 배치하도록 패딩 및 베이스라인 조정
    ctx.textBaseline = "alphabetic";  
    ctx.fillStyle = color;

    //  폰트에 따른 Y축 보정값 적용
    let yOffset = textMetrics.actualBoundingBoxAscent;
    if (forceFont === "FFXIVAppIcons" || fontFamily.includes("FFXIVAppIcons")) {
        yOffset += fontSize * 0.5; // FFXIVAppIcons 보정
    } else if (forceFont === "FFXIV_Lodestone_SSF" || fontFamily.includes("FFXIV_Lodestone_SSF")) {
        yOffset += fontSize * 0.1; // FFXIV_Lodestone_SSF 보정
    }

    ctx.fillText(text, 0, yOffset);

    // 응답 처리
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
