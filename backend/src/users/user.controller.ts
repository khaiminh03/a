import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export class BecomeSupplierDto {
  phone: string;
  address: string;
}

interface JwtRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

// Cấu hình multer lưu ảnh avatar vào uploads/avatar
const storage = diskStorage({
  destination: './uploads/avatar', // Thư mục lưu ảnh
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // API nâng cấp lên nhà cung cấp, bảo vệ route chỉ cho user đăng nhập
  @UseGuards(JwtAuthGuard)
  @Patch('become-supplier')
  async becomeSupplier(@Req() req: JwtRequest, @Body() dto: BecomeSupplierDto) {
    const userId = req.user.userId;
    return this.userService.becomeSupplier(userId, dto.phone, dto.address);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // PATCH cập nhật user có nhận file avatar upload
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', { storage }))
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('Received id in controller:', id);

    if (file) {
      // Gán đường dẫn avatar (có thể là đường dẫn public truy cập được)
      dto.avatarUrl = `/uploads/avatar/${file.filename}`;
    }

    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
