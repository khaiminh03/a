import { useState } from "react";
import axios from "axios";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/register",
        formData
      );
      console.log("Đăng ký thành công:", response.data);
      alert("Đăng ký thành công!");

      // ✅ Reset form sau khi đăng ký
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.response?.data || error.message;

      console.error("Lỗi đăng ký:", errorMessage);
      alert(`Đăng ký thất bại: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Tên"
          value={formData.name}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
          minLength={6}
        />
        <input
          type="text"
          name="phone"
          placeholder="Số điện thoại"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Địa chỉ"
          value={formData.address}
          onChange={handleChange}
          className="w-full border rounded-xl p-3"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
        >
          Đăng ký
        </button>
      </form>
    </div>
  );
}
