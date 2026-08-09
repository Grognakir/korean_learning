# Phase 2 quality report (post F2-I22)

Generated: 2026-08-10  
CP-7: accepted  
Language approval: applied in authoring (F2-I22); **awaiting CP-8**  
Speculative spare content: not generated

## Result

- Status: **language review complete** for §3.2 minimum; CP-8 pending user acceptance
- Approved entities: 576 (via individual decision manifest)
- Contested approvals recorded explicitly: 10
- Non-minimum remainder left draft (does not block §3.2)

## §3.2 approved minimum

| Area                       | Approved |
| -------------------------- | -------: |
| Units                      |       16 |
| Grammar topics             |       80 |
| Primary vocabulary senses  |      192 |
| Canonical reading passages |       16 |
| Grammar exercises          |      160 |
| Vocabulary exercises       |       64 |
| Reading bank exercises     |       48 |

Left draft (intentional): ~899 dictionary senses, 162 non-canonical passages, 100 exam reading questions.

## Contested decisions (approved with notes)

- `grammar.u07.n03` / `grammar.u12.n01` — sequential vs causal `-아/어서`
- `grammar.u07.n05` — `-(으)러` purpose of movement
- `grammar.u09.n02` — `-(으)세요/-(으)십시오`
- `passage.u02.section.37`, `passage.u07.section.s031`, `passage.u09.section.149` — blank markers kept
- Homonym primaries: `dict.dari.noga-ot-bedra-do-stopy`, `dict.bae.zhivot`, `dict.jeo.tot-ta-to-opredelitel-daleko`
- `쪽`/`쭉` not in primary bank → remain draft

## Artifacts

- `content/phase-2/language-review-decisions.json`
- `pnpm content:language-review --write-manifest|--apply`
- Regenerated `supabase/seed.sql`

## Next

- User accepts **CP-8**
- Then F2-I23 preview stabilization / CP-9 / `v0.1.0`
