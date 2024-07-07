import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export const UserController = {
  getUser: async (req: Request, res: Response) => {
    const { id } = req.params;
    const requestingUser = req.user as any;

    try {
      let user;
      if (id === requestingUser.userId) {
        // Get own record
        user = await UserService.getUserById(id);
      } else {
        // Get user from organizations the requesting user belongs to or created
        // const orgsOwned = await UserService.getUserById(requestingUser.userId);
        // const orgIds = orgsOwned?.organisations.map(org => org.orgId) || [];
        user = await UserService.getUserInSharedOrganizations(requestingUser.userId, id);
        // for (const orgId of orgIds) {
        //   const usersInOrg = await UserService.getUsersInOrganisation(orgId);
        //   user = usersInOrg.find(u => u.userId === id);
        //   if (user) break;
        // }
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
