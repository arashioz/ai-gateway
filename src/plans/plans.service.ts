import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { PlanInterface, PlanModels } from 'src/database/schemas/plan.schema';

@Injectable()
export class PlansService {
    constructor(@InjectModel(PlanModels.name) private readonly plans: Model<PlanModels>) { }

    createPlan(plan: PlanInterface) {
        return this.plans.create(plan)
    }
    findAllPlan(filter?: FilterQuery<PlanModels>):Promise<PlanModels[]> {
        return this.plans.find(filter)
    }
    findOnePlan(filter:FilterQuery<PlanModels>):Promise<PlanModels>{
        return this.plans.findOne(filter)
    }
}
