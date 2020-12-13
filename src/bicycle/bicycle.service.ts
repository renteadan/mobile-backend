import { Injectable } from '@nestjs/common';
import { IBikesListFilters } from 'src/requests/TransactionsListRequest';
import { BicycleGateway } from './bicycle.gateway';
import { IBicycle } from './models/Bicycle';

@Injectable()
export class BicycleService {
	constructor(private gateway: BicycleGateway) {}

	async getBicyclesWithFilters(filters: IBikesListFilters): Promise<IBicycle[]> {
		const result = await this.gateway.getBicyclesWithFilters(filters);
		return result;
	}

	async countBicyclesWithFilters(filters: IBikesListFilters): Promise<number> {
		const result = await this.gateway.countBicyclesWithFilters(filters);
		return result.count;
	}
}
