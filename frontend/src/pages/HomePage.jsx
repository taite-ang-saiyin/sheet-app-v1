import { useState } from "react";
import TransactionForm from "../components/TransactionForm.jsx";

export default function HomePage() {
  const [success, setSuccess] = useState("");

  function handleSaved() {
    setSuccess("သိမ်းပြီးပါပြီ");
    window.setTimeout(() => setSuccess(""), 2500);
  }

  return (
    <section className="page">
      <header className="page-header">
        <p>မင်္ဂလာပါ</p>
        <h1>ငွေစာရင်းသွင်းရန်</h1>
      </header>
      {success ? <div className="success-message">{success}</div> : null}
      <TransactionForm onSaved={handleSaved} />
    </section>
  );
}
