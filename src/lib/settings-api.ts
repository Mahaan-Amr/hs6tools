import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

interface SettingsPrincipal {
  id: string;
  role: UserRole;
}

interface RestrictedSettingsDependencies<TStored, TInput> {
  getPrincipal: () => Promise<SettingsPrincipal | null>;
  read: () => Promise<TStored | null>;
  initialize: (actorId: string) => Promise<{ settings: TStored; created: boolean }>;
  update: (input: TInput, actorId: string) => Promise<TStored>;
  sanitize: (settings: TStored) => unknown;
  validate?: (input: unknown) => { ok: true; value: TInput } | { ok: false; error: string };
}

export async function initializeSettings<TStored>(dependencies: {
  read: () => Promise<TStored | null>;
  create: () => Promise<{ settings: TStored; created: boolean }>;
  audit: () => Promise<void>;
}) {
  const existing = await dependencies.read();
  if (existing) return { settings: existing, created: false };

  const result = await dependencies.create();
  if (result.created) {
    await dependencies.audit();
  }
  return result;
}

export async function resolveSettingsPrincipal(
  sessionUser: { id?: string | null } | null | undefined,
  findCurrentAccount: (id: string) => Promise<{
    id: string;
    role: UserRole;
    isActive: boolean;
  } | null>,
): Promise<SettingsPrincipal | null> {
  if (!sessionUser?.id) return null;
  const account = await findCurrentAccount(sessionUser.id);
  if (!account?.isActive) return null;
  return { id: account.id, role: account.role };
}

export async function configureSettings<TStored>(dependencies: {
  read: () => Promise<TStored | null>;
  write: (existing: TStored | null) => Promise<TStored>;
  audit: () => Promise<void>;
}) {
  const existing = await dependencies.read();
  const settings = await dependencies.write(existing);
  if (!existing) {
    await dependencies.audit();
  }
  return settings;
}

function authorizationResponse(principal: SettingsPrincipal | null) {
  if (!principal) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (principal.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  return null;
}

export function createRestrictedSettingsHandlers<TStored, TInput = TStored>(
  dependencies: RestrictedSettingsDependencies<TStored, TInput>,
) {
  async function getAuthorizedPrincipal() {
    const principal = await dependencies.getPrincipal();
    const response = authorizationResponse(principal);
    return response ? { response, principal: null } : { response: null, principal };
  }

  return {
    async GET() {
      const authorization = await getAuthorizedPrincipal();
      if (authorization.response) return authorization.response;

      const settings = await dependencies.read();
      return NextResponse.json({
        success: true,
        data: settings ? dependencies.sanitize(settings) : null,
        initialized: Boolean(settings),
      });
    },

    async POST(request: Request) {
      void request;
      const authorization = await getAuthorizedPrincipal();
      if (authorization.response || !authorization.principal) {
        return authorization.response!;
      }

      const result = await dependencies.initialize(authorization.principal.id);
      return NextResponse.json({
        success: true,
        data: dependencies.sanitize(result.settings),
        initialized: true,
        created: result.created,
      });
    },

    async PUT(request: Request) {
      const authorization = await getAuthorizedPrincipal();
      if (authorization.response || !authorization.principal) {
        return authorization.response!;
      }

      let input: unknown;
      try {
        input = await request.json();
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid JSON body" },
          { status: 400 },
        );
      }

      const validation = dependencies.validate?.(input);
      if (validation && !validation.ok) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 },
        );
      }

      const settings = await dependencies.update(
        validation?.ok ? validation.value : (input as TInput),
        authorization.principal.id,
      );
      return NextResponse.json({
        success: true,
        data: dependencies.sanitize(settings),
        initialized: true,
      });
    },
  };
}
