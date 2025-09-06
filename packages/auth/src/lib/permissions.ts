import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

const admin = ac.newRole({
  ...adminAc.statements,
});

const owner = ac.newRole({
  ...ownerAc.statements,
});

const member = ac.newRole({
  ...memberAc.statements,
});

const guest = ac.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
});

export const roles = {
  admin,
  owner,
  member,
  guest,
};
