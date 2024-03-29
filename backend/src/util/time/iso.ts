import { z } from "zod";

export const ISOtime = z.string().datetime({ offset: true });

export const getYear = (ISOString: string) => ISOString.slice(0, 4);

export const getMonth = (ISOString: string) => ISOString.slice(5, 7);

export const ToISOPrefixYearAndMonth = (year: string, month: string) =>
	`${year}-${month}%`;
