"use strict";

import WAPI from "../wapi.js"; // import * as fire_app from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
// import * as fire_msg from "https://www.gstatic.com/firebasejs/10.13/firebase-messaging.js";

class FicusClass {
  constructor() {// this.fire_app = fire_app;
    // this.fire_msg = fire_msg;
    // this.f_app = this.fire_app.initializeApp({
    //   apiKey: "AIzaSyAv8QaZaRjJ6HRHX7ymQWoUalNYx2lSRUA",
    //   authDomain: "wmcd-site.firebaseapp.com",
    //   projectId: "wmcd-site",
    //   storageBucket: "wmcd-site.appspot.com",
    //   messagingSenderId: "853912113754",
    //   appId: "1:853912113754:web:14aa98bbd15ceab7aa3e63",
    // });
    // this.f_msg = this.fire_msg.getMessaging(this.f_app);
  }

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

}

const Ficus = new FicusClass();
export default Ficus;