import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, Min, min } from "class-validator";
import { Types } from "mongoose";
import { CustomersModel } from "src/database/schemas/customer.schema";
import { PlanList, PlanType } from "../types/plan.type";
import { PlanModels } from "src/database/schemas/plan.schema";

export class Register {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    username: string;
    @ApiProperty()
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    @ApiProperty({ example: PlanList })
    accessServices: PlanType[]

}
export class RegisterRs extends Register {
    constructor(customer: CustomersModel) {
        super()
        this.username = customer.username
        this.accessServices = customer.accessServices
    }
}