/**
 * Multi-Platform 4K Ultra-Sharp Video (.MP4) & Image (.PNG) Exporter
 * Engineered for maximum Luma/Chroma sharpness on LinkedIn, YouTube, Instagram & Facebook:
 *  - LinkedIn Phone/Feed (4:5 Portrait  — 2160×2700 4K / 1728×2160 4K MP4 & 2160×2700 4K PNG)
 *  - YouTube & LinkedIn Laptop (16:9 4K — 3840×2160 4K UHD MP4 & PNG)
 *  - Universal Square (1:1 4K Square    — 2160×2160 4K MP4 & 3840×3840 4K PNG)
 *  - Instagram Phone (9:16 Vertical     — 2160×3840 4K / 1440×2560 QHD MP4 & 2160×3840 4K PNG)
 *  - YouTube Phone   (9:16 Shorts       — 2160×3840 4K / 1440×2560 QHD MP4 & 2160×3840 4K PNG)
 *  - Facebook Phone  (9:16 Vertical     — 2160×3840 4K / 1440×2560 QHD MP4 & 2160×3840 4K PNG)
 */
(function () {
  const BASE = 1080;

  // Platform Presets with Ultra-Sharp 4K / 2x Retina Super-Sampled Video Candidates (55 Mbps)
  let isGifRenderMode = false;

  const PLATFORM_PRESETS = {
    "linkedin-phone": {
      id: "linkedin-phone",
      label: "LinkedIn Phone & Feed (4K Ultra-Sharp — 2160×2160)",
      shortLabel: "💼 LinkedIn 4K",
      badge: "WORLDGYAN.COM · ASHUTOSH KUMAR CHOUBEY",
      logicalW: 1080,
      logicalH: 1080,
      pngW: 3840,
      pngH: 3840,
      gifW: 2160,
      gifH: 2160,
      videoCandidates: [
        { w: 2160, h: 2160, bitrate: 55_000_000 },
        { w: 1440, h: 1440, bitrate: 45_000_000 },
        { w: 1080, h: 1080, bitrate: 35_000_000 },
      ],
    },
    "laptop-4k": {
      id: "laptop-4k",
      label: "LinkedIn & YouTube Laptop (16:9 4K UHD — 3840×2160)",
      shortLabel: "💻 LinkedIn/YT Laptop (16:9 4K)",
      badge: "WORLDGYAN.COM · ASHUTOSH KUMAR CHOUBEY",
      logicalW: 1920,
      logicalH: 1080,
      pngW: 3840,
      pngH: 2160,
      gifW: 3840,
      gifH: 2160,
      videoCandidates: [
        { w: 3840, h: 2160, bitrate: 60_000_000 },
        { w: 2560, h: 1440, bitrate: 45_000_000 },
        { w: 1920, h: 1080, bitrate: 35_000_000 },
      ],
    },
    "square-4k": {
      id: "square-4k",
      label: "LinkedIn & Universal Square (1:1 4K — 2160×2160)",
      shortLabel: "⬛ LinkedIn/Universal 4K (1:1)",
      badge: "WORLDGYAN.COM · ASHUTOSH KUMAR CHOUBEY",
      logicalW: 1080,
      logicalH: 1080,
      pngW: 3840,
      pngH: 3840,
      gifW: 2160,
      gifH: 2160,
      videoCandidates: [
        { w: 2160, h: 2160, bitrate: 55_000_000 },
        { w: 1440, h: 1440, bitrate: 40_000_000 },
        { w: 1080, h: 1080, bitrate: 30_000_000 },
      ],
    },
    "insta-phone": {
      id: "insta-phone",
      label: "Instagram Phone (9:16 4K Reel — 2160×3840)",
      shortLabel: "📸 Instagram Phone 4K (9:16)",
      badge: "WORLDGYAN.COM · ASHUTOSH KUMAR CHOUBEY",
      logicalW: 1080,
      logicalH: 1920,
      pngW: 2160,
      pngH: 3840,
      gifW: 2160,
      gifH: 3840,
      videoCandidates: [
        { w: 2160, h: 3840, bitrate: 55_000_000 },
        { w: 1440, h: 2560, bitrate: 45_000_000 },
        { w: 1216, h: 2160, bitrate: 38_000_000 },
        { w: 1080, h: 1920, bitrate: 32_000_000 },
      ],
    },
    "yt-phone": {
      id: "yt-phone",
      label: "YouTube Phone (9:16 4K Short — 2160×3840)",
      shortLabel: "▶️ YouTube Phone 4K (9:16)",
      badge: "WORLDGYAN.COM · ASHUTOSH KUMAR CHOUBEY",
      logicalW: 1080,
      logicalH: 1920,
      pngW: 2160,
      pngH: 3840,
      gifW: 2160,
      gifH: 3840,
      videoCandidates: [
        { w: 2160, h: 3840, bitrate: 55_000_000 },
        { w: 1440, h: 2560, bitrate: 45_000_000 },
        { w: 1216, h: 2160, bitrate: 38_000_000 },
        { w: 1080, h: 1920, bitrate: 32_000_000 },
      ],
    },
    "fb-phone": {
      id: "fb-phone",
      label: "Facebook Phone (9:16 4K Short — 2160×3840)",
      shortLabel: "📘 Facebook Phone 4K (9:16)",
      badge: "WORLDGYAN.COM · ASHUTOSH KUMAR CHOUBEY",
      logicalW: 1080,
      logicalH: 1920,
      pngW: 2160,
      pngH: 3840,
      gifW: 2160,
      gifH: 3840,
      videoCandidates: [
        { w: 2160, h: 3840, bitrate: 55_000_000 },
        { w: 1440, h: 2560, bitrate: 45_000_000 },
        { w: 1216, h: 2160, bitrate: 38_000_000 },
        { w: 1080, h: 1920, bitrate: 32_000_000 },
      ],
    },
  };

  function getSceneKey(sceneName) {
    if (sceneName.includes("interceptor")) return "interceptor-pipeline";
    if (sceneName.includes("refresh-token")) return "refresh-token-flow";
    if (sceneName.includes("oauth2") || sceneName.includes("pkce")) return "oauth2-pkce-flow";
    if (sceneName.includes("auth-types") || sceneName.includes("auth-models")) return "auth-types-matrix";
    if (sceneName.includes("project-flow") || sceneName.includes("boot")) return "boot";
    if (sceneName.includes("angular-json")) return "angular-json";
    if (sceneName.includes("package-json")) return "package-json";
    if (sceneName.includes("build-types") || sceneName.includes("build-matrix")) return "build-matrix";
    if (sceneName.includes("writable")) return "writable";
    if (sceneName.includes("linked")) return "linked";
    if (sceneName.includes("zoneless")) return "zoneless";
    return "computed";
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.closePath();
  }

  function drawBackgroundGrid(ctx, w, h) {
    if (isGifRenderMode) {
      // Solid obsidian background in 4K GIF mode prevents circular gradient banding & maximizes LZW sharpness
      ctx.fillStyle = "#070c18";
      ctx.fillRect(0, 0, w, h);
    } else {
      const bgGrad = ctx.createRadialGradient(w * 0.25, h * 0.3, 40, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
      bgGrad.addColorStop(0, "#0f223d");
      bgGrad.addColorStop(0.55, "#0f172a");
      bgGrad.addColorStop(1, "#060a14");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.strokeStyle = isGifRenderMode ? "#0d1629" : "rgba(56, 189, 248, 0.045)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function drawMacShell(ctx, rightBadge, progress, skipOuterBg) {
    if (!skipOuterBg) {
      drawBackgroundGrid(ctx, BASE, BASE);
    }

    // macOS Window (1000x1000 at 40,40)
    ctx.save();
    if (!isGifRenderMode) {
      ctx.shadowColor = "rgba(2, 6, 23, 0.9)";
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 18;
    }
    roundRect(ctx, 40, 40, 1000, 1000, 20);
    ctx.fillStyle = "#0f172a";
    ctx.fill();
    ctx.restore();

    roundRect(ctx, 40, 40, 1000, 1000, 20);
    ctx.strokeStyle = isGifRenderMode ? "#334155" : "rgba(148, 163, 184, 0.26)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Titlebar (height 56)
    ctx.save();
    roundRect(ctx, 40, 40, 1000, 56, [20, 20, 0, 0]);
    if (isGifRenderMode) {
      ctx.fillStyle = "#111c33";
    } else {
      const tbGrad = ctx.createLinearGradient(0, 40, 0, 96);
      tbGrad.addColorStop(0, "#131d36");
      tbGrad.addColorStop(1, "#0b1121");
      ctx.fillStyle = tbGrad;
    }
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 96);
    ctx.lineTo(1040, 96);
    ctx.stroke();

    // Traffic light dots
    const dots = [
      { x: 68, color: "#ff5f56" },
      { x: 90, color: "#ffbd2e" },
      { x: 112, color: "#27c93f" },
    ];
    dots.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, 68, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = d.color;
      ctx.fill();
    });

    // Clean single Address Bar
    roundRect(ctx, 290, 51, 470, 34, 8);
    ctx.fillStyle = "#070c18";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "600 12.5px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("https://worldgyan.com/courses/angular-architecture", 525, 72);

    // Right API Pill
    roundRect(ctx, 878, 54, 140, 28, 14);
    ctx.fillStyle = "rgba(6, 182, 212, 0.14)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(894, 68, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#67e8f9";
    ctx.fill();

    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#67e8f9";
    ctx.textAlign = "left";
    ctx.fillText(rightBadge || "computed()", 904, 72);

    // Progress bar at bottom of window (y = 1016)
    roundRect(ctx, 68, 1016, 944, 6, 3);
    ctx.fillStyle = "#090f1d";
    ctx.fill();

    roundRect(ctx, 68, 1016, Math.max(8, 944 * progress), 6, 3);
    const pGrad = ctx.createLinearGradient(68, 0, 1012, 0);
    pGrad.addColorStop(0, "#06b6d4");
    pGrad.addColorStop(0.5, "#38bdf8");
    pGrad.addColorStop(1, "#10b981");
    ctx.fillStyle = pGrad;
    ctx.fill();
  }

  // ---------------------------------------------------------------------------
  // CORE 1080x1080 SCENES (Zero Duplicated Text)
  // ---------------------------------------------------------------------------
  function drawComputedScene(ctx, t, skipOuterBg) {
    const isMutated = t >= 0.22 && t <= 0.88;
    const isDerived = t >= 0.45 && t <= 0.88;
    const isDomUpdated = t >= 0.56 && t <= 0.88;

    drawMacShell(ctx, "computed()", t, skipOuterBg);

    roundRect(ctx, 68, 116, 330, 88, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "700 10.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "left";
    ctx.fillText("REACTIVE DEPENDENCY GRAPH", 88, 145);

    ctx.font = "800 18.5px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Signal Part 1:", 88, 170);
    ctx.fillText("computed() Graph (O(1))", 88, 192);

    roundRect(ctx, 414, 116, 598, 88, 14);
    ctx.fillStyle = "#080d1a";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "600 11.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = isMutated ? "#67e8f9" : "#cbd5e1";
    ctx.fillText(
      isMutated
        ? "const firstName = signal('Grace');    // v1 ➔ v2 ⚡"
        : "const firstName = signal('Ada');      // Producer Node A",
      432,
      142
    );
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("const lastName  = signal('Lovelace'); // Cached Node B", 432, 164);
    ctx.fillStyle = isDerived ? "#34d399" : "#cbd5e1";
    ctx.fillText("const fullName  = computed(() => `${firstName()} ${lastName()}`);", 432, 186);

    roundRect(ctx, 68, 220, 944, 744, 18);
    ctx.fillStyle = "#070c18";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    const headers = [
      { x: 94, w: 266, text: "1. SOURCE SIGNALS (PRODUCERS)" },
      { x: 404, w: 280, text: "2. COMPUTED SIGNAL (NODE C)" },
      { x: 744, w: 242, text: "3. DOM VIEW SUBTREE" },
    ];
    headers.forEach((h) => {
      roundRect(ctx, h.x, 240, h.w, 28, 8);
      ctx.fillStyle = "#0b1325";
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.stroke();
      ctx.font = "700 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(h.text, h.x + h.w / 2, 258);
    });

    ctx.strokeStyle = isMutated ? "#38bdf8" : "#1e293b";
    ctx.lineWidth = isMutated ? 4.5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(360, 410);
    ctx.lineTo(485, 410);
    ctx.lineTo(520, 455);
    ctx.stroke();

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(360, 740);
    ctx.lineTo(485, 740);
    ctx.lineTo(520, 695);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = isDomUpdated ? "#34d399" : "#1e293b";
    ctx.lineWidth = isDomUpdated ? 4.5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(684, 575);
    ctx.lineTo(744, 575);
    ctx.stroke();

    // Node A
    roundRect(ctx, 94, 310, 266, 200, 16);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = isMutated ? "#38bdf8" : "#263554";
    ctx.lineWidth = isMutated ? 2.8 : 1.8;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "800 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#67e8f9";
    ctx.fillText("NODE A · PRODUCER", 114, 340);
    ctx.textAlign = "right";
    ctx.fillText(isMutated ? "v2 (pulsed)" : "v1 (init)", 340, 340);

    ctx.textAlign = "left";
    ctx.font = "800 16px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("firstName", 114, 378);
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("signal<string>", 245, 378);

    roundRect(ctx, 114, 396, 226, 56, 10);
    ctx.fillStyle = "#060b16";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("VALUE", 126, 428);
    ctx.textAlign = "right";
    ctx.font = "800 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = isMutated ? "#67e8f9" : "#f8fafc";
    ctx.fillText(isMutated ? "'Grace'" : "'Ada'", 328, 429);

    ctx.textAlign = "left";
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("firstName.set('Grace')", 114, 484);

    // Node B
    roundRect(ctx, 94, 640, 266, 200, 16);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = "800 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("NODE B · PRODUCER", 114, 670);
    ctx.textAlign = "right";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("v1 (clean)", 340, 670);

    ctx.textAlign = "left";
    ctx.font = "800 16px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("lastName", 114, 708);

    roundRect(ctx, 114, 726, 226, 56, 10);
    ctx.fillStyle = "#060b16";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("VALUE", 126, 758);
    ctx.textAlign = "right";
    ctx.font = "800 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("'Lovelace'", 328, 759);

    ctx.textAlign = "left";
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Cached · 0 re-evaluations", 114, 814);

    // Node C
    roundRect(ctx, 404, 455, 280, 240, 16);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = isDerived ? "#34d399" : "#263554";
    ctx.lineWidth = isDerived ? 2.8 : 1.8;
    ctx.stroke();

    ctx.font = "800 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("NODE C · COMPUTED", 424, 486);
    ctx.textAlign = "right";
    ctx.fillText(isDerived ? "v2 (derived)" : "v1 (cached)", 664, 486);

    ctx.textAlign = "left";
    ctx.font = "800 16px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("fullName = computed()", 424, 522);

    roundRect(ctx, 424, 540, 240, 34, 8);
    ctx.fillStyle = "#081121";
    ctx.fill();
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("`${firstName()} ${lastName()}`", 436, 561);

    roundRect(ctx, 424, 588, 240, 56, 10);
    ctx.fillStyle = "#060b16";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("OUTPUT", 434, 620);
    ctx.textAlign = "right";
    ctx.font = "800 14.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = isDerived ? "#34d399" : "#f8fafc";
    ctx.fillText(isDerived ? "'Grace Lovelace' ⚡" : "'Ada Lovelace'", 654, 621);

    const domNodes = [
      { y: 310, tag: "<app-header>", val: "Navigation Bar", sub: "DOM Checks: 0 (Skipped)", active: false },
      { y: 500, tag: "<h2>{{ fullName() }}</h2>", val: isDomUpdated ? "Grace Lovelace" : "Ada Lovelace", sub: "Targeted O(1) DOM Patch", active: isDomUpdated },
      { y: 690, tag: "<app-footer>", val: "Footer Links", sub: "DOM Checks: 0 (Skipped)", active: false },
    ];
    domNodes.forEach((n) => {
      roundRect(ctx, 744, n.y, 242, 150, 14);
      ctx.fillStyle = n.active ? "#0d1f2d" : "#0b1220";
      ctx.fill();
      ctx.strokeStyle = n.active ? "#34d399" : "#1e293b";
      ctx.lineWidth = n.active ? 2.5 : 1.5;
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.font = "700 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = n.active ? "#34d399" : "#94a3b8";
      ctx.fillText(n.tag, 762, n.y + 30);

      roundRect(ctx, 762, n.y + 48, 206, 52, 8);
      ctx.fillStyle = "#050912";
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.font = "800 14px -apple-system, sans-serif";
      ctx.fillStyle = n.active ? "#34d399" : "#cbd5e1";
      ctx.fillText(n.val, 865, n.y + 80);

      ctx.textAlign = "left";
      ctx.font = "600 10.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#64748b";
      ctx.fillText(n.sub, 762, n.y + 128);
    });

    if (t >= 0.24 && t <= 0.46) {
      const p = (t - 0.24) / 0.22;
      let px, py;
      if (p < 0.72) {
        const seg = p / 0.72;
        px = 360 + (485 - 360) * seg;
        py = 410;
      } else {
        const seg = (p - 0.72) / 0.28;
        px = 485 + (520 - 485) * seg;
        py = 410 + (455 - 410) * seg;
      }
      const glow = ctx.createRadialGradient(px, py, 2, px, py, 22);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.35, "#67e8f9");
      glow.addColorStop(1, "rgba(6, 182, 212, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    if (t >= 0.46 && t <= 0.58) {
      const p = (t - 0.46) / 0.12;
      const px = 684 + (744 - 684) * p;
      const py = 575;
      const glow = ctx.createRadialGradient(px, py, 2, px, py, 20);
      glow.addColorStop(0, "#ffffff");
      glow.addColorStop(0.35, "#34d399");
      glow.addColorStop(1, "rgba(16, 185, 129, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Node A ('Grace') ➔ Node C ('Grace Lovelace') ➔ O(1) DOM", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawWritableScene(ctx, t, skipOuterBg) {
    const isUpdated = t >= 0.34 && t <= 0.88;
    drawMacShell(ctx, "signal()", t, skipOuterBg);

    roundRect(ctx, 68, 116, 944, 78, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("FINE-GRAINED PUSH / PULL REACTIVITY", 92, 144);
    ctx.font = "800 20px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Signal Part 2: signal(0) Producer ➔ .update(n => n + 1) ➔ O(1) DOM", 92, 174);

    roundRect(ctx, 68, 214, 500, 744, 16);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("counter.component.ts", 94, 248);

    const lines = [
      { n: "01", text: "import { Component, signal } from '@angular/core';", c: "#94a3b8" },
      { n: "02", text: "@Component({", c: "#c084fc" },
      { n: "03", text: "  selector: 'app-counter',", c: "#cbd5e1" },
      { n: "04", text: "  template: `<span>Count: {{ count() }}</span>`", c: "#fcd34d" },
      { n: "05", text: "})", c: "#c084fc" },
      { n: "06", text: "export class CounterComponent {", c: "#38bdf8" },
      { n: "07", text: "  // 1. Create Reactive Producer Node", c: "#64748b" },
      { n: "08", text: `  readonly count = signal(${isUpdated ? "1" : "0"});`, c: "#67e8f9" },
      { n: "09", text: "", c: "#cbd5e1" },
      { n: "10", text: "  increment() {", c: "#38bdf8" },
      { n: "11", text: "    // 2. Mutate Producer & Bump Version", c: "#64748b" },
      { n: "12", text: "    this.count.update(n => n + 1);", c: "#34d399", hlUpdate: isUpdated },
      { n: "13", text: "  }", c: "#38bdf8" },
      { n: "14", text: "}", c: "#38bdf8" },
    ];

    lines.forEach((l, i) => {
      const y = 295 + i * 32;
      if (l.hlUpdate) {
        roundRect(ctx, 80, y - 20, 476, 28, 6);
        ctx.fillStyle = "rgba(16, 185, 129, 0.18)";
        ctx.fill();
      }
      ctx.font = "600 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#475569";
      ctx.fillText(l.n, 92, y);
      ctx.fillStyle = l.c;
      ctx.fillText(l.text, 126, y);
    });

    roundRect(ctx, 92, 780, 452, 150, 12);
    ctx.fillStyle = "#0b1120";
    ctx.fill();
    ctx.strokeStyle = isUpdated ? "#38bdf8" : "#1e293b";
    ctx.stroke();

    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("INTERNAL SIGNAL_NODE MEMORY STATE", 112, 810);

    ctx.font = "800 16px 'JetBrains Mono', monospace";
    ctx.fillStyle = isUpdated ? "#34d399" : "#f8fafc";
    ctx.fillText(
      isUpdated ? "value: 1  |  version: v2  |  status: REFRESHED" : "value: 0  |  version: v1  |  status: CLEAN",
      112,
      860
    );
    ctx.font = "600 11.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Equality Check: Object.is(0, 1) === false ➔ Notify Consumer", 112, 902);

    roundRect(ctx, 592, 214, 420, 744, 16);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("🌐 Live Component Preview · Zoneless O(1)", 618, 248);

    roundRect(ctx, 622, 290, 360, 260, 16);
    ctx.fillStyle = "#0d1527";
    ctx.fill();
    ctx.strokeStyle = isUpdated ? "#34d399" : "#1e293b";
    ctx.lineWidth = isUpdated ? 2.8 : 1.5;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("<app-counter> · {{ count() }}", 802, 340);

    ctx.font = "800 54px 'JetBrains Mono', monospace";
    ctx.fillStyle = isUpdated ? "#34d399" : "#ffffff";
    ctx.fillText(isUpdated ? "Count: 1" : "Count: 0", 802, 425);

    roundRect(ctx, 682, 468, 240, 52, 12);
    ctx.fillStyle = isUpdated ? "#10b981" : "#1e293b";
    ctx.fill();
    ctx.font = "800 16px -apple-system, sans-serif";
    ctx.fillStyle = isUpdated ? "#052e16" : "#f8fafc";
    ctx.fillText("+ Increment Signal", 802, 500);

    roundRect(ctx, 622, 585, 360, 345, 14);
    ctx.fillStyle = "#0b1120";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("REACTIVE EXECUTION TRACE", 644, 624);

    ctx.font = "600 12.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("1. Producer: count = signal(0)", 644, 670);
    ctx.fillText("2. Action: count.update(n => n + 1)", 644, 715);
    ctx.fillStyle = isUpdated ? "#34d399" : "#94a3b8";
    ctx.fillText("3. Push: Version v1 ➔ v2 notified", 644, 760);
    ctx.fillText("4. Pull: <span> text patched (0.04ms)", 644, 805);
    ctx.fillStyle = "#64748b";
    ctx.fillText("5. Sibling Components Checked: 0", 644, 850);

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Producer v1 ➔ v2 notifies bound view in O(1)", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawLinkedSignalScene(ctx, t, skipOuterBg) {
    const phase = t < 0.28 ? 0 : t < 0.62 ? 1 : 2;
    drawMacShell(ctx, "linkedSignal()", t, skipOuterBg);

    roundRect(ctx, 68, 116, 944, 82, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("DEPENDENT WRITABLE STATE · ANGULAR v19+", 92, 145);
    ctx.font = "800 20px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Signal Part 3: linkedSignal() — Writable + Auto-Reset State", 92, 176);

    roundRect(ctx, 68, 216, 944, 520, 16);
    ctx.fillStyle = "#080d1a";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.strokeStyle = phase === 2 ? "#22d3ee" : "#1e293b";
    ctx.lineWidth = phase === 2 ? 5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(410, 355);
    ctx.bezierCurveTo(490, 355, 520, 455, 600, 455);
    ctx.stroke();

    ctx.strokeStyle = phase === 1 ? "#10b981" : "#1e293b";
    ctx.lineWidth = phase === 1 ? 5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(410, 585);
    ctx.bezierCurveTo(490, 585, 520, 495, 600, 495);
    ctx.stroke();

    roundRect(ctx, 110, 280, 300, 150, 14);
    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText("1. SOURCE SIGNAL", 132, 316);
    ctx.font = "800 17px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("activeCourse()", 132, 352);
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = phase === 2 ? "#fde047" : "#a5f3fc";
    ctx.fillText(phase === 2 ? "'Zoneless Angular' ⚡" : "'Angular Signals'", 132, 395);

    roundRect(ctx, 110, 510, 300, 150, 14);
    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#10b981";
    ctx.fillText("2. USER MANUAL OVERRIDE", 132, 546);
    ctx.font = "800 17px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("currentLesson.set(5)", 132, 582);
    ctx.font = "600 12.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#6ee7b7";
    ctx.fillText("Manual User Action", 132, 625);

    roundRect(ctx, 600, 380, 360, 190, 16);
    ctx.fillStyle = "#131c31";
    ctx.fill();
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#d8b4fe";
    ctx.fillText("DEPENDENT WRITABLE SIGNAL", 624, 418);
    ctx.font = "800 18px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("currentLesson = linkedSignal()", 624, 454);

    roundRect(ctx, 624, 478, 312, 58, 10);
    ctx.fillStyle = "#090d16";
    ctx.fill();
    ctx.strokeStyle = "#334155";
    ctx.stroke();

    ctx.font = "800 15px 'JetBrains Mono', monospace";
    if (phase === 0) {
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("currentLesson() ➔ 1 (Default)", 642, 514);
    } else if (phase === 1) {
      ctx.fillStyle = "#34d399";
      ctx.fillText("currentLesson() ➔ 5 (Manual!)", 642, 514);
    } else {
      ctx.fillStyle = "#22d3ee";
      ctx.fillText("currentLesson() ➔ 1 (Auto-Reset!)", 642, 514);
    }

    roundRect(ctx, 68, 754, 944, 204, 14);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "600 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("readonly activeCourse = signal('Angular Signals');", 94, 796);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("readonly currentLesson = linkedSignal({ source: this.activeCourse, computation: () => 1 });", 94, 834);
    ctx.fillStyle = phase === 1 ? "#34d399" : "#94a3b8";
    ctx.fillText("// Step 1 (Manual Override): this.currentLesson.set(5); ➔ currentLesson() === 5", 94, 878);
    ctx.fillStyle = phase === 2 ? "#22d3ee" : "#94a3b8";
    ctx.fillText("// Step 2 (Source Changes):  this.activeCourse.set('Zoneless Angular'); ➔ Resets to 1!", 94, 916);

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Writable state that auto-resets when source signal changes", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawZonelessScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "Zoneless O(1)", t, skipOuterBg);

    roundRect(ctx, 68, 116, 944, 82, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("CHANGE DETECTION ARCHITECTURE", 92, 145);
    ctx.font = "800 20px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Signal Part 4: Zone.js O(N) Sweep vs. Zoneless Signals O(1)", 92, 176);

    roundRect(ctx, 68, 216, 460, 620, 16);
    ctx.fillStyle = "#090d18";
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 63, 94, 0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "800 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#fb7185";
    ctx.fillText("🔴 Legacy Zone.js (Top-Down O(N) Sweep)", 92, 256);
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Checks ALL 6 components on any async event (4.8ms)", 92, 282);

    roundRect(ctx, 552, 216, 460, 620, 16);
    ctx.fillStyle = "#090d18";
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "800 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("🟢 Zoneless + Signals (Direct O(1) Patch)", 576, 256);
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Updates ONLY 1 target component view (0.08ms)", 576, 282);

    const treeNodes = [
      { x: 230, y: 340, label: "AppRoot", idx: 0 },
      { x: 130, y: 470, label: "Header", idx: 1 },
      { x: 330, y: 470, label: "Courses", idx: 2 },
      { x: 90, y: 610, label: "Nav", idx: 3 },
      { x: 215, y: 610, label: "Sidebar", idx: 4 },
      { x: 345, y: 610, label: "Signal [O(1)]", idx: 5 },
    ];

    const sweepIdx = Math.floor(((t * 1.6) % 1) * 6);
    treeNodes.forEach((n, i) => {
      const checked = i <= sweepIdx;
      roundRect(ctx, n.x, n.y, 130, 56, 10);
      ctx.fillStyle = checked ? "rgba(244, 63, 94, 0.18)" : "#0f172a";
      ctx.fill();
      ctx.strokeStyle = checked ? "#f43f5e" : "#1e293b";
      ctx.lineWidth = checked ? 2.2 : 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.font = "700 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = checked ? "#fda4af" : "#64748b";
      ctx.fillText(n.label, n.x + 65, n.y + 26);
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillText(checked ? "DIRTY CHECKED" : "WAITING", n.x + 65, n.y + 44);
    });

    treeNodes.forEach((n, i) => {
      const rx = n.x + 484;
      const isTarget = i === 5;
      roundRect(ctx, rx, n.y, 130, 56, 10);
      ctx.fillStyle = isTarget ? "rgba(16, 185, 129, 0.2)" : "#0f172a";
      ctx.fill();
      ctx.strokeStyle = isTarget ? "#10b981" : "#1e293b";
      ctx.lineWidth = isTarget ? 2.6 : 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.font = "700 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = isTarget ? "#6ee7b7" : "#475569";
      ctx.fillText(n.label, rx + 65, n.y + 26);
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillText(isTarget ? "⚡ O(1) PATCHED" : "SKIPPED (0ms)", rx + 65, n.y + 44);
    });

    roundRect(ctx, 68, 854, 944, 104, 14);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 13.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("export const appConfig = { providers: [provideZonelessChangeDetection()] };", 94, 898);
    ctx.font = "600 12.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("✓ Zero Zone.js (-35KB) · ✓ Clean Stack Traces · ✓ Pinpoint O(1) DOM Updates", 94, 932);

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Skips top-down tree sweeps · Patches only target view", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawBootFlowScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "Angular 22 Boot", t, skipOuterBg);

    roundRect(ctx, 68, 116, 944, 76, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("RUNTIME EXECUTION ARCHITECTURE", 92, 144);
    ctx.font = "800 20px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Project Flow Part 1: Modern Boot Pipeline", 92, 174);

    const steps = [
      { num: "01", title: "HTML Shell", file: "src/index.html", desc: "<base href=\"/\"> & <app-root>", col: "#c084fc", bg: "rgba(168,85,247,0.12)" },
      { num: "02", title: "Client Bootstrap", file: "src/main.ts", desc: "bootstrapApplication(AppComponent)", col: "#7dd3fc", bg: "rgba(56,189,248,0.12)" },
      { num: "03", title: "DI Providers", file: "src/app/app.config.ts", desc: "provideZonelessChangeDetection()", col: "#fde047", bg: "rgba(251,191,36,0.12)" },
      { num: "04", title: "Reactive Root", file: "AppComponent", desc: "Signal graph wakes, O(1) DOM patch", col: "#6ee7b7", bg: "rgba(52,211,153,0.12)" },
    ];

    const activeIndex = Math.floor((t * 4) % 4);

    steps.forEach((s, i) => {
      const cx = 68 + i * 242;
      roundRect(ctx, cx, 206, 226, 230, 14);
      ctx.fillStyle = i === activeIndex ? "#132142" : "#0d1527";
      ctx.fill();
      ctx.strokeStyle = i === activeIndex ? s.col : "#1e293b";
      ctx.lineWidth = i === activeIndex ? 2 : 1;
      ctx.stroke();

      roundRect(ctx, cx + 14, 222, 60, 22, 6);
      ctx.fillStyle = s.bg;
      ctx.fill();
      ctx.font = "800 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = s.col;
      ctx.fillText("STEP " + s.num, cx + 20, 237);

      ctx.font = "700 15px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(s.title, cx + 14, 270);

      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(s.file, cx + 14, 292);

      ctx.font = "500 11.5px -apple-system, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(s.desc, cx + 14, 330, 200);

      if (i === activeIndex) {
        roundRect(ctx, cx + 14, 385, 198, 36, 8);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();
        ctx.font = "700 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = s.col;
        ctx.fillText("⚡ ACTIVE EXECUTION", cx + 24, 408);
      }
    });

    roundRect(ctx, 68, 456, 944, 380, 14);
    ctx.fillStyle = "#050914";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.stroke();

    roundRect(ctx, 88, 476, 444, 340, 10);
    ctx.fillStyle = "#03060d";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("src/main.ts — Entrypoint", 104, 502);

    ctx.font = "500 12.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("import { bootstrapApplication } from '@angular/core';", 104, 536);
    ctx.fillText("import { appConfig } from './app/app.config';", 104, 564);
    ctx.fillText("import { AppComponent } from './app/app.component';", 104, 592);
    ctx.fillStyle = "#f472b6";
    ctx.fillText("bootstrapApplication(AppComponent, appConfig)", 104, 640);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("  .catch((err) => console.error(err));", 104, 668);

    roundRect(ctx, 550, 476, 442, 340, 10);
    ctx.fillStyle = "#03060d";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("src/app/app.config.ts — Zoneless Providers", 566, 502);

    ctx.font = "500 12.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("export const appConfig: ApplicationConfig = {", 566, 536);
    ctx.fillText("  providers: [", 566, 564);
    ctx.fillStyle = "#34d399";
    ctx.fillText("    provideZonelessChangeDetection(),", 566, 600);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("    provideRouter(routes),", 566, 628);
    ctx.fillText("    provideHttpClient(withFetch())", 566, 656);
    ctx.fillText("  ]", 566, 684);
    ctx.fillText("};", 566, 712);

    roundRect(ctx, 68, 854, 944, 104, 14);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Angular 22 Boot Sequence: HTML ➔ main.ts ➔ appConfig ➔ AppComponent (<app-root>)", 94, 898);
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("⚡ Zero Zone.js (-15kB) · Signals Microtask Reconciliation · Direct O(1) DOM Updates", 94, 932);

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Pure Standalone Architecture · Zero NgModules", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawAngularJsonScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "@angular/build:app", t, skipOuterBg);

    roundRect(ctx, 68, 116, 944, 76, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("BUILD MANIFEST SPECIFICATION", 92, 144);
    ctx.font = "800 20px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Project Flow Part 2: angular.json Line-by-Line", 92, 174);

    roundRect(ctx, 68, 206, 510, 630, 14);
    ctx.fillStyle = "#03060d";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("angular.json — Modern Application Target", 88, 236);

    const jsonLines = [
      { text: '{', col: '#94a3b8' },
      { text: '  "$schema": "./node_modules/@angular/cli/schema.json",', col: '#cbd5e1' },
      { text: '  "version": 1,', col: '#cbd5e1' },
      { text: '  "projects": {', col: '#94a3b8' },
      { text: '    "app": {', col: '#94a3b8' },
      { text: '      "projectType": "application",', col: '#cbd5e1' },
      { text: '      "architect": {', col: '#94a3b8' },
      { text: '        "builder": "@angular/build:application",', col: '#c084fc', hl: true },
      { text: '        "options": {', col: '#94a3b8' },
      { text: '          "outputPath": "dist/app",', col: '#cbd5e1' },
      { text: '          "index": "src/index.html",', col: '#cbd5e1' },
      { text: '          "browser": "src/main.ts",', col: '#7dd3fc', hl: true },
      { text: '          "server": "src/main.server.ts",', col: '#7dd3fc', hl: true },
      { text: '          "prerender": true,', col: '#34d399', hl: true },
      { text: '          "ssr": { "entry": "src/server.ts" },', col: '#fde047', hl: true },
      { text: '          "polyfills": [ ],', col: '#f472b6', hl: true },
      { text: '          "assets": ["public"],', col: '#cbd5e1' },
      { text: '          "styles": ["src/styles.css"]', col: '#cbd5e1' },
      { text: '        }', col: '#94a3b8' },
      { text: '      }', col: '#94a3b8' },
      { text: '    }', col: '#94a3b8' },
      { text: '  }', col: '#94a3b8' },
      { text: '}', col: '#94a3b8' },
    ];

    let ly = 264;
    jsonLines.forEach((l) => {
      if (l.hl) {
        roundRect(ctx, 74, ly - 14, 498, 20, 4);
        ctx.fillStyle = "rgba(168,85,247,0.12)";
        ctx.fill();
      }
      ctx.font = "500 11.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = l.col;
      ctx.fillText(l.text, 88, ly);
      ly += 23;
    });

    const cards = [
      { title: "@angular/build:application", tag: "CORE BUILDER", col: "#c084fc", desc: "Combines Vite for sub-second dev HMR with esbuild for ultra-fast production bundling." },
      { title: "browser & server Targets", tag: "DUAL OUTPUT", col: "#7dd3fc", desc: "Generates client assets in dist/browser and SSR Node server in dist/server in a single pass." },
      { title: "polyfills: [ ] (Zero Zone.js)", tag: "ZONELESS", col: "#f472b6", desc: "Empty polyfills eliminates 15 kB Zone.js monkey patching. Full Signal-based scheduling." },
      { title: "prerender: true & ssr", tag: "HYBRID RENDER", col: "#34d399", desc: "Static Site Generation (SSG) compiles HTML routes at build time for instant TTFB." },
    ];

    cards.forEach((c, idx) => {
      const cy = 206 + idx * 158;
      roundRect(ctx, 598, cy, 414, 144, 14);
      ctx.fillStyle = "#0d1527";
      ctx.fill();
      ctx.strokeStyle = c.col;
      ctx.lineWidth = 1;
      ctx.stroke();

      roundRect(ctx, 616, cy + 16, 96, 20, 6);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.font = "800 9.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.col;
      ctx.fillText(c.tag, 626, cy + 30);

      ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(c.title, 616, cy + 62);

      ctx.font = "500 12px -apple-system, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(c.desc, 616, cy + 90, 378);
    });

    roundRect(ctx, 68, 854, 944, 104, 14);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("Angular 22 Build Engine: Replaces legacy @angular-devkit/build-angular:browser", 94, 898);
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("⚡ Unified Vite dev-server & esbuild production pipeline · Built-in SSR & Prerender", 94, 932);

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Schema-Validated JSON Manifest", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawPackageJsonScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "package.json v22", t, skipOuterBg);

    roundRect(ctx, 68, 116, 944, 76, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("DEPENDENCY MANIFEST SPECIFICATION", 92, 144);
    ctx.font = "800 20px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Project Flow Part 3: package.json Line-by-Line", 92, 174);

    roundRect(ctx, 68, 206, 510, 630, 14);
    ctx.fillStyle = "#03060d";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("package.json — Angular 22 Zoneless Tooling", 88, 236);

    const pkgLines = [
      { text: '{', col: '#94a3b8' },
      { text: '  "scripts": {', col: '#94a3b8' },
      { text: '    "start": "ng serve",', col: '#cbd5e1' },
      { text: '    "build": "ng build",', col: '#34d399', hl: true },
      { text: '    "watch": "ng build --watch --config dev"', col: '#cbd5e1' },
      { text: '  },', col: '#94a3b8' },
      { text: '  "dependencies": {', col: '#94a3b8' },
      { text: '    "@angular/core": "^22.0.0",', col: '#38bdf8', hl: true },
      { text: '    "@angular/common": "^22.0.0",', col: '#cbd5e1' },
      { text: '    "@angular/router": "^22.0.0",', col: '#cbd5e1' },
      { text: '    "@angular/ssr": "^22.0.0",', col: '#fde047', hl: true },
      { text: '    "rxjs": "~7.8.0",', col: '#cbd5e1' },
      { text: '    "tslib": "^2.3.0"', col: '#cbd5e1' },
      { text: '  },', col: '#94a3b8' },
      { text: '  "devDependencies": {', col: '#94a3b8' },
      { text: '    "@angular/build": "^22.0.0",', col: '#c084fc', hl: true },
      { text: '    "@angular/cli": "^22.0.0",', col: '#cbd5e1' },
      { text: '    "@angular/compiler-cli": "^22.0.0",', col: '#cbd5e1' },
      { text: '    "typescript": "~5.8.0"', col: '#38bdf8', hl: true },
      { text: '  }', col: '#94a3b8' },
      { text: '}', col: '#94a3b8' },
    ];

    let py = 268;
    pkgLines.forEach((l) => {
      if (l.hl) {
        roundRect(ctx, 74, py - 14, 498, 22, 4);
        ctx.fillStyle = "rgba(52,211,153,0.12)";
        ctx.fill();
      }
      ctx.font = "500 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = l.col;
      ctx.fillText(l.text, 88, py);
      py += 26;
    });

    const pkgCards = [
      { title: "@angular/core: ^22.0.0", tag: "PRIMITIVES", col: "#38bdf8", desc: "Provides stable Signals, linkedSignal(), resource() API, and zoneless microtask scheduler." },
      { title: "@angular/build: ^22.0.0", tag: "VITE + ESBUILD", col: "#c084fc", desc: "Modern unified builder engine powering instant local reload and tree-shaken production bundles." },
      { title: "zone.js Omitted (-15kB)", tag: "ZONELESS", col: "#34d399", desc: "No longer in dependencies. Dropping it cuts bundle payload and eliminates monkey-patched DOM events." },
      { title: "typescript: ~5.8.0", tag: "STRICT TYPES", col: "#fde047", desc: "Strict type checking for signal templates, input/output macros, and modern JavaScript syntax." },
    ];

    pkgCards.forEach((c, idx) => {
      const cy = 206 + idx * 158;
      roundRect(ctx, 598, cy, 414, 144, 14);
      ctx.fillStyle = "#0d1527";
      ctx.fill();
      ctx.strokeStyle = c.col;
      ctx.lineWidth = 1;
      ctx.stroke();

      roundRect(ctx, 616, cy + 16, 96, 20, 6);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.font = "800 9.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.col;
      ctx.fillText(c.tag, 626, cy + 30);

      ctx.font = "700 14px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(c.title, 616, cy + 62);

      ctx.font = "500 12px -apple-system, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(c.desc, 616, cy + 90, 378);
    });

    roundRect(ctx, 68, 854, 944, 104, 14);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("Angular 22 Dependency Stack: Clean, minimal, zero deprecated packages", 94, 898);
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("⚡ Direct npm scripts for build, serve, and watch · Seamless Docker & CI/CD deployment", 94, 932);

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Pure Modern npm Ecosystem", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#34d399";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawBuildMatrixScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "Build Matrix", t, skipOuterBg);

    roundRect(ctx, 68, 116, 944, 76, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("COMPILATION TARGETS & DEPLOYMENT ARTIFACTS", 92, 144);
    ctx.font = "800 20px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Project Flow Part 4: Angular 22 Build Pipeline", 92, 174);

    const bTypes = [
      { type: "TYPE 01 · CSR", title: "Client-Side Rendering", path: "dist/app/browser/", desc: "Compiles single browser bundle. Client downloads JS and renders DOM in browser via Signals.", arts: ["index.html (shell)", "main-[hash].js", "styles-[hash].css"], col: "#7dd3fc" },
      { type: "TYPE 02 · SSR", title: "Server-Side Rendering", path: "dist/app/browser & server", desc: "Dual compilation. Node.js renders HTML on request. Client rehydrates with event replay.", arts: ["browser/ (client assets)", "server/main.server.mjs", "server.ts (Express/Node)"], col: "#c084fc" },
      { type: "TYPE 03 · SSG", title: "Static Prerendering", path: "prerender: true", desc: "Precomputes HTML at build time for every discoverable route. Zero runtime server needed.", arts: ["index.html (prerendered)", "courses/index.html", "Instant TTFB Latency"], col: "#6ee7b7" },
    ];

    bTypes.forEach((b, i) => {
      const bx = 68 + i * 324;
      roundRect(ctx, bx, 206, 302, 460, 14);
      ctx.fillStyle = "#0d1527";
      ctx.fill();
      ctx.strokeStyle = b.col;
      ctx.lineWidth = 1;
      ctx.stroke();

      roundRect(ctx, bx + 16, 222, 110, 22, 6);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.font = "800 10px 'JetBrains Mono', monospace";
      ctx.fillStyle = b.col;
      ctx.fillText(b.type, bx + 24, 237);

      ctx.font = "700 16px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(b.title, bx + 16, 274);

      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(b.path, bx + 16, 298);

      ctx.font = "500 12px -apple-system, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(b.desc, bx + 16, 335, 270);

      roundRect(ctx, bx + 16, 420, 270, 226, 10);
      ctx.fillStyle = "#050811";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.stroke();

      ctx.font = "700 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Output Artifacts:", bx + 30, 448);

      b.arts.forEach((art, aIdx) => {
        ctx.font = "500 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = b.col;
        ctx.fillText("• " + art, bx + 30, 480 + aIdx * 28);
      });
    });

    roundRect(ctx, 68, 686, 944, 150, 14);
    ctx.fillStyle = "#070b16";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();

    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("CLI EXECUTION COMMANDS & BUILD MODES", 88, 712);

    const cmds = [
      { name: "ng build", desc: "Prod: esbuild + hashes" },
      { name: "ng serve", desc: "Dev: Vite HMR server" },
      { name: "ng build --watch", desc: "Dev: incremental build" },
      { name: "ng test", desc: "Unit & component test" },
    ];

    cmds.forEach((cmd, cIdx) => {
      const cx = 88 + cIdx * 230;
      roundRect(ctx, cx, 726, 216, 88, 8);
      ctx.fillStyle = "#020617";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.stroke();

      ctx.font = "700 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#34d399";
      ctx.fillText(cmd.name, cx + 14, 754);

      ctx.font = "500 11px -apple-system, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(cmd.desc, cx + 14, 782);
    });

    roundRect(ctx, 68, 854, 944, 104, 14);
    ctx.fillStyle = "#080c17";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Angular 22 Build Pipeline: High-speed tree-shaking & multi-target compilation", 94, 898);
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("⚡ Universal builder output · Deployable to Nginx, S3, Cloudflare, or Docker containers", 94, 932);

    ctx.textAlign = "left";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ High-Speed esbuild Bundler", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  // ---------------------------------------------------------------------------
  // INTERCEPTORS & ENTERPRISE AUTHENTICATION SCENES
  // ---------------------------------------------------------------------------
  function drawInterceptorPipelineScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "HTTP Interceptors", t, skipOuterBg);

    // Top Header Banner
    roundRect(ctx, 68, 114, 944, 82, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "800 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("ENTERPRISE NETWORKING · FIFO REQUEST / LIFO RESPONSE", 92, 142);
    ctx.font = "800 24px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular HTTP Interceptors: 7 Types & Onion Pipeline", 92, 172);

    const activeOut = Math.floor((t * 4) % 4);
    const activeIn = Math.floor(((1 - t) * 4) % 4);

    // Lane 1: Outbound Request (FIFO)
    roundRect(ctx, 68, 206, 944, 172, 14);
    ctx.fillStyle = "#0c1527";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 13.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("➔ OUTBOUND REQUEST PIPELINE (FIFO: FIRST-IN, FIRST-OUT)", 92, 232);

    const outSteps = [
      { num: "01", name: "AppComponent", sub: "httpClient.get()", col: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
      { num: "02", name: "authInterceptor", sub: "Inject Bearer JWT", col: "#c084fc", bg: "rgba(168,85,247,0.12)" },
      { num: "03", name: "loggingInterceptor", sub: "X-Correlation-ID", col: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
      { num: "04", name: "Remote API", sub: "Backend Gateway", col: "#34d399", bg: "rgba(52,211,153,0.12)" },
    ];

    outSteps.forEach((s, i) => {
      const cx = 92 + i * 230;
      roundRect(ctx, cx, 246, 196, 116, 10);
      ctx.fillStyle = i === activeOut ? "#132142" : "#080e1b";
      ctx.fill();
      ctx.strokeStyle = i === activeOut ? s.col : "#1e293b";
      ctx.lineWidth = i === activeOut ? 2 : 1;
      ctx.stroke();

      roundRect(ctx, cx + 12, 258, 54, 20, 5);
      ctx.fillStyle = s.bg;
      ctx.fill();
      ctx.font = "800 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = s.col;
      ctx.fillText("STEP " + s.num, cx + 18, 272);

      ctx.font = "800 16px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(s.name, cx + 12, 304);

      ctx.font = "600 12.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(s.sub, cx + 12, 328);

      if (i < 3) {
        ctx.font = "800 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = i === activeOut ? s.col : "#475569";
        ctx.fillText("➔", cx + 208, 310);
      }
    });

    // Lane 2: Inbound Response (LIFO)
    roundRect(ctx, 68, 388, 944, 172, 14);
    ctx.fillStyle = "#0c1527";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 13.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("⮜ INBOUND RESPONSE PIPELINE (LIFO: LAST-IN, FIRST-OUT / ONION MODEL)", 92, 414);

    const inSteps = [
      { num: "01", name: "Remote API", sub: "200 OK / 401 Stream", col: "#34d399", bg: "rgba(52,211,153,0.12)" },
      { num: "02", name: "cacheInterceptor", sub: "In-Memory TTL Store", col: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
      { num: "03", name: "errorInterceptor", sub: "Retry / 401 Mutex", col: "#fb7185", bg: "rgba(244,63,94,0.12)" },
      { num: "04", name: "Component State", sub: "O(1) Signal Update", col: "#c084fc", bg: "rgba(168,85,247,0.12)" },
    ];

    inSteps.forEach((s, i) => {
      const cx = 92 + i * 230;
      roundRect(ctx, cx, 428, 196, 116, 10);
      ctx.fillStyle = i === activeIn ? "#1a2536" : "#080e1b";
      ctx.fill();
      ctx.strokeStyle = i === activeIn ? s.col : "#1e293b";
      ctx.lineWidth = i === activeIn ? 2 : 1;
      ctx.stroke();

      roundRect(ctx, cx + 12, 440, 54, 20, 5);
      ctx.fillStyle = s.bg;
      ctx.fill();
      ctx.font = "800 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = s.col;
      ctx.fillText("LIFO " + s.num, cx + 18, 454);

      ctx.font = "800 16px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(s.name, cx + 12, 486);

      ctx.font = "600 12.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(s.sub, cx + 12, 510);

      if (i < 3) {
        ctx.font = "800 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = i === activeIn ? s.col : "#475569";
        ctx.fillText("⮜", cx + 208, 492);
      }
    });

    // Lower Split: Code & 7-Types Matrix
    roundRect(ctx, 68, 570, 460, 395, 14);
    ctx.fillStyle = "#040711";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("auth.interceptor.ts — Bearer Injection", 88, 600);

    const codeLines = [
      { text: "export const authInterceptor: HttpInterceptorFn =", col: "#f43f5e" },
      { text: "  (req, next) => {", col: "#cbd5e1" },
      { text: "    const auth = inject(AuthService);", col: "#cbd5e1" },
      { text: "    const token = auth.accessToken(); // Signal", col: "#67e8f9" },
      { text: "    if (token && req.url.startsWith('/api/')) {", col: "#fbbf24" },
      { text: "      const cloned = req.clone({", col: "#cbd5e1" },
      { text: "        setHeaders: { Authorization: `Bearer ${token}` }", col: "#34d399" },
      { text: "      });", col: "#cbd5e1" },
      { text: "      return next(cloned);", col: "#c084fc" },
      { text: "    }", col: "#cbd5e1" },
      { text: "    return next(req);", col: "#c084fc" },
      { text: "};", col: "#cbd5e1" },
    ];
    codeLines.forEach((l, idx) => {
      ctx.font = "600 14.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = l.col;
      ctx.fillText(l.text, 88, 630 + idx * 26);
    });

    // Right Half: 7 Types Matrix
    roundRect(ctx, 544, 570, 468, 395, 14);
    ctx.fillStyle = "#060a16";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("7 Production Interceptors Checklist", 564, 600);

    const types = [
      { num: "1", name: "Auth Interceptor", desc: "Bearer JWT injection & context bypass" },
      { num: "2", name: "Refresh Mutex", desc: "401 catch & non-blocking replay queue" },
      { num: "3", name: "Error & Retry", desc: "Exponential backoff for idempotent GETs" },
      { num: "4", name: "Logging & Latency", desc: "Performance.now() telemetry & APM headers" },
      { num: "5", name: "In-Memory Caching", desc: "Response TTL caching for immutable data" },
      { num: "6", name: "Loading Spinner", desc: "Active request ref-counter via finalize()" },
      { num: "7", name: "Security Headers", desc: "CSRF protection & X-Client-Version tags" },
    ];
    types.forEach((item, idx) => {
      const ty = 630 + idx * 47;
      roundRect(ctx, 564, ty - 16, 26, 24, 6);
      ctx.fillStyle = "rgba(56,189,248,0.12)";
      ctx.fill();
      ctx.font = "800 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(item.num, 572, ty);

      ctx.font = "800 15px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(item.name, 600, ty - 1);

      ctx.font = "500 12.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(item.desc, 600, ty + 17);
    });

    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ provideHttpClient(withFetch(), withInterceptors([...]))", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawRefreshTokenFlowScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "Silent Refresh Mutex", t, skipOuterBg);

    roundRect(ctx, 68, 114, 944, 82, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "800 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#f43f5e";
    ctx.fillText("CONCURRENCY MUTEX · 401 INTERCEPTION & REPLAY QUEUE", 92, 142);
    ctx.font = "800 24px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Silent Refresh Token Rotation Without Race Conditions", 92, 172);

    const activeStep = Math.floor((t * 4) % 4);
    const steps = [
      { num: "01", title: "Parallel 401s", sub: "Token Expired", desc: "4 parallel API calls fail concurrently", col: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
      { num: "02", title: "Acquire Mutex", sub: "isRefreshing = true", desc: "Subsequent 401s queue behind Subject", col: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
      { num: "03", title: "POST /refresh", sub: "Single IdP Call", desc: "Backend returns new rotated access JWT", col: "#c084fc", bg: "rgba(168,85,247,0.12)" },
      { num: "04", title: "Replay Queue", sub: "Zero Logout", desc: "Blocked requests replay with fresh token", col: "#34d399", bg: "rgba(52,211,153,0.12)" },
    ];

    steps.forEach((s, i) => {
      const cx = 68 + i * 242;
      roundRect(ctx, cx, 206, 226, 175, 14);
      ctx.fillStyle = i === activeStep ? "#172338" : "#0d1527";
      ctx.fill();
      ctx.strokeStyle = i === activeStep ? s.col : "#1e293b";
      ctx.lineWidth = i === activeStep ? 2 : 1;
      ctx.stroke();

      roundRect(ctx, cx + 14, 222, 60, 22, 6);
      ctx.fillStyle = s.bg;
      ctx.fill();
      ctx.font = "800 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = s.col;
      ctx.fillText("PHASE " + s.num, cx + 20, 237);

      ctx.font = "800 17px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(s.title, cx + 14, 272);

      ctx.font = "700 12.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = s.col;
      ctx.fillText(s.sub, cx + 14, 296);

      ctx.font = "500 12.5px -apple-system, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(s.desc, cx + 14, 332, 200);

      if (i < 3) {
        ctx.font = "800 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = i === activeStep ? s.col : "#475569";
        ctx.fillText("➔", cx + 224, 296);
      }
    });

    // Lower Code & Invariants
    roundRect(ctx, 68, 396, 500, 568, 14);
    ctx.fillStyle = "#040711";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#f43f5e";
    ctx.fillText("refresh-token.interceptor.ts", 88, 426);

    const rCode = [
      { text: "let isRefreshing = false;", col: "#fbbf24" },
      { text: "const refresh$ = new BehaviorSubject<string | null>(null);", col: "#cbd5e1" },
      { text: "", col: "#cbd5e1" },
      { text: "export const refreshTokenInterceptor: HttpInterceptorFn =", col: "#f43f5e" },
      { text: "  (req, next) => {", col: "#cbd5e1" },
      { text: "    const auth = inject(AuthService);", col: "#cbd5e1" },
      { text: "    return next(req).pipe(", col: "#cbd5e1" },
      { text: "      catchError((err: HttpErrorResponse) => {", col: "#f43f5e" },
      { text: "        if (err.status === 401 && !req.url.includes('/refresh')) {", col: "#38bdf8" },
      { text: "          if (!isRefreshing) {", col: "#fbbf24" },
      { text: "            isRefreshing = true;", col: "#fbbf24" },
      { text: "            refresh$.next(null);", col: "#cbd5e1" },
      { text: "            return auth.refreshToken().pipe(", col: "#34d399" },
      { text: "              switchMap((res) => {", col: "#cbd5e1" },
      { text: "                isRefreshing = false;", col: "#fbbf24" },
      { text: "                refresh$.next(res.accessToken);", col: "#34d399" },
      { text: "                return next(req.clone({", col: "#c084fc" },
      { text: "                  setHeaders: { Authorization: `Bearer ${res.accessToken}` }", col: "#34d399" },
      { text: "                }));", col: "#c084fc" },
      { text: "              })", col: "#cbd5e1" },
      { text: "            );", col: "#cbd5e1" },
      { text: "          }", col: "#fbbf24" },
      { text: "          return refresh$.pipe(", col: "#38bdf8" },
      { text: "            filter(t => t !== null), take(1),", col: "#fbbf24" },
      { text: "            switchMap(t => next(req.clone({", col: "#c084fc" },
      { text: "              setHeaders: { Authorization: `Bearer ${t}` }", col: "#34d399" },
      { text: "            })))", col: "#c084fc" },
      { text: "          );", col: "#38bdf8" },
      { text: "        }", col: "#38bdf8" },
      { text: "        return throwError(() => err);", col: "#f43f5e" },
      { text: "      })", col: "#cbd5e1" },
      { text: "    );", col: "#cbd5e1" },
      { text: "};", col: "#cbd5e1" },
    ];
    rCode.forEach((l, idx) => {
      ctx.font = "600 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = l.col;
      ctx.fillText(l.text, 88, 452 + idx * 16);
    });

    // Right Architecture Invariants
    roundRect(ctx, 584, 396, 428, 568, 14);
    ctx.fillStyle = "#060a16";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("Enterprise Security Invariants", 604, 426);

    const rInvariants = [
      { title: "1. Anti-Loop Protection", code: "!req.url.includes('/auth/refresh')", desc: "Prevents fatal recursive loops if refresh token itself has expired or been revoked." },
      { title: "2. Concurrency Mutex Flag", code: "isRefreshing = true", desc: "Locks parallel 401s behind a single refresh call, preventing OAuth token reuse invalidation." },
      { title: "3. BehaviorSubject Queue", code: "refresh$.pipe(filter, take(1))", desc: "Queued calls suspend seamlessly without race conditions and replay upon token emission." },
      { title: "4. Zero Storage Leakage", code: "HttpOnly Refresh Cookie", desc: "Access token kept in memory; refresh token never exposed to JavaScript or XSS." },
    ];
    rInvariants.forEach((item, idx) => {
      const iy = 464 + idx * 122;
      roundRect(ctx, 604, iy, 388, 108, 10);
      ctx.fillStyle = "#0c1527";
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.stroke();

      ctx.font = "800 15px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(item.title, 618, iy + 26);

      ctx.font = "700 12.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(item.code, 618, iy + 52);

      ctx.font = "500 12.5px -apple-system, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(item.desc, 618, iy + 78, 360);
    });

    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Seamless 401 Silent Refresh Mutex", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawOAuth2PkceFlowScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "OAuth 2.0 PKCE", t, skipOuterBg);

    roundRect(ctx, 68, 114, 944, 82, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "800 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("RFC 7636 · PROOF KEY FOR CODE EXCHANGE (PKCE)", 92, 142);
    ctx.font = "800 24px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("OAuth 2.0 & OIDC Authorization Flow in Angular 22", 92, 172);

    const activeStep = Math.floor((t * 4) % 4);
    const pkceSteps = [
      { num: "01", title: "Code Verifier", sub: "Random 128 chars", desc: "Generated in memory via window.crypto", col: "#c084fc" },
      { num: "02", title: "Code Challenge", sub: "SHA-256 Hash", desc: "Base64URL(SHA256(verifier)) sent to IdP", col: "#38bdf8" },
      { num: "03", title: "Auth Code", sub: "IdP Redirect", desc: "User logs in; IdP redirects with code", col: "#fbbf24" },
      { num: "04", title: "Token Exchange", sub: "POST /token", desc: "Exchanges code + verifier for JWT tokens", col: "#34d399" },
    ];

    pkceSteps.forEach((s, i) => {
      const cx = 68 + i * 242;
      roundRect(ctx, cx, 206, 226, 175, 14);
      ctx.fillStyle = i === activeStep ? "#172338" : "#0d1527";
      ctx.fill();
      ctx.strokeStyle = i === activeStep ? s.col : "#1e293b";
      ctx.lineWidth = i === activeStep ? 2 : 1;
      ctx.stroke();

      roundRect(ctx, cx + 14, 222, 60, 22, 6);
      ctx.fillStyle = "rgba(168,85,247,0.12)";
      ctx.fill();
      ctx.font = "800 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = s.col;
      ctx.fillText("STEP " + s.num, cx + 20, 237);

      ctx.font = "800 17px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(s.title, cx + 14, 272);

      ctx.font = "700 12.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = s.col;
      ctx.fillText(s.sub, cx + 14, 296);

      ctx.font = "500 12.5px -apple-system, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(s.desc, cx + 14, 332, 200);

      if (i < 3) {
        ctx.font = "800 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = i === activeStep ? s.col : "#475569";
        ctx.fillText("➔", cx + 224, 296);
      }
    });

    // Lower comparison & security reasoning
    roundRect(ctx, 68, 396, 460, 568, 14);
    ctx.fillStyle = "#040711";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("Why PKCE is Mandatory for SPAs", 88, 426);

    ctx.font = "500 13.5px -apple-system, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("In Single Page Applications, JavaScript runs entirely in the", 88, 460);
    ctx.fillText("browser. A static client_secret CANNOT be protected because", 88, 484);
    ctx.fillText("users can inspect network tabs and source bundles.", 88, 508);

    roundRect(ctx, 88, 530, 420, 110, 10);
    ctx.fillStyle = "#0d1527";
    ctx.fill();
    ctx.strokeStyle = "rgba(168,85,247,0.3)";
    ctx.stroke();

    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#c084fc";
    ctx.fillText("Mathematical Security Invariant:", 104, 558);
    ctx.font = "600 13.5px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Challenge = Base64URL(SHA-256(Verifier))", 104, 590);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("One-way cryptographic proof without static secrets.", 104, 618);

    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("Supported Identity Providers (SSO)", 88, 674);

    const idps = ["Auth0 by Okta", "Keycloak Enterprise", "AWS Cognito", "Google Workspace / Azure AD"];
    idps.forEach((idp, idx) => {
      roundRect(ctx, 88, 696 + idx * 46, 420, 36, 8);
      ctx.fillStyle = "#090f1e";
      ctx.fill();
      ctx.strokeStyle = "#1e293b";
      ctx.stroke();
      ctx.font = "700 13.5px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("✓ " + idp, 104, 720 + idx * 46);
    });

    // Right Implementation
    roundRect(ctx, 544, 396, 468, 568, 14);
    ctx.fillStyle = "#060a16";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.font = "800 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("PKCE Crypto Implementation", 564, 426);

    const pkceCode = [
      { text: "// 1. Generate 128-char cryptographically random verifier", col: "#64748b" },
      { text: "function generateVerifier(): string {", col: "#f43f5e" },
      { text: "  const array = new Uint8Array(64);", col: "#cbd5e1" },
      { text: "  window.crypto.getRandomValues(array);", col: "#38bdf8" },
      { text: "  return base64UrlEncode(array);", col: "#34d399" },
      { text: "}", col: "#f43f5e" },
      { text: "", col: "#cbd5e1" },
      { text: "// 2. Compute SHA-256 hash challenge", col: "#64748b" },
      { text: "async function generateChallenge(verifier: string) {", col: "#f43f5e" },
      { text: "  const encoder = new TextEncoder();", col: "#cbd5e1" },
      { text: "  const data = encoder.encode(verifier);", col: "#cbd5e1" },
      { text: "  const hash = await crypto.subtle.digest('SHA-256', data);", col: "#38bdf8" },
      { text: "  return base64UrlEncode(new Uint8Array(hash));", col: "#34d399" },
      { text: "}", col: "#f43f5e" },
      { text: "", col: "#cbd5e1" },
      { text: "// 3. Exchange Authorization Code for JWT", col: "#64748b" },
      { text: "http.post('/oauth/token', {", col: "#c084fc" },
      { text: "  grant_type: 'authorization_code',", col: "#cbd5e1" },
      { text: "  client_id: environment.clientId,", col: "#cbd5e1" },
      { text: "  code_verifier: storedVerifier,", col: "#fbbf24" },
      { text: "  code: authCode", col: "#34d399" },
      { text: "});", col: "#c084fc" },
    ];
    pkceCode.forEach((l, idx) => {
      ctx.font = "600 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = l.col;
      ctx.fillText(l.text, 564, 456 + idx * 22);
    });

    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ RFC 7636 PKCE Specification Standard", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawAuthTypesMatrixScene(ctx, t, skipOuterBg) {
    drawMacShell(ctx, "Auth Taxonomy", t, skipOuterBg);

    roundRect(ctx, 68, 114, 944, 82, 14);
    ctx.fillStyle = "#111c33";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.font = "800 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("ENTERPRISE SECURITY & SESSION TAXONOMY", 92, 142);
    ctx.font = "800 24px -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Angular Authentication Models: JWT vs PKCE vs HttpOnly", 92, 172);

    const activeCard = Math.floor((t * 4) % 4);

    const authCards = [
      {
        num: "01",
        title: "JWT Bearer (Stateless)",
        sub: "Microservices & Public APIs",
        col: "#38bdf8",
        points: [
          "Token Storage: In-Memory Signal / Closure",
          "XSS Risk: Low (Kept out of localStorage)",
          "CSRF Risk: Zero (Custom header required)",
          "Scalability: High (Zero backend DB lookup)",
          "Best For: Microservices & decoupled APIs",
        ],
      },
      {
        num: "02",
        title: "OAuth 2.0 + OIDC (PKCE)",
        sub: "Enterprise Delegated SSO",
        col: "#c084fc",
        points: [
          "Token Storage: Memory + SessionStorage",
          "Zero client_secret in browser bundle",
          "RFC 7636 dynamic code_challenge",
          "Scalability: High (Standardized tokens)",
          "Best For: Auth0, Okta, Keycloak, Google",
        ],
      },
      {
        num: "03",
        title: "HttpOnly Cookie Sessions",
        sub: "BFF (Backend-For-Frontend)",
        col: "#34d399",
        points: [
          "Token Storage: Browser Cookie Jar",
          "XSS Risk: Zero (JS cannot read cookie!)",
          "CSRF Risk: Requires SameSite=Strict + CSRF",
          "Scalability: Medium (Server session state)",
          "Best For: Banking, healthcare & finance",
        ],
      },
      {
        num: "04",
        title: "Functional Route Guards",
        sub: "CanActivateFn & Signals",
        col: "#fbbf24",
        points: [
          "Pure functions using inject(AuthService)",
          "O(1) Signal reactivity with computed()",
          "Seamless returnUrl redirect preservation",
          "Zero NgModule or guard class boilerplate",
          "Seamless Angular 22 Zoneless integration",
        ],
      },
    ];

    authCards.forEach((c, idx) => {
      const colIdx = idx % 2;
      const rowIdx = Math.floor(idx / 2);
      const cx = colIdx === 0 ? 68 : 544;
      const cy = rowIdx === 0 ? 206 : 584;
      const cw = colIdx === 0 ? 460 : 468;
      const ch = 364;

      roundRect(ctx, cx, cy, cw, ch, 14);
      ctx.fillStyle = idx === activeCard ? "#14213d" : "#080e1b";
      ctx.fill();
      ctx.strokeStyle = idx === activeCard ? c.col : "#1e293b";
      ctx.lineWidth = idx === activeCard ? 2 : 1;
      ctx.stroke();

      roundRect(ctx, cx + 16, cy + 16, 68, 22, 6);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.font = "800 11px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.col;
      ctx.fillText("MODEL " + c.num, cx + 22, cy + 32);

      ctx.font = "800 19px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(c.title, cx + 16, cy + 68);

      ctx.font = "700 13px 'JetBrains Mono', monospace";
      ctx.fillStyle = c.col;
      ctx.fillText(c.sub, cx + 16, cy + 92);

      c.points.forEach((pt, pIdx) => {
        roundRect(ctx, cx + 16, cy + 112 + pIdx * 48, cw - 32, 40, 8);
        ctx.fillStyle = "#0c1527";
        ctx.fill();
        ctx.strokeStyle = "#1a2536";
        ctx.stroke();

        ctx.font = "600 13px -apple-system, sans-serif";
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText("• " + pt, cx + 26, cy + 137 + pIdx * 48);
      });
    });

    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("⚡ Enterprise Authentication Matrix Comparison", 68, 994);
    ctx.textAlign = "right";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("Ashutosh Kumar Choubey", 1012, 994);
  }

  function drawCore1080Scene(ctx, sceneKey, normTime, skipOuterBg) {
    ctx.save();
    if (skipOuterBg) {
      // Expand the 1000x1000 macOS window slightly to fill horizontal safe area (1040px wide)
      ctx.translate(540, 540);
      ctx.scale(1.036, 1.036);
      ctx.translate(-540, -540);
    }
    if (sceneKey === "interceptor-pipeline") {
      drawInterceptorPipelineScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "refresh-token-flow") {
      drawRefreshTokenFlowScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "oauth2-pkce-flow") {
      drawOAuth2PkceFlowScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "auth-types-matrix") {
      drawAuthTypesMatrixScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "boot") {
      drawBootFlowScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "angular-json") {
      drawAngularJsonScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "package-json") {
      drawPackageJsonScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "build-matrix") {
      drawBuildMatrixScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "writable") {
      drawWritableScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "linked") {
      drawLinkedSignalScene(ctx, normTime, skipOuterBg);
    } else if (sceneKey === "zoneless") {
      drawZonelessScene(ctx, normTime, skipOuterBg);
    } else {
      drawComputedScene(ctx, normTime, skipOuterBg);
    }
    ctx.restore();
  }



  // ---------------------------------------------------------------------------
  // YUV420p HIGH-LUMA SHARPNESS ENHANCER
  // ---------------------------------------------------------------------------
  function withCrispTextRendering(ctx, fn) {
    const origFillText = ctx.fillText;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.fillText = function (text, x, y, maxWidth) {
      const currentFill = String(ctx.fillStyle || "").toLowerCase();
      if (currentFill === "#64748b" || currentFill === "#475569") {
        ctx.fillStyle = "#cbd5e1";
      } else if (currentFill === "#94a3b8") {
        ctx.fillStyle = "#e2e8f0";
      } else if (currentFill === "#38bdf8") {
        ctx.fillStyle = "#7dd3fc";
      } else if (currentFill === "#34d399") {
        ctx.fillStyle = "#6ee7b7";
      } else if (currentFill === "#f87171") {
        ctx.fillStyle = "#fda4af";
      }

      if (!isGifRenderMode && currentFill !== "#052e16") {
        ctx.save();
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeStyle = "rgba(2, 6, 23, 0.92)";
        ctx.lineWidth = 2.6;
        if (maxWidth !== undefined) {
          ctx.strokeText(text, x, y, maxWidth);
        } else {
          ctx.strokeText(text, x, y);
        }
        ctx.restore();
      }

      if (maxWidth !== undefined) {
        return origFillText.call(ctx, text, x, y, maxWidth);
      }
      return origFillText.call(ctx, text, x, y);
    };

    try {
      fn();
    } finally {
      ctx.fillText = origFillText;
    }
  }

  // ---------------------------------------------------------------------------
  // CLEAN COMPOSITOR (Zero Duplicate Headers, Zero Duplicate Code, Zero Duplicate Footers)
  // ---------------------------------------------------------------------------
  function renderPlatformFrame(ctx, outW, outH, sceneName, platformId, normTime) {
    const preset = PLATFORM_PRESETS[platformId] || PLATFORM_PRESETS["linkedin-phone"];
    const sceneKey = getSceneKey(sceneName);

    withCrispTextRendering(ctx, () => {
      ctx.save();
      ctx.scale(outW / preset.logicalW, outH / preset.logicalH);

      if (preset.logicalW === 1080 && preset.logicalH === 1080) {
        drawCore1080Scene(ctx, sceneKey, normTime, false);
      } else {
        drawBackgroundGrid(ctx, preset.logicalW, preset.logicalH);
        const offsetX = Math.round((preset.logicalW - 1080) / 2);
        const offsetY = Math.round((preset.logicalH - 1080) / 2);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        drawCore1080Scene(ctx, sceneKey, normTime, true);
        ctx.restore();
      }

      ctx.restore();
    });
  }

  function getSceneNameFromUrl(url) {
    const clean = (url || "").split("?")[0].split("/").pop() || "angular-signals";
    return clean.replace(".html", "");
  }

  // ---------------------------------------------------------------------------
  // 220ms 4K HARDWARE MP4 ENCODER PROBE (Ensures 4K/2K H.264 High Profile works)
  // ---------------------------------------------------------------------------
  function probeRecorderConfig(width, height, mimeType, bitrate) {
    return new Promise((resolve) => {
      try {
        if (!window.MediaRecorder || !MediaRecorder.isTypeSupported(mimeType)) {
          return resolve(false);
        }
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        const ctx = c.getContext("2d", { alpha: false });
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, width, height);

        const stream = c.captureStream(30);
        const track = stream.getVideoTracks()[0];
        const rec = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: bitrate,
        });
        let failed = false;
        let totalBytes = 0;

        rec.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) totalBytes += e.data.size;
        };
        rec.onerror = () => {
          failed = true;
          try {
            stream.getTracks().forEach((t) => t.stop());
          } catch {}
          resolve(false);
        };
        rec.onstop = () => {
          try {
            stream.getTracks().forEach((t) => t.stop());
          } catch {}
          resolve(!failed && totalBytes > 0);
        };

        rec.start(40);
        let frame = 0;
        const timer = setInterval(() => {
          frame++;
          ctx.fillStyle = frame % 2 === 0 ? "#0f172a" : "#1e293b";
          ctx.fillRect(0, 0, width, Math.min(height, 512));
          if (track && typeof track.requestFrame === "function") {
            try {
              track.requestFrame();
            } catch {}
          }
          if (frame >= 7) {
            clearInterval(timer);
            try {
              if (rec.state === "recording") {
                try {
                  rec.requestData();
                } catch {}
                rec.stop();
              }
            } catch {
              resolve(false);
            }
          }
        }, 32);
      } catch {
        resolve(false);
      }
    });
  }

  async function selectWorkingVideoConfig(preset) {
    // Prioritize High Profile H.264 (8x8 DCT + CABAC) & HEVC 4K — NEVER use Baseline (42E01E)!
    const mp4Codecs = [
      'video/mp4;codecs="avc1.640034"', // H.264 High Profile L5.2 (4K UHD)
      'video/mp4;codecs="avc1.640033"', // H.264 High Profile L5.1 (4K)
      'video/mp4;codecs="avc1.640032"', // H.264 High Profile L5.0 (2K/QHD)
      'video/mp4;codecs="avc1.64002a"', // H.264 High Profile L4.2
      'video/mp4;codecs="avc1.640028"', // H.264 High Profile L4.0
      'video/mp4;codecs="hvc1.1.6.L153.B0"', // HEVC 4K High Tier
      'video/mp4;codecs="hvc1.1.6.L150.B0"', // HEVC 4K
      "video/mp4;codecs=avc1", // Auto-level H.264
      "video/mp4",
    ];

    for (const dim of preset.videoCandidates) {
      for (const mime of mp4Codecs) {
        const works = await probeRecorderConfig(dim.w, dim.h, mime, dim.bitrate);
        if (works) {
          return { width: dim.w, height: dim.h, mimeType: mime, bitrate: dim.bitrate, ext: "mp4" };
        }
      }
    }

    // Fallback to WebM VP9 High Bitrate if browser lacks MP4 MediaRecorder
    const webmCodecs = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    const fallbackDim = preset.videoCandidates[0];
    for (const mime of webmCodecs) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(mime)) {
        return { width: fallbackDim.w, height: fallbackDim.h, mimeType: mime, bitrate: fallbackDim.bitrate, ext: "webm" };
      }
    }

    throw new Error("No supported video encoder found in this browser.");
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API: Download 4K PNG (Platform-Aware)
  // ---------------------------------------------------------------------------
  async function download4KPoster(url, btnEl, platformId) {
    const orig = btnEl ? btnEl.textContent : "";
    const pKey = platformId || (btnEl && btnEl.dataset.platform) || "linkedin-phone";
    const preset = PLATFORM_PRESETS[pKey] || PLATFORM_PRESETS["linkedin-phone"];
    try {
      if (btnEl) btnEl.textContent = `⏳ Rendering ${preset.pngW}×${preset.pngH} 4K PNG...`;
      const canvas = document.createElement("canvas");
      canvas.width = preset.pngW;
      canvas.height = preset.pngH;
      const ctx = canvas.getContext("2d", { alpha: false });
      const sceneName = getSceneNameFromUrl(url);

      renderPlatformFrame(ctx, preset.pngW, preset.pngH, sceneName, preset.id, 0.52);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1.0));
      if (!blob) throw new Error("Canvas PNG export failed");
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${sceneName}-${preset.id}-${preset.pngW}x${preset.pngH}-4k-worldgyan.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 4000);
      if (btnEl) btnEl.textContent = `✓ Downloaded 4K PNG (${preset.pngW}×${preset.pngH})!`;
    } catch (err) {
      console.error(err);
      if (btnEl) btnEl.textContent = "⚠️ PNG Export Failed";
    }
    if (btnEl) {
      setTimeout(() => {
        btnEl.textContent = orig;
      }, 2400);
    }
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API: Download Ultra-Sharp 4K .MP4 Video (55 Mbps · 30 FPS · Warm-Up)
  // ---------------------------------------------------------------------------
  async function download4KVideo(url, btnEl, platformId) {
    const orig = btnEl ? btnEl.textContent : "";
    const pKey = platformId || (btnEl && btnEl.dataset.platform) || "linkedin-phone";
    const preset = PLATFORM_PRESETS[pKey] || PLATFORM_PRESETS["linkedin-phone"];
    try {
      if (btnEl) btnEl.textContent = "⏳ Selecting 4K High-Profile .MP4 Encoder...";
      const config = await selectWorkingVideoConfig(preset);

      const canvas = document.createElement("canvas");
      canvas.width = config.width;
      canvas.height = config.height;
      const ctx = canvas.getContext("2d", { alpha: false });
      const sceneName = getSceneNameFromUrl(url);

      // Draw initial frame BEFORE captureStream so stream track is initialized cleanly
      renderPlatformFrame(ctx, config.width, config.height, sceneName, preset.id, 0);

      // 30 FPS doubles the per-frame bit budget (~1.85 Mb/frame at 55 Mbps) and matches LinkedIn's native 30fps player
      const stream = canvas.captureStream(30);
      const videoTrack = stream.getVideoTracks()[0];
      const recorder = new MediaRecorder(stream, {
        mimeType: config.mimeType,
        videoBitsPerSecond: config.bitrate,
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      let recorderError = null;
      recorder.onerror = (e) => {
        recorderError = e;
      };

      const donePromise = new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      // 600ms warm-up locks the hardware VBR encoder onto peak 55 Mbps bitrate before animation begins
      const warmupMs = 600;
      const loopDurationMs = 8000;
      const outroHoldMs = 300;
      const totalRecordMs = warmupMs + loopDurationMs + outroHoldMs;
      const start = performance.now();
      recorder.start(250);

      await new Promise((resolve) => {
        function step(now) {
          if (recorderError || recorder.state !== "recording") {
            return resolve();
          }
          const elapsed = now - start;
          let progress = 0;
          if (elapsed <= warmupMs) {
            progress = 0;
          } else if (elapsed >= warmupMs + loopDurationMs) {
            progress = 0.86; // Hold on completed state at end
          } else {
            progress = (elapsed - warmupMs) / loopDurationMs;
          }

          renderPlatformFrame(ctx, config.width, config.height, sceneName, preset.id, progress);
          if (videoTrack && typeof videoTrack.requestFrame === "function") {
            try {
              videoTrack.requestFrame();
            } catch {}
          }
          if (btnEl) {
            const pct = Math.min(100, Math.round((elapsed / totalRecordMs) * 100));
            btnEl.textContent = `🔴 Recording 4K .${config.ext.toUpperCase()} ${config.width}×${config.height} (${pct}%)...`;
          }
          if (elapsed < totalRecordMs) {
            setTimeout(() => requestAnimationFrame(step), 16);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(step);
      });

      if (recorder.state !== "inactive") {
        recorder.stop();
      }
      await donePromise;
      stream.getTracks().forEach((t) => t.stop());

      if (chunks.length === 0) {
        throw new Error("No video data produced");
      }

      const blob = new Blob(chunks, { type: config.mimeType });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${sceneName}-${preset.id}-${config.width}x${config.height}-4k-worldgyan.${config.ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 6000);
      if (btnEl) {
        btnEl.textContent = `✓ Downloaded 4K .${config.ext.toUpperCase()} (${config.width}×${config.height})!`;
      }
    } catch (err) {
      console.error(err);
      if (btnEl) btnEl.textContent = "⚠️ Video Export Failed";
    }
    if (btnEl) {
      setTimeout(() => {
        btnEl.textContent = orig;
      }, 2800);
    }
  }

  /**
   * Builds a 256-color RGB palette (768 bytes) + 18-bit RGB (64×64×64 = 262,144-entry) lookup table
   * sampled across multiple animation phases and specifically engineered for 4K LinkedIn GIF sharpness.
   */
  function buildHighQualityGifPalette(sampleRgbaList) {
    const palette = new Uint8Array(256 * 3);
    let count = 0;

    function addRgb(r, g, b) {
      if (count >= 256) return;
      for (let i = 0; i < count; i++) {
        const dr = palette[i * 3] - r;
        const dg = palette[i * 3 + 1] - g;
        const db = palette[i * 3 + 2] - b;
        if (dr * dr + dg * dg + db * db <= 6) return;
      }
      palette[count * 3] = r;
      palette[count * 3 + 1] = g;
      palette[count * 3 + 2] = b;
      count++;
    }

    function addHex(hex) {
      const v = parseInt(hex.slice(1), 16);
      addRgb((v >> 16) & 255, (v >> 8) & 255, v & 255);
    }

    function addRamp(hexA, hexB, steps) {
      const va = parseInt(hexA.slice(1), 16);
      const vb = parseInt(hexB.slice(1), 16);
      const r1 = (va >> 16) & 255, g1 = (va >> 8) & 255, b1 = va & 255;
      const r2 = (vb >> 16) & 255, g2 = (vb >> 8) & 255, b2 = vb & 255;
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        addRgb(
          Math.round(r1 + (r2 - r1) * t),
          Math.round(g1 + (g2 - g1) * t),
          Math.round(b1 + (b2 - b1) * t)
        );
      }
    }

    // 1. Exact core UI surfaces, cards, borders & syntax colors (0 quantization error on flat panels)
    const exactHexes = [
      "#040812", "#060b16", "#060b18", "#070c18", "#070c1a", "#080c17", "#080d1a",
      "#090d16", "#090d18", "#091022", "#0b1121", "#0b1325", "#0d1629", "#0f172a",
      "#111827", "#111c33", "#131c31", "#131d36", "#1e293b", "#263554", "#334155",
      "#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9", "#f8fafc", "#ffffff",
      "#38bdf8", "#67e8f9", "#7dd3fc", "#a5f3fc", "#bae6fd", "#06b6d4", "#22d3ee", "#0284c7", "#0c2d48", "#082f49",
      "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#059669", "#047857", "#052e16", "#063229", "#064e3b",
      "#f43f5e", "#fb7185", "#fda4af", "#f87171", "#ef4444", "#dc2626", "#3b1022", "#4c0519",
      "#a855f7", "#c084fc", "#d8b4fe", "#9333ea", "#7e22ce", "#2e1065", "#3b0764",
      "#f59e0b", "#fbbf24", "#fde047", "#fef08a", "#ff5f56", "#ffbd2e", "#27c93f",
    ];
    for (let i = 0; i < exactHexes.length; i++) {
      addHex(exactHexes[i]);
    }

    // 2. Smooth 4K font anti-aliasing ramps from primary dark surfaces to all syntax/text colors
    const rampSurfaces = ["#091022", "#111c33", "#080d1a", "#070c18"];
    const rampTargets = [
      "#ffffff", "#e2e8f0", "#cbd5e1", "#7dd3fc", "#67e8f9",
      "#6ee7b7", "#34d399", "#fda4af", "#d8b4fe", "#fde047",
    ];
    for (let s = 0; s < rampSurfaces.length; s++) {
      for (let i = 0; i < rampTargets.length; i++) {
        addRamp(rampSurfaces[s], rampTargets[i], s < 2 ? 7 : 5);
      }
    }

    // 3. Multi-frame 18-bit histogram sampling across key animation phases for remaining slots
    if (sampleRgbaList && sampleRgbaList.length > 0 && count < 256) {
      const hist = new Uint32Array(262144);
      const stride = 4 * 5; // fast sub-sampling across 4K buffers
      for (let bIdx = 0; bIdx < sampleRgbaList.length; bIdx++) {
        const buf = sampleRgbaList[bIdx];
        for (let i = 0; i < buf.length; i += stride) {
          const key =
            ((buf[i] >> 2) << 12) |
            ((buf[i + 1] >> 2) << 6) |
            (buf[i + 2] >> 2);
          hist[key]++;
        }
      }
      const candidates = [];
      for (let k = 0; k < 262144; k++) {
        if (hist[k] > 12) {
          candidates.push({ key: k, freq: hist[k] });
        }
      }
      candidates.sort((a, b) => b.freq - a.freq);
      for (let c = 0; c < candidates.length && count < 256; c++) {
        const key = candidates[c].key;
        const r = ((key >> 12) & 63) * 4 + 2;
        const g = ((key >> 6) & 63) * 4 + 2;
        const b = (key & 63) * 4 + 2;
        let minDist = Infinity;
        for (let p = 0; p < count; p++) {
          const dr = palette[p * 3] - r;
          const dg = palette[p * 3 + 1] - g;
          const db = palette[p * 3 + 2] - b;
          const d = dr * dr + dg * dg + db * db;
          if (d < minDist) minDist = d;
        }
        if (minDist > 24) {
          addRgb(r, g, b);
        }
      }
    }

    // 4. Precompute 18-bit RGB (64×64×64 = 262,144 entries) -> nearest palette index LUT
    const lut = new Uint8Array(262144);
    for (let r6 = 0; r6 < 64; r6++) {
      const r = (r6 << 2) | (r6 >> 4);
      for (let g6 = 0; g6 < 64; g6++) {
        const g = (g6 << 2) | (g6 >> 4);
        for (let b6 = 0; b6 < 64; b6++) {
          const b = (b6 << 2) | (b6 >> 4);
          let bestIdx = 0;
          let bestDist = Infinity;
          for (let p = 0; p < count; p++) {
            const dr = palette[p * 3] - r;
            const dg = palette[p * 3 + 1] - g;
            const db = palette[p * 3 + 2] - b;
            // Perceptual RGB weight (human eye is most sensitive to green/luma)
            const dist = dr * dr * 2 + dg * dg * 4 + db * db * 3;
            if (dist < bestDist) {
              bestDist = dist;
              bestIdx = p;
              if (dist === 0) break;
            }
          }
          lut[(r6 << 12) | (g6 << 6) | b6] = bestIdx;
        }
      }
    }

    return { palette, lut };
  }

  /**
   * Encodes an indexed 8-bit pixel frame into GIF89a LZW sub-blocks using a flat Int32Array dictionary.
   */
  function lzwEncodeGifFrame(indexedPixels, lzwTable) {
    const minCodeSize = 8;
    const clearCode = 256;
    const eoiCode = 257;

    const out = [minCodeSize];
    const subBlock = new Uint8Array(255);
    let sbLen = 0;
    let bitBuf = 0;
    let bitCnt = 0;

    function flushSubBlock() {
      if (sbLen > 0) {
        out.push(sbLen);
        for (let i = 0; i < sbLen; i++) {
          out.push(subBlock[i]);
        }
        sbLen = 0;
      }
    }

    function writeCode(code, size) {
      bitBuf |= code << bitCnt;
      bitCnt += size;
      while (bitCnt >= 8) {
        subBlock[sbLen++] = bitBuf & 0xff;
        if (sbLen === 255) flushSubBlock();
        bitBuf >>= 8;
        bitCnt -= 8;
      }
    }

    lzwTable.fill(-1);
    let codeSize = 9;
    let maxCode = 511;
    let nextCode = 258;

    writeCode(clearCode, codeSize);

    let prefix = indexedPixels[0];
    const total = indexedPixels.length;

    for (let i = 1; i < total; i++) {
      const k = indexedPixels[i];
      const tableIdx = (prefix << 8) | k;
      const hit = lzwTable[tableIdx];
      if (hit !== -1) {
        prefix = hit;
      } else {
        writeCode(prefix, codeSize);
        if (nextCode < 4096) {
          lzwTable[tableIdx] = nextCode;
          if (nextCode > maxCode && codeSize < 12) {
            codeSize++;
            maxCode = (1 << codeSize) - 1;
          }
          nextCode++;
        } else {
          writeCode(clearCode, codeSize);
          lzwTable.fill(-1);
          codeSize = 9;
          maxCode = 511;
          nextCode = 258;
        }
        prefix = k;
      }
    }

    writeCode(prefix, codeSize);
    writeCode(eoiCode, codeSize);

    if (bitCnt > 0) {
      subBlock[sbLen++] = bitBuf & 0xff;
    }
    flushSubBlock();
    out.push(0x00); // Block Terminator

    return new Uint8Array(out);
  }

  /**
   * Renders & downloads a True 4K Ultra-Sharp Animated .GIF (2160×2700 / 3840×2160 / 2160×2160)
   * engineered specifically for LinkedIn posts (18-bit LUT + Delta Sub-Frame LZW compression).
   */
  async function download4KGif(url, btnEl, platformId) {
    const sceneName = getSceneNameFromUrl(url);
    const pKey = platformId || (btnEl && btnEl.dataset.platform) || "linkedin-phone";
    const preset = PLATFORM_PRESETS[pKey] || PLATFORM_PRESETS["linkedin-phone"];
    const gifW = preset.gifW || 2160;
    const gifH = preset.gifH || 2700;
    const orig = btnEl ? btnEl.textContent : "";

    isGifRenderMode = true;
    try {
      if (btnEl) {
        btnEl.textContent = `🎞️ Calibrating 4K .GIF ${gifW}×${gifH}...`;
      }
      await new Promise((r) => setTimeout(r, 40));

      const canvas = document.createElement("canvas");
      canvas.width = gifW;
      canvas.height = gifH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: false });

      // Sample 3 key animation phases (initial, active pulse, completed DOM patch) to build 18-bit LUT palette
      const samplePhases = [0.10, 0.36, 0.72];
      const sampleBuffers = [];
      for (let i = 0; i < samplePhases.length; i++) {
        renderPlatformFrame(ctx, gifW, gifH, sceneName, preset.id, samplePhases[i]);
        sampleBuffers.push(ctx.getImageData(0, 0, gifW, gifH).data);
      }
      const { palette, lut } = buildHighQualityGifPalette(sampleBuffers);

      const byteChunks = [];

      // 1. GIF89a Header + Logical Screen Descriptor (13 bytes)
      const header = new Uint8Array([
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // "GIF89a"
        gifW & 0xff, (gifW >> 8) & 0xff,
        gifH & 0xff, (gifH >> 8) & 0xff,
        0xf7, // Global Color Table (256 colors, 8-bit primary resolution)
        0x00, // Background color index
        0x00, // Default aspect ratio
      ]);
      byteChunks.push(header);

      // 2. Global Color Table (768 bytes)
      byteChunks.push(palette);

      // 3. Netscape 2.0 Infinite Loop Application Extension (19 bytes)
      byteChunks.push(
        new Uint8Array([
          0x21, 0xff, 0x0b,
          0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30,
          0x03, 0x01, 0x00, 0x00, 0x00,
        ])
      );

      const totalFrames = 36;
      const pixelCount = gifW * gifH;
      const indexedPixels = new Uint8Array(pixelCount);
      const prevIndexedPixels = new Uint8Array(pixelCount);
      const lzwTable = new Int32Array(4096 * 256);
      let lastFrameHeader = null;
      let lastTotalDelayCs = 0;

      for (let f = 0; f < totalFrames; f++) {
        const progress = f === totalFrames - 1 ? 0.86 : (f / (totalFrames - 1)) * 0.88;
        const delayCs = f === totalFrames - 1 ? 65 : 18; // 180ms step, 650ms hold on completed state

        renderPlatformFrame(ctx, gifW, gifH, sceneName, preset.id, progress);
        const rgba = ctx.getImageData(0, 0, gifW, gifH).data;

        if (f === 0) {
          for (let p = 0, j = 0; p < pixelCount; p++, j += 4) {
            const key =
              ((rgba[j] >> 2) << 12) |
              ((rgba[j + 1] >> 2) << 6) |
              (rgba[j + 2] >> 2);
            const idx = lut[key];
            indexedPixels[p] = idx;
            prevIndexedPixels[p] = idx;
          }

          const frameHeader = new Uint8Array([
            0x21, 0xf9, 0x04, 0x04, // Disposal method 1: Do not dispose (leave in place for delta sub-frames)
            delayCs & 0xff, (delayCs >> 8) & 0xff,
            0x00, 0x00,
            0x2c,
            0x00, 0x00, 0x00, 0x00,
            gifW & 0xff, (gifW >> 8) & 0xff,
            gifH & 0xff, (gifH >> 8) & 0xff,
            0x00,
          ]);
          lastFrameHeader = frameHeader;
          lastTotalDelayCs = delayCs;
          byteChunks.push(frameHeader);
          byteChunks.push(lzwEncodeGifFrame(indexedPixels, lzwTable));
        } else {
          // Compute exact dirty bounding box (minX..maxX, minY..maxY) where 4K pixels changed
          let minX = gifW, minY = gifH, maxX = -1, maxY = -1;
          let p = 0, j = 0;
          for (let y = 0; y < gifH; y++) {
            for (let x = 0; x < gifW; x++, p++, j += 4) {
              const key =
                ((rgba[j] >> 2) << 12) |
                ((rgba[j + 1] >> 2) << 6) |
                (rgba[j + 2] >> 2);
              const idx = lut[key];
              indexedPixels[p] = idx;
              if (idx !== prevIndexedPixels[p]) {
                prevIndexedPixels[p] = idx;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (maxX < minX && lastFrameHeader) {
            // Identical frame: merge hold duration into previous frame's Graphic Control Extension
            lastTotalDelayCs += delayCs;
            lastFrameHeader[4] = lastTotalDelayCs & 0xff;
            lastFrameHeader[5] = (lastTotalDelayCs >> 8) & 0xff;
          } else {
            const subX = minX;
            const subY = minY;
            const subW = maxX - minX + 1;
            const subH = maxY - minY + 1;
            const subPixels = new Uint8Array(subW * subH);
            let dst = 0;
            for (let y = subY; y <= maxY; y++) {
              const rowStart = y * gifW + subX;
              subPixels.set(indexedPixels.subarray(rowStart, rowStart + subW), dst);
              dst += subW;
            }

            const frameHeader = new Uint8Array([
              0x21, 0xf9, 0x04, 0x04, // Disposal method 1: Leave in place
              delayCs & 0xff, (delayCs >> 8) & 0xff,
              0x00, 0x00,
              0x2c,
              subX & 0xff, (subX >> 8) & 0xff,
              subY & 0xff, (subY >> 8) & 0xff,
              subW & 0xff, (subW >> 8) & 0xff,
              subH & 0xff, (subH >> 8) & 0xff,
              0x00,
            ]);
            lastFrameHeader = frameHeader;
            lastTotalDelayCs = delayCs;
            byteChunks.push(frameHeader);
            byteChunks.push(lzwEncodeGifFrame(subPixels, lzwTable));
          }
        }

        if (f % 2 === 0 || f === totalFrames - 1) {
          if (btnEl) {
            const pct = Math.round(((f + 1) / totalFrames) * 100);
            btnEl.textContent = `🎞️ Encoding 4K .GIF ${gifW}×${gifH} (${pct}%)...`;
          }
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      // 4. GIF Trailer (0x3B)
      byteChunks.push(new Uint8Array([0x3b]));

      const blob = new Blob(byteChunks, { type: "image/gif" });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = `${sceneName}-${preset.id}-${gifW}x${gifH}-4k-worldgyan.gif`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 6000);

      if (btnEl) {
        btnEl.textContent = `✓ Downloaded 4K .GIF (${gifW}×${gifH})!`;
      }
    } catch (err) {
      console.error(err);
      if (btnEl) btnEl.textContent = "⚠️ 4K GIF Export Failed";
    } finally {
      isGifRenderMode = false;
    }
    if (btnEl) {
      setTimeout(() => {
        btnEl.textContent = orig;
      }, 2800);
    }
  }

  window.WorldGyan4KExporter = {
    PLATFORM_PRESETS,
    download4KPoster,
    download4KVideo,
    download4KGif,
  };
})();


