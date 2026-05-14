import { useEffect, useState } from "react";
import { getSummary } from "../api/transactions.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Loading from "../components/Loading.jsx";
import SummaryCards from "../components/SummaryCards.jsx";
import TransactionTable from "../components/TransactionTable.jsx";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSummary() {
    setLoading(true);
    setError("");
    try {
      const data = await getSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || "စုစုပေါင်းစာရင်း ဖတ်၍မရပါ။");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <p>စာရင်းချုပ်</p>
        <h1>စုစုပေါင်းစာရင်း</h1>
      </header>

      <ErrorMessage message={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <SummaryCards summary={summary} />
          <div className="section-title">
            <h2>နောက်ဆုံးမှတ်တမ်းများ</h2>
            <span>{summary?.count || 0} ခု</span>
          </div>
          <TransactionTable
            transactions={summary?.recent_transactions || []}
            showActions={false}
          />
        </>
      )}
    </section>
  );
}
