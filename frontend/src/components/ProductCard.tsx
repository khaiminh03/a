import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    categoryId: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/categories/${product.categoryId}`);
        const categoryData = await response.json();
        setCategoryName(categoryData.name); // Assuming the response contains a 'name' field
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchCategory();
  }, [product.categoryId]);

  const handleAdd = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingProductIndex = cart.findIndex((item: any) => item._id === product._id);

    if (existingProductIndex >= 0) {
      cart[existingProductIndex].quantity += 1;  // Tăng số lượng nếu sản phẩm đã có trong giỏ
    } else {
      cart.push({ ...product, quantity: 1 });  // Thêm sản phẩm với số lượng 1
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);  // Lưu giỏ hàng đã cập nhật
  };

 const formatPrice = (price: number): string => {
  return price.toLocaleString("vi-VN") + "đ";
};



  return (
    <div className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full">
      <Link
        to={`/product/${product._id}`}
        className="group cursor-pointer flex items-center justify-center px-2"
      >
        <img
          src={`http://localhost:5000/uploads/products/${product.images[0]}`}
          alt={product.name}
          className="group-hover:scale-105 transition max-w-26 md:max-w-36"
        />
      </Link>
      <div className="text-gray-500/60 text-sm">
        <p>{categoryName}</p>
        <h2 className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</h2>
        <div className="flex items-end justify-between mt-3">
          <span className="md:text-xl text-base font-medium text-green-500">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="mt-4 w-full py-2 border border-green-400 text-green-500 bg-green-50 rounded-xl text-sm font-semibold transition-all"
        >
          Thêm
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
