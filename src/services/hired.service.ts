import HiredCandidateModel from "../models/hired-candidate.model";
import shortlistService from "./shortlist.service";
import ShortlistedCandidateModel from "../models/shorlisted-candidates";
import candidateService from "./candidate.service";

const isCandidateHired = async (candidateId: string, recruiterId: string) => {
    const hiredCandidate = await HiredCandidateModel.findOne({ candidateId, recruiterId });
    return hiredCandidate ? true : false;
};

const hireCandidate = async (candidateId: string, recruiterId: string) => {
    const isHired = await isCandidateHired(candidateId, recruiterId);

    if (isHired) {
        await HiredCandidateModel.deleteOne({ candidateId, recruiterId });
        return { message: "Candidate removed from hired" };
    }

    const isShortlisted = await shortlistService.isCandidateShortlisted(candidateId, recruiterId);

    if (isShortlisted && !isHired) {
        await ShortlistedCandidateModel.deleteOne({ candidateId, recruiterId });
    }

    const hiredCandidate = await HiredCandidateModel.create({ candidateId, recruiterId });
    return { message: "Candidate hired successfully", data: hiredCandidate };
};

const getAllHiredCandidates = async (recruiterId: string, query?: any) => {
    const hiredCandidates = await HiredCandidateModel.find({ recruiterId });
    const hiredIds = hiredCandidates.map((candidate) => candidate.candidateId);

    const allCandidates = await candidateService.getAllCandidates(recruiterId, query);
    return allCandidates.filter((candidate: any) => hiredIds.includes(candidate.candidateId));
};

const getHiredCandidateById = async (candidateId: string, recruiterId: string) => {
    const hiredCandidate = await candidateService.getCandidateById(candidateId, recruiterId);
    return hiredCandidate;
};

export default {
    getAllHiredCandidates,
    getHiredCandidateById,
    hireCandidate,
};
