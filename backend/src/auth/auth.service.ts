import { Injectable, BadRequestException, UnauthorizedException,NotFoundException  } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDocument } from '../users/schemas/user.schema';  // Import UserDocument để sử dụng đúng kiểu
import { CreateUserDto } from '../users/dto/create-user.dto';
import axios from 'axios';  // Import axios để gọi API Google
import { UpdateUserDto } from 'src/users/dto/update-user.dto';



@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Đăng ký người dùng mới
  async register(createUserDto: CreateUserDto) {
    const { email, password, ...rest } = createUserDto;

    const userExists = await this.userService.findByEmail(email);
    if (userExists) {
      throw new BadRequestException('Email already exists');
    }

    // Mã hóa mật khẩu trước khi lưu vào DB
    const hashedPassword = await bcrypt.hash(password, 10);  // 10 là số vòng
    const newUser = await this.userService.create({
      email,
      password: hashedPassword,  // Lưu mật khẩu đã mã hóa
      ...rest,
    });

    return {
      message: 'User registered successfully',
      user: newUser,
    };
  }

  // Kiểm tra đăng nhập thông qua email và password
  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // So sánh mật khẩu đã mã hóa và mật khẩu nhập vào
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  // Đăng nhập người dùng với email và password
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.validateUser(email, password);

    const payload = {
    sub: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
    address: user.address,
    phone: user.phone,
  };

    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }
// Phương thức xác thực JWT và trả về thông tin người dùng
  verifyToken(token: string) {
    try {
      // Giải mã token và trả về payload
      const decoded = this.jwtService.verify(token);  // Token sẽ được giải mã và trả về payload
      return decoded;  // Trả về thông tin người dùng giải mã từ token
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }
  // Xác thực thông tin người dùng qua Google
// async validateGoogleUser(googleUser: any, accessToken: string): Promise<UserDocument> {
//     const googleUserInfo = await this.getGoogleUserInfo(accessToken);

//     let user = await this.userService.findByEmail(googleUserInfo.email);

//     if (!user) {
//       const fullName = `${googleUserInfo.given_name || ''} ${googleUserInfo.family_name || ''}`.trim();
//       user = await this.userService.create({
//         email: googleUserInfo.email,
//         name: fullName,
//         avatarUrl: googleUserInfo.picture,
//         password: '',
//         role: 'customer',
//       });
//     }
    
//     return user as UserDocument;
//   }
async validateGoogleUser(
  googleUser: any,
  accessToken: string,
  extraInfo?: Partial<UpdateUserDto>, // Thông tin bổ sung từ người dùng
): Promise<UserDocument> {
  const googleUserInfo = await this.getGoogleUserInfo(accessToken);

  let user = await this.userService.findByEmail(googleUserInfo.email);

  if (!user) {
    const fullName = `${googleUserInfo.given_name || ''} ${googleUserInfo.family_name || ''}`.trim();
    user = await this.userService.create({
      email: googleUserInfo.email,
      name: fullName,
      avatarUrl: googleUserInfo.picture,
      password: '',
      role: 'customer',
      phone: extraInfo?.phone ?? '', // Lưu số điện thoại nếu có
      address: extraInfo?.address ?? '', // Lưu địa chỉ nếu có
    });
  } else {
    let hasUpdate = false;

    // Nếu chưa có số điện thoại, cập nhật nó
    if (extraInfo?.phone && !user.phone) {
      user.phone = extraInfo.phone;
      hasUpdate = true;
    }

    // Nếu chưa có địa chỉ, cập nhật nó
    if (extraInfo?.address && !user.address) {
      user.address = extraInfo.address;
      hasUpdate = true;
    }

    if (hasUpdate) {
      await user.save();
    }
  }

  return user as UserDocument;
}


  // Lấy thông tin người dùng từ Google API
  async getGoogleUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,  // Gửi access_token trong header
        },
      });

      return response.data;  // Trả về thông tin người dùng từ Google
    } catch (error) {
      throw new UnauthorizedException('Invalid access token or unable to fetch user info from Google');
    }
  }

  // Tạo JWT token cho người dùng
  getAccessToken(payload: { email: string; sub: string; role: string }) {
  return this.jwtService.sign(payload, { expiresIn: '1h' });  // You can adjust expiration time here
}

  // Giải mã và xác thực accessToken
  async validateAccessToken(accessToken: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(accessToken);
      const { sub: userId } = decoded as { sub: string };

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }

      return user; // Trả về thông tin người dùng nếu token hợp lệ
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  // Cập nhật thông tin người dùng
 async updateAddressAndPhone(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<UserDocument> {
  // Tìm người dùng qua UserService
  const user = await this.userService.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Cập nhật thông tin address và phone nếu có
  if (updateUserDto.address) {
    user.address = updateUserDto.address;
  }

  if (updateUserDto.phone) {
    user.phone = updateUserDto.phone;
  }

  // Lưu lại thông tin đã cập nhật
  return user.save(); // Lưu người dùng đã được cập nhật
}

}
