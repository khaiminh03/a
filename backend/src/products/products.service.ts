import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }
// Lấy sản phẩm theo id
  // Lấy sản phẩm theo id
  async findOne(id: string): Promise<Product | null> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async getByCategoryId(categoryId: string): Promise<Product[]> {
  return this.productModel.find({
    categoryId: new Types.ObjectId(categoryId.trim()),
  }).exec();
}
// Lấy sản phẩm của nhà cung cấp
  async getProductsBySupplier(supplierId: Types.ObjectId): Promise<Product[]> {
    return this.productModel.find({ supplierId }).exec(); 
  }
   // Tìm kiếm sản phẩm theo tên
  async searchByName(keyword: string): Promise<Product[]> {
  return this.productModel.find({
    name: { $regex: keyword, $options: 'i' } 
  }).exec();
}
}
