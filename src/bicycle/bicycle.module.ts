import { Module } from '@nestjs/common';
import { BicycleController } from './bicycle.controller';
import { BicycleService } from './bicycle.service';
import { BicycleGateway } from './bicycle.gateway';
import { SystemModule } from 'src/system/system.module';

@Module({
	controllers: [BicycleController],
	providers: [BicycleService, BicycleGateway],
	imports: [SystemModule],
})
export class BicycleModule {}
