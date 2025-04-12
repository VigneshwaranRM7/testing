// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { EndorsementInterface } from "../interfaces/models.interface";

const schema = new Schema<EndorsementInterface>(
    {
        endorsementId: { type: String, required: true },
        roleBasedSkillMappingId: { type: String, required: true },
    },
    { timestamps: true }
);

export default model<EndorsementInterface>("endorsements", schema);
