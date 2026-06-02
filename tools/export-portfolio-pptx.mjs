import { promises as fs, readFileSync, mkdirSync } from "fs";
import path from "path";
import os from "os";
import vm from "vm";
import { createRequire } from "module";
import { execFileSync } from "child_process";
import ts from "typescript";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd());
const OUTPUT_DEFAULT = path.join(ROOT, "portfolio-web-to-pptx.pptx");
const WIDTH = 1920;
const HEIGHT = 1080;
const EMU_WIDTH = 12192000;
const EMU_HEIGHT = 6858000;
const FONT_BODY = "'Malgun Gothic', 'Segoe UI', sans-serif";
const FONT_HEAD = "'Georgia', 'Malgun Gothic', serif";
const FONT_MONO = "'Consolas', 'Courier New', monospace";
const BASE_BG = "#f7f3ec";
const INK = "#1f1b17";
const MUTED = "#625a50";
const LINE = "#d7cfbf";
const PANEL = "#fffdf8";
const nodeRequire = createRequire(import.meta.url);
const FONT_CACHE_DIR = path.join(os.tmpdir(), "portfolio-fontconfig-cache");
mkdirSync(FONT_CACHE_DIR, { recursive: true });
process.env.XDG_CACHE_HOME = FONT_CACHE_DIR;

const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const outputPath =
  outputIndex >= 0 && args[outputIndex + 1]
    ? path.resolve(ROOT, args[outputIndex + 1])
    : OUTPUT_DEFAULT;
const keepTemp = args.includes("--keep-temp");

function loadTsModule(filePath) {
  const source = readFileSync(filePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filePath,
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: nodeRequire,
    __dirname: path.dirname(filePath),
    __filename: filePath,
    process,
    console,
    global,
  });
  vm.runInContext(transpiled, context, { filename: filePath });
  return module.exports;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function mixHex(left, right, weight = 0.5) {
  const parse = (hex) => [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
  const [lr, lg, lb] = parse(left);
  const [rr, rg, rb] = parse(right);
  const blend = (l, r) => Math.round(l * (1 - weight) + r * weight);
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(blend(lr, rr))}${toHex(blend(lg, rg))}${toHex(
    blend(lb, rb)
  )}`;
}

function isCjk(char) {
  const code = char.codePointAt(0);
  return (
    (code >= 0x1100 && code <= 0x11ff) ||
    (code >= 0x2e80 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af)
  );
}

function estimateWidth(text, fontSize) {
  let units = 0;
  for (const char of [...String(text)]) {
    if (char === " ") {
      units += 0.34;
    } else if (/[A-Za-z0-9]/.test(char)) {
      units += 0.58;
    } else if (isCjk(char)) {
      units += 1;
    } else if (/[.,;:!?()\-–—/\\·]/.test(char)) {
      units += 0.36;
    } else {
      units += 0.7;
    }
  }
  return units * fontSize;
}

function wrapText(text, maxWidth, fontSize, maxLines = Infinity) {
  const paragraphs = String(text).split(/\n+/);
  const lines = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const tokens = paragraph.split(/(\s+)/);
    let current = "";
    let currentWidth = 0;

    for (const token of tokens) {
      const tokenWidth = estimateWidth(token, fontSize);
      const shouldWrap =
        current &&
        currentWidth + tokenWidth > maxWidth &&
        !/^\s+$/.test(token);

      if (shouldWrap) {
        lines.push(current.trimEnd());
        current = token.trimStart();
        currentWidth = estimateWidth(current, fontSize);
      } else {
        current += token;
        currentWidth += tokenWidth;
      }
    }

    if (current) {
      lines.push(current.trimEnd());
    }
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const clipped = lines.slice(0, Math.max(0, maxLines));
  if (clipped.length > 0) {
    clipped[clipped.length - 1] = `${clipped[clipped.length - 1].replace(
      /\s+$/,
      ""
    )}…`;
  }
  return clipped;
}

function lineHeight(fontSize, factor = 1.35) {
  return Math.round(fontSize * factor);
}

function rect({
  x,
  y,
  w,
  h,
  fill = "none",
  fillOpacity = 1,
  stroke = "none",
  strokeOpacity = 1,
  strokeWidth = 0,
  rx = 0,
  ry = rx,
}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${ry}" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/>`;
}

function circle({ cx, cy, r, fill, opacity = 1, stroke = "none", strokeOpacity = 1, strokeWidth = 0 }) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeWidth}"/>`;
}

function line({ x1, y1, x2, y2, stroke = LINE, strokeWidth = 1, opacity = 1 }) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${strokeWidth}"/>`;
}

function text({
  x,
  y,
  value,
  size = 24,
  fill = INK,
  weight = 400,
  family = FONT_BODY,
  align = "left",
  italic = false,
  letterSpacing = 0,
  opacity = 1,
}) {
  const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" fill-opacity="${opacity}" font-family="${family}" font-size="${size}" font-weight="${weight}" font-style="${
    italic ? "italic" : "normal"
  }" letter-spacing="${letterSpacing}" xml:space="preserve">${escapeXml(value)}</text>`;
}

function paragraph({
  x,
  y,
  width,
  text: value,
  size = 22,
  fill = INK,
  weight = 400,
  family = FONT_BODY,
  maxLines = Infinity,
  lineFactor = 1.35,
  italic = false,
  align = "left",
  leadingOffset = 0,
}) {
  const lines = wrapText(value, width, size, maxLines);
  const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
  const dx = align === "center" ? x : x;
  const baseY = y + size + leadingOffset;
  const gap = lineHeight(size, lineFactor);

  return `
    <text x="${dx}" y="${baseY}" text-anchor="${anchor}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" font-style="${
      italic ? "italic" : "normal"
    }" xml:space="preserve">
      ${lines
        .map(
          (lineText, index) =>
            `<tspan x="${dx}" dy="${index === 0 ? 0 : gap}">${escapeXml(
              lineText
            )}</tspan>`
        )
        .join("")}
    </text>
  `;
}

function labelValue({ x, y, label, value, valueSize = 28, labelSize = 13, fill = INK, labelFill = MUTED }) {
  return `
    ${text({
      x,
      y,
      value: label.toUpperCase(),
      size: labelSize,
      fill: labelFill,
      family: FONT_MONO,
      letterSpacing: 1.6,
    })}
    ${text({
      x,
      y: y + 34,
      value,
      size: valueSize,
      fill,
      family: FONT_HEAD,
      weight: 700,
    })}
  `;
}

function chipWidth(label, size = 16) {
  return Math.max(72, Math.round(estimateWidth(label, size) + 34));
}

