import {
  adminAc,
  defaultAc,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const roles = {
  admin: adminAc,
  owner: ownerAc,
  member: memberAc,
  guest: defaultAc.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
  }),
};
