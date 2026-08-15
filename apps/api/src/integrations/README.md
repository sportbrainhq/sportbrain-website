# Integrations

Clients for systems outside this repository. Empty for now.

## The expected first occupant: the content bridge

The SportBrainHQ content-generation service produces website articles. When
that link is built, its client lives here as `content-bridge/`.

Two rules were set when the platform architecture was agreed, and both are
load-bearing:

1. **The website never reads the content service's database.** It calls an
   API. Sharing a database couples the two schemas permanently and means
   neither can be refactored alone.

2. **Data flows one way: content service to website.** The website does not
   write back. This is what keeps the two systems independently deployable.

## Shape of an integration

```
integrations/
  <system>/
    <system>.module.ts
    <system>.client.ts     HTTP calls, retries, timeouts
    <system>.mapper.ts     external shape -> internal shape
    dto/                   the external contract, versioned
```

The mapper is not optional. Letting an external system's response shape reach
application code means their next breaking change becomes yours.

## Rules

1. **Every outbound call has a timeout.** A hanging third party should not
   hang a request here.
2. **Every integration degrades.** If the remote system is down, the website
   serves what it has rather than erroring.
3. **The external contract is versioned and validated on arrival** with Zod,
   at the boundary, so a change is a clear error rather than an `undefined`
   three layers deep.
