import { useEffect, useState } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";

interface User {
  name?: string;
  phone?: string;
  address?: string;
}

interface Product {
  _id?: string;
  name: string;
  images: string[];
}

interface OrderItem {
  productId: Product;
  supplierId: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customerId?: User;
  shippingAddress?: string;
}

const SupplierOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const supplierId = "682edc8880281d22dbfc2c60";

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`http://localhost:5000/orders/supplier/${supplierId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        console.error("Không lấy được đơn hàng của nhà cung cấp");
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error("Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="mt-24 px-4 md:px-8 pb-20 max-w-6xl mx-auto">
  <Typography variant="h4" className="mb-10 font-extrabold text-center text-indigo-800">
    Quản lý Đơn hàng Nhà cung cấp
  </Typography>

  {orders.length === 0 ? (
    <p className="text-center text-gray-500 text-lg">Hiện không có đơn hàng nào.</p>
  ) : (
    orders.map((order) => (
      <Box
        key={order._id}
        className="border border-gray-200 rounded-3xl p-6 mb-10 shadow-md bg-white hover:shadow-xl transition-shadow"
      >
        <div className="flex flex-col md:flex-row md:justify-between mb-6 gap-2">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Mã đơn:</span> {order._id}
          </div>
          <div className="text-sm text-gray-500">
            Ngày đặt: <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 mb-6">
          <div>
            <p><span className="font-semibold">Người đặt:</span> {order.customerId?.name || "Ẩn"}</p>
            <p><span className="font-semibold">SĐT:</span> {order.customerId?.phone || "Ẩn"}</p>
          </div>
          <div>
            <p><span className="font-semibold">Địa chỉ giao hàng:</span> {order.shippingAddress || "Không có thông tin"}</p>
            <p><span className="font-semibold">Thanh toán:</span> {order.paymentMethod}</p>
          </div>
        </div>

        <div className="mt-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 border-t pt-4 mb-4">
              <img
                src={
                  item.productId?.images?.[0]
                    ? `http://localhost:5000/uploads/products/${item.productId.images[0]}`
                    : "/no-image.png"
                }
                alt={item.productId?.name || "Product"}
                className="w-24 h-24 object-cover rounded-xl border shadow-sm"
              />
              <div className="flex-1 space-y-1">
                <p className="text-base font-bold text-indigo-700">{item.productId.name}</p>
                <p className="text-sm text-gray-600">Số lượng: <span className="font-medium">{item.quantity}</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-6 pt-4 border-t">
          <div className="text-base text-green-700 font-bold">
            Tổng cộng: {order.totalAmount.toLocaleString()}đ
          </div>
          <FormControl fullWidth className="md:w-64 mt-4 md:mt-0">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={order.status || ""}
              label="Trạng thái"
              onChange={(e) => handleStatusChange(order._id, e.target.value)}
              disabled={loading || order.status === "Hoàn thành"}
            >
              <MenuItem value="Đã đặt hàng">🕒 Chờ xác nhận</MenuItem>
              <MenuItem value="Đã xác nhận">✅ Đã xác nhận</MenuItem>
              <MenuItem value="Đang giao hàng">🚚 Đang giao hàng</MenuItem>
              <MenuItem value="Hoàn thành">🎉 Hoàn thành</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Box>
    ))
  )}
</div>


  );
};

export default SupplierOrders;
