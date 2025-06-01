import React from "react";
import "./Header.css";

const Header = ({ attempts }) => {
    return (
        <div className="header">
            <h1>Hangman Game</h1>
            <h3>Enter a letter one by one and guess the correct word</h3>
            <h3>
                You have <span className="lives-span">{attempts}</span> lives left
            </h3>
        </div>
    );
};

export default Header;
