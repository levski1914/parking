import { SetMetadata } from '@nestjs/common';
import { OwnerType } from 'src/generated/prisma/client';

export const OWNER_TYPES_KEY = 'ownerTypes';

export const OwnerTypes = (...types: OwnerType[]) =>
  SetMetadata(OWNER_TYPES_KEY, types);
