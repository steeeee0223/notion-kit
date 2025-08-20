import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  workspace: ["read", "update"],
  people: ["invite", "read", "add", "add:request", "update", "group:enable"],
} as const;

export const ac = createAccessControl(statement);

const admin = ac.newRole({
  workspace: ["read", "update"],
  people: ["invite", "read", "add", "update", "group:enable"],
});

const owner = ac.newRole({
  workspace: ["read", "update"],
  people: ["invite", "read", "add", "update"],
});

const member = ac.newRole({
  workspace: ["read"],
  people: ["read", "add:request"],
});

const guest = ac.newRole({
  workspace: [],
  people: [],
});

export const roles = {
  admin,
  owner,
  member,
  guest,
};
