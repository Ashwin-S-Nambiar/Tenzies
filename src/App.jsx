import React, { useState, useEffect } from "react"
import Die from "./components/Die"
import Header from "./components/Header"
import Footer from "./components/Footer"
import {nanoid} from "nanoid"
import Confetti from "react-confetti"
import { motion } from "framer-motion";

export default function App() {
    const [dice, setDice] = useState(allNewDice());
    const [tenzies, setTenzies] = useState(false);
    const [lost, setLost] = useState(false);
    const [rolling, setRolling] = useState(false);
  
    useEffect(() => {
      const allHeld = dice.every(die => die.isHeld);
      const firstValue = dice[0].value;
      const allSameValue = dice.every(die => die.value === firstValue);
      
      if (allHeld && allSameValue) {
        setTenzies(true);
      } else if (allHeld && !allSameValue) {
        setLost(true);
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
        setTimeout(() => {
          setDice(oldDice => oldDice.map(die => {
            return die.isHeld ? die : generateNewDie();
          }));
          setRolling(false);
        }, 600);
      } else {
        setTenzies(false);
        setLost(false);
        setDice(allNewDice());
      }
    }
  
    function holdDice(id) {
      if (!rolling) {
        setDice(oldDice => oldDice.map(die => {
          return die.id === id ? 
            {...die, isHeld: !die.isHeld} :
            die;
        }));
      }
    }
  
    const diceElements = dice.map(die => (
      <Die 
        key={die.id}
        value={die.value}
        isHeld={die.isHeld}
        holdDice={() => holdDice(die.id)}
      />
    ));
  
    return (
        <>
        <Header />
        {tenzies && <Confetti />}
        <div className="app-container">
          <div className="grid-background" />
          <div className="content-wrapper">
            <motion.main 
              className="game-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1 
                className="title"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
              >
                Tenzies
              </motion.h1>
              <motion.p 
                className="instructions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {tenzies ? 
                  "You Won!" : 
                  lost ? 
                    "You lost :(" : 
                    "Roll until all dice are the same. Click each die to freeze it at its current value between rolls."}
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