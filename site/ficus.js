"use strict";

import WAPI from "./wapi.js";
export async function get_transactions() {
  const end_ts = Math.ceil(Date.now() / 1000);
  const start_ts = end_ts - 86400 * 7;
  let response = await WAPI().get("ficus/transactions", {
    start_ts: start_ts,
    end_ts: end_ts
  });
  return await response.json();
}
export async function set_txn_category(txn, category) {
  let response = await WAPI().post("ficus/categorize", {
    txn_id: txn.id,
    category: category
  });
  return await response.json();
}