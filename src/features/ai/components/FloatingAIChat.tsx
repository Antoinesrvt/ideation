import React, { useState, useEffect, useRef, MouseEvent } from "react";
import "../styles/nucleus.css"; // We'll include the CSS separately

interface Message {
  type: string;
  text: string;
  index?: number;
}

interface CustomCSSProperties extends React.CSSProperties {
  '--index'?: number;
}

export const FloatingAIChat = () => {
  // State for the component
  const [expanded, setExpanded] = useState(false);
  const [expanding, setExpanding] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [landing, setLanding] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: "Hi there! I'm your Kickoff Assistant. How can I help with your project today?",
    },
  ]);

  // Refs with proper types
  const nucleusRef = useRef<HTMLDivElement>(null);
  const nucleusPulseRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Create particles
  useEffect(() => {
    createParticles();
  }, []);

  const createParticles = () => {
    const particles = document.getElementById("particles");
    if (!particles) return;

    // Clear existing particles
    particles.innerHTML = "";

    // Create exactly 15 particles as specified
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div") as HTMLDivElement;
      particle.classList.add("particle");

      // Size between 2-4px
      const size = Math.random() * 2 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random position within nucleus
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 20;
      const x = Math.cos(angle) * distance + 50;
      const y = Math.sin(angle) * distance + 50;
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;

      // 30% chance of using cyan, otherwise white
      const color = Math.random() < 0.3 ? "#00c2ff" : "white";
      particle.style.background = color;

      particles.appendChild(particle);
    }
  };

  // Animate pulse before transformation
  const animatePulse = () => {
    if (nucleusPulseRef.current) {
      nucleusPulseRef.current.style.animation =
        "pulse-click 0.8s ease-out forwards";

      // Reset animation after completion
      setTimeout(() => {
        if (nucleusPulseRef.current) {
          nucleusPulseRef.current.style.animation = "none";
        }
      }, 800);
    }
  };

  // Toggle assistant state
  const toggleAssistant = () => {
    if (expanded) {
      // Collapse process
      setLanding(false);
      setCollapsing(true);
      setExpanding(false);

      // Apply 3D rotation before collapsing
      if (nucleusRef.current) {
        nucleusRef.current.style.transform = "translateZ(0) rotateX(3deg)";
      }

      // Start collapse
      setTimeout(() => {
        setExpanded(false);
        setTyping(false);
      }, 120);

      // Reset particles during collapse
      setTimeout(() => {
        const collapseParticles = document.querySelectorAll(".particle") as NodeListOf<HTMLDivElement>;
        collapseParticles.forEach((particle, i) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 20;
          const x = Math.cos(angle) * distance + 50;
          const y = Math.sin(angle) * distance + 50;

          particle.style.transition = `all ${700 + Math.random() * 600}ms var(--expand-timing)`;
          particle.style.opacity = "0.7";

          setTimeout(() => {
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.transform = "none";
          }, i * 30);
        });
      }, 300);

      // Remove transition classes
      setTimeout(() => {
        setCollapsing(false);
      }, 800);
    } else {
      // Expansion process
      // Play pulse animation first (120ms as specified)
      animatePulse();

      // Mark as expanding
      setExpanding(true);

      // Apply initial 3D perspective
      if (nucleusRef.current) {
        nucleusRef.current.style.transform = "translateZ(30px) rotateX(8deg)";
      }

      // Start expansion after pulse
      setTimeout(() => {
        setExpanded(true);

        // Animate particles to create the "energy flow" effect
        const expandParticles = document.querySelectorAll(".particle") as NodeListOf<HTMLDivElement>;
        expandParticles.forEach((particle, i) => {
          const tx = Math.random() * 300 - 150;
          const ty = Math.random() * 500 - 250;
          const duration = 700 + Math.random() * 600;

          particle.style.setProperty("--tx", `${tx}px`);
          particle.style.setProperty("--ty", `${ty}px`);

          setTimeout(() => {
            particle.style.transition = `transform ${duration}ms var(--expand-timing), opacity ${duration * 0.8}ms var(--expand-timing)`;
            particle.style.transform = `translate(${tx}px, ${ty}px)`;
            particle.style.opacity = "0";
          }, i * 50);
        });

        // Add landing animation
        setTimeout(() => {
          setLanding(true);
        }, 750);
      }, 200);

      // Remove expanding class when done
      setTimeout(() => {
        setExpanding(false);
      }, 1000);
    }
  };

  // Add new message to the chat
  const addNewMessage = () => {
    const newCounter = messageCounter + 1;
    setMessageCounter(newCounter);

    const userMsg = {
      type: "user",
      text: `This is test message ${newCounter} from the user`,
      index: newCounter,
    };

    setMessages([...messages, userMsg]);

    // Safe scroll handling
    const scrollToBottom = (element: HTMLDivElement) => {
      element.scrollTop = element.scrollHeight;
    };

    const content = contentRef.current;
    if (content) {
      setTimeout(() => scrollToBottom(content), 100);
    }

    setTyping(true);

    setTimeout(() => {
      setTyping(false);

      const aiMsg = {
        type: "ai",
        text: `This is a response from the Kickoff AI to your message ${newCounter}. How can I help you further?`,
        index: newCounter + 1,
      };

      setMessages((messages) => [...messages, aiMsg]);

      const content = contentRef.current;
      if (content) {
        setTimeout(() => scrollToBottom(content), 100);
      }
    }, 1500);
  };

  // Initialize ambient nucleus animation
  useEffect(() => {
    const animateNucleus = () => {
      if (!expanded) {
        const nucleusParticles = document.querySelectorAll(".particle") as NodeListOf<HTMLDivElement>;
        if (nucleusParticles.length) {
          const randomIndex = Math.floor(Math.random() * nucleusParticles.length);
          const randomParticle = nucleusParticles[randomIndex];

          randomParticle.style.boxShadow = "0 0 8px 2px rgba(0, 194, 255, 0.7)";
          randomParticle.style.opacity = "1";

          setTimeout(() => {
            randomParticle.style.boxShadow = "none";
            randomParticle.style.opacity = "0.7";
          }, 800);
        }
      }

      setTimeout(animateNucleus, 2000 + Math.random() * 3000);
    };

    const animationTimer = setTimeout(animateNucleus, 1000);

    return () => {
      clearTimeout(animationTimer);
    };
  }, [expanded]);

  // Handle tilt on mousemove
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!expanded && nucleusRef.current) {
        const rect = nucleusRef.current.getBoundingClientRect();
        const nucleusX = rect.left + rect.width / 2;
        const nucleusY = rect.top + rect.height / 2;

        // Calculate distance from nucleus center
        const distX = e.clientX - nucleusX;
        const distY = e.clientY - nucleusY;

        // Calculate tilt angle (max 10 degrees)
        const distance = Math.sqrt(distX * distX + distY * distY);
        const maxDistance = 300;
        const tiltFactor = Math.min(distance / maxDistance, 1);

        const tiltX = (distY / maxDistance) * 10 * tiltFactor;
        const tiltY = (-distX / maxDistance) * 10 * tiltFactor;

        // Only apply tilt when nearby
        if (distance < maxDistance) {
          nucleusRef.current.style.transform = `scale(1) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        } else {
          nucleusRef.current.style.transform = "scale(1)";
        }
      }
    };

    document.addEventListener("mousemove", handleMouseMove as unknown as EventListener);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove as unknown as EventListener);
    };
  }, [expanded]);

  // Button click handlers
  const handleAddMessageClick = () => {
    if (!expanded) {
      toggleAssistant();
      setTimeout(addNewMessage, 1000);
    } else {
      addNewMessage();
    }
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleAssistant();
  };

  // Nucleus click handler
  const handleNucleusClick = () => {
    if (!expanded) {
      toggleAssistant();
    }
  };

  return (
    <div className="container">
      <div
        className={`ai-container ${expanded ? "ai-expanded" : ""} ${
          expanding ? "ai-expanding" : ""
        } ${collapsing ? "ai-collapsing" : ""} ${landing ? "ai-landing" : ""} ${
          typing ? "ai-typing" : ""
        }`}
      >
        <div className="landing-shadow"></div>
        <div className="nucleus" ref={nucleusRef} onClick={handleNucleusClick}>
          <div className="nucleus-inner">
            <div className="nucleus-glass"></div>
            <div className="nucleus-highlight"></div>
            <div className="nucleus-core"></div>
          </div>
          <div className="orbital-system">
            <div className="orbital-ring"></div>
            <div className="orbital-ring"></div>
            <div className="orbital-ring"></div>
          </div>
          <div className="morphing-container">
            <div className="morphing-gradient"></div>
          </div>
          {/* <div className="k-symbol">K</div> */}
          <div className="particles" id="particles"></div>
          <div className="nucleus-pulse" ref={nucleusPulseRef}></div>
          <div
            className="transformation-ripple"
            id="transformation-ripple"
          ></div>
          <div className="assistant">
            <div className="assistant-header">
              <div className="assistant-logo">K</div>
              <div className="assistant-title">Kickoff Assistant</div>
              <button className="close-btn" onClick={handleCloseClick}>
                ×
              </button>
            </div>
            <div className="assistant-content" ref={contentRef}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.type}`}
                  style={{ "--index": message.index || index } as CustomCSSProperties}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <div className="assistant-input">
              <input
                type="text"
                className="input-field"
                placeholder="Type your message..."
              />
              <button className="send-btn">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingAIChat;
