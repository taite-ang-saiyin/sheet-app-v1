import { formatDate, formatDirection, formatMethod, formatMoney } from "../utils/format.js";

export default function TransactionTable({ transactions, onEdit, onDelete, showActions = true }) {
  if (!transactions.length) {
    return <div className="state-box">မှတ်တမ်း မရှိသေးပါ။</div>;
  }

  return (
    <section className="records">
      <div className="record-list">
        {transactions.map((item) => (
          <article key={item.id} className="record-card">
            <div>
              <h3>{item.person_name}</h3>
              <p>
                {formatDate(item.transaction_date)} · {formatMethod(item.payment_method)}
              </p>
            </div>
            <div className="record-card__amount">
              <strong className={item.direction === "in" ? "money-in" : "money-out"}>
                {item.direction === "in" ? "+" : "-"}
                {formatMoney(item.amount)}
              </strong>
              <span>{formatDirection(item.direction)}</span>
            </div>
            {showActions ? (
              <div className="record-card__actions">
                <button type="button" className="small-button" onClick={() => onEdit(item)}>
                  ပြင်
                </button>
                <button
                  type="button"
                  className="small-button small-button--danger"
                  onClick={() => onDelete(item)}
                >
                  ဖျက်
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ရက်စွဲ</th>
              <th>အမည်</th>
              <th>အမျိုးအစား</th>
              <th>နည်းလမ်း</th>
              <th>ငွေပမာဏ</th>
              {showActions ? <th></th> : null}
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.transaction_date)}</td>
                <td>{item.person_name}</td>
                <td>{formatDirection(item.direction)}</td>
                <td>{formatMethod(item.payment_method)}</td>
                <td className={item.direction === "in" ? "money-in" : "money-out"}>
                  {item.direction === "in" ? "+" : "-"}
                  {formatMoney(item.amount)}
                </td>
                {showActions ? (
                  <td className="table-actions">
                    <button type="button" className="small-button" onClick={() => onEdit(item)}>
                      ပြင်
                    </button>
                    <button
                      type="button"
                      className="small-button small-button--danger"
                      onClick={() => onDelete(item)}
                    >
                      ဖျက်
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
