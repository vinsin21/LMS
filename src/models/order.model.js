const mongoose = require('mongoose')
const { AvailablePaymentProviders, PaymentProviderEnum } = require('../constant')
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2')


const orderSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    paymentProvider: {
        type: String,
        enum: AvailablePaymentProviders,
        default: PaymentProviderEnum.UNKNOWN,
    },
    paymentId: {
        type: String,            // razorpayOrder.id, or if we are using any other payment gateway
    },
    // This field shows if the payment is done or not
    isPaymentDone: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true })


orderSchema.plugin(mongooseAggregatePaginate)

const Order = mongoose.model("Order", orderSchema)

module.exports = Order