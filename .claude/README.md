# Habilidades de Claude para ConvocaTE

Estas piezas guían a Claude cuando trabaja en este repositorio. No son parte de la app: no se publican (ver `.vercelignore`) y no cambian nada de lo que ven los usuarios.

Vienen del proyecto de código abierto **ECC** de Affaan Mustafa (https://github.com/affaan-m/ECC, antes `everything-claude-code`, licencia MIT, versión 2.2.3, commit `b38be6a` del 29/10/2026). La licencia está en `ECC-LICENSE`.

Se eligieron solo 5 piezas de las más de 400 del paquete, se leyeron completas y se revisaron (sin caracteres ocultos, sin comandos que descarguen o ejecuten código externo). No se instaló el paquete ni se activó ningún automatismo (`hooks`).

| Pieza | Para qué sirve en ConvocaTE |
|---|---|
| `skills/click-path-audit` | Seguir cada botón de la app paso a paso y encontrar los que "no hacen nada" porque un paso deshace al anterior. |
| `skills/production-audit` | Revisar con evidencia local si un cambio está listo para salir y qué podría romperse. |
| `skills/accessibility` | Revisar accesibilidad (WCAG 2.2): foco, contraste, tamaño de botones, lectores de pantalla. |
| `skills/postgres-patterns` | Buenas prácticas de la base de datos (índices, tipos, RLS) basadas en las de Supabase. |
| `agents/database-reviewer` | Revisor de base de datos para funciones y migraciones. |

## Lo que se quitó del original

- En `postgres-patterns`: la "plantilla de configuración" con `ALTER SYSTEM` y `REVOKE ALL ON SCHEMA public`, que en Supabase puede romper permisos si se ejecuta tal cual.
- En `database-reviewer`: los comandos `psql $DATABASE_URL` (aquí la base se maneja con las herramientas de Supabase).
- En `click-path-audit` y `production-audit`: ejemplos y enlaces a otras piezas del paquete que no se incluyeron.

## Regla de uso

Estas piezas son guías para revisar y proponer. Nada de lo que sugieran se aplica a la base real, ni se manda un correo o se lanza una convocatoria, sin el OK explícito de César.
