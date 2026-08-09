# Контекст сессии — Korean Learning

Последнее обновление: 2026-08-10

## Чем занимаемся

F2-I23 essentially complete pending **CP-9**. Do not tag `v0.1.0` without CP-9.

## F2-I23 — done

- Merge #16 release stabilization + #17 curriculum cache fix
- Remote: migrations, chunked curriculum import, `sample-module` archived
- Remote counts: 16 modules / 80 grammar / 192 dict / 16 passages / 272 exercises
- Vercel: `CONTENT_SOURCE=supabase` on Production + Preview
- Production smoke (`korean-learning-gray.vercel.app`): `/topics` u01–u16, `/topics/u01` OK, sample/demo 404, auth/review/progress/dictionary 200
- Preview deployment URLs remain behind Vercel SSO (known)

## Нужно от пользователя

**CP-9** — проверить production smoke и явно разрешить tag/release `v0.1.0`.

## Ветка

`main` @ `4cd5036`
