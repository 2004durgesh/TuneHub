import React, { createContext, useState, useContext } from 'react';

const SegmentedButtonContext = createContext();
export const SegmentedButtonProvider = ({ children }) => {
    const [activeSegment, setActiveSegment] = useState('Music');

    return (
        <SegmentedButtonContext.Provider value={{ activeSegment, setActiveSegment }}>
            {children}
        </SegmentedButtonContext.Provider>
    );
};
export const useSegmentedButton = () => {
    const context = useContext(SegmentedButtonContext);
    if (!context) {
        throw new Error('useSegmentedButton must be used within a SegmentedButtonProvider');
    }
    return context;
};