import { useState, useEffect } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

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

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', String(form.price));
    formData.append('stock', String(form.stock));
    formData.append('origin', form.origin);
    formData.append('categoryId', form.categoryId);
    formData.append('supplierId', form.supplierId);

    form.images.forEach((file) => {
      formData.append('images', file); // key phải là 'images' như trong FilesInterceptor
    });

    try {
      const res = await axios.post('http://localhost:5000/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Product created:', res.data);
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to add product');
    }
  };

  return (
    <form className="space-y-4 max-w-lg mx-auto mt-8" onSubmit={handleSubmit}>
      {[
        { label: 'Name', name: 'name', type: 'text' },
        { label: 'Description', name: 'description', type: 'textarea' },
        { label: 'Price', name: 'price', type: 'number' },
        { label: 'Stock', name: 'stock', type: 'number' },
        { label: 'Origin', name: 'origin', type: 'text' },
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
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}

      {/* Category Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Supplier ID */}
      <div>
        <label className="block text-sm font-medium mb-1">Supplier ID</label>
        <input
          type="text"
          name="supplierId"
          value={form.supplierId}
          onChange={handleChange}
          className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">Images</label>
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Add Product
      </button>
    </form>
  );
};

export default AddProduct;
