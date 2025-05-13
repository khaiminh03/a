import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [address, setAddress] = useState("No address found");
  const [showAddress, setShowAddress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setProducts(cart);

    const rawUser = JSON.parse(localStorage.getItem("user_info") || "{}");
    const userInfo = Array.isArray(rawUser) ? rawUser[0] : rawUser;

    if (userInfo?.address) {
      setAddress(userInfo.address);
    }
  }, []);

  const totalPrice = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = totalPrice * 0.02;
  const totalWithTax = totalPrice + tax;

  const updateQuantity = (index: number, newQty: number) => {
    const updatedProducts = [...products];
    updatedProducts[index].quantity = newQty;
    setProducts(updatedProducts);
    localStorage.setItem("cart", JSON.stringify(updatedProducts));
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    localStorage.setItem("cart", JSON.stringify(updatedProducts));
  };

  const updateAddress = (newAddress: string) => {
    const rawUser = JSON.parse(localStorage.getItem("user_info") || "{}");
    const userInfo = Array.isArray(rawUser) ? rawUser[0] : rawUser;

    userInfo.address = newAddress;
    localStorage.setItem("user_info", JSON.stringify(userInfo));
    setAddress(newAddress);
    setShowAddress(false);
  };

  const placeOrder = async () => {
    const rawUser = JSON.parse(localStorage.getItem("user_info") || "{}");
    const userInfo = Array.isArray(rawUser) ? rawUser[0] : rawUser;

    const userId = userInfo._id || userInfo.sub;
    if (!userId) {
      alert("User information is incomplete or missing.");
      return;
    }

    const orderData = {
      customerId: userId,
      items: products.map(product => ({
        productId: product._id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: totalWithTax,
      shippingAddress: address,
      paymentMethod: "COD",
      status: "pending",
    };

    try {
      const response = await fetch("http://localhost:5000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        localStorage.removeItem("cart");
        navigate("/myorder");
      } else {
        alert("Order placement failed!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Order placement failed!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Giỏ hàng <span className="text-sm text-indigo-500">{products.length} số lượng</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Thông tin chi tiết</p>
          <p className="text-center">Tổng</p>
          <p className="text-center">Action</p>
        </div>

        {products.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                <img
                  className="max-w-full h-full object-cover"
                  src={`http://localhost:5000/uploads/products/${product.images?.[0]}`}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>Size: <span>{product.size || "N/A"}</span></p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      className="outline-none ml-2"
                      value={product.quantity}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">
              {(product.price * product.quantity).toLocaleString()}₫
            </p>
            <button className="cursor-pointer mx-auto" onClick={() => removeProduct(index)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
                  stroke="#FF532E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">{address}</p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-indigo-500 hover:underline cursor-pointer"
            >
              Change
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                <input
                  type="text"
                  placeholder="Enter address"
                  className="w-full p-2 border-b outline-none"
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                />
                <button
                  onClick={() => updateAddress(address)}
                  className="w-full text-indigo-500 text-center p-2 hover:bg-indigo-500/10"
                >
                  Save Address
                </button>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <select className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
            <option value="COD">Cash On Delivery</option>
            <option value="Online">Online Payment</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{totalPrice.toLocaleString()}₫</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping Fee</span>
            <span className="text-green-600">Free</span>
          </p>
          <p className="flex justify-between">
            <span>Tax (2%)</span>
            <span>{tax.toLocaleString()}₫</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>{totalWithTax.toLocaleString()}₫</span>
          </p>
        </div>

        <button
          className="w-full py-3 mt-6 cursor-pointer bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
          onClick={placeOrder}
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default Cart;
