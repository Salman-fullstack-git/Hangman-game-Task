import React from "react";

const GameOver = ({ word, reset }) => {
  return (
    <div className="game-over">
      <h2>Game Over</h2>
      <p>The correct word was: <strong>{word}</strong></p>
      <button onClick={reset}>Try Again</button>
    </div>
  );
};

export default GameOver;
