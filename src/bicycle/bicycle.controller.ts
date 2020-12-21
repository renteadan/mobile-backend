import { Controller, Post, UseGuards, Request, Get, Param, Query, Put, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthRequest } from 'src/requests/AuthRequest';
import { IBikesListFilters } from 'src/requests/TransactionsListRequest';
import { BicycleService } from './bicycle.service';
import { IBicycle } from './models/Bicycle';
import { IBikeListResponse } from './models/ListResponse';

@Controller('bicycle')
export class BicycleController {

	constructor(private service: BicycleService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	async getBicycles(@Request() req: AuthRequest): Promise<IBikeListResponse> {
		const { userId } = req.user;
		const filters: IBikesListFilters = {
			userId,
		};
		const bicycles = await this.service.getBicyclesWithFilters(filters);
		const bicyclesCount = await this.service.countBicyclesWithFilters(filters);
		return {
			data: bicycles,
			metadata: {
				count: bicyclesCount,
			},
		};
	}

  @UseGuards(JwtAuthGuard)
	@Get('list')
	async getBicyclesWithFilters(@Request() req: AuthRequest, @Query() query: IBikesListFilters): Promise<IBikeListResponse> {
		const skip = +query.skip;
		const limit = +query.limit;
		const { userId } = req.user;
		const filters: IBikesListFilters = {
			userId,
			...query,
			skip,
			limit,
		};
		const bicycles = await this.service.getBicyclesWithFilters(filters);
		const bicyclesCount = await this.service.countBicyclesWithFilters(filters);
		return {
			data: bicycles,
			metadata: {
				count: bicyclesCount,
			},
		};
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
  async getBicycle(@Request() req: AuthRequest, @Param('id') bikeId: number): Promise<IBicycle> {
  	const { userId } = req.user;
  	const filters: IBikesListFilters = {
  		userId,
  		bikeId,
  	};
  	const [bicycle] = await this.service.getBicyclesWithFilters(filters);
  	return bicycle;
  }

  @UseGuards(JwtAuthGuard)
	@Put(':id')
	async updateBycicle(@Request() req: AuthRequest, @Param('id') bikeId: number, @Body() body: IBicycle): Promise<void> {
  	const { userId } = req.user;
  	await this.service.updateBike(userId, bikeId, body);
  	return;
	}
}
