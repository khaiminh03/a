import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  // Tạo đơn hàng mới
  async create(createOrderDto: CreateOrderDto) {
    return await this.orderModel.create(createOrderDto);
  }

  // Lấy danh sách đơn hàng kèm thông tin sản phẩm và danh mục
  async getOrdersWithProductDetails() {
    return this.orderModel
      .find()
      .populate({
        path: 'items.productId',
        select: 'name images categoryId', // chọn trường cần thiết
        populate: {
          path: 'categoryId',
          select: 'name', // chỉ lấy tên danh mục
        },
      })
      .exec();
  }
  async getOrdersByCustomerId(customerId: string) {
  return this.orderModel
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
}
}
