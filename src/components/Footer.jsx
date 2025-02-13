import React, { useState, useEffect } from "react";
import { Github, Twitter, X } from "lucide-react";
import dieImg from '../dice.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      header.style.zIndex = isModalOpen ? "-10" : "50";
    }
  }, [isModalOpen]);

  return (
    <footer className="footer">
      <div className="footer--content">
        <div className="footer--main">
          <div className="footer--branding">
            <div className="footer--image"><img src={dieImg} alt="die pic" /></div>
            <p className="footer--tagline">Create your winning combination.</p>
          </div>
          <div className="footer--links">
            <div className="footer--section">
              <h3 className="footer--heading">Links</h3>

              <button title="Learn to play" className="footer--btn" onClick={toggleModal}>
                How to Play
              </button>

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

              <a href="https://www.figma.com/design/GNoH9u6aAWv0fUU5W9cJfV/Tenzies-(Copy)?node-id=0-1&t=co7s3upvY8mBOHiC-1" target="_blank" title="Inspiration" className="footer--link">Figma</a>
            </div>
            <div className="footer--section">
              <h3 className="footer--heading">Resources</h3>
              <a href="https://github.com/Ashwin-S-Nambiar/Tenzies/blob/main/README.md" title="View Documnetation" target="_blank" className="footer--link">Documentation</a>
              <a href="https://github.com/Ashwin-S-Nambiar/Tenzies" title="View Repo" target="_blank" className="footer--link">GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer--bottom">
          <p className="footer--copyright">
            © {currentYear} <a className="footer--link link-1" target="_blank" href="https://ashwin-s-nambiar.is-a.dev/">Ashwin S Nambiar</a>. All rights reserved.
          </p>
          <div className="footer--social">
            <a href="https://github.com/ashwin-s-nambiar" target="_blank" className="footer--social-link">
              <Github size={20} />
            </a>
            <a href="https://x.com/ashwinnambiar11" target="_blank" className="footer--social-link">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
);
};

export default Footer;