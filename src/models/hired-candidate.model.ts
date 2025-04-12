import mongoose from "mongoose";

const hiredCandidateSchema = new mongoose.Schema({
    candidateId: { type: String, ref: "students", required: true },
    recruiterId: { type: String, ref: "recruiters", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const HiredCandidateModel = mongoose.model("hired_candidates", hiredCandidateSchema);

export default HiredCandidateModel;
