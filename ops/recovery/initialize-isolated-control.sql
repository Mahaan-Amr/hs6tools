\set ON_ERROR_STOP on

CREATE TABLE IF NOT EXISTS public.hs6tools_recovery_control (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  environment text NOT NULL CHECK (environment IN ('staging', 'recovery')),
  instance_id text NOT NULL,
  allow_restore boolean NOT NULL DEFAULT false,
  allow_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

TRUNCATE public.hs6tools_recovery_control;
INSERT INTO public.hs6tools_recovery_control (
  environment,
  instance_id,
  allow_restore,
  allow_delete
) VALUES (
  :'recovery_environment',
  :'recovery_instance_id',
  true,
  true
);

REVOKE ALL ON public.hs6tools_recovery_control FROM PUBLIC;
