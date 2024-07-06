import { validate } from "class-validator";
import { User } from "../entities/User";
import { Organisation } from "../entities/Organisation";
import { connectionSource } from "../database/ormconfig";

export const validateFields = async (entity: any) => {
  const errors = await validate(entity);
  const validationErrors = errors.map(err => ({
    field: err.property,
    message: Object.values(err.constraints!).join(", ")
  }));

  // Additional manual checks for unique constraints
  if (entity instanceof User) {
    const userRepository = connectionSource.getRepository(User);

    if (entity.email) {
      const existingUser = await userRepository.findOneBy({ email: entity.email });
      if (existingUser) {
        validationErrors.push({
          field: "email",
          message: "Email already exists"
        });
      }
    }

    if (entity.userId) {
      const existingUser = await userRepository.findOneBy({ userId: entity.userId });
      if (existingUser) {
        validationErrors.push({
          field: "userId",
          message: "User ID already exists"
        });
      }
    }
  }

  if (entity instanceof Organisation) {
    // Validate 'name' field
    if (!entity.name) {
      validationErrors.push({
        field: "name",
        message: "Name is required"
      });
    }
  }

  return validationErrors.length > 0 ? validationErrors : null;
};

export const validateLoginFields = async (email: string, password: string) => {
  const errors = [];

  if (!email) {
    errors.push({
      field: "email",
      message: "Email is required"
    });
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push({
      field: "email",
      message: "Invalid email format"
    });
  }

  if (!password) {
    errors.push({
      field: "password",
      message: "Password is required"
    });
  }

  return errors.length > 0 ? errors : null;
};