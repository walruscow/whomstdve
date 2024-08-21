"use strict";

import { AuthWrapper } from "../auth.js";
import * as ficus from "./ficus.js";

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
        let new_budget = await ficus.new_budget({
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
        ficus.set_txn_budget(txn, budget);
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
      transactions: await ficus.get_unbudgeted_transactions()
    });
  }

  async get_budgets() {
    this.setState({
      budgets: await ficus.get_budgets()
    });
  }

  render() {
    if (this.state.transactions == null || this.state.budgets == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting");
    }

    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Budgeter, {
      transactions: this.state.transactions,
      budgets: this.state.budgets,
      on_new_budget: () => this.get_budgets()
    }));
  }

}

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render( /*#__PURE__*/React.createElement(AuthWrapper, {
  inner_content: () => /*#__PURE__*/React.createElement(FicusApp, null)
}));