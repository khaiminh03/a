import { Controller, Get, Post, Body, Patch, Param,UseGuards,Req, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // đường dẫn tùy theo cấu trúc project của bạn


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
  // @Post('become-supplier/:id')
  // async becomeSupplier(@Param('id') id: string) {
  //   return this.userService.update(id, { role: 'supplier' });
  // }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
  
}
