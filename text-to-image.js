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

    // 우선순위 폰트 스택
    const fontFamily = `"FFXIV_Lodestone_SSF", "FFXIVAppIcons", "Pretendard", "Roboto", Arial, sans-serif`;

    // 캔버스 초기화
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");

    // 텍스트 메트릭 계산
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const textMetrics = ctx.measureText(text);
    const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    const width = Math.ceil(textMetrics.width);
    const height = Math.ceil(actualHeight);

    canvas.width = width;
    canvas.height = height;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center"; // 중앙 정렬
    ctx.textBaseline = "middle"; // 중앙 맞춤
    ctx.fillStyle = color;

    //  특정 유니코드 문자 보정
    let adjustedText = "";
    for (const char of text) {
        const codePoint = char.codePointAt(0);
        if (codePoint >= 0xE020 && codePoint <= 0xE0DB) {
            // 특정 유니코드 문자에 대해 위치 보정
            adjustedText += `{${char}}`; // 보정 처리를 표시 (단순 예시)
        } else {
            adjustedText += char;
        }
    }

    // 텍스트 렌더링
    const x = width / 2;
    const y = height / 2;
    ctx.fillText(adjustedText, x, y);

    // 이미지 응답
    res.setHeader("Content-Type", "image/png");
    canvas.createPNGStream().pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
