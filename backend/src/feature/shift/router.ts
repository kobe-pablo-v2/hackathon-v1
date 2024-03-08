import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import { MIME } from "../../util/mime";
import { ErrorResponse, UserSecurity } from "../../util/schema";
import {
	GetConfirmedInMonthRequestQuery,
	GetConfirmedInMonthResponseSchema,
	GetMyConfirmedInMonthResponseSchema,
	ListShiftRequestInMonthRequestQuery,
	ListShiftRequestInMonthSchema,
	UpdateConfirmedShiftInMonthSchema,
	UpdateShiftRequestInMonthSchema,
} from "./schema";

export const UpdateShiftRequestInMonthRouter = createRoute({
	method: "patch",
	path: "/api/employee/shiftRequest",
	request: {
		body: {
			content: {
				[MIME.json]: {
					schema: UpdateShiftRequestInMonthSchema,
				},
			},
		},
	},
	responses: {
		[StatusCodes.OK]: {
			description: "successfully update shift request",
		},
		...ErrorResponse,
	},
	security: [{ type: ["Bearer"], in: ["headers"] }],
});

export const ListShiftRequestInMonthRouter = createRoute({
	method: "get",
	path: "/api/employer/shiftRequest",
	request: {
		query: ListShiftRequestInMonthRequestQuery,
	},
	responses: {
		[StatusCodes.OK]: {
			content: {
				[MIME.json]: {
					schema: ListShiftRequestInMonthSchema,
				},
			},
			description: "successfully update shift request",
		},
		...ErrorResponse,
	},
	...UserSecurity,
});

export const UpdateConfirmedShiftInMonthRouter = createRoute({
	method: "patch",
	path: "/api/employer/confirmedShift",
	request: {
		body: {
			content: {
				[MIME.json]: {
					schema: UpdateConfirmedShiftInMonthSchema,
				},
			},
		},
	},
	responses: {
		[StatusCodes.OK]: {
			description: "successfully update shift request",
		},
		...ErrorResponse,
	},
	security: [{ type: ["Bearer"], in: ["headers"] }],
});

export const GetConfirmedInMonthRouter = createRoute({
	method: "get",
	path: "/api/user/confirmedShift",
	request: {
		query: GetConfirmedInMonthRequestQuery,
	},
	responses: {
		[StatusCodes.OK]: {
			content: {
				[MIME.json]: {
					schema: GetConfirmedInMonthResponseSchema,
				},
			},
			description: "successfully update shift request",
		},
		...ErrorResponse,
	},
	...UserSecurity,
});

export const GetMyConfirmedInMonthRouter = createRoute({
	method: "get",
	path: "/api/employee/confirmedShift",
	request: {
		query: GetConfirmedInMonthRequestQuery,
	},
	responses: {
		[StatusCodes.OK]: {
			content: {
				[MIME.json]: {
					schema: GetMyConfirmedInMonthResponseSchema,
				},
			},
			description: "successfully update shift request",
		},
		...ErrorResponse,
	},
	...UserSecurity,
});
