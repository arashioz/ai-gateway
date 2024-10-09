import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { retry } from 'rxjs';
import { generateApiKey } from 'src/common/helper/apiKey.gen';
import { CustomersModel } from 'src/database/schemas/customer.schema';

@Injectable()
export class CustomersService {
    constructor(@InjectModel(CustomersModel.name) private readonly customers: Model<CustomersModel>) { }

    createCustomer(customer: Partial<CustomersModel>) {
        return this.customers.create(customer)
    }

    async findOneCustomer(username: string): Promise<CustomersModel> {
        return this.customers.findOne({ username: username })
    }
    async findOneAndUpdate(filter: FilterQuery<CustomersModel>, update: UpdateQuery<CustomersModel>) {
        return this.customers.findOneAndUpdate(filter, update, { new: true })
    }
}
