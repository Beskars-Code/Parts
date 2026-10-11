import { createApi } from "@convex-dev/better-auth";

import schema from "./schema";
import { createAuthOptions } from "../../confect/services/auth/component";

const { create, findOne, findMany, updateOne, updateMany, deleteOne: dropOne, deleteMany: dropMany } = createApi(schema, createAuthOptions);

export { create, dropMany as deleteMany, dropOne as deleteOne, findMany, findOne, updateMany, updateOne };
