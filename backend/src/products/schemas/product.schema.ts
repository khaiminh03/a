import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

  @Prop([String])
  images: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  supplierId: string;

  @Prop()
  origin: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';
}

export const ProductSchema = SchemaFactory.createForClass(Product);
