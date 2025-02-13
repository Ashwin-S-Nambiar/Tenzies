import React from "react"
import { motion } from "framer-motion";

const Die = ({ value, isHeld, holdDice }) => {
    return (
      <motion.div 
        className={`die-face ${isHeld ? 'held' : ''}`}
        onClick={holdDice}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
      >
        <motion.h2 
          className="die-num"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {value}
        </motion.h2>
      </motion.div>
    );
};

export default Die;