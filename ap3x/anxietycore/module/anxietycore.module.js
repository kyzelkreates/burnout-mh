// AP3X AnxietyCore — BCO Module Registration
// ─────────────────────────────────────────────────────────────────
// Follows the BCO Run 3 module contract exactly (see sleep.module.js).
// Register with: moduleRegistry.register(anxietyCoreModule)
//
// This hooks AnxietyCore into BCO's rule engine, action engine, and
// module registry — giving it full governance and audit coverage.

import { AP3X_KEYS } from "../../shared/constants.js";

export const anxietyCoreModule = {
  name: "anxietycore",
  version: "1.0.0",

  // ── Entity keys used by this module ──────────────────────────
  entities: [
    AP3X_KEYS.ANXIETY_LOGS,
    AP3X_KEYS.MOOD_LOGS,
    AP3X_KEYS.SLEEP_LOGS,
    AP3X_KEYS.TRIGGER_LOGS,
    AP3X_KEYS.RISK_FLAGS,
    AP3X_KEYS.STREAK,
    AP3X_KEYS.CLINICIAN_NOTES
  ],

  // ── Actions this module emits ─────────────────────────────────
  actions: [
    "AP3X_LOG_ANXIETY",
    "AP3X_LOG_MOOD",
    "AP3X_LOG_SLEEP",
    "AP3X_LOG_TRIGGER",
    "AP3X_SET_RISK_FLAG",
    "AP3X_ADD_CLINICIAN_NOTE",
    "AP3X_SYNC_PATIENT_DATA"
  ],

  // ── BCO rules (evaluated by the BCO rule engine on every event) ─
  rules: [
    {
      id:       "ap3x_high_anxiety_flag",
      name:     "High anxiety single-entry flag",
      priority: "high",
      condition: {
        type:  "AND",
        rules: [
          { type: "EVENT_TYPE_EQUALS",     value: "AP3X_LOG_ANXIETY" },
          { type: "THRESHOLD_GREATER_THAN", field: "anxiety_score", value: 7 }
        ]
      },
      action: {
        type: "CREATE_ALERT",
        payload: {
          severity: "warning",
          message:  "High anxiety score recorded (≥8). Patient may need support.",
          module:   "anxietycore"
        }
      }
    },
    {
      id:       "ap3x_low_sleep_anxiety",
      name:     "Low sleep + high anxiety compound flag",
      priority: "high",
      condition: {
        type:  "AND",
        rules: [
          { type: "EVENT_TYPE_EQUALS",     value: "AP3X_LOG_ANXIETY" },
          { type: "THRESHOLD_GREATER_THAN", field: "anxiety_score", value: 5 }
        ]
      },
      action: {
        type: "CREATE_ALERT",
        payload: {
          severity: "warning",
          message:  "Elevated anxiety with possible poor sleep — see AP3X risk detail.",
          module:   "anxietycore"
        }
      }
    }
  ],

  // ── UI blocks for BCO dashboard renderer ─────────────────────
  ui_blocks: [
    {
      id:          "ap3x_anxiety_chart",
      type:        "chart",
      dataSource:  AP3X_KEYS.ANXIETY_LOGS,
      permissions: ["patient", "clinician"]
    },
    {
      id:          "ap3x_risk_card",
      type:        "card",
      dataSource:  AP3X_KEYS.RISK_FLAGS,
      permissions: ["clinician"]
    },
    {
      id:          "ap3x_mood_history",
      type:        "list",
      dataSource:  AP3X_KEYS.MOOD_LOGS,
      permissions: ["patient", "clinician"]
    }
  ],

  // ── Permission gates ──────────────────────────────────────────
  permissions: {
    read:           ["patient", "clinician"],
    write:          ["patient"],
    clinician_read: ["clinician"],
    clinician_write:["clinician"],  // notes + flags only
    blockedActions: ["AP3X_SYNC_PATIENT_DATA"]  // system-only
  },

  config: {
    streak_timezone: "UTC",
    sync_on_boot:    true
  }
};
