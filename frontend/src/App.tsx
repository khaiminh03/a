import React, { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CategoryPage from './pages/CategoryPage';
import AddProduct from "./pages/AddProduct";
import RegisterForm from "./pages/RegisterForm";
import ProductDetail from "./pages/ProductDetail";
import LoginForm from "./components/LoginForm";
import Footer from "./components/Footer";
import Cart from "./pages/Cart";
import Navbar from "./components/Nabar";
import MyOrders from "./pages/MyOrders";
import ProductsByCategory from "./components/ProductByCategory"


interface DecodedToken {
  id: string;
  role: string;
  name: string;
  email: string;
  address: string;
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem("accessToken", token);
      window.history.replaceState({}, document.title, "/");

      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        localStorage.setItem("user_info", JSON.stringify(decodedToken)); // ✅ Lưu thông tin người dùng
        setUser(decodedToken);
      } catch (err) {
        console.error("Không thể giải mã token:", err);
      }
    } else {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(storedToken);
          localStorage.setItem("user_info", JSON.stringify(decodedToken)); // ✅ Cập nhật thông tin nếu cần
          setUser(decodedToken);
        } catch (err) {
          console.error("Không thể giải mã token từ localStorage:", err);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === "admin" && location.pathname !== "/admin") {
        navigate("/admin");
      } else if (user.role !== "admin" && location.pathname === "/admin") {
        navigate("/");
      }
    }
  }, [user, navigate, location.pathname]);

  return (
    <div>
      <Navbar/>
      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<CategoryPage />} />
          <Route path="/sp" element={<AddProduct />} />
          <Route path="/dangky" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/myorder" element={<MyOrders/>} />
          <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />

       
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
