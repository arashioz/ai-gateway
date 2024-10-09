import { Body, ConflictException, Controller, Get, Post, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from 'src/common/dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Register } from 'src/common/dto/register.dto';
import { CustomersService } from 'src/customers/customers.service';
import { IS_PUBLIC_KEY, Public } from './auth.decorators';
import { AppGuard } from './auth.guard';

@Controller('auth')
@ApiTags('Authorization')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly customerService: CustomersService) { }

    @Public()
    @Post('/login')
    @UseGuards(AuthGuard('local'))
    async login(@Body() body: LoginDTO, @Request() req) {
        return this.authService.login(body)
    }
    
    @Public()
    @Post('/register')
    async register(@Body() body: Register) {
        return this.authService.register(body)
    }
    @UseGuards(AppGuard)
    @ApiBearerAuth()
    @Get('/profile')
    async profile(@Request() req: any) {
        return req.user
    }

}
