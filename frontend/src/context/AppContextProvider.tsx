import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import { AppContextType, UserType } from "../types";

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);

  const value: AppContextType = { navigate, user, setUser, isSeller, setIsSeller };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
