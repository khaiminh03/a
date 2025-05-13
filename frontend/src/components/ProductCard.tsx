import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
    console.log(`Đã thêm: ${product.name}`);
  };

  return (
    <div className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white min-w-56 max-w-56 w-full">
      <Link
        to={`/product/${product._id}`}
        className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center"
      >
        <img
          src={`http://localhost:5000/uploads/products/${product.images[0]}`}
          alt={product.name}
          className="object-contain w-28 h-28 group-hover:scale-110 transition-transform duration-300"
        />
      </Link>

      <div className="text-gray-500/60 text-sm">
         <p>{categoryName}</p> 
        <h2 className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-green-600 font-bold text-lg">${product.price}</span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="mt-4 w-full py-2 border border-green-400 text-green-500 hover:bg-green-50 rounded-xl text-sm font-semibold transition-all"
        >
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
