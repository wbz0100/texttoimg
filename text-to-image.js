const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

//  폰트 우선순위대로 등록
const fontStack = [
    { path: "src/font/FFXIV_Lodestone_SSF.ttf", family: "FFXIV_Lodestone_SSF" }, 
    { path: "src/font/FFXIVAppIcons.ttf", family: "FFXIVAppIcons" },
    { path: "src/font/Pretendard-Medium.ttf", family: "Pretendard" },
    { path: "src/font/Pretendard-NanumGothic-Regular.ttf", family: "NanumGothic" }
];

fontStack.forEach(({ path: fontPath, family }) => {
    registerFont(path.join(__dirname, fontPath), { family });
});

app.get("/image.png", (req, res) => {
    const text = req.query.text || "기본 문구";
    const fontSize = parseInt(req.query.size, 10) || 40;
    const color = req.query.color || "black";

    //  우선순위 폰트 스택 설정
    const fontFamily = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", , "Pretendard", "Roboto", "NanumGothic", Arial, sans-serif`;

    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const textMetrics = ctx.measureText(text);
    const width = Math.ceil(textMetrics.width);
    const height = Math.ceil(fontSize * 1.2);

    canvas.width = width;
    canvas.height = height;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);

    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
