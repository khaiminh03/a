import { useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  categoryId: string;  // Add categoryId
  price: number;
  inStock: boolean;
  images: string[];
  category: string;  // Add category to hold category name
  supplierId: string; // Add supplierId to Product
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch category name for a product
  const fetchCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/categories/${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      const categoryData = await response.json();
      return categoryData.name;
    } catch (error) {
      console.error(error);
      return 'Unknown'; // Return Unknown in case of error
    }
  };

  // Fetch tất cả sản phẩm từ backend
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/products'); // Lấy tất cả sản phẩm từ API
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();

      // Lấy thông tin người dùng từ localStorage và lấy supplierId từ trường 'sub'
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) {
        throw new Error('User info not found');
      }

      const parsedUserInfo = JSON.parse(userInfo);
      const supplierId = parsedUserInfo.sub; // Trường 'sub' chứa supplierId

      // Lọc các sản phẩm theo supplierId
      const filteredProducts = data.filter((product: Product) => 
        product.supplierId.toString() === supplierId // So sánh supplierId với giá trị trong sản phẩm
      );

      // Fetch category name cho mỗi sản phẩm đã lọc
      for (let product of filteredProducts) {
        const categoryName = await fetchCategory(product.categoryId);
        product.category = categoryName;
      }

      setProducts(filteredProducts); // Cập nhật danh sách sản phẩm đã lọc
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Lấy sản phẩm ngay khi component được render
  }, []); // Chạy một lần khi component được mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex-1 py-10 flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">Tất cả sản phẩm</h2>

        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Sản phẩm</th>
                <th className="px-4 py-3 font-semibold truncate">Danh mục</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:block">Giá</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product, index) => (
                <tr key={index} className="border-t border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <div className="border border-gray-300 rounded p-2">
                      <img
                        src={`http://localhost:5000/uploads/products/${product.images[0]}`}
                        alt={product.name}
                        className="w-16"
                      />
                    </div>
                    <span className="truncate max-sm:hidden w-full">{product.name}</span>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">${product.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
