import { IPaginatedQuery } from "../../common/paginated-query.interface";

export interface IUsersFindAllPaginatedOptions extends IPaginatedQuery{
	username?: string;
	role?: string;
}