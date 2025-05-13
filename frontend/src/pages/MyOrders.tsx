import { useEffect, useState } from "react";

interface Category {
  name: string;
}

interface Product {
  name: string;
  images: string[];
  categoryId?: Category;
}

interface OrderItem {
  productId: Product;
  quantity: number;
}

interface Order {
  _id: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const rawUser = JSON.parse(localStorage.getItem("user_info") || "{}");
      const userInfo = Array.isArray(rawUser) ? rawUser[0] : rawUser;
      const userId = userInfo._id || userInfo.sub;
      if (!userId) return;

      const res = await fetch(`http://localhost:5000/orders/customer/${userId}`)
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        console.error("Không lấy được đơn hàng");
      }
    };

    fetchOrders();
  }, []);

  return (
   <div className="mt-16 pb-16 px-4 max-w-5xl mx-auto">
  <div className="flex flex-col items-start mb-8">
    <p className="text-2xl font-bold uppercase">Đơn hàng của bạn</p>
    <div className="w-16 h-0.5 bg-indigo-600 rounded-full"></div>
  </div>

  {orders.length === 0 ? (
    <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
  ) : (
    orders.map((order) => (
      <div
        key={order._id}
        className="flex flex-col md:flex-row justify-between gap-6 border border-gray-300 rounded-lg p-6 mb-6 shadow-sm"
      >
        {/* Bên trái - thông tin sản phẩm */}
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded overflow-hidden border">
            <img
              src={
                order.items[0].productId?.images?.[0]
                  ? `http://localhost:5000/uploads/products/${order.items[0].productId.images[0]}`
                  : "/no-image.png"
              }
              alt={order.items[0].productId?.name || "Product"}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex flex-col justify-between">
            <p className="text-sm text-gray-500">
              <strong>OrderId :</strong> {order._id}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {order.items[0].productId?.name || "Product"}
            </p>
            <p className="text-sm text-gray-500">
              Category: {order.items[0].productId?.categoryId?.name || "N/A"}
            </p>
          </div>
        </div>

        {/* Bên phải - chi tiết đơn hàng */}
        <div className="flex flex-col justify-between text-sm text-gray-600 text-right w-full md:w-auto">
          <div className="flex justify-between md:justify-end gap-4 mb-2">
            <p><strong>Payment :</strong> {order.paymentMethod}</p>
            <p><strong>Total Amount :</strong> ${order.totalAmount}</p>
          </div>
          <p>Quantity: {order.items[0].quantity}</p>
          <p>Status: {order.status}</p>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p className="text-green-600 font-semibold text-base mt-1">
            Amount: ${order.totalAmount}
          </p>
        </div>
        
      </div>
    ))
  )}
</div>

  );
};

export default MyOrders;