// Importing package
import { Schema, model } from "mongoose";

// Importing interfaces
import { NotificationInterface } from "../interfaces/models.interface";
const schema = new Schema<NotificationInterface>(
    {
        notificationId: { type: String, required: true },
        senderId: { type: String, required: true },
        receiverId: { type: String, required: true },
        message: { type: String, required: true },
        link: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default model<NotificationInterface>("notifications", schema);
