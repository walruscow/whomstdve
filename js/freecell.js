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
    console.log("clicking ", card, cardId);
    console.log("result", this.props.game.tryMoveCard(cardId));
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
function AppRoot() {
  return /*#__PURE__*/React.createElement("div", {
    id: "app"
  }, /*#__PURE__*/React.createElement(GameBoard, {
    game: new GameHandle()
  }));
}
class GameHandle {
  static _registry = new FinalizationRegistry(h => {
    fc.delete_game(h);
  });
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
}
init().then(() => {
  ReactDOM.render(/*#__PURE__*/React.createElement(AppRoot, null), document.getElementById("root"));
});