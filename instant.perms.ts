// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
    $default: {
        allow: {
            view: "true",
            create: "auth.id != null",
            update: "auth.id != null",
            delete: "false",
        },
    },
    dollars: {
        allow: {
            create: "auth.id != null && hasCompletedPayment",
            update: "false",
        },
        bind: ["hasCompletedPayment", "ruleParams.hasCompletedPayment == true"],
    },
} satisfies InstantRules;

export default rules;
