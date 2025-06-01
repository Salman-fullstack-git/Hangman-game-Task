import React, { useState, useEffect, useCallback } from "react";
import DisplayBoard from "./Components/DisplayBoard";
import Header from "./Components/Header";
import Input from "./Components/Input";
import Man from "./Components/Man";
import GameOver from "./Components/GameOver";
import Winner from "./Components/Winner";
import "./Hangman.css";

const emptySpace = "___";
const MAX_WRONG = 6;

const Hangman = () => {
  const [word, setWord] = useState("");
  const [guessedWord, setGuessedWord] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [sessionId, setSessionId] = useState(null);


  const fetchRandomWord = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("http://localhost:5000/api/word")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setSessionId(data.sessionId);
        setWord(data.word);
        setGuessedWord(new Set());
        setWrongGuesses(0);
        setIsGameOver(false);
        setIsWinner(false);
        setWrongLetters([]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching word:", err);
        setError("Failed to fetch word from server.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem("hangmanState");
    if (savedState) {
      try {
        const {
          sessionId,
          word,
          guessedWord,
          wrongGuesses,
          isGameOver,
          isWinner,
          wrongLetters,
        } = JSON.parse(savedState);
        setSessionId(sessionId);
        setWord(word);
        setGuessedWord(new Set(guessedWord));
        setWrongGuesses(wrongGuesses);
        setIsGameOver(isGameOver);
        setIsWinner(isWinner);
        setWrongLetters(wrongLetters || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to parse saved game state:", error);
        fetchRandomWord();
      }
    } else {
      fetchRandomWord();
    }
  }, [fetchRandomWord]);

  useEffect(() => {
    if (word && sessionId) {
      const gameState = {
        sessionId,
        word,
        guessedWord: Array.from(guessedWord),
        wrongGuesses,
        isGameOver,
        isWinner,
        wrongLetters,
      };
      localStorage.setItem("hangmanState", JSON.stringify(gameState));
    }
  }, [sessionId, word, guessedWord, wrongGuesses, isGameOver, isWinner, wrongLetters]);

  const getGuessedWord = useCallback(() => {
    return word.split("").map((letter) =>
      guessedWord.has(letter.toLowerCase()) ? letter : emptySpace
    );
  }, [word, guessedWord]);

  const getInput = (letter) => {
  if (guessedWord.has(letter.toLowerCase())) return;

  fetch("http://localhost:5000/api/guess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionId,
      word,
      guessedWord: Array.from(guessedWord),
      wrongGuesses,
      wrongLetters,
      letter
    })
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to process guess on server.");
      }
      return res.json();
    })
    .then((data) => {
      setGuessedWord(new Set(data.guessedWord));
      setWrongGuesses(data.wrongGuesses);
      setWrongLetters(data.wrongLetters);
      setIsWinner(data.isWinner);
      setIsGameOver(data.isGameOver);
    })
    .catch((err) => {
      console.error("Error processing guess:", err);
      setError("Failed to process guess on server.");
    });
};


  const resetGame = () => {
    localStorage.removeItem("hangmanState");
    fetchRandomWord();
  };

  const game = (
    <div className="game">
      <DisplayBoard word={getGuessedWord()} />
      <Input getInput={getInput} />
      <div className="wrong-letters">
        <strong>Wrong Letters:</strong> {wrongLetters.join(", ")}
      </div>
    </div>
  );

  const winnerOrLoser = isWinner ? (
    <Winner reset={resetGame} />
  ) : isGameOver ? (
    <GameOver word={word} reset={resetGame} />
  ) : (
    game
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="hangman-container">
      <Header attempts={MAX_WRONG - wrongGuesses} />
      <Man wrongGuesses={wrongGuesses} />
      {winnerOrLoser}
    </div>
  );
};

export default Hangman;