const express = require('express');
const cors = require('cors');
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // Works in Node < 18
const crypto = require('crypto');
const sessions = {};

const app = express();
const PORT = 5000;
const MAX_WRONG = 6;

app.use(cors());
app.use(express.json());

let wordList = [];

const loadWordList = async () => {
  try {
    const response = await fetch("https://random-word-api.herokuapp.com/all");
    if (!response.ok) {throw new Error("Failed to fetch word list");}
    wordList = await response.json();
    console.log(`✅ Loaded ${wordList.length} words`);
  } catch (err) {
    console.error("❌ Error loading word list:", err);
  }
};

app.get('/api/word', (req, res) => {
  if (wordList.length===0) {
    return res.status(500).json({ error: "Word list not loaded yet" });
  }
  const randomIndex = Math.floor(Math.random() * wordList.length);
  const word = wordList[randomIndex];
  const sessionId = crypto.randomUUID(); // Generate unique session ID

  sessions[sessionId] = {
    word: word.toLowerCase(),
    guessedWord: new Set(),
    wrongGuesses: 0,
    wrongLetters: []
  };
  res.json({ sessionId, word });
});

app.post('/api/guess', (req, res) => {
  const {sessionId, letter } = req.body;

  if (!sessionId || !letter) {
    return res.status(400).json({ error: "Missing sessionId or letter." });
  }

  const game = sessions[sessionId];
  if (!game) {
    return res.status(404).json({ error: "Session not found." });
  }

  const { word, guessedWord, wrongGuesses, wrongLetters } = game;

  const lowerWord = word.toLowerCase();
  const lowerLetter = letter.toLowerCase();
  const updatedGuessedWord = new Set(guessedWord);
  const updatedWrongLetters = [...wrongLetters];

  if (updatedGuessedWord.has(lowerLetter)) {
    return res.status(400).json({error: "Letter already guessed."});
  }

  updatedGuessedWord.add(lowerLetter);

  let newWrongGuesses = wrongGuesses;
  if (!lowerWord.includes(lowerLetter)) {
    newWrongGuesses += 1;
    updatedWrongLetters.push(lowerLetter);
  }

  const isWinner = lowerWord.split('').every(char => updatedGuessedWord.has(char));
  const isGameOver = newWrongGuesses >= MAX_WRONG;

  game.wrongGuesses = newWrongGuesses;
  game.guessedWord = updatedGuessedWord;
  game.wrongLetters = updatedWrongLetters;

  res.json({
    guessedWord: Array.from(updatedGuessedWord),
    wrongGuesses: newWrongGuesses,
    wrongLetters: updatedWrongLetters,
    isWinner,
    isGameOver
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  loadWordList();
});