import { Request, Response } from "express";
import { createOrganisation, getOrganisations, getOrganisationById } from "../services/organisation.service";
import { User } from "../entities/User";
import { OrganisationService } from "../services/organisation.service";

export const create = async (req: Request, res: Response) => {
  const user = req.user as User;
  const { name, description } = req.body;

  const result = await createOrganisation(user, name, description);;

  if (!result.success) {
    if (result.errors) {
      // Validation errors
      return res.status(422).json({ errors: result.errors });
    } else {
      // Other registration failures
      return res.status(400).json({
        status: "Bad request",
        message: "Client error",
        statusCode: 400
      });
    }
  }

  if (!result.organisation) {
    return res.status(500).json({
      status: "Internal Server Error",
      message: "Organisation information missing",
    });
  }

  res.status(201).json({
    status: "success",
    message: "Organisation created successfully",
    data: {
      orgId: result.organisation.orgId,
      name: result.organisation.name,
      description: result.organisation.description,
    },
  });
};

export const getAll = async (req: Request, res: Response) => {
  const user = req.user as User;
  const fullOrganisations = await getOrganisations(user);

  // Map the organisations to only include the required fields
  const organisations = fullOrganisations.map(org => ({
    orgId: org.orgId,
    name: org.name,
    description: org.description
  }));

  res.status(200).json({
    status: "success",
    message: "Organisations retrieved successfully",
    data: {
      organisations,
    },
  });
};

export const getById = async (req: Request, res: Response) => {
  const user = req.user as User;
  const { orgId } = req.params;

  const {organisation, access} = await getOrganisationById(user, orgId);
  
  if (!organisation) {
    return res.status(404).json({ status: "error", message: "Organisation not found" });
  }

  if (!access) {
    return res.status(403).json({ status: "error", message: "You do not have access to this organisation" });
  }

  res.status(200).json({
    status: "success",
    message: "Organisation retrieved successfully",
    data: {
      orgId: organisation.orgId,
      name: organisation.name,
      description: organisation.description,
    },
  });
};

export const OrganisationController = {
  addUserToOrganisation: async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { userId } = req.body;

    try {
      await OrganisationService.addUserToOrganisation(orgId, userId);
      return res.status(200).json({
        status: "success",
        message: "User added to organisation successfully"
      });
    } catch (error) {
      return res.status(400).json({ status: "error", message: (error as Error).message });
    }
  }
};
