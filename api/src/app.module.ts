import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PositionsModule } from './modules/positions/positions.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { FilesModule} from './modules/files/files.module';
import { HrOperationsModule } from './modules/hr_operations/hr-operations.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    OrganizationsModule,
    DepartmentsModule,
    PositionsModule,
    EmployeesModule,
    FilesModule,
    HrOperationsModule
  ],
})
export class AppModule {}