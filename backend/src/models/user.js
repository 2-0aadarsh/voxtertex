import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    signupComplete: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["Participant", "Expert", "Business", "Freelancer"],
        default: undefined,
    },
    // Password reset fields
    resetPasswordOTP: {
        type: String,
        default: undefined,
    },
    resetPasswordOTPExpiry: {
        type: Date,
        default: undefined,
    },
    resetPasswordToken: {
        type: String,
        default: undefined,
    },
    resetPasswordTokenExpiry: {
        type: Date,
        default: undefined,
    },
    lastOTPRequest: {
        type: Date,
        default: undefined,
    },
    otpRequestCount: {
        type: Number,
        default: 0,
    }
},

    {
        timestamps: true,
    },
);

userSchema.index({
    firstName: 'text',
    lastName: 'text'
});

const User = mongoose.model("User", userSchema);
export default User;
