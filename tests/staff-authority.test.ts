import assert from "node:assert/strict";
import test from "node:test";

import {
  activeAccountAuthority,
  canAssignAccountRole,
  canChangeAccountRole,
  canChangeStaffStatus,
  canRemoveActiveSuperAdmin,
  isUserRole,
  removesActiveSuperAdmin,
} from "../src/lib/staff-authority";

test("current account state, not a stale session role, grants staff authority", () => {
  assert.deepEqual(
    activeAccountAuthority({
      id: "staff-1",
      role: "ADMIN",
      isActive: true,
      deletedAt: null,
    }),
    { id: "staff-1", role: "ADMIN" },
  );

  assert.equal(
    activeAccountAuthority({
      id: "staff-1",
      role: "ADMIN",
      isActive: false,
      deletedAt: null,
    }),
    null,
  );
  assert.equal(
    activeAccountAuthority({
      id: "staff-1",
      role: "SUPER_ADMIN",
      isActive: true,
      deletedAt: new Date("2026-08-24T00:00:00Z"),
    }),
    null,
  );
  assert.equal(activeAccountAuthority(null), null);
});

test("only a Super Admin can assign a privileged role", () => {
  assert.equal(canAssignAccountRole("ADMIN", "ADMIN"), false);
  assert.equal(canAssignAccountRole("ADMIN", "SUPER_ADMIN"), false);
  assert.equal(canAssignAccountRole("SUPER_ADMIN", "ADMIN"), true);
  assert.equal(canAssignAccountRole("SUPER_ADMIN", "SUPER_ADMIN"), true);
  assert.equal(canAssignAccountRole("ADMIN", "CUSTOMER"), true);
});

test("only a Super Admin can change an existing staff role", () => {
  assert.equal(canChangeAccountRole("ADMIN", "ADMIN", "CUSTOMER"), false);
  assert.equal(
    canChangeAccountRole("SUPER_ADMIN", "ADMIN", "CUSTOMER"),
    true,
  );
  assert.equal(canChangeAccountRole("ADMIN", "CUSTOMER", "CUSTOMER"), true);
});

test("only a Super Admin can disable or enable a staff account", () => {
  assert.equal(canChangeStaffStatus("ADMIN", "ADMIN"), false);
  assert.equal(canChangeStaffStatus("SUPER_ADMIN", "ADMIN"), true);
  assert.equal(canChangeStaffStatus("ADMIN", "CUSTOMER"), true);
});

test("role input accepts only known account roles", () => {
  assert.equal(isUserRole("CUSTOMER"), true);
  assert.equal(isUserRole("ADMIN"), true);
  assert.equal(isUserRole("SUPER_ADMIN"), true);
  assert.equal(isUserRole("OWNER"), false);
  assert.equal(isUserRole(undefined), false);
});

test("detects every ordinary update that would remove an active Super Admin", () => {
  const activeSuperAdmin = {
    role: "SUPER_ADMIN" as const,
    isActive: true,
    deletedAt: null,
  };

  assert.equal(removesActiveSuperAdmin(activeSuperAdmin, { role: "ADMIN" }), true);
  assert.equal(removesActiveSuperAdmin(activeSuperAdmin, { isActive: false }), true);
  assert.equal(
    removesActiveSuperAdmin(activeSuperAdmin, { deletedAt: new Date() }),
    true,
  );
  assert.equal(
    removesActiveSuperAdmin(activeSuperAdmin, { firstName: "Unchanged authority" }),
    false,
  );
  assert.equal(
    removesActiveSuperAdmin(
      { ...activeSuperAdmin, isActive: false },
      { role: "ADMIN" },
    ),
    false,
  );
});

test("the final active Super Admin requires a protected workflow", () => {
  assert.equal(canRemoveActiveSuperAdmin(1), false);
  assert.equal(canRemoveActiveSuperAdmin(2), true);
});
