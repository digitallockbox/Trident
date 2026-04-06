// userContext.tsx — Store user public key and profile in context
import React, { createContext, useContext, useState } from "react";

export interface UserProfile {
  pubkey: string;
  role: "creator" | "affiliate" | "user";
  displayName?: string;
  avatarUrl?: string;
}

interface UserContextType {
  pubkey: string | null;
  profile: UserProfile | null;
  setPubkey: (k: string | null) => void;
  setProfile: (p: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType>({
  pubkey: null,
  profile: null,
  setPubkey: () => {},
  setProfile: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  return (
    <UserContext.Provider value={{ pubkey, profile, setPubkey, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
