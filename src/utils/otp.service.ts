import { generate } from "otp-generator"
export function generateOtp() {
    const otp = generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    });

    return otp
}