function chips(items, { x, y, maxWidth, fill = PANEL, stroke = LINE, textFill = INK, accent = INK, size = 16, padX = 18, padY = 11, gapX = 10, gapY = 10, lineStrokeOpacity = 1 }) {
  let currentX = x;
  let currentY = y;
  let rowHeight = 0;
  const parts = [];

  for (const item of items) {
    const label = typeof item === "string" ? item : item.label;
    const width = chipWidth(label, size) + (padX - 18) * 2;
    const height = size + padY * 2;

    if (currentX !== x && currentX + width > x + maxWidth) {
      currentX = x;
      currentY += rowHeight + gapY;
      rowHeight = 0;
    }

    parts.push(
      rect({
        x: currentX,
        y: currentY,
        w: width,
        h: height,
        fill,
        fillOpacity: 0.75,
        stroke,
        strokeOpacity: lineStrokeOpacity,
        strokeWidth: 1,
        rx: 999,
      }),
      text({
        x: currentX + width / 2,
        y: currentY + Math.round(height / 2) + Math.round(size / 2) - 2,
        value: label,
        size,
        fill: textFill,
        family: FONT_MONO,
        weight: 500,
        align: "center",
      })
    );

    currentX += width + gapX;
    rowHeight = Math.max(rowHeight, height);
  }

  return { svg: parts.join(""), height: currentY + rowHeight - y };
}

function card({ x, y, w, h, accent, title, body, titleSize = 26, bodySize = 18, titleFill = INK, bodyFill = MUTED, bodyMaxLines = 8, titleWeight = 700, bodyLineFactor = 1.34, titleFamily = FONT_HEAD, bodyFamily = FONT_BODY, fill = PANEL, fillOpacity = 0.92, stroke = LINE }) {
  const innerX = x + 28;
  const innerY = y + 28;
  const bodyY = title ? innerY + 42 : innerY;
  const bodyWidth = w - 56;
  return `
    ${rect({ x, y, w, h, fill, fillOpacity, stroke, strokeOpacity: 0.95, strokeWidth: 1.2, rx: 28 })}
    ${accent ? rect({ x: x + 20, y: y + 18, w: 52, h: 5, fill: accent, rx: 999 }) : ""}
    ${
      title
        ? text({
            x: innerX,
            y: innerY + 8,
            value: title,
            size: titleSize,
            fill: titleFill,
            family: titleFamily,
            weight: titleWeight,
          })
        : ""
    }
    ${
      body
        ? paragraph({
            x: innerX,
            y: bodyY,
            width: bodyWidth,
            text: body,
            size: bodySize,
            fill: bodyFill,
            family: bodyFamily,
            maxLines: bodyMaxLines,
            lineFactor: bodyLineFactor,
          })
        : ""
    }
  `;
}

function cardWithLines({ x, y, w, h, accent, title, lines, titleSize = 22, bodySize = 16, bodyFill = MUTED, gap = 10, fill = PANEL }) {
  let svg = rect({ x, y, w, h, fill, fillOpacity: 0.92, stroke: LINE, strokeOpacity: 0.95, strokeWidth: 1, rx: 24 });
  if (accent) {
    svg += rect({ x: x + 18, y: y + 16, w: 48, h: 5, fill: accent, rx: 999 });
  }
  svg += text({ x: x + 24, y: y + 46, value: title, size: titleSize, fill: INK, family: FONT_HEAD, weight: 700 });
  let currentY = y + 80;
  for (const lineItem of lines) {
    const label = lineItem.label ? `${lineItem.label}: ` : "";
    const valueText = label + lineItem.text;
    svg += paragraph({
      x: x + 24,
      y: currentY,
      width: w - 48,
      text: valueText,
      size: bodySize,
      fill: lineItem.fill || bodyFill,
      family: lineItem.family || FONT_BODY,
      maxLines: lineItem.maxLines || 3,
      lineFactor: lineItem.lineFactor || 1.3,
      weight: lineItem.weight || 400,
      italic: lineItem.italic || false,
    });
    currentY += (lineItem.height || lineHeight(bodySize, 1.3) * (lineItem.maxLines || 2)) + gap;
  }
  return svg;
}

