"use strict";

import init, * as fc from "/wasm/freecell.js";
const SUITS = ["♠", "♥", "♣", "♦"];
const CARD_VALS = ["X", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const Card = ({
  val,
  suit,
  onClick
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      color: suit === 1 || suit === 3 ? "red" : "black"
    },
    onClick: () => onClick({
      val,
      suit
    })
  }, CARD_VALS[val], SUITS[suit]);
};
const CardPile = ({
  cards,
  onCardClick
}) => {
  if (cards == null) {
    cards = [];
  }
  if (!Array.isArray(cards)) {
    cards = [cards];
  }
  if (cards.length == 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "card-pile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "empty-card"
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "card-pile"
  }, (Array.isArray(cards) ? cards : [cards]).map((card, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    val: card.val,
    suit: card.suit,
    onClick: onCardClick
  })));
};
class GameBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game: props.game,
      boardState: props.game.gameState()
    };
  }
  handleCardClick = card => {
    const cardId = card.val + card.suit * 13 - 1;
    this.props.game.tryMoveCard(cardId);
    while (this.props.game.tryAutoMove(fc.AutoMove.All)) {}
    this.setState({
      boardState: this.props.game.gameState()
    });
  };
  render = () => {
    return /*#__PURE__*/React.createElement("div", {
      className: "game-board"
    }, /*#__PURE__*/React.createElement("div", {
      className: "top-row"
    }, this.state.boardState.free_cells.map((card, i) => /*#__PURE__*/React.createElement(CardPile, {
      cards: card,
      onCardClick: this.handleCardClick
    })), this.state.boardState.home_piles.map((card, i) => /*#__PURE__*/React.createElement(CardPile, {
      cards: card,
      onCardClick: this.handleCardClick
    }))), /*#__PURE__*/React.createElement("div", {
      className: "cascades"
    }, this.state.boardState.cascades.map((cascade, i) => /*#__PURE__*/React.createElement(CardPile, {
      cards: cascade,
      onCardClick: this.handleCardClick
    }))));
  };
}
class GameOptions extends React.Component {
  constructor(props, options = {}) {
    super(props);
    this.state = {
      autoMove: options.autoMove || "Safe"
    };
  }
  optionsChange = () => {
    this.props.onOptionsChange(newOptions);
  };
  getOptions = () => {
    return {
      autoMove: this.state.autoMove
    };
  };
  render = () => {
    return /*#__PURE__*/React.createElement("div", {
      className: "options"
    }, /*#__PURE__*/React.createElement("div", null, "Auto Move:", /*#__PURE__*/React.createElement("select", {
      value: this.state.autoMove,
      onChange: e => this.setState({
        autoMove: e.target.value
      })
    }, /*#__PURE__*/React.createElement("option", {
      value: "Safe"
    }, "Safe"), /*#__PURE__*/React.createElement("option", {
      value: "All"
    }, "All"), /*#__PURE__*/React.createElement("option", {
      value: "None"
    }, "None"))));
  };
}
function AppRoot() {
  const [optionsVisible, setOptionsVisible] = React.useState(false);
  const boardRef = React.useRef();
  const toggleOptions = () => {
    setOptionsVisible(!optionsVisible);
  };
  const somehowUndo = () => {
    console.log("HELLO");
    GameHandle.get().undo();
    if (boardRef.current) {
      boardRef.current.setState({
        boardState: GameHandle.get().gameState()
      });
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    id: "root"
  }, optionsVisible && /*#__PURE__*/React.createElement(GameOptions, null), /*#__PURE__*/React.createElement("div", {
    id: "menu"
  }, /*#__PURE__*/React.createElement("div", {
    class: "left"
  }, /*#__PURE__*/React.createElement("span", {
    title: "Toggle options",
    class: "menu-icon",
    onClick: toggleOptions
  }, "\u2630")), /*#__PURE__*/React.createElement("div", {
    class: "center"
  }, /*#__PURE__*/React.createElement("header", {
    class: "menu-header"
  }, "Freecell")), /*#__PURE__*/React.createElement("div", {
    class: "right"
  }, /*#__PURE__*/React.createElement("span", {
    title: "Undo",
    class: "menu-icon",
    onClick: somehowUndo
  }, "\u238C"))), /*#__PURE__*/React.createElement(GameBoard, {
    ref: boardRef,
    game: GameHandle.get()
  })));
}
class GameHandle {
  static _registry = new FinalizationRegistry(h => {
    fc.delete_game(h);
  });
  static _globalGame = null;
  static get() {
    if (GameHandle._globalGame == null) {
      GameHandle._globalGame = new GameHandle();
    }
    return GameHandle._globalGame;
  }
  static get_new() {
    GameHandle._globalGame = new GameHandle();
    return GameHandle._globalGame;
  }
  constructor() {
    this._handle = fc.new_game();
    GameHandle._registry.register(this, this._handle);
  }
  handle = () => {
    return this._handle;
  };
  gameState = () => {
    return fc.get_game_state(this._handle);
  };
  tryMoveCard = cardId => {
    return fc.try_move_card(this._handle, cardId);
  };
  tryAutoMove = autoMove => {
    return fc.try_auto_move(this._handle, fc.AutoMove.All);
  };
  undo = () => {
    if (!this._handle) {
      debugger;
      console.log("FUCKKKK");
    }
    return fc.undo(this._handle);
  };
}
init().then(() => {
  ReactDOM.render(/*#__PURE__*/React.createElement(AppRoot, null), document.getElementById("root-wrapper"));
});