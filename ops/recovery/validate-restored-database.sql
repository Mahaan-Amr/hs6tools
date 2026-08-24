\set ON_ERROR_STOP on

DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NULL THEN
    RAISE EXCEPTION 'Prisma migration history is missing';
  END IF;

  IF to_regclass('public.users') IS NULL
     OR to_regclass('public.products') IS NULL
     OR to_regclass('public.orders') IS NULL THEN
    RAISE EXCEPTION 'one or more critical application tables are missing';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public._prisma_migrations
    WHERE finished_at IS NULL AND rolled_back_at IS NULL
  ) THEN
    RAISE EXCEPTION 'migration history contains an unfinished migration';
  END IF;
END
$$;
