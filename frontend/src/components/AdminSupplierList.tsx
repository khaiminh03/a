import React, { useEffect, useState } from 'react';

interface Supplier {
  _id: string;
  storeName: string;
  phone: string;
  address: string;
  isApproved: boolean;
}

const AdminSupplierList: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('accessToken');

  const fetchSuppliers = async () => {
    if (!token) {
      alert('Bạn chưa đăng nhập hoặc hết phiên làm việc');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/store-profiles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Không thể lấy danh sách nhà cung cấp');
      }
      const data = await res.json();
      setSuppliers(data);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const approveSupplier = async (id: string) => {
    if (!token) {
      alert('Bạn chưa đăng nhập hoặc hết phiên làm việc');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/store-profiles/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Duyệt nhà cung cấp thất bại');
      }
      alert('Duyệt thành công');
      fetchSuppliers();
    } catch (error: any) {
      alert(error.message || 'Lỗi khi duyệt nhà cung cấp');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;

  if (!token) return <div>Bạn cần đăng nhập với tài khoản admin để xem trang này.</div>;

  return (
    <div>
      <h1>Danh sách đăng ký nhà cung cấp</h1>
      {suppliers.length === 0 ? (
        <p>Chưa có nhà cung cấp nào đăng ký.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Tên cửa hàng</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Số điện thoại</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Địa chỉ</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{s.storeName}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{s.phone}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{s.address}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {s.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {!s.isApproved && (
                    <button onClick={() => approveSupplier(s._id)}>Duyệt</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminSupplierList;
