"use strict";

import { AuthWrapper } from "./auth.js";
import * as ficus from "./ficus/ficus.js";

function TransactionBox(props) {
  const [transaction, setTransaction] = React.useState(props.transaction);
  let category_content;

  if (transaction.user_category) {
    category_content = /*#__PURE__*/React.createElement("div", {
      class: "category_selected"
    }, transaction.user_category);
  } else {
    category_content = /*#__PURE__*/React.createElement("div", {
      class: "category_chooser"
    }, props.category_list.map(category => /*#__PURE__*/React.createElement("button", {
      class: "category_choice",
      onClick: () => {
        ficus.set_txn_category(transaction, category).then(() => {
          setTransaction({ ...transaction,
            user_category: category
          });
        });
      }
    }, category)));
  }

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    class: "orange"
  }, "Cents: ", transaction.cents), /*#__PURE__*/React.createElement("h1", {
    class: "purple"
  }, "Description: ", transaction.description), /*#__PURE__*/React.createElement("div", {
    class: "category_box"
  }, category_content));
}

class FicusApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: null
    };
    this.get_transactions();
  }

  async get_transactions() {
    const txns = await ficus.get_transactions();
    this.setState({
      transactions: txns
    });
  }

  render() {
    let txns = null;

    if (this.state.transactions != null) {
      txns = this.state.transactions.map(t => /*#__PURE__*/React.createElement(TransactionBox, {
        transaction: t,
        category_list: ["catA", "catB", "catC"]
      }));
    }

    return /*#__PURE__*/React.createElement("div", null, txns);
  }

}

const domContainer = document.querySelector("#root");
const root = ReactDOM.createRoot(domContainer);
root.render( /*#__PURE__*/React.createElement(AuthWrapper, {
  inner_content: () => /*#__PURE__*/React.createElement(FicusApp, null)
}));