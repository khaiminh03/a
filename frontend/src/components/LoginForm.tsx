import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

interface DecodedToken {
  _id?: string;
  role: string;
  name?: string;
  email: string;
  address?: string;
  phone?: string;
  isGoogleAccount?: boolean;
  avatarUrl?: string;
}

interface LoginResponse {
  access_token: string;
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        localStorage.setItem("accessToken", token);
        const decoded = jwtDecode<DecodedToken>(token);
        localStorage.setItem("user_info", JSON.stringify(decoded));

        // Phát event storage cho các tab khác
        window.dispatchEvent(new Event("storage"));

        // Phát event custom cho tab hiện tại cập nhật UI
        window.dispatchEvent(new CustomEvent("authChanged"));

        // Xóa query string token khỏi URL
        window.history.replaceState({}, "", window.location.pathname);

        // Chuyển hướng theo role
        if (decoded.role === "admin") {
          navigate("/admin");
        } else if (decoded.role === "supplier") {
          navigate("/seller");
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Giải mã token thất bại:", err);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:5000/auth/login",
        { email, password }
      );

      const token = response.data.access_token;
      localStorage.setItem("accessToken", token);

      const decoded = jwtDecode<DecodedToken>(token);
      localStorage.setItem("user_info", JSON.stringify(decoded));

      // Phát event storage cho các tab khác
      window.dispatchEvent(new Event("storage"));

      // Phát event custom cho tab hiện tại cập nhật UI
      window.dispatchEvent(new CustomEvent("authChanged"));

      // Chuyển hướng theo role
      if (decoded.role === "admin") {
        navigate("/admin");
      } else if (decoded.role === "supplier") {
        navigate("/seller");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/login";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-lg shadow-[0px_0px_10px_0px] shadow-black/10">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Đăng nhập</h2>
          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

          <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
            <input
              className="w-full outline-none bg-transparent py-2.5"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center mt-2 mb-8 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
            <input
              className="w-full outline-none bg-transparent py-2.5"
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 py-2.5 rounded text-white font-medium"
          >
            Đăng nhập
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-3 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all active:scale-95 py-2.5 rounded font-medium flex items-center justify-center gap-2"
          >
            Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
