import { Response } from "express";
import { HttpStatusCode } from "axios";
import catchAsync from "../utils/catch-async";
import collaboratorService from "../services/collaborator.service";
import { responseConstants } from "../constants";

const handleGetProfile = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const profile = await collaboratorService.getCollaboratorById(collaborator.collaborator_id);

    res.status(HttpStatusCode.Ok).json({
        message: responseConstants.collaborators.profileFetchedSuccessfully,
        data: profile,
    });
});

const handleUpdateProfile = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const profile = await collaboratorService.updateCollaborator(
        collaborator.collaborator_id,
        req.body,
        req.files?.profile_picture?.[0]?.location
    );

    res.status(HttpStatusCode.Ok).json({
        message: responseConstants.collaborators.profileUpdatedSuccessfully,
        data: profile,
    });
});

const handleDeleteProfile = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    await collaboratorService.deleteCollaborator(collaborator);

    res.status(HttpStatusCode.Ok).json({
        message: responseConstants.collaborators.profileDeletedSuccessfully,
    });
});

const handleUpdatePassword = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    await collaboratorService.updateCollaborator(collaborator.collaborator_id, req.body);

    res.status(HttpStatusCode.Ok).json({
        message: "Password updated successfully",
    });
});

export default {
    handleGetProfile,
    handleUpdateProfile,
    handleDeleteProfile,
    handleUpdatePassword,
};
