import skillModel from "../models/skill.model";
import logger from "../config/logger";
import { skillInterface } from "../interfaces/models.interface";

/**
 * Gets unique skills from the database, removing duplicates based on name (case-insensitive)
 * @returns Array of unique skill objects
 */
export const getUniqueSkills = async (): Promise<skillInterface[]> => {
    const allSkills = await skillModel.find({ isActive: true });
    const uniqueSkillsMap = new Map();

    allSkills.forEach((skill) => {
        if (!uniqueSkillsMap.has(skill.name.toLowerCase())) {
            uniqueSkillsMap.set(skill.name.toLowerCase(), skill);
        }
    });

    return Array.from(uniqueSkillsMap.values());
};

/**
 * Matches a list of skill names against the database skills and returns matching skill IDs
 * @param extractedSkills Array of skill names to match
 * @param uniqueSkills Array of unique skills from database
 * @returns Array of matched skill IDs
 */
export const matchSkillsAndGetIds = (extractedSkills: string[], uniqueSkills: skillInterface[]): string[] => {
    try {
        // Create a map of normalized skill names for case-insensitive matching
        const skillMap = new Map(uniqueSkills.map((skill) => [skill.name.toLowerCase(), skill]));
        logger.info(`Skill map: ${skillMap}`);

        // Match extracted skills against our database skills
        const matchedSkills = extractedSkills
            .map((extractedSkill) => {
                const normalizedSkill = extractedSkill.trim().toLowerCase();
                return skillMap.get(normalizedSkill);
            })
            .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined)
            .map((skill) => skill.skillId);

        logger.info(`Matched skills: ${matchedSkills}`);

        logger.info(`Skills matching result: {
      input: ${extractedSkills},
      matched: ${matchedSkills}
    }`);

        return matchedSkills;
    } catch (error) {
        logger.error("Error in matchSkillsAndGetIds:", error);
        return [];
    }
};

export default {
    getUniqueSkills,
    matchSkillsAndGetIds,
};
