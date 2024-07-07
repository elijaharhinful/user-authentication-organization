import { connectionSource } from "../database/ormconfig";
import { User } from "../entities/User";

export const UserService = {
  getUserById: async (userId: string): Promise<User | null> => {
    const userRepository = connectionSource.getRepository(User);
    return await userRepository.findOne({
      where: { userId },
      relations: ["organisations"]
    });
  },

  getUsersInOrganisation: async (orgId: string): Promise<User[]> => {
    const userRepository = connectionSource.getRepository(User);
    return await userRepository.createQueryBuilder("user")
      .innerJoin("user.organisations", "org")
      .where("org.orgId = :orgId", { orgId })
      .getMany();
  },
  
  getUserInSharedOrganizations: async (requestingUserId: string, targetUserId: string): Promise<User | null> => {
    const userRepository = connectionSource.getRepository(User);
    return await userRepository.createQueryBuilder("user")
      .innerJoin("user.organisations", "org")
      .innerJoin("org.users", "member")
      .where("user.userId = :targetUserId", { targetUserId })
      .andWhere("member.userId = :requestingUserId", { requestingUserId })
      .getOne();
  }
};