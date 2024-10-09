import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CustomersService],
  exports: [CustomersService]
})
export class CustomersModule { }
