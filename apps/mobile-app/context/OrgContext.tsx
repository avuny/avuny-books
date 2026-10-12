import React, { createContext, useContext, useState } from 'react';

interface OrgContextType {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);

  return (
    <OrgContext.Provider
      value={{
        selectedOrganizationId,
        setSelectedOrganizationId,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useSelectedOrganization = () => {
  const context = useContext(OrgContext);

  if (!context) {
    throw new Error('useSelectedOrganization must be used within OrgProvider');
  }

  return context;
};
