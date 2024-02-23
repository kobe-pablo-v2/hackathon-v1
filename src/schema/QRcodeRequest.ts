import { z } from "zod";

export const QRcodeRequest = z.object({
	type: z.enum(["svg", "png"]).default("png"),
	ec_level: z.enum(["L", "M", "Q", "H"]).default("M"),
	margin: z
		.string()
		.default("0")
		.transform((v) => parseInt(v, 10)),
});

export const MIME_TYPE = {
	png: "image/png",
	svg: "mage/svg+xml",
} as const;
