import { useEffect, useState } from "react";
import {
  deleteTransaction,
  getTransactions,
} from "../api/transactions.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import TransactionForm from "../components/TransactionForm.jsx";
import TransactionTable from "../components/TransactionTable.jsx";

const emptyFilters = {
  search: "",
  start_date: "",
  end_date: "",
  direction: "",
  payment_method: "",
};

export default function RecordsPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  async function loadRecords(nextFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const rows = await getTransactions(nextFilters);
      setTransactions(rows);
    } catch (err) {
      setError(err.message || "မှတ်တမ်းများ ဖတ်၍မရပါ။");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords(emptyFilters);
  }, []);

  function setFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    loadRecords(filters);
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(`${item.person_name} စာရင်းကို ဖျက်မလား။`);
    if (!confirmed) return;

    setError("");
    try {
      await deleteTransaction(item.id);
      await loadRecords(filters);
    } catch (err) {
      setError(err.message || "ဖျက်၍မရပါ။");
    }
  }

  async function handleEdited() {
    setEditing(null);
    await loadRecords(filters);
  }

  return (
    <section className="page">
      <header className="page-header">
        <p>ရှာဖွေ၊ စစ်ထုတ်၊ ပြင်ဆင်ရန်</p>
        <h1>မှတ်တမ်းများ</h1>
      </header>

      <form className="filter-panel" onSubmit={handleSearch}>
        <input
          className="input"
          type="search"
          value={filters.search}
          onChange={(event) => setFilter("search", event.target.value)}
          placeholder="အမည်ဖြင့် ရှာရန်"
        />
        <div className="filter-grid">
          <input
            className="input"
            type="date"
            value={filters.start_date}
            onChange={(event) => setFilter("start_date", event.target.value)}
            aria-label="စတင်ရက်"
          />
          <input
            className="input"
            type="date"
            value={filters.end_date}
            onChange={(event) => setFilter("end_date", event.target.value)}
            aria-label="ဆုံးရက်"
          />
          <select
            className="input"
            value={filters.direction}
            onChange={(event) => setFilter("direction", event.target.value)}
            aria-label="အမျိုးအစား"
          >
            <option value="">အားလုံး</option>
            <option value="in">ဝင်ငွေ</option>
            <option value="out">ထွက်ငွေ</option>
          </select>
          <select
            className="input"
            value={filters.payment_method}
            onChange={(event) => setFilter("payment_method", event.target.value)}
            aria-label="ငွေပေးချေမှုနည်းလမ်း"
          >
            <option value="">နည်းလမ်းအားလုံး</option>
            <option value="kpay">KPay</option>
            <option value="kmbank">KMBank</option>
          </select>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setFilters(emptyFilters);
              loadRecords(emptyFilters);
            }}
          >
            ရှင်းမည်
          </button>
          <button type="submit" className="button button--primary">
            ရှာမည်
          </button>
        </div>
      </form>

      <ErrorMessage message={error} />
      {loading ? (
        <Loading />
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
      )}

      {editing ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-sheet">
            <h2>စာရင်းပြင်ရန်</h2>
            <TransactionForm
              initialValues={editing}
              onSaved={handleEdited}
              onCancel={() => setEditing(null)}
              submitLabel="ပြင်ဆင်သိမ်းမည်"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
