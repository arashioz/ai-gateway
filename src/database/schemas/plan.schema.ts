import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export interface PlanInterface {
    planName: string
    requestCount: number;
    requestCountPlan: number;
}

@Schema({ versionKey: false, timestamps: true, _id: true, collection: 'plans' })
export class PlanModels extends Document {
    @Prop({ required: true, unique: true })
    planName: string

    @Prop({ default: 0 })
    requestCount: number;

    @Prop({ default: 1000 })
    requestCountPlan: number;

}
export const PlanSchema = SchemaFactory.createForClass(PlanModels)