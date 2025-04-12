import mongoose from "mongoose";

export interface ICollaboratorProductStudents {
    collaborator_product_students_id: string;
    collaborator_id: string;
    product_id: string;
    student_id: string;
    is_active: boolean;
    email: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    collaborator_student_tags: string[];
    payment_id: string;
}

const collaboratorProductStudentsSchema = new mongoose.Schema<ICollaboratorProductStudents>(
    {
        collaborator_product_students_id: {
            type: String,
            required: true,
            unique: true,
        },
        collaborator_id: {
            type: String,
            required: true,
        },
        product_id: {
            type: String,
            required: true,
        },
        student_id: {
            type: String,
            required: true,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        email: {
            type: String,
            required: true,
            unique: false,
        },
        name: {
            type: String,
        },
        collaborator_student_tags: {
            type: [String],
        },
        payment_id: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    }
);

const CollaboratorProductStudentsModel = mongoose.model<ICollaboratorProductStudents>(
    "collaborator_product_students",
    collaboratorProductStudentsSchema
);

export default CollaboratorProductStudentsModel;
