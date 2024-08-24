"use strict";

export default function WAPI() {
  return WAPIClass.get();
}
export function base_url() {
  if (/^https:\/\/(192\.168\.|localhost)/.test(window.location.origin)) {
    // https
    return window.location.origin.replace(/:\d+$/, ":60000");
  } else if (/^http:\/\/(192\.168\.|localhost)/.test(window.location.origin)) {
    // http
    return window.location.origin.replace(/:\d+$/, ":60010");
  } else {
    return "https://api.wmcd.dev";
  }
}
export function init(auth_data) {
  return WAPIClass.init(auth_data);
}

class WAPIClass {
  // singleton API class. that's so that we can use setInterval "safely"
  constructor(auth_data) {
    this.auth_data = auth_data;
    this.base_url = base_url();
  }

  static init(auth_data) {
    WAPIClass._instance = new WAPIClass(auth_data); // Refresh auth every 10 minutes

    setInterval(() => {
      WAPIClass.get().refresh_auth().catch(error => console.error("Auto refresh failed:", error));
    }, 10 * 60 * 1000);
    return WAPIClass.get();
  }

  static get() {
    if (WAPIClass._instance == null) {
      throw new Error("API is not initialized");
    }

    return WAPIClass._instance;
  }

  async refresh_auth() {
    try {
      const response = await this.post("account/refresh_session");
      const auth = await response.json();
      this.auth_data = auth;
      return auth;
    } catch (error) {
      console.error("session refresh failed:", error);
      throw error;
    }
  }

  async get(path, query = {}, {
    options = null
  } = {}) {
    if (options == null) {
      options = {};
    }

    options.method = "GET";
    const query_path = `${path}?${new URLSearchParams(query).toString()}`;
    return await this._fetch(query_path, options);
  }

  async post(path, body = null, {
    options = {}
  } = {}) {
    options.method = "POST";

    if (options.headers == null) {
      options.headers = {};
    }

    if (options.headers["Content-Type"] == null) {
      options.headers["Content-Type"] = "application/json";
    }

    if (body !== null) {
      options.body = JSON.stringify(body);
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

    let endpoint = `${this.base_url}/${path}`; // set some common options

    options.headers["Authorization"] = this.auth_data.token;
    return await fetch(endpoint, options);
  }

}