function slideShell({ accent, accent2, slideNo, title, subtitle, content }) {
  const accentSoft = mixHex(accent, "#ffffff", 0.88);
  const accentSoft2 = mixHex(accent2 || accent, "#ffffff", 0.9);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${BASE_BG}"/>
          <stop offset="100%" stop-color="${mixHex(BASE_BG, accentSoft, 0.35)}"/>
        </linearGradient>
        <linearGradient id="accentBand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="${accentSoft}"/>
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
      <rect x="0" y="0" width="${WIDTH}" height="108" fill="${accent}" fill-opacity="0.04"/>
      <rect x="0" y="0" width="12" height="${HEIGHT}" fill="${accent}" fill-opacity="0.85"/>
      <rect x="1564" y="0" width="356" height="${HEIGHT}" fill="${accent}" fill-opacity="0.05"/>
      <circle cx="1688" cy="196" r="190" fill="${accent2 || accent}" fill-opacity="0.08"/>
      <circle cx="1740" cy="860" r="290" fill="${accentSoft2}" fill-opacity="0.7"/>
      <path d="M 0 100 C 240 130 420 70 640 100 C 850 128 1000 70 1200 100 C 1420 130 1590 90 1920 116 L 1920 134 L 0 134 Z" fill="${accent}" fill-opacity="0.05"/>
      <rect x="100" y="76" width="238" height="30" rx="999" fill="${accent}" fill-opacity="0.08" stroke="${accent}" stroke-opacity="0.18"/>
      ${text({ x: 126, y: 98, value: "PORTFOLIO / 2026", size: 12, fill: accent, family: FONT_MONO, weight: 700, letterSpacing: 2 })}
      ${text({ x: 1780, y: 96, value: `SLIDE ${String(slideNo).padStart(2, "0")}`, size: 12, fill: MUTED, family: FONT_MONO, weight: 700, align: "right", letterSpacing: 1.4 })}
      ${text({ x: 100, y: 170, value: title, size: 58, fill: INK, family: FONT_HEAD, weight: 700 })}
      ${subtitle ? text({ x: 100, y: 216, value: subtitle, size: 18, fill: MUTED, family: FONT_BODY, weight: 400 }) : ""}
      <g>${content}</g>
    </svg>
  `;
}

function wrapBulletLines(items, x, y, width, { size = 16, bulletSize = 16, fill = MUTED, accent = INK, maxLines = 3, gap = 14, bulletXOffset = 0, lineFactor = 1.32 }) {
  let currentY = y;
  let svg = "";
  for (const item of items) {
    const lines = wrapText(item, width - 28, size, maxLines);
    svg += text({
      x: x + bulletXOffset,
      y: currentY + size,
      value: "•",
      size: bulletSize,
      fill: accent,
      family: FONT_BODY,
      weight: 700,
    });
    svg += `
      <text x="${x + 20}" y="${currentY + size}" fill="${fill}" font-family="${FONT_BODY}" font-size="${size}" xml:space="preserve">
        ${lines
          .map(
            (lineText, index) =>
              `<tspan x="${x + 20}" dy="${index === 0 ? 0 : lineHeight(size, lineFactor)}">${escapeXml(
                lineText
              )}</tspan>`
          )
          .join("")}
      </text>
    `;
    currentY += lines.length * lineHeight(size, lineFactor) + gap;
  }
  return { svg, height: currentY - y };
}

function statCards(items, { x, y, w, h, accent, columns = 3, titleSize = 16, valueSize = 34, detailSize = 14 }) {
  const gap = 14;
  const cardWidth = Math.floor((w - gap * (columns - 1)) / columns);
  const cardHeight = h;
  let svg = "";
  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cardX = x + col * (cardWidth + gap);
    const cardY = y + row * (cardHeight + gap);
    svg += `
      ${rect({
        x: cardX,
        y: cardY,
        w: cardWidth,
        h: cardHeight,
        fill: PANEL,
        fillOpacity: 0.95,
        stroke: accent,
        strokeOpacity: 0.18,
        strokeWidth: 1.2,
        rx: 22,
      })}
      ${text({
        x: cardX + 20,
        y: cardY + 46,
        value: item.value,
        size: valueSize,
        fill: accent,
        family: FONT_HEAD,
        weight: 700,
      })}
      ${text({
        x: cardX + 20,
        y: cardY + 78,
        value: item.label.toUpperCase(),
        size: titleSize,
        fill: MUTED,
        family: FONT_MONO,
        weight: 700,
        letterSpacing: 1.2,
      })}
      ${
        item.detail
          ? paragraph({
              x: cardX + 20,
              y: cardY + 100,
              width: cardWidth - 40,
              text: item.detail,
              size: detailSize,
              fill: MUTED,
              family: FONT_BODY,
              maxLines: 2,
              lineFactor: 1.25,
            })
          : ""
      }
    `;
  });
  const rows = Math.ceil(items.length / columns);
  return { svg, height: rows * cardHeight + Math.max(0, rows - 1) * gap };
}

function slideDivider(x, y, w, accent) {
  return `
    ${line({ x1: x, y1: y, x2: x + w, y2: y, stroke: accent, strokeWidth: 2, opacity: 0.18 })}
  `;
}

function buildCoverSlide(profile) {
  const accent = "#2d6b8c";
  const accent2 = "#b85b2e";
  const meta = [
    { label: "Role", value: "Full-stack Engineer" },
    { label: "Focus", value: "End-to-end systems" },
    { label: "Based", value: "Seoul, KR" },
    { label: "Available", value: "2026.06 +" },
  ];

  const chipsSvg = chips(
    ["Flutter", "Spring Boot", "Django", "React", "Docker", "Redis"],
    {
      x: 100,
      y: 560,
      maxWidth: 780,
      fill: "#ffffff",
      stroke: accent,
      textFill: accent,
      size: 16,
    }
  ).svg;

  const metaCards = statCards(
    meta.map((item) => ({ ...item, detail: "" })),
    {
      x: 100,
      y: 850,
      w: 1000,
      h: 130,
      accent,
      columns: 4,
      valueSize: 22,
      detailSize: 13,
      titleSize: 12,
    }
  ).svg;

  return slideShell({
    accent,
    accent2,
    slideNo: 1,
    title: profile.name.ko,
    subtitle: profile.title,
    content: `
      ${text({
        x: 100,
        y: 280,
        value: profile.name.en,
        size: 28,
        fill: MUTED,
        family: FONT_HEAD,
        italic: true,
        weight: 500,
      })}
      ${paragraph({
        x: 100,
        y: 330,
        width: 760,
        text: profile.motto.ko,
        size: 28,
        fill: INK,
        family: FONT_HEAD,
        italic: true,
        maxLines: 2,
        lineFactor: 1.25,
      })}
      ${slideDivider(100, 412, 520, accent)}
      ${paragraph({
        x: 100,
        y: 440,
        width: 760,
        text: profile.about.summary,
        size: 20,
        fill: MUTED,
        family: FONT_BODY,
        maxLines: 4,
        lineFactor: 1.34,
      })}
      ${chipsSvg}
      ${text({
        x: 100,
        y: 800,
        value: profile.contact.email,
        size: 18,
        fill: accent2,
        family: FONT_MONO,
        weight: 700,
      })}
      ${text({
        x: 100,
        y: 834,
        value: profile.contact.gitlab,
        size: 14,
        fill: MUTED,
        family: FONT_MONO,
      })}
      <g transform="translate(1220, 220)">
        ${circle({ cx: 290, cy: 70, r: 300, fill: accent, opacity: 0.04 })}
        ${circle({ cx: 430, cy: 300, r: 180, fill: accent2, opacity: 0.06 })}
        ${text({
          x: 0,
          y: 180,
          value: "04",
          size: 360,
          fill: accent,
          family: FONT_HEAD,
          weight: 700,
          opacity: 0.06,
        })}
        ${text({
          x: 30,
          y: 390,
          value: "Building across layers.",
          size: 28,
          fill: INK,
          family: FONT_HEAD,
          italic: true,
          weight: 600,
        })}
        ${paragraph({
          x: 30,
          y: 440,
          width: 500,
          text: "웹에서 설명한 내용은 그대로 두고, 문서형 결과물은 별도의 PPTX로 뽑아냅니다. 섹션별 설계와 문제 해결 기록을 슬라이드로 다시 정리한 버전입니다.",
          size: 18,
          fill: MUTED,
          family: FONT_BODY,
          maxLines: 4,
          lineFactor: 1.34,
        })}
      </g>
      <g transform="translate(1160, 770)">
        ${metaCards}
      </g>
    `,
  });
}

function buildAboutSlide(profile) {
  const accent = "#2d6b8c";
  const accent2 = "#6e8a3e";
  const keywordSet = profile.about.keywords;
  const keywordsSvg = chips(keywordSet, {
    x: 0,
    y: 0,
    maxWidth: 690,
    fill: "#fbfaf6",
    stroke: accent,
    textFill: accent,
    size: 16,
  }).svg;

  return slideShell({
    accent,
    accent2,
    slideNo: 2,
    title: "About",
    subtitle: "풀스택, 디바이스, 시뮬레이션을 한 흐름으로 묶는 사람",
    content: `
      <g transform="translate(100, 250)">
        ${card({
          x: 0,
          y: 0,
          w: 930,
          h: 260,
          accent,
          title: "Summary",
          body: profile.about.summary,
          titleSize: 28,
          bodySize: 24,
          bodyMaxLines: 6,
          bodyLineFactor: 1.33,
        })}
        <g transform="translate(0, 288)">
          ${rect({ x: 0, y: 0, w: 930, h: 220, fill: PANEL, fillOpacity: 0.92, stroke: LINE, strokeWidth: 1.2, rx: 28 })}
          ${text({ x: 28, y: 38, value: "Keywords", size: 24, fill: INK, family: FONT_HEAD, weight: 700 })}
          ${keywordsSvg}
        </g>
      </g>

      <g transform="translate(1080, 250)">
        ${cardWithLines({
          x: 0,
          y: 0,
          w: 740,
          h: 160,
          accent: accent2,
          title: "Role",
          lines: [{ text: profile.about.role, maxLines: 2 }],
          bodySize: 18,
        })}
        ${cardWithLines({
          x: 0,
          y: 184,
          w: 740,
          h: 200,
          accent,
          title: "Interest",
          lines: [{ text: profile.about.interest, maxLines: 4 }],
          bodySize: 17,
        })}
        ${cardWithLines({
          x: 0,
          y: 408,
          w: 740,
          h: 260,
          accent: accent2,
          title: "Motto + Contact",
          lines: [
            { label: "Motto", text: profile.motto.en, italic: true, maxLines: 2 },
            { label: "Email", text: profile.contact.email, family: FONT_MONO, maxLines: 1, fill: INK },
            { label: "GitLab", text: "lab.ssafy.com/ljin2091", family: FONT_MONO, maxLines: 1, fill: INK },
          ],
          bodySize: 16,
        })}
      </g>

      <g transform="translate(100, 782)">
        ${card({
          x: 0,
          y: 0,
          w: 1720,
          h: 180,
          accent,
          title: "What I optimize for",
          body: "문제와 결과를 한 번에 설명할 수 있는 구조를 선호합니다. 화면, API, 배포, 장비를 따로 보는 대신 동일한 목표를 향해 묶고, 그 과정에서 남는 판단 근거를 문서화하는 쪽에 무게를 둡니다.",
          titleSize: 24,
          bodySize: 22,
          bodyMaxLines: 3,
        })}
      </g>
    `,
  });
}

function buildTechSlide(techStack) {
  const accent = "#6e8a3e";
  const accent2 = "#7c4f8a";
  const startX = 100;
  const startY = 250;
  const cardW = 810;
  const cardH = 150;
  const gapX = 20;
  const gapY = 18;
  let cards = "";

  techStack.forEach((category, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);
    const chipSvg = chips(category.items, {
      x: x + 26,
      y: y + 82,
      maxWidth: cardW - 52,
      fill: "#fffdf8",
      stroke: accent,
      textFill: INK,
      size: 15,
    }).svg;

    cards += `
      ${rect({ x, y, w: cardW, h: cardH, fill: PANEL, fillOpacity: 0.93, stroke: LINE, strokeWidth: 1.2, rx: 24 })}
      ${rect({ x: x + 18, y: y + 16, w: 48, h: 5, fill: index % 2 ? accent2 : accent, rx: 999 })}
      ${text({ x: x + 26, y: y + 48, value: category.name, size: 24, fill: INK, family: FONT_HEAD, weight: 700 })}
      ${category.subtitle ? text({ x: x + 26, y: y + 72, value: category.subtitle, size: 13, fill: MUTED, family: FONT_MONO, letterSpacing: 0.8 }) : ""}
      ${chipSvg}
    `;
  });

  return slideShell({
    accent,
    accent2,
    slideNo: 3,
    title: "Tech Stack",
    subtitle: "프로젝트에서 실제로 손에 익은 도구들",
    content: `
      ${cards}
      <g transform="translate(100, 940)">
        ${card({
          x: 0,
          y: 0,
          w: 1720,
          h: 88,
          accent: accent2,
          title: "",
          body: "각 카테고리는 단순 나열이 아니라 실제로 붙여서 쓴 묶음입니다. 모바일, 웹, 백엔드, 실시간 통신, 인프라, 시뮬레이션까지 한 흐름으로 함께 다뤘습니다.",
          bodySize: 18,
          bodyMaxLines: 2,
        })}
      </g>
    `,
  });
}

function summarizeMedia(media) {
  return media.slice(0, 3).map((item) => `${item.title} — ${item.caption}`);
}

function buildProjectOverviewSlide(project, slideNo) {
  const accent = project.accentColor;
  const accent2 = mixHex(project.accentColor, "#000000", 0.18);
  const stats = project.stats.slice(0, 3);
  const mediaNotes = summarizeMedia(project.media);
  const notableMRs = project.featuredMRs.slice(0, 3).map((mr) => `${mr.label}${mr.note ? ` — ${mr.note}` : ""}`);
  const techItems = project.techStack.slice(0, 8);

  const statsBlock = statCards(stats, {
    x: 0,
    y: 0,
    w: 760,
    h: 120,
    accent,
    columns: stats.length >= 3 ? 3 : 2,
    valueSize: 24,
    detailSize: 12,
    titleSize: 11,
  }).svg;

  const techChips = chips(techItems, {
    x: 0,
    y: 0,
    maxWidth: 760,
    fill: "#fffdf8",
    stroke: accent,
    textFill: INK,
    size: 15,
  }).svg;

  return slideShell({
    accent,
    accent2,
    slideNo,
    title: `${project.displayName} — Overview`,
    subtitle: project.period,
    content: `
      <g transform="translate(100, 250)">
        ${card({
          x: 0,
          y: 0,
          w: 760,
          h: 220,
          accent,
          title: "Impact",
          body: project.impact,
          titleSize: 26,
          bodySize: 22,
          bodyMaxLines: 5,
        })}
        ${card({
          x: 0,
          y: 240,
          w: 760,
          h: 280,
          accent: accent2,
          title: "Background",
          body: `${project.background?.problem || "No background provided."}\n\nApproach: ${project.background?.approach || "No approach provided."}`,
          titleSize: 24,
          bodySize: 17,
          bodyMaxLines: 9,
        })}
        ${card({
          x: 0,
          y: 544,
          w: 760,
          h: 260,
          accent,
          title: "Role",
          body: `${project.role.team}\n\n${project.role.myPart}`,
          titleSize: 24,
          bodySize: 18,
          bodyMaxLines: 7,
        })}
      </g>

      <g transform="translate(910, 250)">
        ${card({
          x: 0,
          y: 0,
          w: 910,
          h: 196,
          accent,
          title: "Quick Stats",
          body: "",
        })}
        <g transform="translate(0, 70)">
          ${statsBlock}
        </g>

        ${card({
          x: 0,
          y: 214,
          w: 910,
          h: 190,
          accent: accent2,
          title: "Tech Stack",
          body: "",
        })}
        <g transform="translate(26, 296)">
          ${techChips}
        </g>

        ${card({
          x: 0,
          y: 428,
          w: 910,
          h: 240,
          accent,
          title: "Media Notes",
          body: mediaNotes.join("\n\n"),
          titleSize: 24,
          bodySize: 15,
          bodyMaxLines: 8,
        })}

        ${card({
          x: 0,
          y: 668,
          w: 910,
          h: 128,
          accent: accent2,
          title: "Featured MRs",
          body: notableMRs.join("\n"),
          titleSize: 22,
          bodySize: 14,
          bodyMaxLines: 4,
        })}
      </g>
    `,
  });
}

function buildProjectDeepDiveSlide(project, slideNo) {
  const accent = project.accentColor;
  const accent2 = mixHex(project.accentColor, "#000000", 0.18);
  const problems = project.problems.slice(0, 3);
  const techDecisions = project.techDecisions.slice(0, 3);
  const outcomes = project.outcomes.slice(0, 3);
  const mrs = project.featuredMRs.slice(0, 2);

  const problemCards = problems
    .map((problem, index) => {
      const x = 100 + index * 540;
      return cardWithProblem({
        x,
        y: 250,
        w: 520,
        h: 330,
        accent,
        item: problem,
        idx: index + 1,
      });
    })
    .join("");

  const techLines = techDecisions.map((decision) => `${decision.tech} — ${decision.why}`);
  const outcomeLines = outcomes.map((item) => `${item.value} / ${item.label} — ${item.detail || ""}`);
  const mrLines = mrs.map((mr) => `${mr.label}${mr.note ? ` — ${mr.note}` : ""}`);

  return slideShell({
    accent,
    accent2,
    slideNo,
    title: `${project.displayName} — Deep Dive`,
    subtitle: "문제, 판단, 결과, 회고를 한 장에 모은 페이지",
    content: `
      ${problemCards}

      <g transform="translate(100, 580)">
        ${card({
          x: 0,
          y: 0,
          w: 560,
          h: 280,
          accent,
          title: "Tech Decisions",
          body: techLines.join("\n\n"),
          titleSize: 24,
          bodySize: 15,
          bodyMaxLines: 9,
        })}

        ${card({
          x: 580,
          y: 0,
          w: 420,
          h: 280,
          accent: accent2,
          title: "Outcomes",
          body: "",
        })}
        ${outcomes
          .map((item, index) => {
            const y = 82 + index * 68;
            return `
              ${rect({ x: 600, y, w: 380, h: 56, fill: "#fffdf8", fillOpacity: 0.95, stroke: LINE, strokeWidth: 1, rx: 18 })}
              ${text({ x: 620, y: y + 22, value: item.value, size: 22, fill: accent, family: FONT_HEAD, weight: 700 })}
              ${text({ x: 620, y: y + 42, value: item.label, size: 13, fill: MUTED, family: FONT_MONO, weight: 700, letterSpacing: 0.8 })}
            `;
          })
          .join("")}

        ${card({
          x: 1020,
          y: 0,
          w: 600,
          h: 280,
          accent: accent2,
          title: "Retrospective",
          body: `${project.retrospective.lesson}\n\nNext time: ${project.retrospective.nextTime}\n\nMRs:`,
          titleSize: 24,
          bodySize: 15,
          bodyMaxLines: 8,
        })}
        ${wrapBulletLines(
          mrLines,
          1048,
          188,
          540,
          {
            size: 14,
            bulletSize: 14,
            fill: INK,
            accent,
            maxLines: 1,
            gap: 10,
          }
        ).svg}
      </g>
    `,
  });
}

function cardWithProblem({ x, y, w, h, accent, item, idx }) {
  const problemText = item.problem;
  const approachText = item.approach;
  const resultText = item.result;

  return `
    ${rect({ x, y, w, h, fill: PANEL, fillOpacity: 0.94, stroke: LINE, strokeOpacity: 0.95, strokeWidth: 1.1, rx: 24 })}
    ${rect({ x: x + 18, y: y + 16, w: 44, h: 5, fill: accent, rx: 999 })}
    ${text({ x: x + 22, y: y + 48, value: `Problem ${idx}`, size: 13, fill: accent, family: FONT_MONO, weight: 700, letterSpacing: 1.2 })}
    ${text({ x: x + 22, y: y + 78, value: item.title, size: 20, fill: INK, family: FONT_HEAD, weight: 700 })}
    ${text({ x: x + 22, y: y + 108, value: "Problem", size: 13, fill: MUTED, family: FONT_MONO, weight: 700, letterSpacing: 1 })}
    ${paragraph({
      x: x + 22,
      y: y + 126,
      width: w - 44,
      text: problemText,
      size: 13,
      fill: INK,
      family: FONT_BODY,
      maxLines: 2,
      lineFactor: 1.28,
    })}
    ${text({ x: x + 22, y: y + 182, value: "Approach", size: 13, fill: MUTED, family: FONT_MONO, weight: 700, letterSpacing: 1 })}
    ${paragraph({
      x: x + 22,
      y: y + 200,
      width: w - 44,
      text: approachText,
      size: 13,
      fill: INK,
      family: FONT_BODY,
      maxLines: 2,
      lineFactor: 1.28,
    })}
    ${text({ x: x + 22, y: y + 258, value: "Result", size: 13, fill: MUTED, family: FONT_MONO, weight: 700, letterSpacing: 1 })}
    ${paragraph({
      x: x + 22,
      y: y + 276,
      width: w - 44,
      text: resultText,
      size: 13,
      fill: accent,
      family: FONT_BODY,
      maxLines: 1,
      lineFactor: 1.28,
    })}
  `;
}

function buildExperienceSlide(experience, awards) {
  const accent = "#2d6b8c";
  const accent2 = "#6e8a3e";

  const activities = experience.flatMap((item) =>
    item.activities.map((activity) => `${item.org} — ${activity}`)
  );

  return slideShell({
    accent,
    accent2,
    slideNo: 12,
    title: "Experience",
    subtitle: "교육과 프로젝트를 연결한 실행 기록",
    content: `
      <g transform="translate(100, 250)">
        ${card({
          x: 0,
          y: 0,
          w: 1160,
          h: 700,
          accent,
          title: "Timeline",
          body: "",
        })}
        ${experience
          .map((item, index) => {
            const y = 96 + index * 318;
            return `
              ${rect({ x: 28, y: y + 8, w: 8, h: 240, fill: accent, fillOpacity: 0.14, rx: 999 })}
              ${circle({ cx: 32, cy: y + 18, r: 10, fill: accent, opacity: 0.9 })}
              ${text({ x: 58, y: y + 20, value: item.period, size: 13, fill: MUTED, family: FONT_MONO, weight: 700, letterSpacing: 1 })}
              ${text({ x: 58, y: y + 54, value: item.org, size: 28, fill: INK, family: FONT_HEAD, weight: 700 })}
              ${text({ x: 58, y: y + 88, value: item.role, size: 18, fill: accent, family: FONT_BODY, weight: 600 })}
              ${wrapBulletLines(item.activities, 58, y + 128, 1060, {
                size: 16,
                bulletSize: 16,
                fill: INK,
                accent,
                maxLines: 2,
                gap: 8,
                lineFactor: 1.26,
              }).svg}
            `;
          })
          .join("")}
      </g>

      <g transform="translate(1290, 250)">
        ${card({
          x: 0,
          y: 0,
          w: 530,
          h: 300,
          accent: accent2,
          title: "Snapshot",
          body: "SSAFY 14기에서 네 개의 프로젝트를 끝까지 완수했고, 각 프로젝트에서 화면·서버·인프라·디바이스를 한 흐름으로 정리하는 경험을 쌓았습니다.",
          titleSize: 24,
          bodySize: 18,
          bodyMaxLines: 6,
        })}

        ${card({
          x: 0,
          y: 334,
          w: 530,
          h: 366,
          accent,
          title: "What I repeated",
          body: "• 상태와 권한의 주인을 먼저 정한다.\n• 결과와 근거를 함께 남긴다.\n• 배포와 검증까지 포함해 완성한다.",
          titleSize: 24,
          bodySize: 18,
          bodyMaxLines: 8,
        })}
        ${
          awards.length
            ? card({
                x: 0,
                y: 728,
                w: 530,
                h: 198,
                accent: accent2,
                title: "Awards",
                body: awards
                  .map(
                    (award) =>
                      `${award.year} — ${award.project} — ${award.result || ""}`
                  )
                  .join("\n\n"),
                titleSize: 24,
                bodySize: 16,
                bodyMaxLines: 5,
              })
            : ""
        }
      </g>
    `,
  });
}

function buildEducationContactSlide(education, profile) {
  const accent = "#b85b2e";
  const accent2 = "#2d6b8c";
  const items = education.map((item) => `${item.type} — ${item.title} — ${item.detail} — ${item.status}`);
  return slideShell({
    accent,
    accent2,
    slideNo: 13,
    title: "Education & Contact",
    subtitle: "이력과 연락처를 한 장에 정리",
    content: `
      <g transform="translate(100, 250)">
        ${card({
          x: 0,
          y: 0,
          w: 760,
          h: 390,
          accent,
          title: "Education",
          body: items.join("\n\n"),
          titleSize: 26,
          bodySize: 20,
          bodyMaxLines: 8,
        })}

        ${card({
          x: 0,
          y: 430,
          w: 760,
          h: 260,
          accent: accent2,
          title: "Motto",
          body: profile.motto.en,
          titleSize: 26,
          bodySize: 28,
          bodyMaxLines: 4,
          bodyLineFactor: 1.25,
          bodyFill: accent2,
        })}
      </g>

      <g transform="translate(910, 250)">
        ${card({
          x: 0,
          y: 0,
          w: 910,
          h: 300,
          accent: accent2,
          title: "Contact",
          body: "",
        })}
        ${text({ x: 30, y: 98, value: "Email", size: 14, fill: MUTED, family: FONT_MONO, weight: 700, letterSpacing: 1.4 })}
        ${text({ x: 30, y: 136, value: profile.contact.email, size: 32, fill: INK, family: FONT_HEAD, weight: 700 })}
        ${text({ x: 30, y: 184, value: "GitLab", size: 14, fill: MUTED, family: FONT_MONO, weight: 700, letterSpacing: 1.4 })}
        ${text({ x: 30, y: 222, value: profile.contact.gitlab, size: 24, fill: accent, family: FONT_MONO, weight: 700 })}
        ${text({ x: 30, y: 270, value: "This export is generated without modifying the website source.", size: 16, fill: MUTED, family: FONT_BODY })}

        ${card({
          x: 0,
          y: 334,
          w: 910,
          h: 356,
          accent,
          title: "How to rerun",
          body: "node tools/export-portfolio-pptx.mjs\n\nUse --output to change the destination, and --keep-temp if you want to inspect the intermediate slide images.",
          titleSize: 24,
          bodySize: 18,
          bodyMaxLines: 7,
        })}
      </g>
    `,
  });
}

function buildProjectSlides(project, slideNoStart) {
  return [
    buildProjectOverviewSlide(project, slideNoStart),
    buildProjectDeepDiveSlide(project, slideNoStart + 1),
  ];
}

function buildSlideImage(svg) {
  return sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

function xmlDecl(value) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${value}`;
}

