"use strict";

import { AuthWrapper } from "../auth.js";
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

}

const Ficus = new FicusClass();
export default Ficus;

let sw_prom = async function () {
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });

    if (registration.installing) {
      console.log("Service worker installing");
    } else if (registration.waiting) {
      console.log("Service worker installed");
    } else if (registration.active) {
      console.log("Service worker active");
    }

    return registration;
  } catch (err) {
    console.error(`Service worker registration failed with ${err}`);
    return null;
  }
}();

let sw_registration = null;
export async function sw() {
  if (sw_registration == null) {
    sw_registration = await sw_prom;
    console.log(`got ${sw_registration}`);
  }

  return sw_registration;
}
export function render(make_app) {
  const domContainer = document.querySelector("#root");
  const root = ReactDOM.createRoot(domContainer);
  root.render( /*#__PURE__*/React.createElement(AuthWrapper, {
    inner_content: make_app
  }));
}