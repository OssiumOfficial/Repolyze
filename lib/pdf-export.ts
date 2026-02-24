import { AnalysisResult } from "./types";

interface RGB {
  r: number;
  g: number;
  b: number;
}

export async function generatePDFReport(result: AnalysisResult): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Refined Caffeine Palette
  const colors = {
    darkRoast: { r: 38, g: 28, b: 24 } as RGB,
    espresso: { r: 54, g: 38, b: 32 } as RGB,
    arabica: { r: 87, g: 63, b: 51 } as RGB,
    mocha: { r: 121, g: 85, b: 61 } as RGB,
    caramel: { r: 183, g: 135, b: 85 } as RGB,
    latte: { r: 212, g: 185, b: 158 } as RGB,
    foam: { r: 241, g: 235, b: 228 } as RGB,
    cream: { r: 250, g: 247, b: 243 } as RGB,
    white: { r: 255, g: 255, b: 255 } as RGB,
    copper: { r: 176, g: 120, b: 80 } as RGB,
    gold: { r: 198, g: 158, b: 98 } as RGB,
    sage: { r: 94, g: 118, b: 95 } as RGB,
    terracotta: { r: 168, g: 98, b: 78 } as RGB,
    slate: { r: 88, g: 82, b: 78 } as RGB,
    success: { r: 82, g: 126, b: 86 } as RGB,
    warning: { r: 186, g: 142, b: 68 } as RGB,
    danger: { r: 172, g: 88, b: 78 } as RGB,
  };

  const setColor = (color: RGB, type: "fill" | "text" | "draw" = "text") => {
    if (type === "fill") doc.setFillColor(color.r, color.g, color.b);
    else if (type === "draw") doc.setDrawColor(color.r, color.g, color.b);
    else doc.setTextColor(color.r, color.g, color.b);
  };

  const addNewPageIfNeeded = (requiredSpace: number = 20): boolean => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = margin;
      addPageBackground();
      return true;
    }
    return false;
  };

  const addPageBackground = () => {
    setColor(colors.cream, "fill");
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const getScoreColor = (score: number): RGB => {
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.danger;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 50) return "Fair";
    if (score >= 25) return "Needs Work";
    return "Critical";
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Wrap text into multiple lines
  const wrapText = (
    text: string,
    maxWidth: number,
    fontSize: number
  ): string[] => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth);
  };

  // === DRAWING FUNCTIONS ===

  const drawHeroSection = () => {
    setColor(colors.darkRoast, "fill");
    doc.rect(0, 0, pageWidth, 55, "F");

    // Accent line
    setColor(colors.caramel, "fill");
    doc.rect(0, 55, pageWidth, 2, "F");

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    setColor(colors.white);
    const repoName =
      result.metadata.name.length > 25
        ? result.metadata.name.substring(0, 25) + "..."
        : result.metadata.name;
    doc.text(repoName, margin, 25);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setColor(colors.latte);
    doc.text(result.metadata.fullName, margin, 34);

    // Stats row
    const statsY = 46;
    let statsX = margin;

    const drawStat = (value: string, label: string, dotColor: RGB) => {
      setColor(dotColor, "fill");
      doc.circle(statsX + 1.5, statsY - 1, 1.5, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      setColor(colors.white);
      doc.text(value, statsX + 5, statsY);
      const valueWidth = doc.getTextWidth(value);
      doc.setFont("helvetica", "normal");
      setColor(colors.latte);
      doc.text(label, statsX + 6 + valueWidth, statsY);
      statsX += valueWidth + doc.getTextWidth(label) + 15;
    };

    drawStat(formatNumber(result.metadata.stars), "stars", colors.gold);
    drawStat(formatNumber(result.metadata.forks), "forks", colors.copper);
    if (result.metadata.language) {
      drawStat(result.metadata.language, "", colors.sage);
    }
    if (result.metadata.license) {
      drawStat(result.metadata.license, "", colors.slate);
    }

    yPosition = 65;
  };

  const drawScoreCard = () => {
    const cardY = yPosition;
    const cardPaddingBottom = 4;
    const cardHeight = 48 + cardPaddingBottom;
    const innerHeight = cardHeight - cardPaddingBottom;
    const score = result.scores?.overall || 0;
    const scoreColor = getScoreColor(score);

    // Card background
    setColor(colors.white, "fill");
    doc.roundedRect(margin, cardY, contentWidth, cardHeight, 3, 3, "F");
    setColor(colors.latte, "draw");
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cardY, contentWidth, cardHeight, 3, 3, "S");

    // === LEFT SECTION - Main Score ===
    const circleRadius = 16;
    const scoreX = margin + 24;
    const scoreY = cardY + innerHeight / 2;

    // Progress track
    setColor(colors.foam, "draw");
    doc.setLineWidth(3);
    doc.circle(scoreX, scoreY, circleRadius, "S");

    // Progress arc
    setColor(scoreColor, "draw");
    doc.setLineWidth(3);
    const totalSegments = 60;
    const filledSegments = Math.floor((score / 100) * totalSegments);

    for (let i = 0; i < filledSegments; i++) {
      const startAngle = (i * (360 / totalSegments) - 90) * (Math.PI / 180);
      const endAngle =
        ((i + 0.8) * (360 / totalSegments) - 90) * (Math.PI / 180);
      const x1 = scoreX + circleRadius * Math.cos(startAngle);
      const y1 = scoreY + circleRadius * Math.sin(startAngle);
      const x2 = scoreX + circleRadius * Math.cos(endAngle);
      const y2 = scoreY + circleRadius * Math.sin(endAngle);
      doc.line(x1, y1, x2, y2);
    }

    // Score number
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    setColor(colors.darkRoast);
    doc.text(score.toString(), scoreX, scoreY + 1, { align: "center" });

    // Score label
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    setColor(scoreColor);
    doc.text(getScoreLabel(score).toUpperCase(), scoreX, scoreY + 22, {
      align: "center",
    });

    // === DIVIDER ===
    const dividerX = margin + 48;
    setColor(colors.foam, "draw");
    doc.setLineWidth(0.3);
    doc.line(dividerX, cardY + 6, dividerX, cardY + innerHeight - 6);

    // === RIGHT SECTION - Score Grid (2 columns) ===
    const gridStartX = dividerX + 6;
    const gridWidth = contentWidth - (gridStartX - margin) - 4;
    const colWidth = gridWidth / 2;

    const scoreItems = [
      { label: "Code Quality", value: result.scores?.codeQuality || 0 },
      { label: "Documentation", value: result.scores?.documentation || 0 },
      { label: "Security", value: result.scores?.security || 0 },
      { label: "Maintainability", value: result.scores?.maintainability || 0 },
      { label: "Test Coverage", value: result.scores?.testCoverage || 0 },
      { label: "Dependencies", value: result.scores?.dependencies || 0 },
    ];

    const rowHeight = 13;
    const barHeight = 3;
    const barWidth = colWidth - 22;

    scoreItems.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = gridStartX + col * colWidth;
      const y = cardY + 10 + row * rowHeight;
      const itemColor = getScoreColor(item.value);

      // Label and value
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setColor(colors.slate);
      doc.text(item.label, x, y);

      doc.setFont("helvetica", "bold");
      setColor(itemColor);
      doc.text(item.value.toString(), x + colWidth - 8, y, { align: "right" });

      // Bar
      setColor(colors.foam, "fill");
      doc.roundedRect(x, y + 2, barWidth, barHeight, 1, 1, "F");

      const fillWidth = Math.max((item.value / 100) * barWidth, 2);
      setColor(itemColor, "fill");
      doc.roundedRect(x, y + 2, fillWidth, barHeight, 1, 1, "F");
    });

    yPosition = cardY + cardHeight + 8;
  };

  const drawSectionTitle = (title: string) => {
    addNewPageIfNeeded(15);
    yPosition += 4;

    setColor(colors.caramel, "fill");
    doc.rect(margin, yPosition - 1.5, 0.4, 5, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    setColor(colors.darkRoast);
    doc.text(title.toUpperCase(), margin + 5, yPosition + 2);

    yPosition += 8;
  };

  const drawTextBlock = (text: string, maxLines: number = 6): void => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(colors.arabica);

    const lines = wrapText(text, contentWidth, 8);
    const displayLines = lines.slice(0, maxLines);
    const lineHeight = 4;

    displayLines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        addPageBackground();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    yPosition += 2;
  };

  const drawCompactInfoRow = (label: string, content: string) => {
    addNewPageIfNeeded(12);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    setColor(colors.mocha);
    doc.text(label.toUpperCase(), margin, yPosition);

    yPosition += 4;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(colors.arabica);

    const lines = wrapText(content, contentWidth, 8);
    const displayLines = lines.slice(0, 3);

    displayLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });

    yPosition += 3;
  };

  const drawTechStackCompact = () => {
    if (!result.techStack || result.techStack.length === 0) return;

    addNewPageIfNeeded(18);
    drawSectionTitle("Technology Stack");

    let techX = margin;
    const pillHeight = 5;
    const pillPadding = 3;
    const pillGap = 3;
    const rowGap = 7;
    let currentRow = 0;
    const startY = yPosition;

    const techColors = [
      colors.copper,
      colors.sage,
      colors.mocha,
      colors.terracotta,
      colors.slate,
    ];

    result.techStack.slice(0, 12).forEach((tech, index) => {
      doc.setFontSize(7);
      const textWidth = doc.getTextWidth(tech);
      const pillWidth = textWidth + pillPadding * 2;

      if (techX + pillWidth > margin + contentWidth) {
        techX = margin;
        currentRow++;
      }

      const pillY = startY + currentRow * rowGap;
      const pillColor = techColors[index % techColors.length];

      setColor(pillColor, "fill");
      doc.roundedRect(techX, pillY - 3.5, pillWidth, pillHeight, 1.5, 1.5, "F");

      doc.setFont("helvetica", "bold");
      setColor(colors.white);
      doc.text(tech, techX + pillPadding, pillY);

      techX += pillWidth + pillGap;
    });

    yPosition = startY + (currentRow + 1) * rowGap + 4;
  };

  const drawCommandsCompact = () => {
    if (!result.howToRun || result.howToRun.length === 0) return;

    addNewPageIfNeeded(25);
    drawSectionTitle("Quick Start");

    const commands = result.howToRun.slice(0, 3);
    const cmdHeight = commands.length * 6 + 8;

    setColor(colors.darkRoast, "fill");
    doc.roundedRect(margin, yPosition, contentWidth, cmdHeight, 3, 3, "F");

    doc.setFontSize(7);
    doc.setFont("courier", "normal");

    commands.forEach((cmd, i) => {
      const cmdText = cmd.length > 80 ? cmd.substring(0, 80) + "..." : cmd;
      setColor(colors.caramel);
      doc.text("$", margin + 4, yPosition + 6 + i * 6);
      setColor(colors.cream);
      doc.text(cmdText, margin + 9, yPosition + 6 + i * 6);
    });

    yPosition += cmdHeight + 6;
  };

  // === TABLE-BASED LAYOUTS ===

  const drawTable = (
    headers: {
      label: string;
      width: number;
      align?: "left" | "center" | "right";
    }[],
    rows: { cells: string[]; color?: RGB }[],
    options: {
      headerBg?: RGB;
      rowHeight?: number;
      fontSize?: number;
      wrapText?: boolean;
    } = {}
  ) => {
    const {
      headerBg = colors.mocha,
      rowHeight = 7,
      fontSize = 7,
      wrapText: shouldWrap = false,
    } = options;

    const headerHeight = 6;

    // Header
    setColor(headerBg, "fill");
    setColor(headerBg, "fill");
    doc.rect(margin, yPosition, contentWidth, headerHeight, "F");

    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    setColor(colors.white);

    let headerX = margin + 3;
    headers.forEach((header) => {
      const align = header.align || "left";
      let textX = headerX;
      if (align === "center") textX = headerX + header.width / 2;
      else if (align === "right") textX = headerX + header.width - 3;

      doc.text(header.label.toUpperCase(), textX, yPosition + 4, { align });
      headerX += header.width;
    });

    yPosition += headerHeight;

    // Rows
    rows.forEach((row, rowIndex) => {
      // Calculate row height based on content
      let maxLines = 1;
      if (shouldWrap) {
        row.cells.forEach((cell, cellIndex) => {
          const lines = wrapText(cell, headers[cellIndex].width - 4, fontSize);
          maxLines = Math.max(maxLines, lines.length);
        });
      }

      const actualRowHeight = shouldWrap
        ? Math.max(rowHeight, maxLines * 3.5 + 2)
        : rowHeight;

      if (addNewPageIfNeeded(actualRowHeight + 2)) {
        // Redraw header on new page
        setColor(headerBg, "fill");
        doc.rect(margin, yPosition, contentWidth, headerHeight, "F");

        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        setColor(colors.white);
        let hX = margin + 3;
        headers.forEach((header) => {
          const align = header.align || "left";
          let textX = hX;
          if (align === "center") textX = hX + header.width / 2;
          else if (align === "right") textX = hX + header.width - 3;
          doc.text(header.label.toUpperCase(), textX, yPosition + 4, { align });
          hX += header.width;
        });
        yPosition += headerHeight;
      }

      // Alternating row background
      if (rowIndex % 2 === 0) {
        setColor(colors.white, "fill");
      } else {
        setColor(colors.foam, "fill");
      }
      doc.rect(margin, yPosition, contentWidth, actualRowHeight, "F");

      // Row border
      setColor(colors.latte, "draw");
      doc.setLineWidth(0.15);
      doc.line(
        margin,
        yPosition + actualRowHeight,
        margin + contentWidth,
        yPosition + actualRowHeight
      );

      // Cell content
      doc.setFontSize(fontSize);
      let cellX = margin + 3;

      row.cells.forEach((cell, cellIndex) => {
        const header = headers[cellIndex];
        const align = header.align || "left";

        if (row.color && cellIndex === row.cells.length - 1) {
          setColor(row.color);
        } else {
          setColor(colors.arabica);
        }

        doc.setFont("helvetica", "normal");

        if (shouldWrap) {
          const lines = wrapText(cell, header.width - 4, fontSize);
          lines.forEach((line: string, lineIndex: number) => {
            let textX = cellX;
            if (align === "center") textX = cellX + header.width / 2 - 1.5;
            else if (align === "right") textX = cellX + header.width - 6;
            doc.text(line, textX, yPosition + 4 + lineIndex * 3.5, { align });
          });
        } else {
          let displayText = cell;
          const maxWidth = header.width - 4;
          if (doc.getTextWidth(displayText) > maxWidth) {
            while (
              doc.getTextWidth(displayText + "...") > maxWidth &&
              displayText.length > 0
            ) {
              displayText = displayText.slice(0, -1);
            }
            displayText += "...";
          }

          let textX = cellX;
          if (align === "center") textX = cellX + header.width / 2 - 1.5;
          else if (align === "right") textX = cellX + header.width - 6;

          doc.text(displayText, textX, yPosition + 4.5, { align });
        }

        cellX += header.width;
      });

      yPosition += actualRowHeight;
    });

    yPosition += 4;
  };

  const drawStructureTable = () => {
    if (!result.keyFolders || result.keyFolders.length === 0) return;

    addNewPageIfNeeded(25);
    drawSectionTitle("Project Structure");

    const headers = [
      { label: "Folder", width: 35 },
      { label: "Description", width: contentWidth - 35 },
    ];

    const rows = result.keyFolders.slice(0, 8).map((folder) => ({
      cells: [folder.name, folder.description],
    }));

    drawTable(headers, rows, {
      headerBg: colors.copper,
      rowHeight: 8,
      fontSize: 7,
      wrapText: true,
    });
  };

  const drawInsightsCards = () => {
    if (!result.insights || result.insights.length === 0) return;

    addNewPageIfNeeded(30);
    drawSectionTitle("Key Insights");

    const insights = result.insights.slice(0, 6);
    const cardPadding = 4;
    const cardGap = 3;
    const iconSize = 6;

    insights.forEach((insight, index) => {
      // Determine colors and icon based on type
      let accentColor: RGB;
      let bgColor: RGB;
      let iconText: string;

      if (insight.type === "strength") {
        accentColor = colors.success;
        bgColor = { r: 240, g: 247, b: 240 };
        iconText = "✓";
      } else if (insight.type === "warning") {
        accentColor = colors.warning;
        bgColor = { r: 252, g: 248, b: 238 };
        iconText = "!";
      } else {
        accentColor = colors.danger;
        bgColor = { r: 252, g: 242, b: 240 };
        iconText = "✗";
      }

      // Priority badge colors
      let priorityColor: RGB;
      let priorityBgColor: RGB;
      if (insight.priority === "high") {
        priorityColor = colors.white;
        priorityBgColor = colors.danger;
      } else if (insight.priority === "medium") {
        priorityColor = colors.darkRoast;
        priorityBgColor = colors.gold;
      } else {
        priorityColor = colors.white;
        priorityBgColor = colors.sage;
      }

      // Calculate card height based on content
      doc.setFontSize(7);
      const titleLines = wrapText(insight.title, contentWidth - 45, 7);
      const descLines = insight.description
        ? wrapText(insight.description, contentWidth - 12, 6.5).slice(0, 2)
        : [];

      const titleHeight = titleLines.length * 3.5;
      const descHeight = descLines.length > 0 ? descLines.length * 3 + 2 : 0;
      const cardHeight = Math.max(
        cardPadding * 2 + titleHeight + descHeight,
        16
      );

      // Check for new page
      if (addNewPageIfNeeded(cardHeight + 5)) {
        if (index > 0) {
          drawSectionTitle("Key Insights (continued)");
        }
      }

      // Card background with rounded corners
      setColor(bgColor, "fill");
      doc.roundedRect(margin, yPosition, contentWidth, cardHeight, 2, 2, "F");

      // Left accent bar
      setColor(accentColor, "fill");
      doc.rect(margin, yPosition, 1.5, cardHeight, "F");

      // Title
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      setColor(colors.darkRoast);

      const titleX = margin + 6;
      const titleY = yPosition + cardPadding + 3;

      titleLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, titleX, titleY + lineIndex * 3.5);
      });

      // Priority badge (top right)
      const badgeText = insight.priority.toUpperCase();
      doc.setFontSize(5);
      const badgeWidth = doc.getTextWidth(badgeText) + 4;
      const badgeHeight = 4;
      const badgeX = margin + contentWidth - badgeWidth - cardPadding;
      const badgeY = yPosition + cardPadding;

      setColor(priorityBgColor, "fill");
      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1, 1, "F");

      doc.setFont("helvetica", "normal");
      setColor(colors.white);
      doc.text(badgeText, badgeX + badgeWidth / 2, badgeY + 2.8, {
        align: "center",
      });

      // Description (if exists)
      if (descLines.length > 0) {
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        setColor(colors.slate);

        const descY = titleY + titleHeight + 1;
        descLines.forEach((line: string, lineIndex: number) => {
          doc.text(line, titleX, descY + lineIndex * 3);
        });
      }

      yPosition += cardHeight + cardGap;
    });

    yPosition += 2;
  };

  const drawRefactorsTable = () => {
    if (!result.refactors || result.refactors.length === 0) return;

    addNewPageIfNeeded(25);
    drawSectionTitle("Refactoring Opportunities");

    const headers = [
      { label: "Opportunity", width: contentWidth - 44 },
      { label: "Impact", width: 22, align: "center" as const },
      { label: "Effort", width: 22, align: "center" as const },
    ];

    const rows = result.refactors.slice(0, 5).map((refactor) => ({
      cells: [
        refactor.title,
        refactor.impact.toUpperCase(),
        refactor.effort.toUpperCase(),
      ],
    }));

    drawTable(headers, rows, {
      headerBg: colors.mocha,
      rowHeight: 7,
      fontSize: 7,
    });
  };

  const drawAutomationsTable = () => {
    if (!result.automations || result.automations.length === 0) return;

    addNewPageIfNeeded(25);
    drawSectionTitle("Automation Suggestions");

    const headers = [
      { label: "Type", width: 28 },
      { label: "Suggestion", width: contentWidth - 28 },
    ];

    const rows = result.automations.slice(0, 5).map((automation) => ({
      cells: [
        automation.type.toUpperCase().replace("-", " "),
        automation.title,
      ],
    }));

    drawTable(headers, rows, {
      headerBg: colors.sage,
      rowHeight: 8,
      fontSize: 7,
      wrapText: true,
    });
  };

  const addFooter = () => {
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      setColor(colors.latte, "draw");
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      setColor(colors.mocha);
      doc.text("Repolyze", margin, pageHeight - 6);

      doc.setFont("helvetica", "normal");
      setColor(colors.slate);
      doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 6, {
        align: "center",
      });

      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc.text(date, pageWidth - margin, pageHeight - 6, { align: "right" });
    }
  };

  // === BUILD THE DOCUMENT ===

  addPageBackground();
  drawHeroSection();
  drawScoreCard();

  // Summary section - compact
  if (result.summary) {
    drawSectionTitle("Executive Summary");
    drawTextBlock(result.summary, 5);
  }

  // Purpose & Audience - compact inline
  if (result.whatItDoes) {
    drawCompactInfoRow("Purpose", result.whatItDoes);
  }

  if (result.targetAudience) {
    drawCompactInfoRow("Target Audience", result.targetAudience);
  }

  // Tech stack
  drawTechStackCompact();

  // Commands
  drawCommandsCompact();

  // Tables for structured data
  drawStructureTable();
  drawInsightsCards();
  drawRefactorsTable();
  drawAutomationsTable();

  // Footer
  addFooter();

  return doc.output("blob");
}

export async function downloadPDFReport(
  result: AnalysisResult,
  filename?: string
): Promise<boolean> {
  try {
    const blob = await generatePDFReport(result);
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `${result.metadata.name}-analysis.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return false;
  }
}

export async function previewPDFReport(
  result: AnalysisResult
): Promise<boolean> {
  try {
    const blob = await generatePDFReport(result);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return true;
  } catch (error) {
    console.error("Failed to preview PDF:", error);
    return false;
  }
}
