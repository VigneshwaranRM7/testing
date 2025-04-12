import mongoose from "mongoose";
export interface IRecruiter {
    recruiterId: string;
    name: string;
    email: string;
    password?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    profilePictureUrl?: string;
    googleId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const recruiterSchema = new mongoose.Schema<IRecruiter>(
    {
        recruiterId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        profilePictureUrl: {
            type: String,
        },
        googleId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

recruiterSchema.pre("save", async function (next) {
    const recruiter = this;

    if (!recruiter.isModified("password")) {
        return next();
    }

    if (!recruiter?.password) {
        return next();
    }

    next();
});

const recruiterModel = mongoose.model<IRecruiter>("recruiters", recruiterSchema);

export default recruiterModel;
