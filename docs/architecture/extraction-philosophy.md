# Extraction Philosophy

Veriq extraction is built around observable evidence in committed snapshots. The goal is to prefer durable, explainable anchors and avoid inference, brittle traversal, and hidden assumptions.

This philosophy preserves a strict preference for semantic and observable selectors while allowing justified exceptions when the snapshot does not expose stronger anchors.

## Core Principles

- Prefer observable anchors over structural guessing.
- Keep extraction pure, deterministic, and free of DOM mutation.
- Separate extraction from business logic and downstream interpretation.
- Treat every selector choice as an engineering decision that should be justified in the relevant investigation document.
- Avoid generated class names unless a documented exception applies.

## Selector Decision Framework

Use selectors in this order of preference:

1. Semantic attributes
   - `aria-*`
   - `role`
   - `data-*`
2. Meaningful HTML elements
3. Stable observable attributes
4. Documented component classes
   - Only when:
     - documented in a committed snapshot
     - repeated consistently
     - no stronger observable anchor exists
     - explicitly justified in the investigation document
5. Stable structural relationships
6. Layout traversal
   - Last resort

This order is a preference, not a guarantee. A lower-ranked selector is acceptable only when the higher-ranked options are unavailable or materially weaker in the committed evidence.

## Exception Process

When a component class is used, the implementation or accompanying architecture note must document:

- why no stronger selector exists
- why the class is considered stable enough
- which investigation document approved it
- what conditions would require reevaluation

The exception process exists to keep the architecture honest. It acknowledges that some committed snapshots expose important regions only through documented component classes, but it does not change the default preference away from semantic and observable anchors.

## What This Means In Practice

- Use semantic attributes whenever they exist and identify the region clearly.
- Use meaningful element types when they provide stable meaning on their own.
- Use documented component classes only when the snapshot evidence supports them and the investigation has already justified the choice.
- Avoid selecting by generated class tokens, child indexes, or anonymous `div` chains.
- Reevaluate any exception if the snapshot gains a stronger anchor, if the class pattern stops repeating, or if the committed evidence changes.

## Architectural Intent

This philosophy keeps Veriq consistent:

- extraction stays grounded in observable DOM evidence
- investigation documents capture selector justification
- implementation remains thin and deterministic
- exceptions are explicit, limited, and reviewable

The result is not a relaxation of standards. It is a clearer hierarchy for making selector choices when real-world snapshots expose only partial semantic structure.
