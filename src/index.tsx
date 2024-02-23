import { Hono } from "hono";
import { QR } from "./page/QR";
import { QRcodeRequest, MIME_TYPE } from "./schema/QRcodeRequest";

export const app = new Hono({ strict: false });

app.get("/qr", (c) => {
	const query = c.req.query();
	const options = QRcodeRequest.parse(query);
	c.header("Content-Type", MIME_TYPE[options.type]);
	c.status(201);
	return c.html(
		// biome-ignore lint/a11y/useHtmlLang: <explanation>
		<html>
			<QR id={"test"} />
		</html>,
	);
});

export default app;
