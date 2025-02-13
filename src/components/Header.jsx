import React, { useState } from "react";
import { X } from "lucide-react";

export default function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Tenzie",
                    text: "Check out this cool game!",
                    url: window.location.href,
                });
                console.log("Successfully shared!");
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            alert("Sharing is not supported on this browser.");
        }
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    
        if (!isModalOpen) {
            document.documentElement.style.overscrollBehavior = "contain";
            document.documentElement.style.touchAction = "none";
        } else {
            document.documentElement.style.overscrollBehavior = "";
            document.documentElement.style.touchAction = "";
        }
    };
    
    return (
        <>
            <header className="header">
                <div className="header--content">
                    <div className="header--logo-section">
                        <img
                            src="/dice.svg"
                            className="header--image"
                            alt="Die Pic"
                        />
                        <h2 className="header--title">Tenzies</h2>
                    </div>
                    <nav className="header--nav">
                        <button 
                            title="Check instructions"
                            onClick={toggleModal}
                            className="glass-button border-animate"
                        >
                            Instructions
                        </button>
                        <button 
                            title="Share this app" 
                            onClick={handleShare} 
                            className="glass-button"
                        >
                            Share
                        </button>
                    </nav>
                </div>
            </header>

            <div className={`modal-container ${isModalOpen ? 'open' : ''}`}>
                <div 
                    className="modal-backdrop"
                    onClick={toggleModal}
                />
                
                <div className="modal-content">
                    <div className="modal-grid-background" />
                    
                    <button 
                        aria-label="close instructions model"
                        onClick={toggleModal}
                        className="modal-close"
                    >
                        <X size={20} />
                    </button>

                    <div className="modal-inner">
                        <h3 className="modal-title">
                            How to play Tenzies
                        </h3>
                        
                        <div className="instructions-list">
                            <div className="instruction-item">
                                <div className="instruction-number instruction-number-1">1</div>
                                <p className="instruction-text">
                                    Click the "Roll" button to roll all ten dice. Each die will show a random number between 1 and 6.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <div className="instruction-number instruction-number-2">2</div>
                                <p className="instruction-text">
                                    After the initial roll, decide which number (e.g., 3) you aim to match across all dice.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <div className="instruction-number instruction-number-3">3</div>
                                <p className="instruction-text">
                                    Click on the dice that display your target number to "hold" them. Held dice will be highlighted and remain fixed in subsequent rolls.
                                </p>
                            </div>

                            <div className="instruction-item">
                                <div className="instruction-number instruction-number-4">4</div>
                                <p className="instruction-text">
                                    Click the "Roll" button to roll the remaining unheld dice. Repeat this process, holding dice that match your target number after each roll. 
                                </p>
                            </div>

                            <div className="instruction-item">
                                <div className="instruction-number instruction-number-1">5</div>
                                <p className="instruction-text">
                                    Continue the rolling and holding process until all ten dice display the same number. Upon achieving this, you'll win the game and can choose to start a new round.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}