import React from "react";
import "./Winner.css";

const Winner = ({ reset }) => {
    return (
        <div style={{ textAlign: "center" }} className="winner">
            <h1>Congratulations!!! You Win</h1>
            <button onClick={reset} className="reset-button">
                Reset
            </button>
        </div>
    );
};

export default Winner;
