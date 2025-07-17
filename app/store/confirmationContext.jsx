import React, { createContext, useContext, useState } from 'react';

const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
  const [confirmation, setConfirmation] = useState(null);

  return (
    <ConfirmationContext.Provider value={{ confirmation, setConfirmation }}>
      {children}
    </ConfirmationContext.Provider>
  );
};

export {ConfirmationContext};
