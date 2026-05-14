import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "../api/transactions.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import {
  formatDate,
  formatDirection,
  formatMethod,
  formatMoney,
} from "../utils/format.js";
import { createTransactionExportImage } from "../utils/exportImage.js";

const columns = [
  { letter: "A", label: "ရက်စွဲ", key: "transaction_date" },
  { letter: "B", label: "အမည်", key: "person_name" },
  { letter: "C", label: "အမျိုးအစား", key: "direction" },
  { letter: "D", label: "နည်းလမ်း", key: "payment_method" },
  { letter: "E", label: "ဝင်ငွေ", key: "in_amount" },
  { letter: "F", label: "ထွက်ငွေ", key: "out_amount" },
];

export default function SheetPage() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState("");

  async function loadSheet() {
    setLoading(true);
    setError("");
    try {
      const rows = await getTransactions();
      setTransactions(rows);
    } catch (err) {
      setError(err.message || "စာရွက်ကို ဖတ်၍မရပါ။");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSheet();
  }, []);

  const filteredRows = useMemo(() => {
    const text = search.trim().toLowerCase();
    if (!text) return transactions;
    return transactions.filter((item) =>
      item.person_name.toLowerCase().includes(text)
    );
  }, [search, transactions]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (sum, item) => {
        const amount = Number(item.amount || 0);
        if (item.direction === "in") {
          sum.in += amount;
        } else {
          sum.out += amount;
        }
        return sum;
      },
      { in: 0, out: 0 }
    );
  }, [filteredRows]);

  async function handleExportImage() {
    setExporting(true);
    setError("");
    try {
      if (exportUrl) {
        URL.revokeObjectURL(exportUrl);
      }
      const blob = await createTransactionExportImage(transactions);
      const nextUrl = URL.createObjectURL(blob);
      setExportUrl(nextUrl);

      const link = document.createElement("a");
      link.href = nextUrl;
      link.download = `money-sheet-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message || "ပုံထုတ်၍မရပါ။");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="page">
      <header className="page-header">
        <p>Excel ပုံစံဖြင့် ကြည့်ရန်</p>
        <h1>စာရွက်</h1>
      </header>

      <div className="sheet-toolbar">
        <input
          className="input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="အမည်ဖြင့် စာရွက်ထဲမှာ ရှာရန်"
        />
        <button type="button" className="small-button" onClick={loadSheet}>
          ပြန်ဖတ်မည်
        </button>
        <button
          type="button"
          className="small-button small-button--accent"
          onClick={handleExportImage}
          disabled={exporting || loading}
        >
          {exporting ? "ပုံထုတ်နေသည်..." : "ပုံထုတ်မည်"}
        </button>
      </div>

      {exportUrl ? (
        <a className="export-link" href={exportUrl} target="_blank" rel="noreferrer">
          ထုတ်ထားသောပုံကို ဖွင့်ကြည့်ရန်
        </a>
      ) : null}

      <ErrorMessage message={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="sheet-card">
          <div className="sheet-meta">
            <span>စုစုပေါင်း {filteredRows.length} ကြောင်း</span>
            <span>လက်ကျန် {formatMoney(totals.in - totals.out)}</span>
          </div>

          <div className="sheet-scroll" aria-label="စာရင်းစာရွက်">
            <table className="sheet-table">
              <thead>
                <tr className="sheet-letters">
                  <th className="sheet-corner"></th>
                  {columns.map((column) => (
                    <th key={column.key}>{column.letter}</th>
                  ))}
                </tr>
                <tr>
                  <th className="sheet-row-number">#</th>
                  {columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item, index) => (
                  <tr key={item.id}>
                    <th className="sheet-row-number">{index + 1}</th>
                    <td>{formatDate(item.transaction_date)}</td>
                    <td>{item.person_name}</td>
                    <td>{formatDirection(item.direction)}</td>
                    <td>{formatMethod(item.payment_method)}</td>
                    <td className="money-in">
                      {item.direction === "in" ? formatMoney(item.amount) : ""}
                    </td>
                    <td className="money-out">
                      {item.direction === "out" ? formatMoney(item.amount) : ""}
                    </td>
                  </tr>
                ))}
                {!filteredRows.length ? (
                  <tr>
                    <th className="sheet-row-number">1</th>
                    <td colSpan={columns.length}>မှတ်တမ်း မရှိသေးပါ။</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr>
                  <th className="sheet-row-number">Σ</th>
                  <td colSpan="4">စုစုပေါင်း</td>
                  <td className="money-in">{formatMoney(totals.in)}</td>
                  <td className="money-out">{formatMoney(totals.out)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
