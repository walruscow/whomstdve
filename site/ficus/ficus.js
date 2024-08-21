"use strict";

import WAPI from "../wapi.js";
export async function get_transactions() {
  const end_ts = Math.ceil(Date.now() / 1000);
  const start_ts = end_ts - 86400 * 7;
  let response = await WAPI().get("ficus/transactions", {
    start_ts: start_ts,
    end_ts: end_ts
  });
  return await response.json();
}
export async function get_budgets() {
  let response = await WAPI().get("ficus/budgets");
  return await response.json();
}
export async function new_budget({
  name,
  duration,
  target_spend
}) {
  let response = await WAPI().post("ficus/budgets/new", {
    name: name,
    duration: duration,
    target_spend: target_spend,
    rollover_periods: 0
  });
  return await response.json();
}
export async function get_unbudgeted_transactions() {
  const end_ts = Math.ceil(Date.now() / 1000);
  const start_ts = end_ts - 86400 * 7;
  let response = await WAPI().get("ficus/transactions/unbudgeted", {
    start_ts: start_ts,
    end_ts: end_ts
  });
  return await response.json();
}
export async function set_txn_budget(txn, budget) {
  let response = await WAPI().post("ficus/transactions/budget", {
    txn_id: txn.id,
    budget_id: budget.id
  });
  return await response.json();
}