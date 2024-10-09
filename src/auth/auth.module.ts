import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CustomersModule } from 'src/customers/customers.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PlansModule } from 'src/plans/plans.module';

@Module({
  imports: [CustomersModule, PlansModule, PassportModule, JwtModule.register({

    secret: "@#@!#$@#!TOKEN$#$@!#()(^&",
    secretOrPrivateKey: "@#@!#$@#!TOKEN$#$@!#()(^&",
    global: true,
    signOptions: { expiresIn: '1d' },
  }),],
  providers: [AuthService, LocalStrategy, JwtService],
  exports: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
