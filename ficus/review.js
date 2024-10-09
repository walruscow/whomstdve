"use strict";

import Ficus, { sw } from "./ficus.js";
const fmt_cents = in_cents => {
  const paddedCents = Math.abs(in_cents).toString().padStart(3, "0");
  const dollars = paddedCents.slice(0, -2);
  const cents = paddedCents.slice(-2);
  return `$${dollars}.${cents}`;
};
class TxnBudgeter extends React.Component {
  constructor(props) {
    super(props);
  }
  assignBudget = e => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target));
    const selectedBudget = this.props.budgets.find(budget => budget.id === e.nativeEvent.submitter.value);
    this.props.onBudgeted(this.props.transaction, selectedBudget, form.always === "on");

    // Uncheck the checkbox after submitting
    e.target.querySelector('input[name="always"]').checked = false;
  };
  render = () => {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      className: "orange"
    }, fmt_cents(this.props.transaction.cents)), /*#__PURE__*/React.createElement("h1", {
      className: "purple"
    }, this.props.transaction.description), /*#__PURE__*/React.createElement("form", {
      onSubmit: e => this.assignBudget(e)
    }, /*#__PURE__*/React.createElement("div", {
      className: "always-budget-option"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      name: "always",
      defaultChecked: false
    }), "Always budget this way")), /*#__PURE__*/React.createElement("ul", {
      className: "budget-chooser"
    }, this.props.budgets.map(budget => /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
      type: "submit",
      value: budget.id,
      className: "budget-choice"
    }, budget.name))))), /*#__PURE__*/React.createElement(NewBudget, {
      onCreate: budget => this.props.onBudgeted(this.props.transaction, budget, /* always = */false),
      txn: this.props.transaction
    }));
  };
}
class NewBudget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false
    };
  }
  componentDidUpdate = prevProps => {
    if (prevProps.txn.id != this.props.txn.id) {
      this.setState({
        expanded: false
      });
    }
  };
  render = () => {
    if (!this.state.expanded) {
      return /*#__PURE__*/React.createElement("button", {
        className: "budget-choice",
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
        this.props.onCreate(new_budget);
      },
      className: "new-budget-form"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "budget_name",
      placeholder: "Budget Name",
      className: "budget-name-input"
    }), /*#__PURE__*/React.createElement("div", {
      className: "budget-frequency"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "duration",
      value: "monthly"
    }), " Monthly"), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "duration",
      value: "yearly"
    }), " Yearly")), /*#__PURE__*/React.createElement("input", {
      type: "text",
      inputmode: "numeric",
      name: "target_spend",
      placeholder: "Target Spend",
      className: "target-spend-input"
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit"
    }, "Create Budget"));
  };
}
class Budgeter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_txn_idx: 0,
      budgets: props.budgets
    };
  }
  render = () => {
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
      onBudgeted: async (txn, budget, always) => {
        const budgetPromise = Ficus.set_txn_budget(txn, budget, always);
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
        await budgetPromise;
        this.props.onNewBudget(budget);
      }
    }));
  };
}
export default class ReviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txn_map: new Map(),
      budgets: null,
      current_txn_id: null
    };
  }
  getTransactions = async () => {
    const txns = await Ficus.get_unbudgeted_transactions();
    this.setState(prev_state => {
      const txn_map = new Map(prev_state.txn_map.entries());
      for (const t of txns) {
        txn_map.set(t.id, t);
      }
      const new_state = {
        txn_map
      };
      if (!txn_map.has(prev_state.current_txn_id)) {
        new_state.current_txn_id = null;
      }
      if (!prev_state.current_txn_id && txn_map.size > 0) {
        new_state.current_txn_id = txns[0].id;
      }
      return newState;
    });
  };
  getBudgets = async () => {
    this.setState({
      budgets: await Ficus.get_budgets()
    });
  };
  componentDidMount = () => {
    this.getTransactions();
    this.getBudgets();
    window.addEventListener("hashchange", this.handleHashChange);
    this.handleHashChange(); // Set initial page based on URL
    this.checkNotifications();
  };
  handleHashChange = () => {
    // /review/{txn}
    const txn_id = window.location.hash.slice(2).split("/")[1];
    if (!txn_id || txn_id === "") {
      this.setState({
        current_txn_id: null
      });
    } else {
      this.setState({
        current_txn_id: txn_id
      });
    }
  };
  componentWillUnmount = () => {
    window.removeEventListener("hashchange", this.handleHashChange);
  };
  render = () => {
    if (this.state.transactions == null || this.state.budgets == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting");
    }
    if (this.state.current_txn_id >= this.props.transactions.length) {
      return /*#__PURE__*/React.createElement("div", {
        className: "budgeter"
      }, /*#__PURE__*/React.createElement("h1", null, "All done!"));
    }
    return /*#__PURE__*/React.createElement(Budgeter, {
      transactions: this.state.transactions,
      budgets: this.state.budgets,
      onNewBudget: () => this.getBudgets()
    });
  };
  render = () => {
    return /*#__PURE__*/React.createElement("div", {
      className: "budgeter"
    }, /*#__PURE__*/React.createElement(TxnBudgeter, {
      transaction: this.props.transactions[this.state.active_txn_idx],
      budgets: this.state.budgets,
      onBudgeted: async (txn, budget, always) => {
        const budgetPromise = Ficus.set_txn_budget(txn, budget, always);
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
        await budgetPromise;
        this.props.onNewBudget(budget);
      }
    }));
  };
}