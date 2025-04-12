// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { OtherActivityInterface } from "../interfaces/models.interface";
const schema = new Schema<OtherActivityInterface>(
    {
        otherActivityId: { type: String, required: true },
        studentId: { type: String, required: true },
        name: { type: String, required: true },
        organizationOrVenue: { type: String, required: true },
        activityType: { type: String, required: true },
        startMonth: { type: String, required: true },
        startYear: { type: String, required: true },
        endMonth: { type: String, required: true },
        endYear: { type: String, required: true },
        description: { type: String, required: false },
    },
    { timestamps: true }
);

export default model<OtherActivityInterface>("other_activities", schema);
