import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./AppContext";
import { AppContextType, UserType } from "../types";
import jwtDecode from "jwt-decode";

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);

  useEffect(() => {
    // Kiểm tra token trong URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      window.history.replaceState({}, document.title, "/");

      try {
        const decodedUser = jwtDecode<UserType>(token);
        localStorage.setItem("user_info", JSON.stringify(decodedUser));
        setUser(decodedUser);
      } catch (err) {
        console.error("Không thể giải mã token:", err);
      }
    } else {
      // Lấy token từ localStorage
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const decodedUser = jwtDecode<UserType>(storedToken);
          localStorage.setItem("user_info", JSON.stringify(decodedUser));
          setUser(decodedUser);
        } catch (err) {
          console.error("Không thể giải mã token từ localStorage:", err);
        }
      }
    }
  }, []);

  // Kiểm soát redirect theo role user, bạn có thể giữ logic này ở đây hoặc ở App.tsx
  useEffect(() => {
    if (user) {
      if (user.role === "admin" && window.location.pathname !== "/admin") {
        navigate("/admin");
      } else if (user.role !== "admin" && window.location.pathname === "/admin") {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const value: AppContextType = { navigate, user, setUser, isSeller, setIsSeller };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
