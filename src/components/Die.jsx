import React from "react";
import { motion } from "framer-motion";

const Die = ({ value, isHeld, holdDice, rolling }) => {
    const dots = Array.from({ length: value }, (_, i) => (
        <motion.span
            key={i}
            className="dot"
            variants={{
                initial: { scale: 0 },
                animate: { scale: 1 },
            }}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.1 }}
        />
    ));

    const containerVariants = {
        hover: { scale: 1.1 },
        tap: { scale: 0.95 },
    };

    const dieVariants = {
        initial: { scale: 0.8, opacity: 0, rotate: 0 },
        animate: { scale: 1, opacity: 1, rotate: rolling && !isHeld ? 360 : 0 },
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: rolling && !isHeld ? 0.5 : 0.2,
            ease: "easeInOut",
        },
    };

    return (
        <motion.div
            className={`die-face ${isHeld ? 'held' : ''}`}
            onClick={holdDice}
            variants={containerVariants}
            whileHover="hover"
            whileTap="tap"
        >
            <motion.div className="die-container" variants={dieVariants} initial="initial" animate="animate">
                {dots}
            </motion.div>
        </motion.div>
    );
};

export default Die;