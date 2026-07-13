export const RULE_CODES = Object.freeze({
  EXTERNAL_FACT_MODEL_OUTPUT_ONLY: "E_EXTERNAL_FACT_MODEL_OUTPUT_ONLY",
  CLAIM_WITHOUT_EVIDENCE: "E_CLAIM_WITHOUT_EVIDENCE",
  UNKNOWN_CLAIM_REFERENCE: "E_UNKNOWN_CLAIM_REFERENCE",
  COMPLETED_WITHOUT_ACTION: "E_COMPLETED_WITHOUT_ACTION",
  COMPLETED_WITHOUT_SUCCESSFUL_ACTION: "E_COMPLETED_WITHOUT_SUCCESSFUL_ACTION",
  COMPLETED_WITHOUT_OUTPUT: "E_COMPLETED_WITHOUT_OUTPUT",
  COMPLETED_WITHOUT_EVIDENCE: "E_COMPLETED_WITHOUT_EVIDENCE",
  MEMORY_PROMOTION_WITHOUT_EVIDENCE: "E_MEMORY_PROMOTION_WITHOUT_EVIDENCE",
  HIGH_RISK_MEMORY_ACTION_WITHOUT_CONFIRMATION: "E_HIGH_RISK_MEMORY_ACTION_WITHOUT_CONFIRMATION",
  RESIGNATURE_EXTERNAL_CLAIM_WITHOUT_EVIDENCE: "E_RESIGNATURE_EXTERNAL_CLAIM_WITHOUT_EVIDENCE",
  INVALID_TIME_ORDER: "E_INVALID_TIME_ORDER",
  LIFECYCLE_SELF_REPLACEMENT: "E_LIFECYCLE_SELF_REPLACEMENT",
  JOURNAL_OBSERVATION_WITHOUT_EVIDENCE: "E_JOURNAL_OBSERVATION_WITHOUT_EVIDENCE",
  JOURNAL_REPORT_WITHOUT_SOURCE: "E_JOURNAL_REPORT_WITHOUT_SOURCE",
  JOURNAL_INFERENCE_WITHOUT_SOURCE: "E_JOURNAL_INFERENCE_WITHOUT_SOURCE",
});

function error(code, path, message) {
  return { code, path, message };
}

function time(value) {
  return Date.parse(value);
}

export function validateEvidenceSemantics(bundle) {
  const errors = [];
  const claims = new Map((bundle?.claims || []).map((claim) => [claim.claim_id, claim]));
  const evidenceByClaim = new Map();

  for (const item of bundle?.evidence || []) {
    for (const claimId of item.supports_claim_ids || []) {
      if (!claims.has(claimId)) {
        errors.push(error(RULE_CODES.UNKNOWN_CLAIM_REFERENCE, `/evidence/${item.evidence_id}/supports_claim_ids`, `Evidence references unknown claim ${claimId}.`));
        continue;
      }
      const items = evidenceByClaim.get(claimId) || [];
      items.push(item);
      evidenceByClaim.set(claimId, items);
    }
  }

  for (const claim of claims.values()) {
    const support = evidenceByClaim.get(claim.claim_id) || [];
    if (!support.length) {
      errors.push(error(RULE_CODES.CLAIM_WITHOUT_EVIDENCE, `/claims/${claim.claim_id}`, "Every claim must be linked to at least one evidence item."));
      continue;
    }
    if (claim.claim_type === "external_fact" && support.every((item) => item.evidence_type === "model_output")) {
      errors.push(error(RULE_CODES.EXTERNAL_FACT_MODEL_OUTPUT_ONLY, `/claims/${claim.claim_id}`, "A model output proves only that the model produced the statement; it cannot alone establish an external fact."));
    }
  }
  return errors;
}

export function validateInitiativeSemantics(initiative) {
  const errors = [];
  if (initiative?.protocol_version === "0.2" && time(initiative.updated_at) < time(initiative.created_at)) {
    errors.push(error(RULE_CODES.INVALID_TIME_ORDER, "/updated_at", "updated_at must not be earlier than created_at."));
  }
  for (const [index, action] of (initiative?.actual_actions || []).entries()) {
    if (initiative?.protocol_version === "0.2" && action.finished_at && time(action.finished_at) < time(action.started_at)) {
      errors.push(error(RULE_CODES.INVALID_TIME_ORDER, `/actual_actions/${index}/finished_at`, "finished_at must not be earlier than started_at."));
    }
  }
  if (initiative?.status !== "completed") return errors;

  const actions = initiative.actual_actions || [];
  if (!actions.length) {
    errors.push(error(RULE_CODES.COMPLETED_WITHOUT_ACTION, "/actual_actions", "A completed initiative must contain at least one actual action."));
  } else if (!actions.some((action) => action.status === "succeeded")) {
    errors.push(error(RULE_CODES.COMPLETED_WITHOUT_SUCCESSFUL_ACTION, "/actual_actions", "A completed initiative must contain at least one successful actual action."));
  }
  if (!(initiative.outputs || []).length) errors.push(error(RULE_CODES.COMPLETED_WITHOUT_OUTPUT, "/outputs", "A completed initiative must link an artifact or result."));
  if (!(initiative.evidence_refs || []).length) errors.push(error(RULE_CODES.COMPLETED_WITHOUT_EVIDENCE, "/evidence_refs", "A completed initiative must link evidence."));
  return errors;
}

