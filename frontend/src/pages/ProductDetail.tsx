import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  origin: string;
  categoryId: string;
  supplierId: string;
  status: string;
}

const BASE_IMAGE_URL = 'http://localhost:5000/uploads/products/';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [thumbnail, setThumbnail] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(`http://localhost:5000/products/${id}`);
        setProduct(res.data);
        if (res.data.images.length > 0) {
          setThumbnail(BASE_IMAGE_URL + res.data.images[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Lấy giỏ hàng hiện tại từ localStorage, nếu không có thì khởi tạo giỏ hàng mới
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa, nếu có thì tăng số lượng lên
      const existingProductIndex = currentCart.findIndex((item: Product) => item._id === product._id);
      if (existingProductIndex !== -1) {
        currentCart[existingProductIndex].quantity += 1; // Tăng số lượng sản phẩm trong giỏ hàng
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới vào giỏ hàng
        currentCart.push({ ...product, quantity: 1 });
      }

      // Lưu lại giỏ hàng vào localStorage
      localStorage.setItem('cart', JSON.stringify(currentCart));

      // Điều hướng đến trang giỏ hàng
      navigate('/cart');
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl w-full px-6 mx-auto">
      <p>
        <span>Trang chủ</span> / <span>Sản phẩm</span> /{' '}
        <span className="text-indigo-500">{product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.images.map((image, index) => (
              <div
                key={index}
                onClick={() => setThumbnail(BASE_IMAGE_URL + image)}
                className={`border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer ${
                  thumbnail === BASE_IMAGE_URL + image ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <img src={BASE_IMAGE_URL + image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>

          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            <img src={thumbnail} alt="Selected product" className="max-w-md" />
          </div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>

          <div className="mt-6">
            <p className="text-2xl font-medium">Giá: {product.price.toLocaleString()}₫</p>
            <span className="text-gray-500/70">(Đã bao gồm thuế VAT)</span>
          </div>

          <p className="text-base font-medium mt-6">Mô tả:</p>
          <p className="text-gray-500/70">{product.description}</p>

          <div className="mt-4 text-gray-500 text-sm space-y-1">
            <p><strong>Số lượng:</strong> {product.stock}</p>
            <p><strong>Xuất xứ:</strong> {product.origin}</p>
            <p><strong>Trạng thái:</strong> {product.status}</p>
          </div>

          <div className="flex items-center mt-10 gap-4 text-base">
            <button onClick={handleAddToCart} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition">
              Thêm vào giỏ hàng
            </button>
            <button className="w-full py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
