import { useEffect, useState } from "react";
import { createTransaction, updateTransaction } from "../api/transactions.js";
import ErrorMessage from "./ErrorMessage.jsx";

function todayText() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  person_name: "",
  amount: "",
  transaction_date: todayText(),
  direction: "in",
  payment_method: "kpay",
};

export default function TransactionForm({
  initialValues,
  onSaved,
  onCancel,
  submitLabel,
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(initialValues && initialValues.id);

  useEffect(() => {
    if (initialValues) {
      setForm({
        person_name: initialValues.person_name || "",
        amount: String(initialValues.amount || ""),
        transaction_date: initialValues.transaction_date || todayText(),
        direction: initialValues.direction || "in",
        payment_method: initialValues.payment_method || "kpay",
      });
    } else {
      setForm(emptyForm);
    }
    setError("");
  }, [initialValues]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.person_name.trim()) {
      setError("အမည် ဖြည့်ပါ။");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("ငွေပမာဏကို ၀ ထက်ကြီးသော နံပါတ်ဖြင့် ဖြည့်ပါ။");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        person_name: form.person_name.trim(),
        amount: String(Math.round(Number(form.amount))),
      };
      const saved = isEditing
        ? await updateTransaction(initialValues.id, payload)
        : await createTransaction(payload);
      if (!isEditing) {
        setForm(emptyForm);
      }
      onSaved?.(saved);
    } catch (err) {
      setError(err.message || "သိမ်းဆည်းမှု မအောင်မြင်ပါ။");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />

      <label className="field">
        <span className="field__label">လက်ခံသူ / ပေးသူ အမည်</span>
        <input
          className="input"
          type="text"
          value={form.person_name}
          onChange={(event) => setField("person_name", event.target.value)}
          placeholder="ဥပမာ - မမ"
          autoComplete="name"
          required
        />
      </label>

      <label className="field">
        <span className="field__label">ငွေပမာဏ</span>
        <input
          className="input"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={form.amount}
          onChange={(event) => setField("amount", event.target.value)}
          placeholder="ဥပမာ - 50000"
          required
        />
      </label>

      <label className="field">
        <span className="field__label">ရက်စွဲ</span>
        <input
          className="input"
          type="date"
          value={form.transaction_date}
          onChange={(event) => setField("transaction_date", event.target.value)}
          required
        />
      </label>

      <div className="field">
        <span className="field__label">အမျိုးအစား</span>
        <div className="segment">
          <button
            type="button"
            className={form.direction === "in" ? "is-selected" : ""}
            onClick={() => setField("direction", "in")}
          >
            ဝင်ငွေ
          </button>
          <button
            type="button"
            className={form.direction === "out" ? "is-selected" : ""}
            onClick={() => setField("direction", "out")}
          >
            ထွက်ငွေ
          </button>
        </div>
      </div>

      <div className="field">
        <span className="field__label">ငွေပေးချေမှုနည်းလမ်း</span>
        <div className="segment">
          <button
            type="button"
            className={form.payment_method === "kpay" ? "is-selected" : ""}
            onClick={() => setField("payment_method", "kpay")}
          >
            KPay
          </button>
          <button
            type="button"
            className={form.payment_method === "kmbank" ? "is-selected" : ""}
            onClick={() => setField("payment_method", "kmbank")}
          >
            KMBank
          </button>
        </div>
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="button button--ghost" onClick={onCancel}>
            မလုပ်တော့ပါ
          </button>
        ) : null}
        <button className="button button--primary" type="submit" disabled={saving}>
          {saving ? "သိမ်းနေပါသည်..." : submitLabel || "သိမ်းမည်"}
        </button>
      </div>
    </form>
  );
}