export function validateMemoryPolicySemantics(decision) {
  if (decision?.protocol_version !== "0.2") return [];
  const errors = [];
  const untrusted = new Set(["public_external", "private_external", "model_generated", "imported_unknown"]);
  if (decision.operation === "promote" && decision.decision === "allow" && untrusted.has(decision.source_class) && !decision.evidence_refs.length) {
    errors.push(error(RULE_CODES.MEMORY_PROMOTION_WITHOUT_EVIDENCE, "/evidence_refs", "Promoting external, model-generated, or unknown material requires linked evidence."));
  }
  if (["delete", "export"].includes(decision.operation) && decision.decision === "allow" && !decision.confirmation_ref) {
    errors.push(error(RULE_CODES.HIGH_RISK_MEMORY_ACTION_WITHOUT_CONFIRMATION, "/confirmation_ref", "An allowed delete or export decision requires an authenticated confirmation reference."));
  }
  return errors;
}

export function validateResignatureSemantics(resignature) {
  if (resignature?.protocol_version !== "0.2") return [];
  if (resignature.claim_scope === "includes_external_claims" && !resignature.evidence_refs.length) {
    return [error(RULE_CODES.RESIGNATURE_EXTERNAL_CLAIM_WITHOUT_EVIDENCE, "/evidence_refs", "A resignature that includes external claims requires linked evidence.")];
  }
  return [];
}

export function validateSchedulerLeaseSemantics(lease) {
  const errors = [];
  if (time(lease.expires_at) <= time(lease.acquired_at)) errors.push(error(RULE_CODES.INVALID_TIME_ORDER, "/expires_at", "expires_at must be later than acquired_at."));
  if (lease.released_at && time(lease.released_at) < time(lease.acquired_at)) errors.push(error(RULE_CODES.INVALID_TIME_ORDER, "/released_at", "released_at must not be earlier than acquired_at."));
  return errors;
}

export function validateCapabilityGrantSemantics(grant) {
  const errors = [];
  if (grant.not_before && grant.expires_at && time(grant.expires_at) <= time(grant.not_before)) {
    errors.push(error(RULE_CODES.INVALID_TIME_ORDER, "/expires_at", "expires_at must be later than not_before."));
  }
  if (grant.revoked_at && time(grant.revoked_at) < time(grant.issued_at)) {
    errors.push(error(RULE_CODES.INVALID_TIME_ORDER, "/revoked_at", "revoked_at must not be earlier than issued_at."));
  }
  return errors;
}

export function validateRecordLifecycleSemantics(lifecycle) {
  if (lifecycle.action === "supersede" && lifecycle.replacement_ref?.ref_id === lifecycle.record_ref?.ref_id) {
    return [error(RULE_CODES.LIFECYCLE_SELF_REPLACEMENT, "/replacement_ref/ref_id", "A record cannot supersede itself.")];
  }
  return [];
}

export function validatePeriodSemantics(document) {
  if (time(document.period_end) < time(document.period_start)) {
    return [error(RULE_CODES.INVALID_TIME_ORDER, "/period_end", "period_end must not be earlier than period_start.")];
  }
  return [];
}

export function validateLifecycleOpportunitySemantics(opportunity) {
  if (time(opportunity.window_end) <= time(opportunity.window_start)) {
    return [error(RULE_CODES.INVALID_TIME_ORDER, "/window_end", "window_end must be later than window_start.")];
  }
  return [];
}

export function validateJournalSemantics(journal) {
  const errors = validatePeriodSemantics(journal);
  for (const [index, item] of journal.events.entries()) {
    if (item.epistemic_status === "observed" && !item.evidence_refs.length) {
      errors.push(error(RULE_CODES.JOURNAL_OBSERVATION_WITHOUT_EVIDENCE, `/events/${index}/evidence_refs`, "An observed journal event requires linked evidence."));
    }
    if (item.epistemic_status === "reported" && !item.source_refs.length) {
      errors.push(error(RULE_CODES.JOURNAL_REPORT_WITHOUT_SOURCE, `/events/${index}/source_refs`, "A reported journal event requires a source reference."));
    }
    if (item.epistemic_status === "inferred" && !item.source_refs.length) {
      errors.push(error(RULE_CODES.JOURNAL_INFERENCE_WITHOUT_SOURCE, `/events/${index}/source_refs`, "An inferred journal event requires the source material it was inferred from."));
    }
  }
  return errors;
}

export function validateProtocolSemantics(kind, document) {
  if (kind === "evidence") return validateEvidenceSemantics(document);
  if (kind === "initiative") return validateInitiativeSemantics(document);
  if (kind === "memory_policy_decision") return validateMemoryPolicySemantics(document);
  if (kind === "resignature") return validateResignatureSemantics(document);
  if (kind === "scheduler_lease") return validateSchedulerLeaseSemantics(document);
  if (kind === "capability_grant") return validateCapabilityGrantSemantics(document);
  if (kind === "record_lifecycle") return validateRecordLifecycleSemantics(document);
  if (kind === "lifecycle_opportunity") return validateLifecycleOpportunitySemantics(document);
  if (kind === "journal_entry") return validateJournalSemantics(document);
  if (["dream_record", "handoff_record"].includes(kind)) return validatePeriodSemantics(document);
  return [];
}
