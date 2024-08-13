import { useState, useEffect } from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

export default function App() {
  const getBestTime = () => {
    const storedBestTime = localStorage.getItem("bestTime");
    return storedBestTime ? JSON.parse(storedBestTime) : null;
  };

  const [dice, setDice] = useState(allNewDice());
  const [tenzies, setTenzies] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [bestTime, setBestTime] = useState(getBestTime);

  useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);
    if (allHeld && allSameValue) {
      setTenzies(true);
      setIsRunning(false);

      if (bestTime === null || time < bestTime) {
        setBestTime(time);
        localStorage.setItem("bestTime", JSON.stringify(time));
      }
    }
  }, [dice, time, bestTime]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(timer);
    }
    return () => {
      clearInterval(timer);
    };
  }, [isRunning]);

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  function rollDice() {
    if (!tenzies) {
      setIsRunning(true);
      setRolling(true);
      setRollCount((prevRollCount) => prevRollCount + 1);
      setTimeout(() => {
        setDice((oldDice) =>
          oldDice.map((die) => {
            return die.isHeld ? die : generateNewDie();
          })
        );
        setRolling(false);
      }, 600);
    } else {
      setTenzies(false);
      setDice(allNewDice());
      setRollCount(0);
      setTime(0);
      setIsRunning(false);
    }
  }

  function holdDice(id) {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
    setIsRunning(true);
  }

  const diceElements = dice.map((die) => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      isRolling={rolling}
      holdDice={() => holdDice(die.id)}
    />
  ));

  return (
    <main>
      {tenzies && <Confetti />}
      <h1 className="title">Tenzies</h1>
      <p className="instructions">
        Roll until all dice are the same. Click each die to freeze it at its
        current value between rolls.
      </p>
      <p className="instructions bottom">
        Your time will start when you click the first die. All the best!
      </p>
      <div className="time-roll-info">
        <span>Roll Count: {rollCount}</span>
        <span>Time: {time} seconds</span>
      </div>
      {bestTime !== null && (
        <span className="best-time">Best Time: {bestTime} seconds</span>
      )}
      <div className="dice-container">{diceElements}</div>
      <button className="roll-dice" onClick={rollDice}>
        {tenzies ? "New Game" : "Roll"}
      </button>
    </main>
  );
}
