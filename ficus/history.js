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

const Transaction = ({
  transaction,
  budget
}) => {
  const [weekday, date_time] = fmt_ts(transaction.ts);
  return /*#__PURE__*/React.createElement("div", {
    className: "transaction"
  }, /*#__PURE__*/React.createElement("p", {
    className: "transaction-date"
  }, /*#__PURE__*/React.createElement("span", {
    className: "transaction-weekday"
  }, weekday), " ", date_time), /*#__PURE__*/React.createElement("p", {
    className: "transaction-description"
  }, transaction.description), /*#__PURE__*/React.createElement("p", {
    className: "transaction-amount"
  }, fmt_cents(transaction.cents)), budget && /*#__PURE__*/React.createElement("p", {
    className: "transaction-budget"
  }, budget.name));
};

export default class HistoryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null,
      budget_map: null
    };
    this.get_transactions();
    this.get_budgets();
  }

  async get_transactions() {
    this.setState({
      transactions: await Ficus.get_transactions()
    });
  }

  async get_budgets() {
    const budgets = await Ficus.get_budgets();
    const budget_map = {};

    for (const budget of budgets) {
      budget_map[budget.id] = budget;
    }

    this.setState({
      budget_map
    });
  }

  render() {
    if (this.state.transactions == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting");
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, this.state.transactions.map((transaction, index) => /*#__PURE__*/React.createElement(Transaction, {
      transaction: transaction,
      budget: this.state.budget_map ? this.state.budget_map[transaction.budget] : null
    })));
  }

}