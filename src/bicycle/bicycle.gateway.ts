import { Injectable } from '@nestjs/common';
import { IBikesListFilters } from 'src/requests/TransactionsListRequest';
import { ConfigProvider } from 'src/system/ConfigProvider';
import { Database } from 'src/system/database';
import { IBicycle } from './models/Bicycle';

const defaultOrderBy = 'id';
const defaultOrderByList = ['name', 'model'];
const defaultOrder = 'asc';
const defaultOrderList = ['asc', 'desc'];

@Injectable()
export class BicycleGateway extends Database {
	table: string;
	usersTable: string;
	constructor(configManager: ConfigProvider) {
		super(configManager);
		this.table = 'bicycles';
		this.usersTable = 'users';
	}

	getBicyclesWithFilters(filters: IBikesListFilters): Promise<any> {
		const queryBuilder = this.queryBuilder;
		let query = queryBuilder.columns('*')
			.from(this.table)
			.where('user_id', filters.userId);

		if (filters.bikeId && Number.isInteger(filters.bikeId)) {
			query = query.where('id', filters.bikeId);
		}

		if (Number.isInteger(filters.limit) && filters.limit >= 0 ) {
			query = query.limit(filters.limit);
		}

		if (Number.isInteger(filters.skip) && filters.skip >= 0 ) {
			query = query.offset(filters.skip);
		}

		if (filters.name) {
			query = query.where('name',  'like', `%${filters.name.toLowerCase()}%`);
		}

		if (filters.orderBy && defaultOrderByList.includes(filters.orderBy)) {
			if (filters.order && defaultOrderList.includes(filters.order)) {
				query = query.orderBy(filters.orderBy, filters.order);
			} else {
				query = query.orderBy(filters.orderBy, defaultOrder);
			}
		} else {
			query = query.orderBy(defaultOrderBy, defaultOrder);
		}

		const sql = query.toQuery().toString();

		return this.query({
			sql,
		});
	}

	countBicyclesWithFilters(filters: IBikesListFilters): Promise<any> {
		const queryBuilder = this.queryBuilder;
		let query = queryBuilder.columns()
			.count('id', {
				as: 'count',
			})
			.from(this.table)
			.where('user_id', filters.userId);

		if (filters.bikeId && Number.isInteger(filters.bikeId)) {
			query = query.where('id', filters.bikeId);
		}

		if (filters.orderBy && defaultOrderByList.includes(filters.orderBy)) {
			if (filters.order && defaultOrderList.includes(filters.order)) {
				query = query.orderBy(filters.orderBy, filters.order);
			} else {
				query = query.orderBy(filters.orderBy, defaultOrder);
			}
		} else {
			query = query.orderBy(defaultOrderBy, defaultOrder);
		}

		const sql = query.toQuery().toString();

		return this.query({
			sql,
		});
	}

	updateBike(userId: number, id: number, bike: IBicycle): Promise<any> {
		const sql = `
		UPDATE ${this.table} SET ? WHERE id = ? AND user_id = ?;
		`;
		delete bike.id;
		delete bike.user_id;

		return this.query({
			sql,
			values: [bike, id, userId],
		});
	}
}
