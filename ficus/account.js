"use strict";

import WAPI from "../wapi.js";
import Ficus from "./ficus.js";

const CopyTextBox = ({
  text
}) => {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    console.log("Text copied to clipboard");
  };

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: text,
    readOnly: true
  }), /*#__PURE__*/React.createElement("button", {
    onClick: copyToClipboard
  }, "Copy"));
};

class Session extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      expires_ts,
      issued_ts,
      id,
      is_current_session
    } = this.props;
    const is_api_key = expires_ts === 0;

    const ds = ts => new Date(ts * 1000).toISOString().split("T")[0];

    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, "Session ID: ", id == null ? "null" : id.slice(-8)), is_current_session && /*#__PURE__*/React.createElement("p", {
      class: "green"
    }, "Current Session"), /*#__PURE__*/React.createElement("p", null, "Issued: ", ds(issued_ts)), !is_api_key && /*#__PURE__*/React.createElement("p", null, "Expires: ", ds(expires_ts)), /*#__PURE__*/React.createElement("button", {
      onClick: () => this.props.revoke(id)
    }, is_api_key ? "Revoke" : "Sign Out"));
  }

}

const ConnectedAccounts = ({
  connections
}) => {
  if (connections && connections.length > 0) {
    return /*#__PURE__*/React.createElement("ul", null, connections.map(c => /*#__PURE__*/React.createElement("li", null, c)));
  } // no accounts, offer to add one


  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", null, "No connected accounts found."), /*#__PURE__*/React.createElement("form", {
    className: "add-connection",
    onSubmit: e => {
      e.preventDefault();
      Ficus.add_connection(e.target.elements.accessUrl.value);
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "accessUrl",
    placeholder: "Access URL"
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit"
  }, "Connect Account")));
};

export default class AccountPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessions: null,
      current_session: null,
      new_api_key: null,
      connected_accounts: null
    };
    this.get_connected_accounts();
    this.get_sessions();
  }

  async get_connected_accounts() {
    this.setState({
      connected_accounts: await Ficus.list_connected_accounts()
    });
  }

  async get_sessions() {
    let response = await WAPI().get("account/session/list");
    let json = await response.json();
    this.setState({
      sessions: json.sessions,
      current_session: WAPI().auth_data.session_id
    });
  }

  async new_api_key() {
    let response = await WAPI().post("account/session/new_api_key");
    let json = await response.json();
    this.setState(prevState => ({
      new_api_key: json.token,
      sessions: [...prevState.sessions, json]
    }));
  }

  async revoke(id) {
    let response = await WAPI().post("account/session/revoke", {
      session: id
    });
    let json = await response.json();
    this.setState(prevState => ({
      sessions: prevState.sessions.filter(session => session.session_id !== id)
    }));
  }

  async test_notif() {
    console.debug("Testing notification!");
    Ficus.test_notif();
  }

  render() {
    if (this.state.sessions == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting, maybe a spinner?");
    }

    const api_keys = this.state.sessions.filter(session => session.expires_ts === 0);
    const app_sessions = this.state.sessions.filter(session => session.expires_ts !== 0);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h1", null, "Connected Accounts"), /*#__PURE__*/React.createElement(ConnectedAccounts, {
      connections: this.state.connected_accounts
    })), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h1", null, "API Keys"), /*#__PURE__*/React.createElement("button", {
      onClick: () => this.new_api_key()
    }, "New API Key"), this.state.new_api_key && /*#__PURE__*/React.createElement(CopyTextBox, {
      text: this.state.new_api_key
    }), /*#__PURE__*/React.createElement("ul", null, api_keys.map(session => /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Session, {
      expires_ts: session.expires_ts,
      issued_ts: session.issued_ts,
      id: session.session_id,
      is_current_session: false,
      revoke: id => this.revoke(id)
    }))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h1", null, "Active Sessions"), /*#__PURE__*/React.createElement("ul", null, app_sessions.map(session => /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Session, {
      expires_ts: session.expires_ts,
      issued_ts: session.issued_ts,
      id: session.session_id,
      is_current_session: session.session_id == this.state.current_session,
      revoke: id => this.revoke(id)
    }))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h1", null, "Utilities"), /*#__PURE__*/React.createElement("button", {
      onClick: () => this.test_notif()
    }, "Test Notif")));
  }

}