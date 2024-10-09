"use strict";

import Ficus, { sw } from "./ficus.js";
import { AuthWrapper } from "../auth.js";
import ReviewPage from "./review.js";
import AccountPage from "./account.js";
import HistoryPage from "./history.js";
import OverviewPage from "./overview.js";
function render(make_app) {
  const domContainer = document.querySelector("#ficus");
  const root = ReactDOM.createRoot(domContainer);
  root.render(/*#__PURE__*/React.createElement(AuthWrapper, {
    inner_content: make_app
  }));
}
class FicusApp extends React.Component {
  static DEFAULT_PAGE = "review";
  static PAGES = {
    account: () => /*#__PURE__*/React.createElement(AccountPage, null),
    review: () => /*#__PURE__*/React.createElement(ReviewPage, null),
    history: () => /*#__PURE__*/React.createElement(HistoryPage, null),
    overview: () => /*#__PURE__*/React.createElement(OverviewPage, null)
  };
  constructor(props) {
    super(props);
    this.state = {
      current_page: FicusApp.DEFAULT_PAGE,
      notifications_state: this.initNotifState()
    };
    this.handleHashChangeListener = () => this.handleHashChange();
  }
  initNotifState = () => {
    let permission_state = Notification.permission;
    console.debug(`Notification permission: ${permission_state}`);
    switch (permission_state) {
      case "granted":
        // great, check if subscription is active
        return "unconfirmed";
      case "denied":
        return "denied";
      case "default":
        return "not_granted";
    }
  };
  checkNotifications = async () => {
    const s = await sw();
    let sub = await s.pushManager.getSubscription();
    if (sub == null) {
      this.setState({
        notifications_state: "not_subscribed"
      });
    } else {
      this.setState({
        notifications_state: "unconfirmed"
      });
      this.confirmNotificationSubscription(sub);
    }
  };
  confirmNotificationSubscription = async sub => {
    try {
      // lol this is the easiest way to get what we need
      sub = JSON.parse(JSON.stringify(sub));
      let success = await Ficus.subscribe({
        endpoint: sub.endpoint,
        auth: sub.keys.auth,
        p256dh: sub.keys.p256dh,
        expiration_time: sub.expirationTime
      });
      this.setState({
        notifications_state: success ? "confirmed" : "not_subscribed"
      });
      console.debug(`Subscribe success? ${success}`);
    } catch (error) {
      console.error("Error confirming notification subscription:", error);
      this.setState({
        notifications_state: "not_subscribed"
      });
    }
  };
  enableNotifications = async () => {
    this.setState({
      notifications_state: "pending"
    });
    // kick off network request asap
    const sub_info_req = Ficus.get_subscription_meta();
    let permission = await Notification.requestPermission();
    if (permission !== "granted") {
      this.setState({
        notifications_state: "denied"
      });
      return;
    }
    const s = await sw();
    let sub = await s.pushManager.getSubscription();
    if (sub == null) {
      // no subscription yet
      console.debug("Seeking a new subscription");
      const sub_info = await sub_info_req;
      try {
        sub = await s.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: sub_info.vapid_key
        });
      } catch (error) {
        console.error(`Error subscribing: ${error}`);
        this.setState({
          notifications_state: "denied"
        });
        return;
      }
    }
    await this.confirmNotificationSubscription(sub);
  };
  changePage = page => {
    this.setState({
      current_page: page
    });
    window.location.hash = `/${page}`;
  };
  componentDidMount = () => {
    window.addEventListener("hashchange", this.handleHashChange);
    this.handleHashChange(); // Set initial page based on URL
    this.checkNotifications();
  };
  componentWillUnmount = () => {
    window.removeEventListener("hashchange", this.handleHashChange);
  };
  handleHashChange = () => {
    const hashes = window.location.hash.slice(2).split("/");
    const page = hashes[0]; // Get first component after '#/'
    const sub_nav = hashes.slice(1).join("/"); // Get the rest of the hash
    if (FicusApp.PAGES[page]) {
      this.setState({
        current_page: page,
        sub_nav: sub_nav
      });
    } else {
      // If invalid hash, set to default page
      this.setState({
        current_page: FicusApp.DEFAULT_PAGE,
        sub_nav: ""
      });
      window.location.hash = `/${FicusApp.DEFAULT_PAGE}`;
    }
  };
  render = () => {
    const CurrentPage = FicusApp.PAGES[this.state.current_page];
    let subscribe_floater = null;
    switch (this.state.notifications_state) {
      case "denied":
        subscribe_floater = /*#__PURE__*/React.createElement("div", {
          className: "flooter"
        }, /*#__PURE__*/React.createElement("span", null, "Please enable notifications for the best experience!"));
        break;
      case "not_granted":
      case "not_subscribed":
        subscribe_floater = /*#__PURE__*/React.createElement("div", {
          className: "flooter"
        }, /*#__PURE__*/React.createElement("button", {
          onClick: () => this.enableNotifications()
        }, "Enable Notifications"));
        break;
      case "pending":
        // TODO: in pending we want to show a spinner or sth on this button
        // maybe a checkmark after or sth and then done????
        break;
      case "unconfirmed":
      case "confirmed":
        // no need to show anything, subscription is likely active
        break;
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("nav", null, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", {
      onClick: () => this.changePage("account"),
      className: this.state.current_page === "account" ? "selected" : ""
    }, "Account"), /*#__PURE__*/React.createElement("li", {
      onClick: () => this.changePage("review"),
      className: this.state.current_page === "review" ? "selected" : ""
    }, "Review"), /*#__PURE__*/React.createElement("li", {
      onClick: () => this.changePage("history"),
      className: this.state.current_page === "history" ? "selected" : ""
    }, "History"), /*#__PURE__*/React.createElement("li", {
      onClick: () => this.changePage("overview"),
      className: this.state.current_page === "overview" ? "selected" : ""
    }, "Overview"))), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(CurrentPage, {
      nav: this.state.sub_nav
    })), subscribe_floater);
  };
}
(async () => {
  try {
    const s = await sw();
    const response = await (await fetch("/_swtest")).json();
    console.log(`Service worker v${response.version} active`);
  } catch (error) {
    console.log("Service worker isn't working:", error);
  }
})();
render(() => /*#__PURE__*/React.createElement(FicusApp, null));