export const RULE_CODES = Object.freeze({
  EXTERNAL_FACT_MODEL_OUTPUT_ONLY: "E_EXTERNAL_FACT_MODEL_OUTPUT_ONLY",
  CLAIM_WITHOUT_EVIDENCE: "E_CLAIM_WITHOUT_EVIDENCE",
  UNKNOWN_CLAIM_REFERENCE: "E_UNKNOWN_CLAIM_REFERENCE",
  COMPLETED_WITHOUT_ACTION: "E_COMPLETED_WITHOUT_ACTION",
  COMPLETED_WITHOUT_SUCCESSFUL_ACTION: "E_COMPLETED_WITHOUT_SUCCESSFUL_ACTION",
  COMPLETED_WITHOUT_OUTPUT: "E_COMPLETED_WITHOUT_OUTPUT",
  COMPLETED_WITHOUT_EVIDENCE: "E_COMPLETED_WITHOUT_EVIDENCE",
});

export function validateEvidenceSemantics(bundle) {
  const errors = [];
  const claims = new Map((bundle?.claims || []).map((claim) => [claim.claim_id, claim]));
  const evidenceByClaim = new Map();

  for (const item of bundle?.evidence || []) {
    for (const claimId of item.supports_claim_ids || []) {
      if (!claims.has(claimId)) {
        errors.push({
          code: RULE_CODES.UNKNOWN_CLAIM_REFERENCE,
          path: `/evidence/${item.evidence_id}/supports_claim_ids`,
          message: `Evidence references unknown claim ${claimId}.`,
        });
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
      errors.push({
        code: RULE_CODES.CLAIM_WITHOUT_EVIDENCE,
        path: `/claims/${claim.claim_id}`,
        message: "Every claim must be linked to at least one evidence item.",
      });
      continue;
    }

    if (claim.claim_type === "external_fact" && support.every((item) => item.evidence_type === "model_output")) {
      errors.push({
        code: RULE_CODES.EXTERNAL_FACT_MODEL_OUTPUT_ONLY,
        path: `/claims/${claim.claim_id}`,
        message: "A model output proves only that the model produced the statement; it cannot alone establish an external fact.",
      });
    }
  }

  return errors;
}

export function validateInitiativeSemantics(initiative) {
  if (initiative?.status !== "completed") return [];

  const errors = [];
  const actions = initiative.actual_actions || [];
  if (!actions.length) {
    errors.push({
      code: RULE_CODES.COMPLETED_WITHOUT_ACTION,
      path: "/actual_actions",
      message: "A completed initiative must contain at least one actual action.",
    });
  } else if (!actions.some((action) => action.status === "succeeded")) {
    errors.push({
      code: RULE_CODES.COMPLETED_WITHOUT_SUCCESSFUL_ACTION,
      path: "/actual_actions",
      message: "A completed initiative must contain at least one successful actual action.",
    });
  }

  if (!(initiative.outputs || []).length) {
    errors.push({
      code: RULE_CODES.COMPLETED_WITHOUT_OUTPUT,
      path: "/outputs",
      message: "A completed initiative must link an artifact or result.",
    });
  }

  if (!(initiative.evidence_refs || []).length) {
    errors.push({
      code: RULE_CODES.COMPLETED_WITHOUT_EVIDENCE,
      path: "/evidence_refs",
      message: "A completed initiative must link evidence.",
    });
  }

  return errors;
}
