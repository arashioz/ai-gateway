import { Module, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { PlansService } from './plans.service';
import { DatabaseModule } from 'src/database/database.module';
import { PlanList } from 'src/common/types/plan.type';

@Module({
  imports: [DatabaseModule],
  providers: [PlansService],
  exports: [PlansService]
})
export class PlansModule implements OnApplicationBootstrap {
  constructor(private readonly planService: PlansService) { }
  async onApplicationBootstrap() {
    let allPlans = await this.planService.findAllPlan()

    PlanList.forEach(async (p, idx) => {
      let plan = PlanList[idx]

      if (allPlans[idx].planName !== plan) {
        return await this.planService.createPlan({
          planName: plan,
          requestCount: 0,
          requestCountPlan: 1000

        });
      }
    })
  }
}
