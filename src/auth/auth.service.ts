import { ConsoleLogger, HttpCode, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';
import * as bcrypt from 'bcrypt';
import { Register, RegisterRs } from 'src/common/dto/register.dto';
import { generateApiKey } from 'src/common/helper/apiKey.gen';
import { LoginDTO } from 'src/common/dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { encrypt } from 'src/common/helper/encryptor.gen';
import { MongooseError } from 'mongoose';
import { PlansService } from 'src/plans/plans.service';
import { env } from 'process';

@Injectable()
export class AuthService {
    constructor(private readonly customerService: CustomersService, private jwtService: JwtService, private planService: PlansService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.customerService.findOneCustomer(username);
        if (!user) {
            throw new UnauthorizedException("AI : HI Please Register to service");

        }
        else if (!bcrypt.compare(pass, user.password)) {
            throw new UnauthorizedException("AI : Check your Password");

        } else {
            const { password, ...result } = user;
            return result;
        }
    }

    async register(customer: Register) {
        customer.password = await bcrypt.hash(customer.password, 10);
        let enc = encrypt(JSON.stringify(customer))
        let planDetails = []

        for (const a of customer.accessServices) {
            let planExist = await this.planService.findOnePlan({ planName: a });
            if (!planExist) {
                throw new HttpException('Plan does not exist for this customer', HttpStatus.NOT_ACCEPTABLE);
            }
            planDetails.push(planExist["_doc"]);
        }
        
        let customerDocument = Object.assign(customer, {
            apiKey: {
                key: enc.encryptedData,
                iv: enc.iv
            },
            planDetails
        });
        
        

        try {
            let newCustomer = await this.customerService.createCustomer(customerDocument);
            return new RegisterRs(newCustomer['_doc'])

        } catch (err) {
            if (err.code === 11000) {
                throw new HttpException('Customer already exists', HttpStatus.CONFLICT);
            }

            throw new HttpException(`${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }


    }

    async login(customer: LoginDTO) {
        let userCustomer = await this.customerService.findOneCustomer(customer.username)
        let comparePassword = await bcrypt.compare(customer.password, userCustomer.password)
        if (!comparePassword) {
            throw new UnauthorizedException('password is wrong')
        }
        delete userCustomer['_doc'].password
        delete userCustomer['_doc'].username
        delete userCustomer['_doc'].apiKey.iv
        let payload = { sub: customer.username, ...userCustomer['_doc'] }
        return {
            accessToken: await this.jwtService.signAsync(payload, {
                secret: "@#@!#$@#!TOKEN$#$@!#()(^&"
            })
        }
    }
}
