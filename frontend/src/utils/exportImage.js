const page = {
  width: 1080,
  margin: 70,
  gap: 58,
  titleHeight: 54,
  rowHeight: 48,
  lineColor: "#111111",
  textColor: "#111111",
  mutedFill: "#f5f5f5",
};

function getColumns(nameColumnLabel) {
  return [
    { label: "ရက်စွဲ", width: 170, align: "left" },
    { label: nameColumnLabel, width: 370, align: "left" },
    { label: "Kpay/mBanking", width: 230, align: "center" },
    { label: "ငွေပမာဏ", width: 170, align: "right" },
  ];
}

const myanmarDigits = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];

function toMyanmarNumber(value) {
  return String(value).replace(/\d/g, (digit) => myanmarDigits[Number(digit)]);
}

function formatExportDate(value) {
  if (!value) return "-";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return toMyanmarNumber(`${Number(day)}-${Number(month)}-${year}`);
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function paymentMethod(value) {
  if (value === "kpay") return "KPay";
  if (value === "kmbank") return "mBanking";
  return "-";
}

function splitRows(transactions) {
  return {
    inRows: transactions.filter((item) => item.direction === "in"),
    outRows: transactions.filter((item) => item.direction === "out"),
  };
}

function sumRows(rows) {
  return rows.reduce((total, row) => total + Number(row.amount || 0), 0);
}

function tableHeight(rows) {
  return (
    page.titleHeight +
    page.rowHeight +
    Math.max(rows.length, 1) * page.rowHeight +
    page.rowHeight
  );
}

function truncate(ctx, text, maxWidth) {
  const value = String(text || "-");
  if (ctx.measureText(value).width <= maxWidth) return value;

  let output = value;
  while (output.length > 1 && ctx.measureText(`${output}...`).width > maxWidth) {
    output = output.slice(0, -1);
  }
  return `${output}...`;
}

function drawCellText(ctx, text, x, y, width, height, align = "left", bold = false) {
  ctx.font = `${bold ? "700" : "400"} 24px "Myanmar Text", "Noto Sans Myanmar", Arial, sans-serif`;
  ctx.fillStyle = page.textColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = align;

  const padding = 18;
  const textX =
    align === "right" ? x + width - padding : align === "center" ? x + width / 2 : x + padding;
  const clipped = truncate(ctx, text, width - padding * 2);
  ctx.fillText(clipped, textX, y + height / 2);
}

function strokeRect(ctx, x, y, width, height) {
  ctx.strokeStyle = page.lineColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

function fillRect(ctx, x, y, width, height, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
}

function drawTable(ctx, title, rows, total, startY, nameColumnLabel) {
  const columns = getColumns(nameColumnLabel);
  const x = page.margin;
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  let y = startY;

  ctx.font = '700 30px "Myanmar Text", "Noto Sans Myanmar", Arial, sans-serif';
  ctx.fillStyle = page.textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(title, x, y + page.titleHeight / 2);
  y += page.titleHeight;

  fillRect(ctx, x, y, tableWidth, page.rowHeight, page.mutedFill);
  let currentX = x;
  columns.forEach((column) => {
    strokeRect(ctx, currentX, y, column.width, page.rowHeight);
    drawCellText(ctx, column.label, currentX, y, column.width, page.rowHeight, "center", true);
    currentX += column.width;
  });
  y += page.rowHeight;

  const visibleRows = rows.length
    ? rows
    : [{ transaction_date: "", person_name: "-", payment_method: "", amount: "" }];
  visibleRows.forEach((row) => {
    currentX = x;
    const values = [
      formatExportDate(row.transaction_date),
      row.person_name,
      paymentMethod(row.payment_method),
      row.amount ? money(row.amount) : "",
    ];
    columns.forEach((column, index) => {
      strokeRect(ctx, currentX, y, column.width, page.rowHeight);
      drawCellText(ctx, values[index], currentX, y, column.width, page.rowHeight, column.align);
      currentX += column.width;
    });
    y += page.rowHeight;
  });

  currentX = x;
  fillRect(ctx, x, y, tableWidth, page.rowHeight, "#fbfbfb");
  strokeRect(ctx, currentX, y, columns[0].width, page.rowHeight);
  currentX += columns[0].width;
  const totalLabelWidth = columns[1].width + columns[2].width;
  strokeRect(ctx, currentX, y, totalLabelWidth, page.rowHeight);
  drawCellText(ctx, "စုစုပေါင်း", currentX, y, totalLabelWidth, page.rowHeight, "center", true);
  currentX += totalLabelWidth;
  strokeRect(ctx, currentX, y, columns[3].width, page.rowHeight);
  drawCellText(ctx, money(total), currentX, y, columns[3].width, page.rowHeight, "right", true);

  return y + page.rowHeight;
}

function drawSummaryTable(ctx, totalIn, totalOut, startY) {
  const rows = [
    ["စုစုပေါင်း ဝင်ငွေ", money(totalIn)],
    ["စုစုပေါင်း ထွက်ငွေ", money(totalOut)],
    ["လက်ကျန်ငွေ", money(totalIn - totalOut)],
  ];
  const x = page.margin;
  const labelWidth = 560;
  const amountWidth = 380;
  let y = startY;

  ctx.font = '700 30px "Myanmar Text", "Noto Sans Myanmar", Arial, sans-serif';
  ctx.fillStyle = page.textColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("စုစုပေါင်းစာရင်းချုပ်", x, y + page.titleHeight / 2);
  y += page.titleHeight;

  rows.forEach(([label, value], index) => {
    if (index === rows.length - 1) {
      fillRect(ctx, x, y, labelWidth + amountWidth, page.rowHeight, "#fbfbfb");
    }
    strokeRect(ctx, x, y, labelWidth, page.rowHeight);
    drawCellText(ctx, label, x, y, labelWidth, page.rowHeight, "center", true);
    strokeRect(ctx, x + labelWidth, y, amountWidth, page.rowHeight);
    drawCellText(ctx, value, x + labelWidth, y, amountWidth, page.rowHeight, "right", true);
    y += page.rowHeight;
  });
}

export function createTransactionExportImage(transactions) {
  const { inRows, outRows } = splitRows(transactions);
  const totalIn = sumRows(inRows);
  const totalOut = sumRows(outRows);
  const summaryHeight = page.titleHeight + page.rowHeight * 3;
  const height =
    page.margin * 2 +
    tableHeight(inRows) +
    tableHeight(outRows) +
    summaryHeight +
    page.gap * 2;

  const canvas = document.createElement("canvas");
  canvas.width = page.width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let y = page.margin;
  y = drawTable(ctx, "ဝင်ငွေစာရင်း", inRows, totalIn, y, "ငွေလွှဲသူအမည်") + page.gap;
  y = drawTable(ctx, "ထွက်ငွေစာရင်း", outRows, totalOut, y, "ငွေလက်ခံသူအမည်") + page.gap;
  drawSummaryTable(ctx, totalIn, totalOut, y);

  return new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1);
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const byteString = atob(dataUrl.split(",")[1]);
    const bytes = new Uint8Array(byteString.length);
    for (let index = 0; index < byteString.length; index += 1) {
      bytes[index] = byteString.charCodeAt(index);
    }
    resolve(new Blob([bytes], { type: "image/png" }));
  });
}
