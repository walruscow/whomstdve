"use strict";

import { AuthWrapper } from "../auth.js";
import Ficus from "./ficus.js"; // Import the functions you need from the SDKs you need

class TxnBudgeter extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      className: "orange"
    }, "Cents: ", this.props.transaction.cents), /*#__PURE__*/React.createElement("h1", {
      className: "purple"
    }, "Description: ", this.props.transaction.description), /*#__PURE__*/React.createElement("div", {
      className: "budget_chooser"
    }, this.props.budgets.map(budget => /*#__PURE__*/React.createElement("button", {
      className: "budget_choice",
      onClick: () => this.props.on_budgeted(this.props.transaction, budget)
    }, budget.name)), /*#__PURE__*/React.createElement(NewBudget, {
      on_create: budget => this.props.on_budgeted(this.props.transaction, budget),
      txn: this.props.transaction
    })));
  }

}

class NewBudget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.txn.id != this.props.txn.id) {
      this.setState({
        expanded: false
      });
    }
  }

  render() {
    if (!this.state.expanded) {
      return /*#__PURE__*/React.createElement("button", {
        className: "budget_choice",
        onClick: () => this.setState({
          expanded: true
        })
      }, "New Budget");
    }

    return /*#__PURE__*/React.createElement("form", {
      onSubmit: async e => {
        e.preventDefault();
        const form = Object.fromEntries(new FormData(e.target));
        let new_budget = await Ficus.new_budget({
          name: form.budget_name,
          target_spend: parseInt(form.target_spend, 10),
          duration: form.duration,
          rollover_policy: form.rollover_policy
        });
        this.props.on_create(new_budget);
      },
      className: "new_budget_form"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "budget_name",
      placeholder: "Budget Name",
      className: "budget_name_input"
    }), /*#__PURE__*/React.createElement("div", {
      className: "budget_frequency"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "duration",
      value: "weekly"
    }), " Weekly"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "duration",
      value: "monthly"
    }), " Monthly"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "duration",
      value: "yearly"
    }), " Yearly")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      name: "target_spend",
      placeholder: "Target Spend",
      className: "target_spend_input"
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit"
    }, "Create Budget"));
  }

}

class Budgeter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_txn_idx: 0,
      budgets: props.budgets
    };
  }

  render() {
    if (this.state.active_txn_idx >= this.props.transactions.length) {
      return /*#__PURE__*/React.createElement("div", {
        className: "budgeter"
      }, /*#__PURE__*/React.createElement("h1", null, "All done!"));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "budgeter"
    }, /*#__PURE__*/React.createElement(TxnBudgeter, {
      transaction: this.props.transactions[this.state.active_txn_idx],
      budgets: this.state.budgets,
      on_budgeted: (txn, budget) => {
        Ficus.set_txn_budget(txn, budget);
        this.setState(prevState => {
          // check if the budget is a new one
          const budgets = [...prevState.budgets];

          if (!prevState.budgets.some(b => b.id === budget.id)) {
            budgets.push(budget);
          }

          return {
            budgets: budgets,
            active_txn_idx: this.state.active_txn_idx + 1
          };
        });
        this.props.on_new_budget(budget);
      }
    }));
  }

}

class FicusApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
      budgets: null
    };
    this.get_transactions();
    this.get_budgets();
  }

  async get_transactions() {
    this.setState({
      transactions: await Ficus.get_unbudgeted_transactions()
    });
  }

  async get_budgets() {
    this.setState({
      budgets: await Ficus.get_budgets()
    });
  }

  async subscribe() {
    await fetch("/fuck/me"); // const t = await Ficus.fire_msg.getToken(Ficus.f_msg, {
    //   serviceWorkerRegistration: await get_sw(),
    //   vapidKey:
    //     "BM_z9ww1GXhxhUcd6htnKZVaSnjn7aGS6VaHOavVbVECr5nH9El9zHf5fnO1yrjCoLdmJhJy9yt2SpoGZA1osFQ",
    // });
    // console.log(`Got token ${t}`);
  }

  render() {
    if (this.state.transactions == null || this.state.budgets == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting");
    }

    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      onClick: () => this.subscribe()
    }, "Subscribe")), /*#__PURE__*/React.createElement(Budgeter, {
      transactions: this.state.transactions,
      budgets: this.state.budgets,
      on_new_budget: () => this.get_budgets()
    }));
  }

}

async function register_sw() {
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
}

let sw_registration = null;
let sw_prom = register_sw();

async function get_sw() {
  if (sw_registration == null) {
    sw_registration = await sw_prom;
  }

  console.log(`got ${sw_registration}`);
  return sw_registration;
}

get_sw();
const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render( /*#__PURE__*/React.createElement(AuthWrapper, {
  inner_content: () => /*#__PURE__*/React.createElement(FicusApp, null)
}));