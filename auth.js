"use strict";

import * as wapi from "./wapi.js";
import WAPI from "./wapi.js";

function get_auth_data() {
  try {
    const auth_data = JSON.parse(window.localStorage.getItem("auth_data"));
    const now_ts = Date.now() / 1000;

    if (now_ts > auth_data.expires_ts || auth_data.token == null || auth_data.issued_ts == null) {
      return null;
    }

    return auth_data;
  } catch (error) {
    return null;
  }
}

function set_auth_data(auth_data) {
  window.localStorage.setItem("auth_data", JSON.stringify(auth_data));
}

export class AuthWrapper extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.inner_content == null) {
      throw new Error("No content provided!");
    }

    const auth_data = get_auth_data();
    this.state = {
      auth_state: auth_data ? "pending" : "unauthenticated"
    };

    if (auth_data) {
      // check / refresh the auth async
      this._refresh_auth(auth_data);
    }
  }

  async _refresh_auth(auth_data) {
    const api = wapi.init(auth_data);

    try {
      const auth = await api.refresh_auth();
      set_auth_data(auth);
      this.setState({
        auth_state: "authenticated"
      });
    } catch (error) {
      // error is ok, assume unauthenticated.
      // spurious errors are not handled. but, old token is not cleared
      // on error. can add retry logic or refresh page to retry
      this.setState({
        auth_state: "unauthenticated"
      });
    }
  }

  render() {
    let contents = null;

    switch (this.state.auth_state) {
      case "authenticated":
        return this.props.inner_content();

      case "pending":
        // this should actually probably "disable" the input form while rendering a spinner indicating waiting
        return "This should be a spinner";

      case "unauthenticated":
        return /*#__PURE__*/React.createElement("div", {
          id: "auth-container"
        }, /*#__PURE__*/React.createElement("form", {
          onSubmit: e => {
            e.preventDefault();

            this._do_auth();
          }
        }, /*#__PURE__*/React.createElement("input", {
          type: "password",
          id: "password",
          name: "password"
        }), /*#__PURE__*/React.createElement("input", {
          type: "submit",
          value: "Log In"
        })));
    }
  }

  async _do_auth() {
    this.setState({
      auth_state: "pending"
    });
    const req = {
      password: document.getElementById("password").value
    };
    let auth;

    try {
      const response = await fetch(`${wapi.base_url()}/account/log_in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req)
      });
      auth = await response.json();
    } catch (err) {
      console.error("Error parsing authentication response:", err);
      this.setState({
        auth_state: "unauthenticated"
      });
      return;
    }

    if (auth.token) {
      window.localStorage.setItem("auth_data", JSON.stringify(auth));
      this.setState({
        auth_state: "authenticated",
        api: wapi.init(auth)
      });
    } else {
      this.setState({
        auth_state: "unauthenticated",
        api: null
      });
    }
  }

}