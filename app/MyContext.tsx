import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MyContextType {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

const MyContext = createContext<MyContextType | null>(null);

export const MyContextProvider = ({ children }: { children: ReactNode }) => {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);
  const resetRecording = () => setIsRecording(false);

  return (
    <MyContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        resetRecording,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyContextProvider");
  }
  return context;
};
