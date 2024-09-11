"use strict";

import { render } from "./ficus.js";
import WAPI from "../wapi.js";

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
    }, "Current Session"), /*#__PURE__*/React.createElement("p", null, "Issued: ", ds(issued_ts)), /*#__PURE__*/React.createElement("p", null, "Expires: ", is_api_key ? "never" : ds(expires_ts)), /*#__PURE__*/React.createElement("button", {
      onClick: () => this.props.revoke(id)
    }, is_api_key ? "Revoke" : "Sign Out"));
  }

}

class FicusAccounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessions: null,
      new_api_key: null
    };
    this.get_sessions();
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

  render() {
    if (this.state.sessions == null) {
      return /*#__PURE__*/React.createElement("div", null, "Waiting, maybe a spinner?");
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      onClick: () => this.new_api_key()
    }, "New API Key"), this.state.new_api_key && /*#__PURE__*/React.createElement(CopyTextBox, {
      text: this.state.new_api_key
    }), /*#__PURE__*/React.createElement("h1", null, "Active Sessions"), /*#__PURE__*/React.createElement("ul", null, this.state.sessions.map(session => /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement(Session, {
      expires_ts: session.expires_ts,
      issued_ts: session.issued_ts,
      id: session.session_id,
      is_current_session: session.session_id == this.state.current_session,
      revoke: id => this.revoke(id)
    })))));
  }

}

render(() => /*#__PURE__*/React.createElement(FicusAccounts, null));