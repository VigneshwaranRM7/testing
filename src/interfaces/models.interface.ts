import { Model } from "mongoose";

interface AuditInfoInterface {
    createdAt: Date;
    updateAt: Date;
}

interface InstitutionInterface extends AuditInfoInterface {
    institutionId: string;
    name: string;
    email: string;
    profilePictureUrl: string;
    profilePictureKey: string;
    domainName: string;
    establishmentYear: string;
    establishmentMonth: string;
    address: string;
    contact: string;
    institutionType: string;
    about: string;
    isActive: boolean;
}

interface StudentInterface extends AuditInfoInterface {
    studentId: string;
    name: string;
    email: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber: string;
    about: string;
    isActive: boolean;
    googleId: string;
    password: string;
    profilePictureUrl: string;
    profilePictureKey: string;
    socialMedia: {
        linkedIn: string;
        instagram: string;
        twitter: string;
        facebook: string;
        behance: string;
        personalWebsite: string;
    };
    isPasswordSetUpCompleted: boolean;
    isEmailVerified: boolean;
    isOnBoardingCompleted: boolean;
    isProfileCompleted: boolean;
}

export interface RephraseDataInterface {
    rephraseTotalCount: number;
    rephraseLimitExceeded: boolean;
    rephrasePendingCount: number;
}

interface StudentModelWithStatic extends Model<StudentInterface> {
    updateRephraseData: (studentId: string, rephraseData: RephraseDataInterface) => Promise<StudentInterface | null>;
}

interface InstitutionStudentMappingInterface extends AuditInfoInterface {
    institutionStudentMappingId: string;
    institutionId: string;
    studentId: string;
    departmentId: string;
    rollNumber: string;
    batch: string;
    isActive: boolean;
}

interface StudentSignUpTokenInterface extends AuditInfoInterface {
    studentSignUpTokenId: string;
    studentId: string;
    token: string;
}

interface StudentSessionTokenInterface extends AuditInfoInterface {
    studentSessionTokenId: string;
    token: string;
}

interface MasterSkillCategoryInterface extends AuditInfoInterface {
    masterSkillCategoryId: string;
    name: string;
    isActive: boolean;
}

interface SubSkillCategoryInterface extends AuditInfoInterface {
    subSkillCategoryId: string;
    masterSkillCategoryId: string;
    name: string;
    isActive: boolean;
}

interface skillInterface extends AuditInfoInterface {
    skillId: string;
    subSkillCategoryId: string;
    name: string;
    isActive: boolean;
}

interface StudentPasswordResetTokenInterface extends AuditInfoInterface {
    studentPasswordResetTokenId: string;
    studentId: string;
}

interface YouTubeCourseInterface extends AuditInfoInterface {
    youtubeCourseId: string;
    youtubePlaylistId: string;
    studentId: string;
    courseMetaData: object;
    courseContent: object;
    courseProgress: object;
}

interface EducationInterface extends AuditInfoInterface {
    educationId: string;
    studentId: string;
    degree: string;
    branch: string;
    institutionName: string;
    rollNumber: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    grade: string;
    gradeType: string;
    description: string;
    verifierEmail: string;
    isVerified: boolean;
    organizationWebsiteUrl: string;
    status: string;
}

interface WorkExperienceInterface extends AuditInfoInterface {
    workExperienceId: string;
    studentId: string;
    role: string;
    companyName: string;
    employeeId: string;
    workType: string;
    location: string;
    locationType: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    organizationWebsiteUrl: string;
    currentlyWorking: boolean;
    description: string;
    verifierEmail: string;
    isVerified: boolean;
    status: string;
}

interface LicenseAndCertificateInterface extends AuditInfoInterface {
    credentialId: string;
    studentId: string;
    name: string;
    issuedOrganization: string;
    // doneVia: string;
    issueMonth: string;
    issueYear: string;
    expirationMonth: string;
    expirationYear: string;
    credentialID: string;
    credentialURL: string;
    noExpirationDate: boolean;
    youtubeLearningId: string;
    youtubeAssessmentId: string;
    isVerified: boolean;
}

interface ProjectInterface extends AuditInfoInterface {
    projectId: string;
    studentId: string;
    associationId: string;
    associationType: string;
    name: string;
    description: string;
    projectType: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    currentlyWorking: boolean;
    projectLink: string;
    organizationWebsiteUrl: string;
    verifierEmail: string;
    isVerified: boolean;
    otherAssociationName?: string;
    status: string;
}

interface OtherActivityInterface extends AuditInfoInterface {
    otherActivityId: string;
    studentId: string;
    name: string;
    organizationOrVenue: string;
    activityType: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    description: string;
}

interface ProfileVerificationInterface extends AuditInfoInterface {
    profileVerificationId: string;
    studentId: string;
    verifierEmail: string;
    associationType: string;
    isVerified: boolean;
    associationId: string;
    revisions: Array<{
        revisionDate: Date;
        comments: string;
    }>;
}

interface NotificationInterface extends AuditInfoInterface {
    notificationId: string;
    senderId: string;
    receiverId: string;
    message: string;
    link: string;
    isRead: boolean;
}

