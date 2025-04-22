import { $Enums } from "@prisma/client";

export interface UserSafeData {
  id: string;
  name: string;
  last_name: string;
  birthdate: Date;
  email: string;
  status: $Enums.Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreData {
    id: string;
    name: string;
    tel: string | null;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    status: $Enums.Status;
}

export interface ProfileData extends UserSafeData {
  store: StoreData | null;
};
