import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { PlanModels } from "./plan.schema";
import { PlanType } from "src/common/types/plan.type";

export class ApiKey {
    @Prop()
    key: string
    @Prop()
    iv: string
}

@Schema({ versionKey: false, timestamps: true, _id: true, collection: 'customers' })
export class CustomersModel extends Document {
    @Prop({ unique: true })
    username: string

    @Prop()
    password: string

    @Prop({ required: true, unique: true, type: ApiKey })
    apiKey: ApiKey

    @Prop()
    accessServices: PlanType[]

    @Prop()
    planDetails?: PlanModels[]

}
export const CustomersSchema = SchemaFactory.createForClass(CustomersModel)