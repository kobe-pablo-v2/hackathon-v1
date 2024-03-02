import { RouteHandler } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import {
	ConfirmedShiftRepositoryFactory,
	GetUserInContextFactory,
	ShiftRequestRepositoryFactory,
} from "../../factoryType";
import { getMonth, getYear } from "../../util/time/iso";
import {
	GetConfirmedInMonthRouter,
	UpdateShiftRequestInMonthRouter,
} from "./router";

export const useUpdateShiftRequestInMonthHandler =
	(
		shiftRequestRepositoryFactory: ShiftRequestRepositoryFactory,
		getUserInContextFactory: GetUserInContextFactory,
	): RouteHandler<typeof UpdateShiftRequestInMonthRouter> =>
	async (c) => {
		const shiftTime = c.req.valid("json");

		await shiftRequestRepositoryFactory(c).deleteInMonth(
			getUserInContextFactory(c)().id,
			getYear(shiftTime[0][0]),
			getMonth(shiftTime[0][0]),
		);

		await shiftRequestRepositoryFactory(c).insert({
			userID: getUserInContextFactory(c)().id,
			shiftTime,
		});

		return c.body(null, StatusCodes.OK);
	};

export const useGetConfirmedShiftInMonthHandler =
	(
		confirmedShiftRepositoryFactory: ConfirmedShiftRepositoryFactory,
	): RouteHandler<typeof GetConfirmedInMonthRouter> =>
	async (c) => {
		const year = c.req.query("year");
		const month = c.req.query("month");
		if (year == null || month == null) {
			return c.json(
				{ message: "require year and month" },
				StatusCodes.BAD_REQUEST,
			);
		}

		const shifts = await confirmedShiftRepositoryFactory(c).findInMonth(
			year,
			month,
		);

		return c.json(
			shifts.map((s) => {
				return {
					userID: s.userID,
					shiftTime: s.shiftTime,
				};
			}),
			StatusCodes.OK,
		);
	};