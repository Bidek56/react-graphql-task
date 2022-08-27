import React from 'react'

export type contextType = {
    running: boolean,
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
};

export const StatusContext = React.createContext<contextType>({
        running: false, 
        setRunning: {} as React.Dispatch<React.SetStateAction<boolean>>
    });