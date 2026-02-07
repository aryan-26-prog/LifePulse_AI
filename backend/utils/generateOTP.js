const otpGenerator = require("otp-generator");

module.exports = () => {

  return otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false
  });

};