function buildContentTypes(slideCount) {
  const overrides = [
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>`,
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>`,
    `<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>`,
    `<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>`,
    `<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`,
    `<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`,
    `<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`,
    ...Array.from({ length: slideCount }, (_, index) => `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`),
  ];

  return xmlDecl(`
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Default Extension="png" ContentType="image/png"/>
      ${overrides.join("\n      ")}
    </Types>
  `);
}

function buildRootRels() {
  return xmlDecl(`
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
    </Relationships>
  `);
}

function buildCoreProps() {
  const now = new Date().toISOString();
  return xmlDecl(`
    <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <dc:title>Portfolio PPTX Export</dc:title>
      <dc:creator>Codex</dc:creator>
      <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
      <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
      <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
    </cp:coreProperties>
  `);
}

function buildAppProps(slideTitles) {
  const titlesVector = slideTitles
    .map((title) => `<vt:lpstr>${escapeXml(title)}</vt:lpstr>`)
    .join("");
  return xmlDecl(`
    <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
      <Application>Microsoft Office PowerPoint</Application>
      <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
      <Slides>${slideTitles.length}</Slides>
      <Notes>0</Notes>
      <HiddenSlides>0</HiddenSlides>
      <MMClips>0</MMClips>
      <HeadingPairs>
        <vt:vector size="2" baseType="variant">
          <vt:variant><vt:lpstr>Slides</vt:lpstr></vt:variant>
          <vt:variant><vt:i4>${slideTitles.length}</vt:i4></vt:variant>
        </vt:vector>
      </HeadingPairs>
      <TitlesOfParts>
        <vt:vector size="${slideTitles.length}" baseType="lpstr">
          ${titlesVector}
        </vt:vector>
      </TitlesOfParts>
      <Company></Company>
      <LinksUpToDate>false</LinksUpToDate>
      <SharedDoc>false</SharedDoc>
      <HyperlinksChanged>false</HyperlinksChanged>
      <AppVersion>16.0000</AppVersion>
    </Properties>
  `);
}

