import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { OrganisationService } from "../services/organisation.service";

export const UserController = {
  getUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestingUser = req.user as any; // Type assertion, assuming req.user is set by authMiddleware

    try {
      let user;
      if (id === requestingUser.userId) {
        user = await UserService.getUserById(id);
      } else {
        const orgsOwned = await UserService.getUserById(requestingUser.userId);
        const orgIds = orgsOwned?.organisations.map(org => org.orgId) || [];
        
        for (const orgId of orgIds) {
          const usersInOrg = await UserService.getUsersInOrganisation(orgId);
          user = usersInOrg.find(u => u.userId === id);
          if (user) break;
        }
      }

      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }

      return res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        data: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  }
};
