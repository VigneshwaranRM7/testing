import ShortlistedCandidateModel from "../models/shorlisted-candidates";
import candidateService from "./candidate.service";

const isCandidateShortlisted = async (candidateId: string, recruiterId: string) => {
    const shortlistedCandidate = await ShortlistedCandidateModel.findOne({ candidateId, recruiterId });
    return shortlistedCandidate ? true : false;
};
// Shortlisted candidates
const getAllShortlistedCandidates = async (recruiterId: string, query?: any) => {
    const shortlistedCandidates = await ShortlistedCandidateModel.find({ recruiterId });
    const shortlistedIds = shortlistedCandidates.map((candidate) => candidate.candidateId);
    const allCandidates = await candidateService.getAllCandidates(recruiterId, query);
    return allCandidates.filter((candidate: any) => shortlistedIds.includes(candidate.candidateId));
};

const shortlistCandidate = async (candidateId: string, recruiterId: string) => {
    const isShortlisted = await isCandidateShortlisted(candidateId, recruiterId);

    if (isShortlisted) {
        await ShortlistedCandidateModel.deleteOne({ candidateId, recruiterId });
        return { message: "Candidate removed from shortlist" };
    }

    const shortlistedCandidate = await ShortlistedCandidateModel.create({ candidateId, recruiterId });
    return { message: "Candidate shortlisted successfully", data: shortlistedCandidate };
};

const getShortlistedCandidateById = async (candidateId: string, recruiterId: string) => {
    const shortlistedCandidate = await candidateService.getCandidateById(candidateId, recruiterId);
    return shortlistedCandidate;
};

export default {
    getAllShortlistedCandidates,
    shortlistCandidate,
    isCandidateShortlisted,
    getShortlistedCandidateById,
};