function buildPresProps() {
  return xmlDecl(`
    <p:presentationPr xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>
  `);
}

function buildTheme() {
  return xmlDecl(`
    <a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Portfolio Theme">
      <a:themeElements>
        <a:clrScheme name="Portfolio">
          <a:dk1><a:sysClr val="windowText" lastClr="1F1B17"/></a:dk1>
          <a:lt1><a:sysClr val="window" lastClr="FFFDF8"/></a:lt1>
          <a:dk2><a:srgbClr val="2D6B8C"/></a:dk2>
          <a:lt2><a:srgbClr val="F7F3EC"/></a:lt2>
          <a:accent1><a:srgbClr val="2D6B8C"/></a:accent1>
          <a:accent2><a:srgbClr val="B85B2E"/></a:accent2>
          <a:accent3><a:srgbClr val="6E8A3E"/></a:accent3>
          <a:accent4><a:srgbClr val="7C4F8A"/></a:accent4>
          <a:accent5><a:srgbClr val="B8A13B"/></a:accent5>
          <a:accent6><a:srgbClr val="A85B7E"/></a:accent6>
          <a:hlink><a:srgbClr val="2D6B8C"/></a:hlink>
          <a:folHlink><a:srgbClr val="7C4F8A"/></a:folHlink>
        </a:clrScheme>
        <a:fontScheme name="Portfolio">
          <a:majorFont>
            <a:latin typeface="Georgia"/>
            <a:ea typeface="Malgun Gothic"/>
            <a:cs typeface="Malgun Gothic"/>
          </a:majorFont>
          <a:minorFont>
            <a:latin typeface="Malgun Gothic"/>
            <a:ea typeface="Malgun Gothic"/>
            <a:cs typeface="Malgun Gothic"/>
          </a:minorFont>
        </a:fontScheme>
        <a:fmtScheme name="Portfolio">
          <a:fillStyleLst>
            <a:solidFill><a:schemeClr val="lt1"/></a:solidFill>
            <a:solidFill><a:schemeClr val="lt2"/></a:solidFill>
            <a:solidFill><a:schemeClr val="accent1"/></a:solidFill>
          </a:fillStyleLst>
          <a:lnStyleLst>
            <a:ln w="9525"><a:solidFill><a:schemeClr val="accent1"/></a:solidFill><a:prstDash val="solid"/></a:ln>
            <a:ln w="12700"><a:solidFill><a:schemeClr val="accent2"/></a:solidFill><a:prstDash val="solid"/></a:ln>
            <a:ln w="19050"><a:solidFill><a:schemeClr val="accent3"/></a:solidFill><a:prstDash val="solid"/></a:ln>
          </a:lnStyleLst>
          <a:effectStyleLst>
            <a:effectStyle><a:effectLst/></a:effectStyle>
            <a:effectStyle><a:effectLst/></a:effectStyle>
            <a:effectStyle><a:effectLst/></a:effectStyle>
          </a:effectStyleLst>
          <a:bgFillStyleLst>
            <a:solidFill><a:schemeClr val="lt1"/></a:solidFill>
            <a:solidFill><a:schemeClr val="lt1"/></a:solidFill>
            <a:solidFill><a:schemeClr val="lt1"/></a:solidFill>
          </a:bgFillStyleLst>
        </a:fmtScheme>
      </a:themeElements>
      <a:objectDefaults/>
      <a:extraClrSchemeLst/>
    </a:theme>
  `);
}

