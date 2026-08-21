import { authenticator } from 'otplib';
import QRCode from 'qrcode';

async function test() {
  try {
    const secret = authenticator.generateSecret();
    console.log("Secret:", secret);
    const otpauth = authenticator.keyuri('test@test.com', 'Workforce Analytics', secret);
    console.log("OTPAuth:", otpauth);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);
    console.log("QR Length:", qrCodeDataUrl.length);
    console.log("Success");
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
