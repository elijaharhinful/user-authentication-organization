import { QueryFailedError } from "typeorm";
import { connectionSource } from "../database/ormconfig";
import { User } from "../entities/User";
import { Organisation } from "../entities/Organisation";
import { validateFields } from "../utils/validation";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwtUtils";
import { validateLoginFields } from "../utils/validation";

export const registerUser = async (userData: Partial<User>) => {
  const userRepository = connectionSource.getRepository(User);
  const orgRepository = connectionSource.getRepository(Organisation);

  // Check if a user with the same email already exists

  const user = userRepository.create(userData);
  const validationErrors = await validateFields(user);
  if (validationErrors) {
    return { success: false, errors: validationErrors };
  }

  try {
    user.password = await bcrypt.hash(user.password, 10);
    const savedUser =  await userRepository.save(user);
    
    const userFirstName = user.firstName;
    const orgName: string = `${userFirstName}'s Organisation`;
    const organisation = orgRepository.create({
      name: orgName,
      owner: user,
      users: [savedUser],
    });

    await orgRepository.save(organisation);

    const token = generateToken(user);
    return {
      success: true,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
      token
    };
  } catch (error) {
    if (error instanceof QueryFailedError && error.message.includes('duplicate key value violates unique constraint')) {
      return { success: false, error: "Email already exists" };
    } else {
      return { success: false, error: "Registration failed" };
    }
  }
};

export const loginUser = async (email: string, password: string) => {
  const validationErrors = await validateLoginFields(email, password);
  if (validationErrors) {
    return { success: false, errors: validationErrors };
  }
  const userRepository = connectionSource.getRepository(User);
  const user = await userRepository.findOneBy({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { success: false, error: [{ field: "general", message: "Invalid credentials" }] };
  }

  return { success: true, user, token: generateToken(user) };
};
