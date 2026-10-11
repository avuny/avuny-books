---
trigger: model_decision
description: "Apply when most logic is shared but one small part varies by vendor, channel or platform: social login, OTP delivery, email/SMS/WhatsApp vendors, token storage, payments, file storage."
---

# Provider / strategy pattern

**Use it when** two or more implementations (or one now and a clear second soon) share a flow and differ in a small step.
**Don't** when the variation is only data (URL, client id, template name): that is configuration. Skip it for a single implementation with no foreseeable second.

## Shape
1. **Orchestrator service** owns the shared flow (validation, rate limits, persistence, linking, audit). It never branches on a provider id.
2. **Provider interface** is the smallest surface for the varying step, defined beside the service. Inputs and outputs are normalized types, never vendor payloads.
3. **Implementations** own the vendor SDK or HTTP calls, the mapping to normalized types, and vendor errors mapped to domain errors.
4. **Registry** in the container maps `id` to implementation. Ids come from a shared enum. A provider is enabled only when its env keys are present; disabled ones are absent from the registry and from the capabilities endpoint so clients hide them.
5. **Adding one** = new file, register it, env keys, i18n keys, tests. The orchestrator does not change (see the `add-provider` skill).
6. **Testing:** one shared contract-test suite run against every implementation with fake HTTP, plus orchestrator tests with a fake provider.

## Client side
Same idea for platform differences: the interface lives in the shared package, each app injects its implementation at the root.
