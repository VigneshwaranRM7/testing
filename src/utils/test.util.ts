import testConstant from "../constants/test.constant";

const isTestUser = (email: string) => {
    return testConstant.TEST_EMAILS.includes(email);
};

export default {
    isTestUser,
};
