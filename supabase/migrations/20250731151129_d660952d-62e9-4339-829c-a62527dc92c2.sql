-- First migration: Add new enum values
ALTER TYPE user_role ADD VALUE 'admin';
ALTER TYPE user_role ADD VALUE 'entrenador_principal_pending';