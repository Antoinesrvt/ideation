"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useSpring, animated, config } from "react-spring";
import "./style.css";

// Define types for the dashboard components
type MessageSender = "user" | "ai";

type Message = {
  text: string;
  sender: MessageSender;
  timestamp?: Date;
};

type DashboardType = "financial" | "businessModel" | "timeline" | "team" | "market" | null;

// Enhanced placeholder visualization components
const FinancialProjections = ({ energyLevel }: { energyLevel: number }) => (
  <div className="placeholder-visualization">
    <div className="chart" style={{ opacity: 0.5 + energyLevel * 0.5 }}>
      {[40, 65, 48, 80, 55, 75].map((height, i) => (
        <div 
          key={i} 
          className="bar" 
          style={{ 
            height: `${(height * 0.5) + (height * 0.5 * energyLevel)}px`,
            animationDelay: `${i * 0.1}s` 
          }}
        ></div>
      ))}
    </div>
    <div className="chart-labels">
      <div>Q1</div>
      <div>Q2</div>
      <div>Q3</div>
      <div>Q4</div>
      <div>Q1</div>
      <div>Q2</div>
    </div>
    <div className="data-insights" style={{ opacity: 0.2 + energyLevel * 0.8 }}>
      <div className="insight">
        <span className="metric">+24%</span>
        <span className="label">Revenue Growth</span>
      </div>
      <div className="insight">
        <span className="metric">$1.2M</span>
        <span className="label">Projected Earnings</span>
      </div>
    </div>
  </div>
);

const BusinessModelCanvas = ({ energyLevel }: { energyLevel: number }) => (
  <div className="placeholder-visualization">
    <div className="canvas-grid" style={{ opacity: 0.5 + energyLevel * 0.5 }}>
      {["Key Partners", "Key Activities", "Value Propositions", "Customer Relationships", 
        "Customer Segments", "Key Resources", "Channels", "Cost Structure", "Revenue Streams"].map((section, i) => (
        <div key={i} className="canvas-section" style={{ animationDelay: `${i * 0.1}s` }}>
          <h3>{section}</h3>
          <div className="section-content" style={{ opacity: 0.3 + energyLevel * 0.7 }}></div>
        </div>
      ))}
    </div>
  </div>
);

const TimelineVisual = ({ energyLevel }: { energyLevel: number }) => (
  <div className="placeholder-visualization">
    <div className="timeline" style={{ opacity: 0.5 + energyLevel * 0.5 }}>
      <div className="timeline-line"></div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="timeline-node" 
          style={{ 
            left: `${i * 20}%`, 
            scale: 0.8 + energyLevel * 0.2,
            animationDelay: `${i * 0.15}s`
          }}
        >
          <div className="node-content" style={{ opacity: 0.4 + energyLevel * 0.6 }}></div>
          <div className="node-label">Phase {i+1}</div>
        </div>
      ))}
    </div>
  </div>
);

