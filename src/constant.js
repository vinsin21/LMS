const DBName = "LMS"

const LoginTypeEnum = {
    GOOGLE: "GOOGLE",
    EMAIL_PASSWORD: "EMAIL_PASSWORD"
}
const avialableLoginType = Object.values(LoginTypeEnum)


const UserRoleEnum = {
    USER: "USER",
    ADMIN: "ADMIN"
}
const avialableUserRoles = Object.values(UserRoleEnum)

const ActivationTokenExpiry = 5 * 60 * 1000  // min

const PaymentProviderEnum = {
    UNKNOWN: "UNKNOWN",
    RAZERPAY: "RAZERPAY",
    PAYPAL: "PAYPAL",
}

const AvailablePaymentProviders = Object.values(PaymentProviderEnum);

module.exports = {
    DBName,
    LoginTypeEnum,
    avialableLoginType,
    UserRoleEnum,
    avialableUserRoles,
    ActivationTokenExpiry,
    PaymentProviderEnum,
    AvailablePaymentProviders
}