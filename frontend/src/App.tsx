import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import { useAppContext } from "./context/AppContext";

import Home from "./pages/Home";
import CategoryPage from './pages/CategoryPage';
import AddProduct from "./pages/AddProduct";
import RegisterForm from "./pages/RegisterForm";
import ProductDetail from "./pages/ProductDetail";
import LoginForm from "./components/LoginForm";
import Footer from "./components/Footer";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import MyOrders from "./pages/MyOrders";
import ProductsByCategory from "./components/ProductByCategory"
import SellerLayout from "./pages/SellerLayout";
import ProductsPage from "./pages/ProductsPage";
import AllProducts from "./components/AllProducts";
import SearchPage from "./components/SearchPage";
import AdminSupplierList from "./components/AdminSupplierList";

const App: React.FC = () => {
  const location = useLocation();
  //const { user } = useAppContext();

  return (
    <div>
      {!location.pathname.startsWith("/seller") && <Navbar />}

      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminSupplierList />} />
          <Route path="/add" element={<CategoryPage />} />
          <Route path="/sp" element={<AddProduct />} />
          <Route path="/dangky" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/myorder" element={<MyOrders />} />
          <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/search" element={<SearchPage />} />
           

          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<AddProduct />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="overview" element={<ProductsPage />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000} // tự tắt sau 3 giây
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Footer />
    </div>
  );
};

export default App;