function buildPresentation(slideCount) {
  const slideRelIds = Array.from({ length: slideCount }, (_, index) => `rId${index + 2}`);
  const slideEntries = slideRelIds
    .map((relId, index) => `<p:sldId id="${256 + index}" r:id="${relId}"/>`)
    .join("");
  return xmlDecl(`
    <p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
      <p:sldMasterIdLst>
        <p:sldMasterId id="2147483648" r:id="rId1"/>
      </p:sldMasterIdLst>
      <p:sldIdLst>
        ${slideEntries}
      </p:sldIdLst>
      <p:sldSz cx="${EMU_WIDTH}" cy="${EMU_HEIGHT}" type="custom"/>
      <p:notesSz cx="6858000" cy="9144000"/>
      <p:defaultTextStyle/>
    </p:presentation>
  `);
}

function buildPresentationRels(slideCount) {
  const rels = [
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`,
    ...Array.from({ length: slideCount }, (_, index) => `<Relationship Id="rId${index + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`),
    `<Relationship Id="rId${slideCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>`,
    `<Relationship Id="rId${slideCount + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>`,
  ];
  return xmlDecl(`
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      ${rels.join("\n      ")}
    </Relationships>
  `);
}

function buildSlideMaster() {
  return xmlDecl(`
    <p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
      <p:cSld name="Portfolio Master">
        <p:spTree>
          <p:nvGrpSpPr>
            <p:cNvPr id="1" name=""/>
            <p:cNvGrpSpPr/>
            <p:nvPr/>
          </p:nvGrpSpPr>
          <p:grpSpPr>
            <a:xfrm>
              <a:off x="0" y="0"/>
              <a:ext cx="0" cy="0"/>
              <a:chOff x="0" y="0"/>
              <a:chExt cx="0" cy="0"/>
            </a:xfrm>
          </p:grpSpPr>
        </p:spTree>
      </p:cSld>
      <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
      <p:sldLayoutIdLst>
        <p:sldLayoutId id="2147483649" r:id="rId1"/>
      </p:sldLayoutIdLst>
      <p:txStyles>
        <p:titleStyle/>
        <p:bodyStyle/>
        <p:otherStyle/>
      </p:txStyles>
    </p:sldMaster>
  `);
}

