export function externalEffectsAreDisabled(): boolean {
  return process.env.EXTERNAL_EFFECTS_DISABLED === "true";
}

export function externalEffectsDisabledError(effect: string): {
  success: false;
  error: string;
} {
  return {
    success: false,
    error: `${effect} is disabled in this environment`,
  };
}
