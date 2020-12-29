import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<any> {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.use(json({
		limit: '50mb',
	}));
	await app.listen(3000);
}
bootstrap();
