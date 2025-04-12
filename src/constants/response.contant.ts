const responseConstants = {
    users: {
        register: "Collaborator registered succcessfully",
        login: "Collaborator logged in successfully",
        otp: "OTP sent successfully",
        verifyOtp: "OTP verified successfully",
        logout: "Collaborator logged out successfully",
        verifySession: "Session verified successfully",
        forgotPassword: "Forgot password link sent successfully",
    },
    collaborators: {
        profile: "Collaborator profile details",
        profileFetchedSuccessfully: "Collaborator profile fetched successfully",
        profileUpdatedSuccessfully: "Collaborator profile updated successfully",
        profileDeletedSuccessfully: "Collaborator profile deleted successfully",
    },
    products: {
        getAllProducts: "Products fetched successfully",
        getProductById: "Product fetched successfully",
        createProduct: "Product created successfully",
        updateProduct: "Product updated successfully",
        deleteProduct: "Product deleted successfully",
        assignProductToStudent: "Product assigned to students successfully",
        getProductAnalytics: "Product analytics fetched successfully",
        completeProductAssignment: "Product assignment completed successfully",
        checkStudentDetails: "Student details checked successfully",
    },
    billing: {
        getAllPlans: "Plans fetched successfully",
        getActivePlan: "Active plan fetched successfully",
        selectPlan: "Plan selected successfully",
        calculatePaymentAmount: "Payment amount calculated successfully",
        createPaymentOrder: "Payment order created successfully",
        verifyPayment: "Payment verified successfully",
    },
};

export default responseConstants;
