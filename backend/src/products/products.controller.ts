import { 
    Controller, Post, Get, Put, Delete, Param, Body, UploadedFiles, UseInterceptors,NotFoundException
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { v4 as uuidv4 } from 'uuid';
  import { extname } from 'path';
  import { ProductsService } from './products.service';
  import { CreateProductDto } from './dto/create-product.dto';
  import { Product } from './schemas/product.schema';
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    @Post()
    @UseInterceptors(
      FilesInterceptor('images', 10, {  // 'images' phải trùng key bên formData.append
        storage: diskStorage({
          destination: './uploads/products',
          filename: (req, file, cb) => {
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            cb(null, uniqueName);
          },
        }),
      }),
    )
    async create(
      @UploadedFiles() files: Express.Multer.File[],
      @Body() createProductDto: CreateProductDto,
    ): Promise<Product> {
      const imageFilenames = files.map(file => file.filename);
  
      return this.productsService.create({
        ...createProductDto,
        images: imageFilenames,
      });
    }
  
    @Get()
    async findAll(): Promise<Product[]> {
      return this.productsService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Product> {
      const product = await this.productsService.findOne(id);
      if (!product) {
        throw new NotFoundException(`Product with id ${id} not found`);
      }
      return product;
    }
    @Get('by-category-id/:id')
    getByCategoryId(@Param('id') id: string) {
      return this.productsService.getByCategoryId(id);
}

  
    // @Put(':id')
    // async update(
    //   @Param('id') id: string,
    //   @Body() updateData: Partial<CreateProductDto>,
    // ): Promise<Product> {
    //   return this.productsService.update(id, updateData);
    // }
  
    // @Delete(':id')
    // async remove(@Param('id') id: string): Promise<void> {
    //   return this.productsService.remove(id);
    // }
  }
  