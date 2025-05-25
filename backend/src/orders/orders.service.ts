import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product, ProductDocument } from '../products/schemas/product.schema';
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

//   async create(createOrderDto: CreateOrderDto) {
//   try {
//     return await this.orderModel.create(createOrderDto);
//   } catch (error) {
//     throw new Error(`Failed to create order: ${error.message}`);
//   }
// }
async create(createOrderDto: CreateOrderDto) {
    try {
      // 1. Duyệt qua từng sản phẩm để kiểm tra và trừ tồn kho
      for (const item of createOrderDto.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(`Không tìm thấy sản phẩm ID ${item.productId}`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Sản phẩm ${product.name} không đủ hàng tồn kho`);
        }

        product.stock -= item.quantity;
        await product.save();
      }

      // 2. Tạo đơn hàng sau khi trừ stock
      const order = new this.orderModel(createOrderDto);
      return await order.save();
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

async getOrdersWithProductDetails() {
  try {
    return await this.orderModel
      .find()
      .populate({
        path: 'items.productId',
        select: 'name images categoryId',
        populate: {
          path: 'categoryId',
          select: 'name',
        },
      })
      .exec();
  } catch (error) {
    throw new Error(`Failed to get orders: ${error.message}`);
  }
}

async getOrdersByCustomerId(customerId: string) {
  try {
    return await this.orderModel
      .find({ customerId })
      .populate({
        path: 'items.productId',
        select: 'name images categoryId',
        populate: {
          path: 'categoryId',
          select: 'name',
        },
      })
      .exec();
  } catch (error) {
    throw new Error(`Failed to get orders by customer: ${error.message}`);
  }
}
async getOrdersBySupplierId(supplierId: string) {
  return this.orderModel.find({
    'items.supplierId': supplierId,
  })
  .populate({
    path: 'items.productId',
    select: 'name price',
  })
  .exec();
}

}
