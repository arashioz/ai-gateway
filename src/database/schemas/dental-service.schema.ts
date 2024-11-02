import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose"
import { PlanType } from "src/common/types/plan.type"
import { Document, Types } from "mongoose";

@Schema({ versionKey: false, timestamps: true, _id: true, collection: 'dental-service' })
export class DentalServiceModel extends Document {
    @Prop({ unique: true })
    customerKey: string

    @Prop()
    folderId: string

    @Prop()
    aiReport: Array<Object>


}
export const DentalServiceSchema = SchemaFactory.createForClass(DentalServiceModel)