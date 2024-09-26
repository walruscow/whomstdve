"use strict";

import WAPI from "../wapi.js";
class FicusClass {
  async get_transactions() {
    const end_ts = Math.ceil(Date.now() / 1000);
    const start_ts = end_ts - 86400 * 7;
    let response = await WAPI().get("ficus/transactions", {
      start_ts: start_ts,
      end_ts: end_ts
    });
    return await response.json();
  }
  async get_budgets() {
    let response = await WAPI().get("ficus/budgets");
    return await response.json();
  }
  async new_budget({
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
  async get_unbudgeted_transactions() {
    const end_ts = Math.ceil(Date.now() / 1000);
    const start_ts = end_ts - 86400 * 7;
    let response = await WAPI().get("ficus/transactions/unbudgeted", {
      start_ts: start_ts,
      end_ts: end_ts
    });
    return await response.json();
  }
  async set_txn_budget(txn, budget) {
    let response = await WAPI().post("ficus/transactions/budget", {
      txn_id: txn.id,
      budget_id: budget.id
    });
    return await response.json();
  }
  async get_subscription_meta() {
    let response = await WAPI().get("ficus/subscribe/meta");
    let json = await response.json();
    json.vapid_key = new Uint8Array(json.vapid_key.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return json;
  }
  async subscribe(sub) {
    let response = await WAPI().post("ficus/subscribe", sub);
    let json = await response.json();
    console.log(`Subscribing and got response ${JSON.stringify(json)}`);
    return json.ok;
  }
  async test_notif() {
    let response = await WAPI().post("ficus/notify_me");
    let json = await response.json();
    console.log(`Got notify_me response ${JSON.stringify(json)}`);
  }
  async list_connected_accounts() {
    let response = await WAPI().get("ficus/connection/list");
    let json = await response.json();
    return json.connections;
  }
  async add_connection(setup_token) {
    let response = await WAPI().post("ficus/connection/add", {
      setup_token: setup_token
    });
    let json = response.json();
    return json.ok;
  }
}
const Ficus = new FicusClass();
export default Ficus;
let sw_registration = null;
export async function sw() {
  function wait_for_control() {
    return new Promise(resolve => {
      if (navigator.serviceWorker.controller) {
        // Service worker is already controlling the page
        resolve();
        return;
      }
      const on_change = () => {
        if (navigator.serviceWorker.controller) {
          resolve();
          navigator.serviceWorker.removeEventListener("controllerchange", on_change);
        }
      };
      navigator.serviceWorker.addEventListener("controllerchange", on_change);
    });
  }
  if (sw_registration == null) {
    try {
      sw_registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/"
      });
      console.debug("Registered service worker");
      await navigator.serviceWorker.ready;
      console.debug("Service worker ready");
      await wait_for_control();
      console.debug("Service worker is controlling the page");
    } catch (err) {
      console.error(`Service worker registration failed with ${err}`);
      return null;
    }
  }
  return sw_registration;
}