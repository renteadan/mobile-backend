import { AuthRequest } from './AuthRequest';

export interface IBikesListRequest extends AuthRequest {
  body: IBikesListFilters;
}

export interface IBikesListFilters {
  orderBy?: string;
  order?: string;
  userId: number;
  bikeId?: number;
  skip?: number;
  limit?: number;
}