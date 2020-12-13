import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { BicycleModule } from './bicycle/bicycle.module';

@Module({
	imports: [UserModule, BicycleModule],
})
export class AppModule {}
