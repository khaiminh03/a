import React, { useState, useEffect } from "react";
import axios from "axios";
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

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        localStorage.setItem("accessToken", token);
        const decoded = jwtDecode<DecodedToken>(token);
        localStorage.setItem("user_info", JSON.stringify(decoded));

        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("authChanged"));

        window.history.replaceState({}, "", window.location.pathname);

        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Giải mã token thất bại:", err);
      }
    }
  }, [onSuccess]);

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

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("authChanged"));

      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/login";
  };

  return (
    // Background mờ full màn hình, căn giữa nội dung
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 bg-opacity-30">
      {/* Container form */}
      <div className="bg-white max-w-md w-full mx-4 p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-center text-3xl font-extrabold mb-8 text-gray-900">
            <span className="text-green-600">User</span> Login
          </h2>
          {error && (
            <div className="text-red-600 text-center mb-6 font-semibold">{error}</div>
          )}

          <div className="mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full rounded-md px-4 py-3 border border-gray-300 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-8">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md px-4 py-3 border border-gray-300 bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mb-6 text-center text-sm text-gray-600">
            Create an account?{" "}
            <a href="#" className="text-green-600 hover:underline font-semibold">
              click here
            </a>
          </div>

          <button
            type="submit"
            className="w-full mb-4 py-3 rounded-md bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 active:scale-95 transition-transform"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-md border border-gray-300 text-gray-800 flex justify-center items-center gap-3 hover:bg-gray-100 active:scale-95 transition-transform"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285f4"
                d="M533.5 278.4c0-18.4-1.5-36-4.5-53.2H272v100.7h147.3c-6.4 34.7-26 64.3-55.7 84v69h89.7c52.6-48.5 82.2-119.7 82.2-200.5z"
              />
              <path
                fill="#34a853"
                d="M272 544.3c73.7 0 135.7-24.5 180.9-66.3l-89.7-69c-24.9 16.8-56.8 26.8-91.2 26.8-69.9 0-129.3-47.2-150.5-110.9H29.6v69.7c45.5 89.6 139 150.7 242.4 150.7z"
              />
              <path
                fill="#fbbc04"
                d="M121.5 323.6c-10.4-31-10.4-64.3 0-95.3V158.6H29.6c-35.9 71.6-35.9 157.1 0 228.7l91.9-63.7z"
              />
              <path
                fill="#ea4335"
                d="M272 107.7c38.6 0 73.3 13.3 100.7 39.3l75.4-75.4C403.1 24.1 344.1 0 272 0 168.6 0 75.1 61.1 29.6 150.7l91.9 69.7c21.2-63.7 80.6-110.9 150.5-110.9z"
              />
            </svg>
            Đăng nhập với Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
