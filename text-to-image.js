const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/text.svg", (req, res) => {
    const text = req.query.text || "기본 문구";
    const fontSize = parseInt(req.query.size, 10) || 40;
    const color = req.query.color || "black";

    // 기본 SVG 설정
    const svgWidth = 800; // SVG 가로 크기
    const svgHeight = 200; // SVG 세로 크기

    // 유니코드 범위 확인 (U+E020 ~ U+E0DB)
    const needsAdjustment = (char) => {
        const codePoint = char.codePointAt(0);
        return codePoint >= 0xE020 && codePoint <= 0xE0DB;
    };

    // SVG 텍스트 생성
    let textContent = "";
    let currentX = svgWidth / 2; // 중앙 정렬 기준점
    for (const char of text) {
        const adjustedFontSize = needsAdjustment(char) ? fontSize * 0.8 : fontSize;
        textContent += `
            <text
                x="${currentX}"
                y="50%"
                font-size="${adjustedFontSize}"
                fill="${color}"
                text-anchor="middle"
                dominant-baseline="middle"
                font-family="FFXIV_Lodestone_SSF, FFXIVAppIcons, Pretendard, sans-serif">
                ${char}
            </text>`;
        // 글자 간격 조정
        currentX += adjustedFontSize; // 필요시 간격 추가 가능
    }

    // 최종 SVG
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
            ${textContent}
        </svg>`;

    // SVG 반환
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