function buildSlideMasterRels() {
  return xmlDecl(`
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
      <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
    </Relationships>
  `);
}

function buildSlideLayout() {
  return xmlDecl(`
    <p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1" matchingName="Blank">
      <p:cSld name="Blank">
        <p:spTree>
          <p:nvGrpSpPr>
            <p:cNvPr id="1" name=""/>
            <p:cNvGrpSpPr/>
            <p:nvPr/>
          </p:nvGrpSpPr>
          <p:grpSpPr>
            <a:xfrm>
              <a:off x="0" y="0"/>
              <a:ext cx="0" cy="0"/>
              <a:chOff x="0" y="0"/>
              <a:chExt cx="0" cy="0"/>
            </a:xfrm>
          </p:grpSpPr>
        </p:spTree>
      </p:cSld>
      <p:clrMapOvr>
        <a:masterClrMapping/>
      </p:clrMapOvr>
    </p:sldLayout>
  `);
}

function buildSlideLayoutRels() {
  return xmlDecl(`
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
    </Relationships>
  `);
}

function buildSlideXml(imageRelId = "rId2", layoutRelId = "rId1", description = "Slide image") {
  return xmlDecl(`
    <p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
      <p:cSld>
        <p:spTree>
          <p:nvGrpSpPr>
            <p:cNvPr id="1" name=""/>
            <p:cNvGrpSpPr/>
            <p:nvPr/>
          </p:nvGrpSpPr>
          <p:grpSpPr>
            <a:xfrm>
              <a:off x="0" y="0"/>
              <a:ext cx="${EMU_WIDTH}" cy="${EMU_HEIGHT}"/>
              <a:chOff x="0" y="0"/>
              <a:chExt cx="${EMU_WIDTH}" cy="${EMU_HEIGHT}"/>
            </a:xfrm>
          </p:grpSpPr>
          <p:pic>
            <p:nvPicPr>
              <p:cNvPr id="2" name="Portfolio Slide" descr="${escapeXml(description)}"/>
              <p:cNvPicPr>
                <a:picLocks noChangeAspect="1"/>
              </p:cNvPicPr>
              <p:nvPr/>
            </p:nvPicPr>
            <p:blipFill>
              <a:blip r:embed="${imageRelId}" cstate="none"/>
              <a:stretch><a:fillRect/></a:stretch>
            </p:blipFill>
            <p:spPr>
              <a:xfrm>
                <a:off x="0" y="0"/>
                <a:ext cx="${EMU_WIDTH}" cy="${EMU_HEIGHT}"/>
              </a:xfrm>
              <a:prstGeom prst="rect">
                <a:avLst/>
              </a:prstGeom>
            </p:spPr>
          </p:pic>
        </p:spTree>
      </p:cSld>
      <p:clrMapOvr>
        <a:masterClrMapping/>
      </p:clrMapOvr>
    </p:sld>
  `);
}

