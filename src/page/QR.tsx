import { imageSync } from "qr-image";

export const QR = ({ id }: { id: string }) => {
	const code = imageSync("test");
	const qrDataURL = `data:image/png;base64,${code.toString("base64")}`;

	return (
		<div>
			<div>QRcode</div>
			<div>id : {id}</div>
			<img src={qrDataURL} alt="QR Code" />
		</div>
	);
};
