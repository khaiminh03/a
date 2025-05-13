import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders - Tạo đơn hàng mới
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto);
  }

  // GET /orders - Lấy tất cả đơn hàng kèm tên sản phẩm và tên danh mục
  @Get()
  async getAll() {
    return await this.ordersService.getOrdersWithProductDetails();
  }
   // GET /orders/customer/:id - Lấy đơn hàng theo customerId
  @Get('customer/:id')
  async getByCustomer(@Param('id') customerId: string) {
    return await this.ordersService.getOrdersByCustomerId(customerId);
  }
}