function buildSlideRels(imageName) {
  return xmlDecl(`
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
      <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${imageName}"/>
    </Relationships>
  `);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeFile(filePath, contents) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, contents, "utf8");
}

async function renderSlides(slideSpecs, workDir) {
  const mediaDir = path.join(workDir, "ppt", "media");
  const slidesDir = path.join(workDir, "ppt", "slides");
  const relsDir = path.join(slidesDir, "_rels");
  await ensureDir(mediaDir);
  await ensureDir(relsDir);

  const slideTitles = [];

  for (let index = 0; index < slideSpecs.length; index += 1) {
    const slide = slideSpecs[index];
    const imageName = `slide${index + 1}.png`;
    const pngPath = path.join(mediaDir, imageName);
    const buffer = await buildSlideImage(slide.svg);
    await fs.writeFile(pngPath, buffer);
    await writeFile(path.join(slidesDir, `slide${index + 1}.xml`), buildSlideXml("rId2", "rId1", slide.title));
    await writeFile(path.join(relsDir, `slide${index + 1}.xml.rels`), buildSlideRels(imageName));
    slideTitles.push(slide.title);
  }

  return slideTitles;
}

async function buildPptx(slideSpecs, output) {
  const workDir = path.join(os.tmpdir(), `portfolio-pptx-${Date.now()}`);
  const outputExt = path.extname(output).toLowerCase();
  const zipOutput =
    outputExt === ".zip"
      ? output
      : path.join(
          path.dirname(output),
          `${path.basename(output, outputExt || ".pptx")}.zip`
        );
  await ensureDir(workDir);

  try {
    const slideTitles = await renderSlides(slideSpecs, workDir);
    await writeFile(path.join(workDir, "[Content_Types].xml"), buildContentTypes(slideSpecs.length));
    await writeFile(path.join(workDir, "_rels", ".rels"), buildRootRels());
    await writeFile(path.join(workDir, "docProps", "core.xml"), buildCoreProps());
    await writeFile(path.join(workDir, "docProps", "app.xml"), buildAppProps(slideTitles));
    await writeFile(path.join(workDir, "ppt", "presentation.xml"), buildPresentation(slideSpecs.length));
    await writeFile(path.join(workDir, "ppt", "_rels", "presentation.xml.rels"), buildPresentationRels(slideSpecs.length));
    await writeFile(path.join(workDir, "ppt", "presProps.xml"), buildPresProps());
    await writeFile(path.join(workDir, "ppt", "theme", "theme1.xml"), buildTheme());
    await writeFile(path.join(workDir, "ppt", "slideMasters", "slideMaster1.xml"), buildSlideMaster());
    await writeFile(path.join(workDir, "ppt", "slideMasters", "_rels", "slideMaster1.xml.rels"), buildSlideMasterRels());
    await writeFile(path.join(workDir, "ppt", "slideLayouts", "slideLayout1.xml"), buildSlideLayout());
    await writeFile(path.join(workDir, "ppt", "slideLayouts", "_rels", "slideLayout1.xml.rels"), buildSlideLayoutRels());

    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `Set-Location '${workDir}'; Compress-Archive -Path * -DestinationPath '${zipOutput}' -Force`,
      ],
      { stdio: "inherit" }
    );

    if (zipOutput !== output) {
      await fs.rm(output, { force: true });
      await fs.rename(zipOutput, output);
    }

    return workDir;
  } catch (error) {
    await fs.rm(workDir, { recursive: true, force: true });
    throw error;
  }
}

function buildSlideSpecs(data) {
  const slides = [];

  slides.push({
    title: "Cover",
    svg: buildCoverSlide(data.profile),
  });
  slides.push({
    title: "About",
    svg: buildAboutSlide(data.profile),
  });
  slides.push({
    title: "Tech Stack",
    svg: buildTechSlide(data.techStack),
  });

  let slideNo = 4;
  for (const project of data.projects) {
    const projectSlides = buildProjectSlides(project, slideNo);
    slides.push({
      title: `${project.displayName} Overview`,
      svg: projectSlides[0],
    });
    slides.push({
      title: `${project.displayName} Deep Dive`,
      svg: projectSlides[1],
    });
    slideNo += 2;
  }

  slides.push({
    title: "Experience",
    svg: buildExperienceSlide(data.experience, data.awards),
  });
  slides.push({
    title: "Education & Contact",
    svg: buildEducationContactSlide(data.education, data.profile),
  });

  return slides;
}

async function main() {
  const dataRoot = path.join(ROOT, "src", "data");
  const profileModule = loadTsModule(path.join(dataRoot, "profile.ts"));
  const projectsModule = loadTsModule(path.join(dataRoot, "projects.ts"));
  const techModule = loadTsModule(path.join(dataRoot, "tech-stack.ts"));
  const data = {
    profile: profileModule.profile,
    awards: profileModule.awards,
    experience: profileModule.experience,
    education: profileModule.education,
    projects: projectsModule.projects,
    techStack: techModule.techStack,
  };

  const slideSpecs = buildSlideSpecs(data);
  const workDir = await buildPptx(slideSpecs, outputPath);

  if (!keepTemp) {
    await fs.rm(workDir, { recursive: true, force: true });
  } else {
    console.log(`Kept temp files at ${workDir}`);
  }

  console.log(`Wrote ${outputPath}`);
}

await main();
