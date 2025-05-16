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
import SellerLayout from "./pages/SellerLayout"
import ProductsPage from "./pages/ProductsPage";
import AllProducts from "./components/AllProducts";
import SearchPage from "./components/SearchPage";
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
        localStorage.setItem("user_info", JSON.stringify(decodedToken)); 
        setUser(decodedToken);
      } catch (err) {
        console.error("Không thể giải mã token:", err);
      }
    } else {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(storedToken);
          localStorage.setItem("user_info", JSON.stringify(decodedToken)); 
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
    {/* Chỉ hiển thị Navbar nếu không phải trang seller */}
    {!location.pathname.startsWith("/seller") && <Navbar />}

    <div className="px-6 md:px-16 lg:px-24 xl:px-32">
      <Routes>
        {/* Các route bình thường */}
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<CategoryPage />} />
        <Route path="/sp" element={<AddProduct />} />
        <Route path="/dangky" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/myorder" element={<MyOrders />} />
        <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />
        <Route path="/spall" element={<AllProducts />} />
        <Route path="/search" element={<SearchPage />} />
        {/* Seller Layout dùng nested route */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<AddProduct />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="overview" element={<ProductsPage />} />
          
        </Route>
      </Routes>
    </div>

    <Footer />
  </div>
);

};
export default App;
