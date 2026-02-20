export async function sendEmail(email, otpCode, purpose) {
  // Implement your email sending logic here using nodemailer or any email service
  console.log(`Sending OTP ${otpCode} to ${email} for purpose: ${purpose}`);
}
