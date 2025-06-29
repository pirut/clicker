import { init } from "@instantdb/admin";
import schema from "../../instant.schema";

const db = init({
    appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
    adminToken: process.env.INSTANTDB_SECRET_KEY!,
    schema,
});

export { db };
