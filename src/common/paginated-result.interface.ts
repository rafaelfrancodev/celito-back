export interface IPaginatedResult<T> {
	data: T[];
	page: number;
	pageSize: number;
	hasNextPage: boolean;
}