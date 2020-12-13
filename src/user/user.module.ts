import { Module } from '@nestjs/common';
import { SystemModule } from 'src/system/system.module';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
@Module({
	providers: [UserGateway, UserService],
	exports: [UserService],
	imports: [SystemModule, AuthModule],
	controllers: [UserController],
})
export class UserModule {}
