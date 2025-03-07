import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'

export type TabListProps = {
  tabs: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

// Use useLayoutEffect with SSR safety
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const TabList = ({ tabs, activeTab, onTabChange }: TabListProps) => {
  // Internal state to track active tab and positions
  const [activeTabId, setActiveTabId] = useState<string>(activeTab || tabs[0]?.id || '');
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });
  
  // Ref for the entire tab list to measure children
  const tabListRef = useRef<HTMLDivElement>(null);
  
  // Update the indicator position when active tab changes
  useIsomorphicLayoutEffect(() => {
    // If activeTab prop changes, update internal state
    if (activeTab && activeTab !== activeTabId) {
      setActiveTabId(activeTab);
    }
    
    const updateIndicator = () => {
      if (!tabListRef.current) return;
      
      // Find the active tab element
      const tabList = tabListRef.current;
      const activeTabElement = tabList.querySelector(`[data-state="active"]`) as HTMLElement;
      
      if (activeTabElement) {
        // Get the position relative to the tab list
        setIndicatorStyle({
          left: activeTabElement.offsetLeft,
          width: activeTabElement.offsetWidth,
        });
      }
    };
    
    // Update immediately and then after a small delay to ensure layout is complete
    updateIndicator();
    const timeout = setTimeout(updateIndicator, 50);
    
    return () => clearTimeout(timeout);
  }, [activeTabId, activeTab]);
  
  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  
  return (
    <TabsList
      variant="pills"
      className={`${
        tabs.length <= 4 ? `grid grid-cols-${tabs.length}` : ""
      } border-solid border-2 border-primary-300 rounded-lg relative overflow-hidden`}
      ref={tabListRef}
    >
      {/* Animated background indicator */}
      <motion.div
        className="absolute bg-primary-600 rounded-md z-0"
        initial={false}
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            mass: 1
          }
        }}
        style={{ height: "80%", top: "10%" }}
      />
      
      {/* Tab buttons */}
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          variant="pills"
          className="relative z-10 data-[state=active]:text-white rounded-md px-12 transition-colors duration-300"
          onClick={() => handleTabClick(tab.id)}
          data-state={tab.id === activeTabId ? 'active' : 'inactive'}
        >
          {tab.icon}
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

export default TabList