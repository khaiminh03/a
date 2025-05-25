import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import axios from 'axios';
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userService.create({
      email,
      password: hashedPassword,
      ...rest,
    });

    return {
      message: 'User registered successfully',
      user: newUser,
    };
  }

  // Kiểm tra đăng nhập email + password
  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  // Đăng nhập với email và password
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
      isGoogleAccount: false,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        address: user.address,
        role: user.role,
      },
    };
  }

  // Xác thực user Google, tạo hoặc cập nhật user, đảm bảo isGoogleAccount true
  async validateGoogleUser(
    googleUser: any,
    accessToken: string,
    extraInfo?: Partial<UpdateUserDto>,
  ): Promise<UserDocument> {
    const googleUserInfo = await this.getGoogleUserInfo(accessToken);

    let user = await this.userService.findByEmail(googleUserInfo.email);

    if (!user) {
      const fullName = [googleUserInfo.given_name, googleUserInfo.family_name].filter(Boolean).join(' ').trim();

      user = await this.userService.create({
        email: googleUserInfo.email,
        name: fullName,
        avatarUrl: googleUserInfo.picture,
        password: '',
        role: 'customer',
        phone: extraInfo?.phone ?? '',
        address: extraInfo?.address ?? '',
        isGoogleAccount: true,
      });
    } else {
      let hasUpdate = false;

      if (!user.isGoogleAccount) {
        user.isGoogleAccount = true;
        hasUpdate = true;
      }
      if (extraInfo?.phone && !user.phone) {
        user.phone = extraInfo.phone;
        hasUpdate = true;
      }
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

  async getGoogleUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token or unable to fetch user info from Google');
    }
  }

  // Tạo JWT token, thêm isGoogleAccount nếu có trong payload
  getAccessToken(payload: { email: string; sub: string; role: string; avatarUrl: string; isGoogleAccount?: boolean }) {
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  // Xác thực token JWT và trả user
  async validateAccessToken(accessToken: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(accessToken);
      const { sub: userId } = decoded as { sub: string };

      const user = await this.userService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Cập nhật address và phone cho user
  async updateAddressAndPhone(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<UserDocument> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.address) {
      user.address = updateUserDto.address;
    }
    if (updateUserDto.phone) {
      user.phone = updateUserDto.phone;
    }
    return user.save();
  }
}