const TeamDashboard = ({ energyLevel }: { energyLevel: number }) => (
  <div className="placeholder-visualization">
    <div className="team-grid" style={{ opacity: 0.5 + energyLevel * 0.5 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="team-member"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="member-avatar"></div>
          <div className="member-info" style={{ opacity: 0.4 + energyLevel * 0.6 }}>
            <div className="member-name">Team Member {i+1}</div>
            <div className="member-role">Role Title</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarketAnalysis = ({ energyLevel }: { energyLevel: number }) => (
  <div className="placeholder-visualization">
    <div className="market-viz" style={{ opacity: 0.5 + energyLevel * 0.5 }}>
      <div className="market-pie">
        <div className="pie-slice slice-1" style={{ transform: `rotate(${energyLevel * 40}deg)` }}></div>
        <div className="pie-slice slice-2" style={{ transform: `rotate(${energyLevel * 160 + 40}deg)` }}></div>
        <div className="pie-slice slice-3" style={{ transform: `rotate(${energyLevel * 120 + 200}deg)` }}></div>
      </div>
      <div className="market-legend" style={{ opacity: 0.3 + energyLevel * 0.7 }}>
        <div className="legend-item"><span className="color-1"></span> Segment A</div>
        <div className="legend-item"><span className="color-2"></span> Segment B</div>
        <div className="legend-item"><span className="color-3"></span> Segment C</div>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
const LivingAIDashboard = () => {
  // State for managing conversation and dashboard mode
  const [conversationActive, setConversationActive] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [aiThinking, setAiThinking] = useState<boolean>(false);
  const [activeDashboard, setActiveDashboard] = useState<DashboardType>(null);
  const [energyLevel, setEnergyLevel] = useState<number>(0);
  const [pulseTrigger, setPulseTrigger] = useState<number>(0);

  // Animation controls for pulse effect
  const pulseAnimation = useAnimationControls();

  // Trigger pulse animation when AI is thinking
  useEffect(() => {
    if (aiThinking) {
      setPulseTrigger(prev => prev + 1);
    }
  }, [aiThinking]);

  // Trigger pulse animation
  useEffect(() => {
    if (pulseTrigger > 0) {
      const pulsate = async () => {
        await pulseAnimation.start({
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.6, 0.2],
          transition: { duration: 1.5, ease: "easeInOut" }
        });
      };
      pulsate();
    }
  }, [pulseTrigger, pulseAnimation]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    // Add user message
    const newMessages = [...messages, { text: userInput, sender: "user" as MessageSender, timestamp: new Date() }];
    setUserInput("");

    // Activate conversation if this is first message
    if (!conversationActive) {
      setConversationActive(true);
    }

    // Show AI thinking state
    setAiThinking(true);

    // Simulate AI processing and response
    setTimeout(() => {
      // Detect dashboard activation requests in user input
      if (userInput.toLowerCase().includes("financial")) {
        setActiveDashboard("financial");
      } else if (userInput.toLowerCase().includes("business model")) {
        setActiveDashboard("businessModel");
      } else if (userInput.toLowerCase().includes("timeline")) {
        setActiveDashboard("timeline");
      } else if (userInput.toLowerCase().includes("team")) {
        setActiveDashboard("team");
      } else if (userInput.toLowerCase().includes("market")) {
        setActiveDashboard("market");
      }

      // Increase energy level for animations
      setEnergyLevel((prev) => Math.min(prev + 0.2, 1));

      // Add AI response
      setAiThinking(false);
      setMessages([
        ...newMessages,
        {
          text: generateResponse(userInput),
          sender: "ai" as MessageSender,
          timestamp: new Date(),
        },
      ]);
    }, 1500 + Math.random() * 1000);
  };

  // Simulate AI response generation
  const generateResponse = (input: string): string => {
    const responses = [
      "I've analyzed your project data and created financial projections based on similar successful ventures.",
      "Let me help you refine your business model canvas. I've identified some opportunities in your value proposition.",
      "I've updated your project timeline with the new milestones. Would you like me to optimize the critical path?",
      "Based on market trends, I recommend focusing on these customer segments first.",
      "I've reviewed your team structure and have some recommendations for optimal role distribution.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Reset conversation and dashboard
  const handleReset = () => {
    setConversationActive(false);
    setMessages([]);
    setActiveDashboard(null);
    
    // Gradually reduce energy level for a smoother transition
    const reduceEnergy = () => {
      setEnergyLevel(prev => {
        const newLevel = prev - 0.1;
        return newLevel <= 0 ? 0 : newLevel;
      });
    };
    
    const interval = setInterval(reduceEnergy, 100);
    
    setTimeout(() => {
      clearInterval(interval);
    setEnergyLevel(0);
    }, 1100);
  };

  return (
    <div className="ai-dashboard-container">
      {/* Ambient Background Effect - reacts to energy level */}
      <AmbientBackground energyLevel={energyLevel} />
      
      {/* Pulse wave animation */}
      <motion.div 
        className="pulse-wave"
        animate={pulseAnimation}
        initial={{ scale: 1, opacity: 0 }}
      />

      {/* Dashboard Navigation - transforms during conversation */}
      <DashboardNav
        conversationActive={conversationActive}
        activeDashboard={activeDashboard}
        setActiveDashboard={setActiveDashboard}
      />

      {/* Main Content Area - transforms based on conversation */}
      <div
        className={`main-content ${
          conversationActive ? "conversation-active" : ""
        }`}
      >
        {/* Living Assistant - central component that breathes and responds */}
        <LivingAssistant
          conversationActive={conversationActive}
          aiThinking={aiThinking}
          energyLevel={energyLevel}
          onClick={() => !conversationActive && setConversationActive(true)}
        />

        {/* Conversation Interface - appears during active conversation */}
        <ConversationInterface
          conversationActive={conversationActive}
          messages={messages}
          userInput={userInput}
          setUserInput={setUserInput}
          aiThinking={aiThinking}
          handleSendMessage={handleSendMessage}
        />

        {/* Dynamic Dashboard Content - transforms based on conversation */}
        <DynamicDashboard
          activeDashboard={activeDashboard}
          conversationActive={conversationActive}
          energyLevel={energyLevel}
        />
      </div>

      {/* Reset Button - visible during active conversation */}
      {conversationActive && (
        <motion.button
          className="reset-button"
          onClick={handleReset}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="reset-icon">↺</span>
          New Conversation
        </motion.button>
      )}
    </div>
  );
};

// Living Assistant Component - Breathes and Responds
const LivingAssistant = ({
  conversationActive,
  aiThinking,
  energyLevel,
  onClick,
}: {
  conversationActive: boolean;
  aiThinking: boolean;
  energyLevel: number;
  onClick: () => void;
}) => {
  // Breathing animation - continuous subtle pulsing
  const breathingAnimation = useSpring({
    from: { scale: 1 },
    to: async (next: any) => {
      while (true) {
        await next({ scale: 1.05, config: { duration: 2000 } });
        await next({ scale: 1, config: { duration: 2000 } });
      }
    },
    pause: conversationActive,
  });

  // Energy core animation based on conversation state
  const energyAnimation = useSpring({
    opacity: conversationActive ? 0.8 : 0.5,
    rotate: conversationActive ? 360 : 0,
    scale: aiThinking ? 1.2 : 1,
    config: { duration: aiThinking ? 800 : 2000 },
    loop: aiThinking,
  });

  // Size transformation when conversation becomes active
  const sizeAnimation = useSpring({
    width: conversationActive ? "70px" : "180px",
    height: conversationActive ? "70px" : "180px",
    config: { tension: 120, friction: 14 },
  });

  // Position transformation when conversation becomes active
  const positionAnimation = useSpring({
    transform: conversationActive ? "translateX(-140px)" : "translateX(0)",
    config: { tension: 120, friction: 14 },
  });

  return (
    <animated.div
      className="living-assistant-container"
      style={positionAnimation}
      onClick={onClick}
    >
      <animated.div
        className="living-assistant"
        style={{
          ...sizeAnimation,
          ...breathingAnimation,
        }}
      >
        {/* Outer rings that rotate independently */}
        <div className="orbital-ring ring-1"></div>
        <div className="orbital-ring ring-2"></div>
        <div className="orbital-ring ring-3"></div>
        <div className="orbital-ring ring-4"></div>

        {/* Energy Core - Animates based on AI state */}
        <animated.div
          className="energy-core"
          style={{
            ...energyAnimation,
            background: aiThinking
              ? `conic-gradient(from ${energyAnimation.rotate}deg, #4723c4, #00c2ff, #ff3478, #4723c4)`
              : `conic-gradient(from 0deg, #4723c4, #00c2ff, #ff3478, #4723c4)`,
          }}
        />

        {/* Inner Glow - Pulses with "thinking" */}
        <div className={`inner-glow ${aiThinking ? "thinking" : ""}`} />

        {/* Energy Particles - Active during thinking/responding */}
        <EnergyParticles active={aiThinking} energyLevel={energyLevel} />

        {/* K Symbol */}
        <div className="assistant-symbol">
          <div className="symbol-line line-vertical"></div>
          <div className="symbol-line line-diagonal-1"></div>
          <div className="symbol-line line-diagonal-2"></div>
        </div>
      </animated.div>
    </animated.div>
  );
};

// Energy Particles Component - Animates during AI activity
const EnergyParticles = ({
  active,
  energyLevel,
}: {
  active: boolean;
  energyLevel: number;
}) => {
  const particlesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    // Only create particles if active
    if (!active) return;

    // Create particles
    const particleCount = Math.floor(15 + energyLevel * 30);
    for (let i = 0; i < particleCount; i++) {
      createParticle(particlesRef.current, energyLevel);
    }
  }, [active, energyLevel]);

  // Create individual particle with random properties
  const createParticle = (container: HTMLDivElement, intensity: number): void => {
    const particle = document.createElement("div");
    particle.className = "energy-particle";

    // Random position within container
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 20 * intensity;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Random size
    const size = 2 + Math.random() * 4;

    // Random color
    const colors = ["#4723c4", "#00c2ff", "#ff3478", "#8723ff", "#00e1ff"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Set styles
    particle.style.left = `calc(50% + ${x}px)`;
    particle.style.top = `calc(50% + ${y}px)`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;

    // Set animation
    const duration = 0.5 + Math.random() * 1.5;
    const delay = Math.random() * 0.5;
    const distance = 30 + Math.random() * 50 * intensity;

    particle.style.animation = `
      particle-float ${duration}s ease-out ${delay}s forwards
    `;

    // Create keyframes dynamically
    const keyframes = document.createElement("style");
    keyframes.textContent = `
      @keyframes particle-float {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 0.8;
        }
        100% {
          transform: translate(
            ${Math.cos(angle) * distance}px,
            ${Math.sin(angle) * distance}px
          ) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(keyframes);

    // Add to container and remove after animation
    container.appendChild(particle);
    setTimeout(() => {
      if (particle.parentNode === container) {
        container.removeChild(particle);
      }
      document.head.removeChild(keyframes);
    }, (duration + delay) * 1000);
  };

  return <div ref={particlesRef} className="energy-particles"></div>;
};

// Conversation Interface Component
const ConversationInterface = ({
  conversationActive,
  messages,
  userInput,
  setUserInput,
  aiThinking,
  handleSendMessage,
}: {
  conversationActive: boolean;
  messages: Message[];
  userInput: string;
  setUserInput: React.Dispatch<React.SetStateAction<string>>;
  aiThinking: boolean;
  handleSendMessage: () => void;
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle key press (Enter)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {conversationActive && (
        <motion.div
          className="conversation-interface"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "420px" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="conversation-header">
            <div className="header-title">Project Assistant</div>
            <div className="header-status">
              <span className="status-indicator active"></span>
              <span>Active</span>
            </div>
          </div>
          
          <div className="messages-container">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <div className="empty-message">Start a conversation to explore your project</div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`message ${message.sender}-message`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 * (index % 3) }}
              >
                <div className="message-content">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </motion.div>
            ))}

            {aiThinking && (
              <motion.div
                className="ai-thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="thinking-dot"></div>
                <div className="thinking-dot"></div>
                <div className="thinking-dot"></div>
              </motion.div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="input-container">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your project..."
              disabled={aiThinking}
            />
            <motion.button
              className={`send-button ${aiThinking ? "disabled" : ""}`}
              onClick={handleSendMessage}
              disabled={aiThinking}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 35, 196, 0.9)" }}
            >
              <span className="send-icon">↑</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Dynamic Dashboard Component - Transforms based on conversation
interface DynamicDashboardProps {
  activeDashboard: DashboardType;
  conversationActive: boolean;
  energyLevel: number;
}

const DynamicDashboard = ({
  activeDashboard,
  conversationActive,
  energyLevel,
}: DynamicDashboardProps) => {
  return (
    <div className={`dynamic-dashboard ${conversationActive ? "active" : ""}`}>
      <AnimatePresence mode="wait">
        {activeDashboard === "financial" && (
          <motion.div
            className="dashboard-module financial-module"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2>Financial Projections</h2>
            <FinancialProjections energyLevel={energyLevel} />
          </motion.div>
        )}

        {activeDashboard === "businessModel" && (
          <motion.div
            className="dashboard-module business-model-module"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2>Business Model Canvas</h2>
            <BusinessModelCanvas energyLevel={energyLevel} />
          </motion.div>
        )}

        {activeDashboard === "timeline" && (
          <motion.div
            className="dashboard-module timeline-module"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2>Project Timeline</h2>
            <TimelineVisual energyLevel={energyLevel} />
          </motion.div>
        )}

        {activeDashboard === "team" && (
          <motion.div
            className="dashboard-module team-module"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2>Team Dashboard</h2>
            <TeamDashboard energyLevel={energyLevel} />
          </motion.div>
        )}

        {activeDashboard === "market" && (
          <motion.div
            className="dashboard-module market-module"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2>Market Analysis</h2>
            <MarketAnalysis energyLevel={energyLevel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Dashboard Navigation Component - Transforms during conversation
interface DashboardNavProps {
  conversationActive: boolean;
  activeDashboard: DashboardType;
  setActiveDashboard: React.Dispatch<React.SetStateAction<DashboardType>>;
}

const DashboardNav = ({
  conversationActive,
  activeDashboard,
  setActiveDashboard,
}: DashboardNavProps) => {
  const navItems = [
    { id: "businessModel" as const, label: "Business Model", icon: "📊" },
    { id: "financial" as const, label: "Financials", icon: "💰" },
    { id: "timeline" as const, label: "Timeline", icon: "📅" },
    { id: "team" as const, label: "Team", icon: "👥" },
    { id: "market" as const, label: "Market", icon: "🔍" },
  ];

  return (
    <motion.div
      className={`dashboard-nav ${
        conversationActive ? "conversation-active" : ""
      }`}
      animate={{
        width: conversationActive ? "100px" : "800px",
        height: conversationActive ? "400px" : "80px",
        left: conversationActive ? "20px" : "50%",
        top: conversationActive ? "50%" : "20px",
        x: conversationActive ? "0" : "-50%",
        y: conversationActive ? "-50%" : "0",
        borderRadius: conversationActive ? "20px" : "40px",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div
        className={`nav-items ${
          conversationActive ? "vertical" : "horizontal"
        }`}
      >
        {navItems.map((item) => (
          <motion.div
            key={item.id}
            className={`nav-item ${
              activeDashboard === item.id ? "active" : ""
            }`}
            onClick={() => setActiveDashboard(item.id)}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(71, 35, 196, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            layout
          >
            <span className="nav-icon">{item.icon}</span>
            <motion.span 
              className="nav-label"
              animate={{ 
                opacity: conversationActive ? 0 : 1,
                maxWidth: conversationActive ? "0px" : "100px",
                marginLeft: conversationActive ? "0px" : "8px"
              }}
              transition={{ duration: 0.3 }}
            >
              {item.label}
            </motion.span>
            {activeDashboard === item.id && (
              <motion.div 
                className="active-indicator" 
                layoutId="activeIndicator"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Ambient Background Component - Reacts to energy level
interface AmbientBackgroundProps {
  energyLevel: number;
}

const AmbientBackground = ({ energyLevel }: AmbientBackgroundProps) => {
  const gradientAnimation = useSpring({
    background: `radial-gradient(
      circle at center,
      rgba(71, 35, 196, ${0.05 + energyLevel * 0.1}) 0%,
      rgba(0, 194, 255, ${0.03 + energyLevel * 0.07}) 35%,
      rgba(255, 52, 120, ${0.02 + energyLevel * 0.05}) 70%,
      rgba(10, 10, 30, 0) 100%
    )`,
    config: { duration: 1000 },
  });

  // Multiple layers add depth
  return (
    <>
      <animated.div className="ambient-background" style={gradientAnimation}>
        <div className="ambient-grid"></div>
        <div className="ambient-dots"></div>
      </animated.div>
      <animated.div 
        className="ambient-blur-container"
        style={{ opacity: 0.2 + energyLevel * 0.5 }}
      >
        <div className="ambient-blur-circle circle-1"></div>
        <div className="ambient-blur-circle circle-2"></div>
        <div className="ambient-blur-circle circle-3"></div>
      </animated.div>
    </>
  );
};

export default LivingAIDashboard;
