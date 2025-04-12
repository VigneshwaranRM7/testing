import mongoose from 'mongoose';

const shortlistedCandidateSchema = new mongoose.Schema({
  candidateId: { type: String, ref: 'students', required: true },
  recruiterId: { type: String, ref: 'recruiters', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ShortlistedCandidateModel = mongoose.model('shortlisted_candidates', shortlistedCandidateSchema);

export default ShortlistedCandidateModel;
