import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
}

interface FormState {
  name: string;
  description: string;
  price: number;
  stock: number;
  origin: string;
  categoryId: string;
  supplierId: string;
  images: File[];
}

const AddProduct = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    origin: '',
    categoryId: '',
    supplierId: '',
    images: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (userInfo.role !== 'supplier') {
      alert('Bạn không có quyền thêm sản phẩm');
      navigate('/');
      return;
    }

    setUserRole(userInfo.role);
    setForm((prevForm) => ({
      ...prevForm,
      supplierId: userInfo.sub,
    }));

    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
      }
    };

    fetchCategories();
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setForm((prevForm) => ({
      ...prevForm,
      images: Array.from(files),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const supplierId = userInfo.sub;

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', String(form.price));
    formData.append('stock', String(form.stock));
    formData.append('origin', form.origin);
    formData.append('categoryId', form.categoryId);
    formData.append('supplierId', supplierId);

    form.images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await axios.post('http://localhost:5000/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Sản phẩm đã được tạo:', res.data);
      alert('Thêm sản phẩm thành công!');
      // Reset form
      setForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        origin: '',
        categoryId: '',
        supplierId: supplierId,
        images: [],
      });
    } catch (error) {
      console.error('Lỗi khi tạo sản phẩm:', error);
      alert('Thêm sản phẩm thất bại');
    }
  };

  if (userRole !== 'supplier') {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl">Bạn không có quyền thêm sản phẩm</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4 max-w-lg mx-auto mt-8" onSubmit={handleSubmit}>
      {[
        { label: 'Tên sản phẩm:', name: 'name', type: 'text' },
        { label: 'Mô tả:', name: 'description', type: 'textarea' },
        { label: 'Giá', name: 'price', type: 'number' },
        { label: 'Số lượng', name: 'stock', type: 'number' },
        { label: 'Xuất xứ', name: 'origin', type: 'text' },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={form[field.name as keyof FormState] as string}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <input
              type={field.type}
              name={field.name}
              value={form[field.name as keyof FormState] as string | number}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-1">Danh mục</label>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden">
        <input
          type="text"
          name="supplierId"
          value={form.supplierId}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hình ảnh</label>
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Thêm sản phẩm
      </button>
    </form>
  );
};

export default AddProduct;
