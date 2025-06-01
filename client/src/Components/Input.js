import React from "react";
import Keyboard from "./Keyboard";

const Input = ({ getInput }) => {
    return (
        <div className="input-container">
            <Keyboard getInput={getInput} />
        </div>
    );
};

export default Input;
