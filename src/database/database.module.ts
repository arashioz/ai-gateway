import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersModel, CustomersSchema } from './schemas/customer.schema';
import { CustomersService } from 'src/customers/customers.service';
import { PlansService } from 'src/plans/plans.service';
import { PlanModels, PlanSchema } from './schemas/plan.schema';

@Module({
    imports: [MongooseModule.forRootAsync({
        inject: [ConfigService], useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('DATABASE_URL'),
        }),
    }),
    MongooseModule.forFeature([{ name: CustomersModel.name, schema: CustomersSchema }, { name: PlanModels.name, schema: PlanSchema }])],
    providers: [CustomersService, PlansService],
    exports: [MongooseModule, CustomersService, PlansService]
})
export class DatabaseModule { }
