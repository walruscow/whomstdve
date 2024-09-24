"use strict";

import Ficus, { sw } from "./ficus.js";

function fmt_cents(in_cents) {
  const paddedCents = Math.abs(in_cents).toString().padStart(3, "0");
  const dollars = paddedCents.slice(0, -2);
  const cents = paddedCents.slice(-2);
  return `$${dollars}.${cents}`;
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

const BudgetTotal = ({
  budgetName,
  total
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "budget-total"
  }, /*#__PURE__*/React.createElement("span", {
    className: "budget-name"
  }, budgetName), /*#__PURE__*/React.createElement("span", {
    className: "budget-amount"
  }, fmt_cents(total)));
};

export default class OverviewPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
      budget_map: null,
      budget_totals: null
    };
    this.get_transactions();
    this.get_budgets();
  }

  async get_transactions() {
    const transactions = await Ficus.get_transactions();
    this.setState({
      transactions
    }, this.calculate_budget_totals);
  }

  async get_budgets() {
    const budgets = await Ficus.get_budgets();
    const budget_map = {};

    for (const budget of budgets) {
      budget_map[budget.id] = budget;
    }

    this.setState({
      budget_map
    }, this.calculate_budget_totals);
  }

  calculate_budget_totals() {
    if (!this.state.transactions || !this.state.budget_map) {
      return;
    }

    const budget_totals = {};

    for (const transaction of this.state.transactions) {
      if (transaction.budget) {
        if (!budget_totals[transaction.budget]) {
          budget_totals[transaction.budget] = 0;
        }

        budget_totals[transaction.budget] += transaction.cents;
      }
    }

    this.setState({
      budget_totals
    });
  }

  render() {
    if (this.state.budget_totals == null || this.state.budget_map == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting");
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, Object.entries(this.state.budget_totals).map(([budgetId, total]) => /*#__PURE__*/React.createElement(BudgetTotal, {
      key: budgetId,
      budgetName: this.state.budget_map[budgetId].name,
      total: total
    })));
  }

}