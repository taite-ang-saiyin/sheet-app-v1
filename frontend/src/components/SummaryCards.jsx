import { formatMoney } from "../utils/format.js";

const items = [
  { key: "total_in", label: "စုစုပေါင်း ဝင်ငွေ", tone: "good" },
  { key: "total_out", label: "စုစုပေါင်း ထွက်ငွေ", tone: "bad" },
  { key: "net_total", label: "လက်ကျန်", tone: "main" },
  { key: "total_kpay", label: "KPay စုစုပေါင်း", tone: "soft" },
  { key: "total_kmbank", label: "KMBank စုစုပေါင်း", tone: "soft" },
];

export default function SummaryCards({ summary }) {
  return (
    <section className="summary-grid">
      {items.map((item) => (
        <article key={item.key} className={`summary-card summary-card--${item.tone}`}>
          <span>{item.label}</span>
          <strong>{formatMoney(summary?.[item.key] || 0)}</strong>
        </article>
      ))}
    </section>
  );
}
