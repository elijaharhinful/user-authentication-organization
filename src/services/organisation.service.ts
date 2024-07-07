import { connectionSource } from "../database/ormconfig";
import { Organisation } from "../entities/Organisation";
import { User } from "../entities/User";
import { validateFields } from "../utils/validation";

export const createOrganisation = async (user: User, name: string, description: string) => {
  const organisationRepository = connectionSource.getRepository(Organisation);
  // Ensure the name is a string before creating the entity
  if (typeof name !== 'string') {
    return { errors: [{ field: "name", message: "Name must be a string" }] };
  }
  const organisation = organisationRepository.create({
    name,
    description,
    owner: user,
    users: [user],
  });

  const validationErrors = await validateFields(organisation);
  if (validationErrors) {
    return { success: false, errors: validationErrors };
  }

  try {
    await organisationRepository.save(organisation);
    return { success: true, organisation };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, errors: [{ field: "general", message: error.message }] };
    } else {
      return { success: false, errors: [{ field: "general", message: "An unknown error occurred" }] };
    }
  }
};

export const getOrganisations = async (user: User) => {
  const organisationRepository = connectionSource.getRepository(Organisation);
  const organisations = await organisationRepository
    .createQueryBuilder("organisation")
    .leftJoinAndSelect("organisation.users", "user")
    .where("user.userId = :userId", { userId: user.userId })
    .getMany();

  return organisations;
};

export const getOrganisationById = async (user: User, orgId: string) => {
  const organisationRepository = connectionSource.getRepository(Organisation);

  // Fetch the organisation by ID
  const organisation = await organisationRepository
    .createQueryBuilder("organisation")
    .leftJoinAndSelect("organisation.users", "user")
    .where("organisation.orgId = :orgId", { orgId })
    .getOne();

  if (!organisation) {
    return { organisation: null, access: false };
  }

  // Check if the user has access to the organisation
  const hasAccess = organisation.users.some(orgUser => orgUser.userId === user.userId);

  return { organisation, access: hasAccess };
};

export const OrganisationService = {
  addUserToOrganisation: async (orgId: string, userId: string): Promise<void> => {
    const organisationRepository = connectionSource.getRepository(Organisation);
    const userRepository = connectionSource.getRepository(User);

    const organisation = await organisationRepository.findOne({
      where: { orgId },
      relations: ["users"]
    });

    if (!organisation) {
      throw new Error("Organisation not found");
    }

    const user = await userRepository.findOne({ where: { userId } });

    if (!user) {
      throw new Error("User not found");
    }

    organisation.users.push(user);
    await organisationRepository.save(organisation);
  }
};


