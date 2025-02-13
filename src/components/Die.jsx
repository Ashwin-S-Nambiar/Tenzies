import React from "react";
import { motion } from "framer-motion";

const Die = ({ value, isHeld, holdDice, rolling }) => {
    const dotVariants = {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    };

    const dots = Array.from({ length: value }, (_, i) => (
        <motion.div 
            key={i} 
            className="dot" 
            variants={dotVariants} 
            initial="initial" 
            animate="animate"
        />
    ));

    const containerVariants = {
        hover: { scale: 1.1 },
        tap: { scale: 0.95 },
    };

    const dieVariants = {
        initial: { scale: 0.8, opacity: 0, rotate: 0 },
        animate: { 
            scale: 1, 
            opacity: 1, 
            rotate: rolling && !isHeld ? [0, 180, 360] : 0,
            transition: {
                type: "spring",
                stiffness: 150,
                damping: 15,
                duration: rolling && !isHeld ? 0.8 : 0.3,
                ease: "easeInOut",
            },
        },
    };

    return (
        <motion.div
            className={`die-face ${isHeld ? 'held' : ''}`}
            data-value={value}
            onClick={holdDice}
            variants={containerVariants}
            whileHover="hover"
            whileTap="tap"
        >
            <motion.div 
                className="die-container"
                variants={dieVariants}
                initial="initial"
                animate="animate"
            >
                {dots}
            </motion.div>
        </motion.div>
    );
};

export default Die;