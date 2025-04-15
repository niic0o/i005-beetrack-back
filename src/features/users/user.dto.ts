import { $Enums } from "@prisma/client";

export interface UserData {
  id: string;
  name: string;
  last_name: string;
  birthdate: Date;
  email: string;
  status: $Enums.Status;
  createdAt: Date;
  updatedAt: Date;
  store: {
    id: string;
    name: string;
    tel: string | null;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    status: $Enums.Status;
  } | null;
}
