export function formatMoney(value) {
  const amount = Number(value || 0);
  try {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)} ကျပ်`;
  } catch {
    return `${amount.toFixed(0)} ကျပ်`;
  }
}

export function formatDate(value) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("my-MM", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return value;
  }
}

export function formatDirection(value) {
  return value === "in" ? "ဝင်ငွေ" : "ထွက်ငွေ";
}

export function formatMethod(value) {
  return value === "kpay" ? "KPay" : "KMBank";
}
