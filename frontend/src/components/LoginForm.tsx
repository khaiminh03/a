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
  isGoogleLogin?: boolean;
}

interface LoginResponse {
  access_token: string;
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        console.log("Token nhận được:", token);
        localStorage.setItem("accessToken", token);
        const decoded = jwtDecode<DecodedToken>(token);
        console.log("Decoded token:", decoded);

        // Lưu thông tin người dùng vào localStorage (luôn là object)
        localStorage.setItem("user_info", JSON.stringify(decoded));
        setUserInfo(decoded);

        // Xóa query params
        window.history.replaceState({}, "", window.location.pathname);

        if (!decoded.name || !decoded.address) {
          setIsUpdating(true);
        } else {
          // Navigate based on role
          if (decoded.role === "admin") {
            navigate("/admin");
          } else if (decoded.role === "supplier") {
            navigate("/seller");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Giải mã token thất bại:", err);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<LoginResponse>("http://localhost:5000/auth/login", {
        email,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("accessToken", token);

      const decoded = jwtDecode<DecodedToken>(token);
      localStorage.setItem("user_info", JSON.stringify(decoded)); // ✅ object
      setUserInfo(decoded);

      if (!decoded.name || !decoded.address) {
        setIsUpdating(true);
      } else {
        // Navigate based on role
        if (decoded.role === "admin") {
          navigate("/admin");
        } else if (decoded.role === "supplier") {
          navigate("/seller");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/login";
  };

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo) {
      // Merge old info to keep _id, email, role
      const old = JSON.parse(localStorage.getItem("user_info") || "{}");
      const updated = {
        ...old,
        name: userInfo.name,
        address: userInfo.address,
      };
      localStorage.setItem("user_info", JSON.stringify(updated));
      setUserInfo(updated);
      setIsUpdating(false);
      // Navigate based on role after update
      if (updated.role === "admin") {
        navigate("/admin");
      } else if (updated.role === "supplier") {
        navigate("/supplier");
      } else {
        navigate("/");
      }
    }
  };

  return (
   <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white text-gray-500 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-lg shadow-[0px_0px_10px_0px] shadow-black/10">
        {!isUpdating ? (
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
        ) : (
          <form onSubmit={handleUpdateInfo}>
            <h2 className="text-2xl font-bold mb-9 text-center text-gray-800">Cập nhật thông tin</h2>

            <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
              <input
                className="w-full outline-none bg-transparent py-2.5"
                type="text"
                placeholder="Họ tên"
                value={userInfo?.name || ""}
                onChange={(e) => setUserInfo({ ...userInfo!, name: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-1 pl-2">
              <input
                className="w-full outline-none bg-transparent py-2.5"
                type="text"
                placeholder="Địa chỉ"
                value={userInfo?.address || ""}
                onChange={(e) => setUserInfo({ ...userInfo!, address: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 py-2.5 rounded text-white font-medium"
            >
              Cập nhật
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
