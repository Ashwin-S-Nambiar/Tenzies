import React, { useState, useEffect } from "react";
import Die from "./components/Die";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { winningResponses, losingResponses } from "./components/responses";

export default function App() {
    const [dice, setDice] = useState(allNewDice());
    const [tenzies, setTenzies] = useState(false);
    const [lost, setLost] = useState(false);
    const [rolling, setRolling] = useState(false);
    const [rolls, setRolls] = useState(0);
    const [winMessage, setWinMessage] = useState("");
    const [loseMessage, setLoseMessage] = useState("");
    const [heldDiceIds, setHeldDiceIds] = useState(new Set());
    const [lockedDiceIds, setLockedDiceIds] = useState(new Set());

    useEffect(() => {
        const allHeld = dice.every(die => die.isHeld);
        const firstValue = dice[0].value;
        const allSameValue = dice.every(die => die.value === firstValue);

        if (allHeld && allSameValue) {
            setTenzies(true);
            setLockedDiceIds(new Set(dice.map(die => die.id)));
            setWinMessage(winningResponses[Math.floor(Math.random() * winningResponses.length)]);
        } else if (allHeld && !allSameValue) {
            setLost(true);
            setLockedDiceIds(new Set(dice.map(die => die.id)));
            setLoseMessage(losingResponses[Math.floor(Math.random() * losingResponses.length)]);
        } else {
            setWinMessage("");
            setLoseMessage("");
        }
    }, [dice]);

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
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
        if (!tenzies && !lost) {
            setRolling(true);
            setRolls(prevRolls => prevRolls + 1);
            setLockedDiceIds(new Set([...lockedDiceIds, ...heldDiceIds]));

            setTimeout(() => {
                setDice(oldDice => oldDice.map(die => {
                    if (lockedDiceIds.has(die.id)) {
                        return die;
                    } else if (heldDiceIds.has(die.id)) {
                        return { ...die, isHeld: true };
                    } else {
                        return generateNewDie();
                    }
                }));
                setRolling(false);
            }, 600);
        } else {
            setTenzies(false);
            setLost(false);
            setDice(allNewDice());
            setRolls(0);
            setHeldDiceIds(new Set());
            setLockedDiceIds(new Set());
        }
    }


    function holdDice(id) {
        if (!rolling && !tenzies && !lost && !lockedDiceIds.has(id)) {
            setHeldDiceIds(prevIds => {
                const newIds = new Set(prevIds);
                if (newIds.has(id)) {
                    newIds.delete(id);
                } else {
                    newIds.add(id);
                }
                return newIds;
            });

            setDice(oldDice => oldDice.map(die => {
                return die.id === id ?
                    { ...die, isHeld: !die.isHeld } :
                    die;
            }));
        }
    }

    const diceElements = dice.map(die => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={heldDiceIds.has(die.id)}
            holdDice={() => holdDice(die.id)}
            rolling={rolling || tenzies || lost}
        />
    ));

    return (
        <>
            {tenzies && <Confetti />}
            <Header />
            <div className="app-container">
                <div className="grid-background" />
                <div className="content-wrapper">
                    <motion.main
                        className="game-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {rolls !== 0 &&
                            <motion.div className="score-container"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                            >
                                <span className="score-label">Rolls:</span>
                                <span className="score-value">{rolls}</span>
                            </motion.div>
                        }
                        <h2 className={`status ${tenzies ? 'win-message' : lost ? 'lose-message' : ''}`}>{ tenzies ? "You Won!" : lost ? "You Lost :(" : "" }</h2>
                        <motion.p
                            className={`instructions ${tenzies ? 'win-message' : lost ? 'lose-message' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {tenzies ? winMessage : lost ? loseMessage : "Roll until all dice are the same. Click each die to freeze it at its current value between rolls."}
                        </motion.p>
                        <motion.div
                            className="dice-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {diceElements}
                        </motion.div>
                        <motion.button
                            className={`roll-dice ${rolling ? 'rolling' : ''}`}
                            onClick={rollDice}
                            disabled={rolling}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {tenzies ? "New Game" : lost ? "New Game" : "Roll"}
                        </motion.button>
                    </motion.main>
                </div>
            </div>
            <Footer />
        </>
    );
}