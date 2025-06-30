// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  $default: {
    allow: {
      view: "true",
      create: "auth.id != null",
      delete: "false",
      update: "auth.id != null",
    },
  },
} satisfies InstantRules;

export default rules;