interface InterestBasedSkillMappingInterface extends AuditInfoInterface {
    interestBasedSkillMappingId: string;
    studentId: string;
    skillId: string;
}

interface RoleBasedSkillMappingInterface extends AuditInfoInterface {
    roleBasedSkillMappingId: string;
    studentId: string;
    skillId: string;
    associationType: string;
    associationId: string;
    isEndorsed: boolean;
    isHit: boolean;
}

interface YoutubeLearningInterface extends AuditInfoInterface {
    youtubeLearningId: string;
    playlistId?: string;
    studentId: string;
    courseMetaData: any;
    courseContent: any;
    courseProgress: any;
    status: string;
    skillBadges: string[];
}

interface EmailTemplateInterface extends AuditInfoInterface {
    emailTemplateId: string;
    name: string;
    htmlContent: string;
    isActive: boolean;
}

interface YoutubeLearningNotesInterface extends AuditInfoInterface {
    youtubeLearningNotesId: string;
    youtubeLearningId: string;
    videoId: string;
    notes: string;
    timestamp: number;
}

interface EndorsementInterface extends AuditInfoInterface {
    endorsementId: string;
    roleBasedSkillMappingId: string;
}

interface RephraseLimitTrackInterface extends AuditInfoInterface {
    studentId: string;
    rephraseCurrentCount: number;
    rephrasePendingCount: number;
    rephraseLimitExceeded: boolean;
    rephraseTotalCount: number;
}

interface RephraseLimitTrackModelWithStatic extends Model<RephraseLimitTrackInterface> {
    findByStudentId: (studentId: string) => Promise<RephraseLimitTrackInterface | null>;
    updateRephraseLimit: (
        studentId: string,
        rephraseCurrentCount: number,
        rephrasePendingCount: number
    ) => Promise<RephraseLimitTrackInterface | null>;
}

interface VideoDetail extends AuditInfoInterface {
    videoId: string;
    videoTitle: string;
}

interface YoutubeAssessmentInterface extends AuditInfoInterface {
    youtubeAssessmentId: string;
    youtubeLearningId: string;
    status: string;
    correctAnswers: number;
    totalQuestions: number;
    score: number;
    studentId: string;
    certificateUrl: string;
    updatedAt: any;
    createdAt: any;
}

interface PlaylistVideosResponse {
    videoDetails: VideoDetail[];
    playlistTitle: string;
    createdAt: Date;
    updatedAt: Date;
}

interface SubmitAnswerBody {
    answers: { questionId: string; selectedAnswer: number }[];
}

interface SaveAnswerBody {
    answers?: { questionId: string; selectedAnswer: number }[];
    action?: "start" | "save" | "timeout";
}

interface YoutubeAssessmentMcqInterface {
    youtubeAssessmentMcqId: string;
    youtubeAssessmentId: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    lastSavedAnswerIndex: number;
    playlistId: string;
    studentId: string;
    youtubeLearningId: string;
}

interface YoutubeAssessmentMcqModelInterface extends Model<YoutubeAssessmentMcqInterface> {
    createMCQs: (mcqs: YoutubeAssessmentMcqInterface[]) => Promise<YoutubeAssessmentMcqInterface[]>;
}

interface CertificateTemplateInterface {
    certificateTemplateId: string;
    name: string;
    htmlContent: string;
    isActive: boolean;
}

interface ResumeTemplateInterface {
    resumeTemplateId: string;
    name: string;
    htmlContent: string;
    isActive: boolean;
}

interface ResumeModelInterface {
    resumeId: string;
    studentId: string;
    resumeTemplateId: string;
    skillIds: string[];
    resumeUrl: string;
}

interface CollaboratorProductTagsInterface extends AuditInfoInterface {
    tag_id: string;
    tag_name: string;
    collaborator_id: string;
    is_global: boolean;
    is_active: boolean;
}

export {
    EducationInterface,
    EmailTemplateInterface,
    EndorsementInterface,
    InterestBasedSkillMappingInterface,
    InstitutionInterface,
    InstitutionStudentMappingInterface,
    LicenseAndCertificateInterface,
    MasterSkillCategoryInterface,
    NotificationInterface,
    OtherActivityInterface,
    ProfileVerificationInterface,
    ProjectInterface,
    RoleBasedSkillMappingInterface,
    skillInterface,
    StudentInterface,
    StudentModelWithStatic,
    StudentPasswordResetTokenInterface,
    StudentSessionTokenInterface,
    StudentSignUpTokenInterface,
    SubSkillCategoryInterface,
    WorkExperienceInterface,
    YouTubeCourseInterface,
    YoutubeLearningInterface,
    YoutubeLearningNotesInterface,
    RephraseLimitTrackInterface,
    RephraseLimitTrackModelWithStatic,
    VideoDetail,
    PlaylistVideosResponse,
    YoutubeAssessmentInterface,
    SubmitAnswerBody,
    SaveAnswerBody,
    YoutubeAssessmentMcqInterface,
    CertificateTemplateInterface,
    ResumeTemplateInterface,
    ResumeModelInterface,
    CollaboratorProductTagsInterface,
};
