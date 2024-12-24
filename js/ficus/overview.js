"use strict";

import Ficus, { sw } from "./ficus.js";
function fmt_cents(in_cents) {
  const paddedCents = Math.abs(in_cents).toString().padStart(3, "0");
  const dollars = paddedCents.slice(0, -2);
  return `$${dollars}`;
}
function fmt_ts(ts) {
  const d = new Date(ts * 1000);
  const weekday = d.toLocaleString({}, {
    weekday: "long"
  });
  const date_time = d.toLocaleString({}, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  });
  return [weekday, date_time];
}
function date_month(d) {
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}
const BudgetBars = ({
  spend,
  target,
  rollover
}) => {
  spend = Math.max(0, -spend);
  target *= 100;
  rollover *= 100;
  if (spend == 0 && target == 0 && rollover == 0) {
    // okay I guess we gotta do sth about this one
    target = 1;
  }
  const total_everything = spend + target + rollover;
  const grow_spent = spend / total_everything * 100;
  const grow_target = Math.max(0, target - spend) / total_everything * 100;
  const grow_rollover = Math.max(0, rollover + Math.min(0, target - spend)) / total_everything * 100;
  return /*#__PURE__*/React.createElement("div", {
    className: "budget-bars"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spent",
    style: {
      flexGrow: grow_spent
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "target",
    style: {
      flexGrow: grow_target
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "rollover",
    style: {
      flexGrow: grow_rollover
    }
  }));
};
const BudgetTotal = ({
  budget,
  total
}) => {
  const budgetName = budget ? budget.name : "Unbudgeted";
  const target = budget ? budget.target_spend : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: "budget-total"
  }, /*#__PURE__*/React.createElement("span", {
    className: "budget-name"
  }, budgetName, " "), /*#__PURE__*/React.createElement("span", {
    className: "budget-spent"
  }, fmt_cents(total)), /*#__PURE__*/React.createElement("span", {
    className: "budget-target"
  }, " / $", target), /*#__PURE__*/React.createElement(BudgetBars, {
    spend: total,
    target: budget ? budget.target_spend : 0,
    rollover: 0
  }));
};
export default class OverviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
      budget_map: null,
      month_totals: null
    };
    this.get_transactions();
    this.get_budgets();
  }
  get_transactions = async () => {
    const startDate = date_month(new Date());
    startDate.setMonth(startDate.getMonth() - 6);
    const transactions = await Ficus.get_transactions({
      start_ts: Math.floor(startDate.getTime() / 1000)
    });
    this.setState({
      transactions
    }, this.calculate_month_totals);
  };
  get_budgets = async () => {
    const budgets = await Ficus.get_budgets();
    const budget_map = {};
    for (const budget of budgets) {
      budget_map[budget.id] = budget;
    }
    this.setState({
      budget_map
    }, this.calculate_month_totals);
  };
  calculate_month_totals = () => {
    if (!this.state.transactions || !this.state.budget_map) {
      return;
    }
    const month_totals = new Map();
    for (const transaction of this.state.transactions) {
      const txn_month = Math.floor(date_month(new Date(transaction.ts * 1000)).getTime() / 1000);
      if (!month_totals.has(txn_month)) {
        month_totals.set(txn_month, new Map());
      }
      const budget_key = transaction.budget || "Unbudgeted";
      const month_entry = month_totals.get(txn_month);
      if (!month_entry.has(budget_key)) {
        month_entry.set(budget_key, 0);
      }
      if (transaction.cents > 0) {
        console.log("txn has +", transaction);
      }
      month_entry.set(budget_key, month_entry.get(budget_key) + transaction.cents);
    }
    this.setState({
      month_totals
    });
  };
  render = () => {
    if (this.state.month_totals == null || this.state.budget_map == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting");
    }
    console.log("rendering with months", this.state.month_totals);
    const month_entries = Array.from(this.state.month_totals.entries().map(([month, budgets]) => {
      return [new Date(month * 1000), budgets];
    }));
    return /*#__PURE__*/React.createElement(React.Fragment, null, month_entries.map(([month, budgets]) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, month.toLocaleString("default", {
      month: "long",
      year: "numeric"
    })), [...budgets.entries()].map(([budgetId, total]) => /*#__PURE__*/React.createElement(BudgetTotal, {
      budget: this.state.budget_map[budgetId],
      total: total
    })))));
  };
}