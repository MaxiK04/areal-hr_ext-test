import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PositionsModule } from './modules/positions/positions.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { FilesModule} from './modules/files/files.module';
import { HrOperationsModule } from './modules/hr_operations/hr-operations.module'
import { LogsModule } from './modules/logs/logs.module'
import { UsersModule } from  './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guard/roles.guard';
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
    HrOperationsModule,
    LogsModule,
    UsersModule,
    AuthModule,
  ],
 // providers: [
 //    {
 //      provide: APP_GUARD,
 //      useClass: JwtAuthGuard,
 //    },
 //    {
 //      provide: APP_GUARD,
 //      useClass: RolesGuard,
 //    },
 //  ],
})
export class AppModule {}