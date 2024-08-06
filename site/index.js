'use strict';

class FicusApi {
  constructor(auth_token) {
    this.auth_token = auth_token;

    if (this.auth_token == null) {
      throw new Error('No auth token');
    }
  }

  async confirm_auth() {
    try {
      const response = await this.post('hello');
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async get_transactions() {
    const end_ts = Math.ceil(Date.now() / 1000);
    const start_ts = end_ts - 86400 * 7;
    let response = await this.get('transactions', {
      start_ts: start_ts,
      end_ts: end_ts
    });
    return await response.json();
  }

  async get(path, query, options) {
    if (options == null) {
      options = {};
    }

    options.method = 'GET';
    const query_path = `${path}?${new URLSearchParams(query).toString()}`;
    return await this._fetch(query_path, options);
  }

  async post(path, options) {
    if (options == null) {
      options = {};
    }

    options.method = 'POST';

    if (options.headers == null) {
      options.headers = {};
    }

    if (options.headers['Content-Type'] == null) {
      options.headers['Content-Type'] = 'application/json';
    }

    return await this._fetch(path, options);
  }

  async _fetch(path, options) {
    if (options == null) {
      options = {};
    }

    if (options.headers == null) {
      options.headers = {};
    }

    let endpoint = `https://api.wmcd.dev/ficus/${path}`; // set some common options

    options.headers['Authorization'] = this.auth_token;
    return await fetch(endpoint, options);
  }

}

function TransactionBox(props) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    class: "orange"
  }, "Cents: ", props.transaction.cents), /*#__PURE__*/React.createElement("h1", {
    class: "purple"
  }, "Description: ", props.transaction.description));
}

class FicusApp extends React.Component {
  constructor(props) {
    super(props);

    if (this.props.api == null) {
      throw new Error('No ficus app!');
    }

    this.state = {
      transactions: null
    };
    this.get_transactions();
  }

  async get_transactions() {
    const txns = await this.props.api.get_transactions();
    this.setState({
      transactions: txns
    });
  }

  render() {
    let txns = null;

    if (this.state.transactions != null) {
      txns = this.state.transactions.map(t => /*#__PURE__*/React.createElement(TransactionBox, {
        transaction: t
      }));
    }

    return /*#__PURE__*/React.createElement("div", null, txns);
  }

}

function get_auth_token_from_storage() {
  return window.localStorage.getItem('token');
}

class AppRoot extends React.Component {
  constructor(props) {
    super(props);
    const auth_token = get_auth_token_from_storage();

    if (!auth_token) {
      this.state = {
        api: null,
        auth_state: 'none'
      };
    } else {
      this.state = {
        api: null,
        auth_state: 'pending'
      };
      let api = new FicusApi(auth_token);
      api.confirm_auth().then(ok => this.setState({
        api: ok ? api : null,
        auth_state: ok ? 'confirmed' : 'none'
      }));
    }
  }

  render() {
    let contents = null;

    if (this.state.auth_state === 'confirmed') {
      // auth succeeded
      contents = /*#__PURE__*/React.createElement(FicusApp, {
        api: this.state.api
      });
    } else if (this.state.auth_state === 'pending') {
      // the state is "getting_token"
      contents = 'Waiting for authentication response';
    } else if (this.state.auth_state == 'none') {
      // the state is "needs auth"
      contents = /*#__PURE__*/React.createElement("div", {
        id: "auth_container"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        id: "username",
        name: "username"
      }), /*#__PURE__*/React.createElement("input", {
        type: "password",
        id: "password",
        name: "password"
      }), /*#__PURE__*/React.createElement("button", {
        id: "auth_button",
        onClick: () => this.do_auth()
      }, "Authenticate"));
    }

    return /*#__PURE__*/React.createElement("div", {
      id: "app"
    }, /*#__PURE__*/React.createElement("h1", null, "Ficus"), contents);
  }

  async do_auth() {
    this.setState({
      auth_state: 'pending'
    });
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const req = {
      username: username,
      password: password
    };
    const response = await fetch('https://api.wmcd.dev/ficus/very_secret_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    });
    let res = await response.json();

    if (res.token) {
      window.localStorage.setItem('token', res.token);
      this.setState({
        auth_state: 'confirmed',
        api: new FicusApi(res.token)
      });
    } else {
      this.setState({
        auth_state: 'none',
        api: null
      });
    }
  }

}

const domContainer = document.querySelector('#root');
const root = ReactDOM.createRoot(domContainer);
root.render( /*#__PURE__*/React.createElement(AppRoot, null));