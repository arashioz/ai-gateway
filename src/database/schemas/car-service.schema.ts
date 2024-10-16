import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose"
import { PlanType } from "src/common/types/plan.type"
import { Document, Types } from "mongoose";

import { ApiKey } from "./customer.schema"
import { PlanModels } from "./plan.schema"

@Schema({ versionKey: false, timestamps: true, _id: true, collection: 'car-service' })
export class CarServiceModel extends Document {
    @Prop({ unique: true })
    customerKey: string

    @Prop()
    rawImageFileIds: Array<string>

    @Prop()
    processedImageFileIds:Array<string>

    @Prop()
    folderId: string


}
export const CarServiceSchema = SchemaFactory.createForClass(CarServiceModel)