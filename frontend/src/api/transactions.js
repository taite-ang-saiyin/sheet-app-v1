import { apiRequest } from "./client.js";

function queryString(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function createTransaction(payload) {
  return apiRequest("/api/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTransaction(id, payload) {
  return apiRequest(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(id) {
  return apiRequest(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}

export function getTransactions(filters = {}) {
  return apiRequest(`/api/transactions${queryString(filters)}`);
}

export function getSummary(filters = {}) {
  return apiRequest(`/api/transactions/summary${queryString(filters)}`);
}
