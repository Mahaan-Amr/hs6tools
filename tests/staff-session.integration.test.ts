import assert from "node:assert/strict";
import test from "node:test";
import type { UserRole } from "@prisma/client";

import { authOptions } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const jwtCallback = authOptions.callbacks?.jwt;

if (!jwtCallback) throw new Error("NextAuth JWT callback is required");
const runJwtCallback = jwtCallback;

interface CurrentAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  deletedAt: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar: string | null;
  company: string | null;
  position: string | null;
  lastLoginAt: Date | null;
}

const activeAdmin: CurrentAccount = {
  id: "staff-1",
  email: "staff@example.test",
  firstName: "Test",
  lastName: "Staff",
  role: "ADMIN",
  isActive: true,
  deletedAt: null,
  emailVerified: true,
  phoneVerified: true,
  avatar: null,
  company: null,
  position: null,
  lastLoginAt: null,
};

test("JWT authority follows current account state for every session read", async (t) => {
  const userDelegate = prisma.user as unknown as {
    findUnique: (args: unknown) => unknown;
  };
  const originalFindUnique = userDelegate.findUnique;
  let currentAccount: CurrentAccount | null = activeAdmin;
  userDelegate.findUnique = () => Promise.resolve(currentAccount);
  t.after(() => {
    userDelegate.findUnique = originalFindUnique;
  });

  async function refresh(staleRole = "SUPER_ADMIN") {
    return runJwtCallback({
      token: {
        id: "staff-1",
        role: staleRole,
        isActive: true,
        firstName: "Stale",
        lastName: "Session",
      },
    } as never);
  }

  let token = await refresh();
  assert.equal(token.role, "ADMIN");
  assert.equal(token.isActive, true);

  currentAccount = { ...activeAdmin, role: "CUSTOMER" };
  token = await refresh();
  assert.equal(token.role, "CUSTOMER");

  currentAccount = { ...activeAdmin, isActive: false };
  token = await refresh();
  assert.equal(token.role, null);
  assert.equal(token.isActive, false);

  currentAccount = { ...activeAdmin, deletedAt: new Date() };
  token = await refresh();
  assert.equal(token.role, null);

  currentAccount = null;
  token = await refresh();
  assert.equal(token.role, null);
});
