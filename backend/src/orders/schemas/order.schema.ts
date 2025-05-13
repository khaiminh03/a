import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop()
  quantity: number;

  @Prop()
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;


  @Prop({ type: [OrderItemSchema] })
  items: OrderItem[];

  @Prop()
  totalAmount: number;

  @Prop()
  shippingAddress: string;

  @Prop()
  paymentMethod: string;

  @Prop()
  status: string;
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);
