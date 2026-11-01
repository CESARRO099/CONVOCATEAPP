# Habilidades de Claude para ConvocaTE

Estas piezas guían a Claude cuando trabaja en este repositorio. No son parte de la app: no se publican (ver `.vercelignore`) y no cambian nada de lo que ven los usuarios.

Vienen del proyecto de código abierto **ECC** de Affaan Mustafa (https://github.com/affaan-m/ECC, antes `everything-claude-code`, licencia MIT, versión 2.2.3, commit `b38be6a` del 29/10/2026). La licencia está en `ECC-LICENSE`.

Se eligieron 14 piezas de las más de 480 del paquete (5 en la primera tanda, 9 en la segunda), se leyeron y se revisaron (sin caracteres ocultos, sin comandos que descarguen o ejecuten código externo). No se instaló el paquete ni se activó ningún automatismo (`hooks`).

| Pieza | Para qué sirve en ConvocaTE |
|---|---|
| `skills/click-path-audit` | Seguir cada botón de la app paso a paso y encontrar los que "no hacen nada" porque un paso deshace al anterior. |
| `skills/production-audit` | Revisar con evidencia local si un cambio está listo para salir y qué podría romperse. |
| `skills/accessibility` | Revisar accesibilidad (WCAG 2.2): foco, contraste, tamaño de botones, lectores de pantalla. |
| `skills/postgres-patterns` | Buenas prácticas de la base de datos (índices, tipos, RLS) basadas en las de Supabase. |
| `agents/database-reviewer` | Revisor de base de datos para funciones y migraciones. |
| `skills/security-review` | Lista de control de seguridad: contraseñas, secretos, entradas del usuario, permisos. |
| `skills/database-migrations` | Cómo hacer cambios de base seguros y reversibles (solo valen los principios generales). |
| `skills/architecture-decision-records` | Dejar por escrito el porqué de cada decisión importante (por ejemplo reglas de adjudicación). |
| `skills/codebase-onboarding` | Armar una guía de la app para que una sesión nueva de Claude se ponga al día rápido. |
| `skills/safety-guard` | Recordatorio de cuidado antes de comandos destructivos (solo orientativo, no bloquea nada). |
| `agents/code-reviewer` | Revisión general de cambios de código antes de proponerlos. |
| `agents/security-reviewer` | Revisor de seguridad para funciones con contraseña y correos. |
| `agents/silent-failure-hunter` | Busca errores que se tragan sin avisar (clave en funciones de correo y adjudicación). |
| `agents/code-explorer` | Recorre cómo funciona una parte de la app de punta a punta, sin modificar nada. |

## Lo que se quitó del original

- En `postgres-patterns`: la "plantilla de configuración" con `ALTER SYSTEM` y `REVOKE ALL ON SCHEMA public`, que en Supabase puede romper permisos si se ejecuta tal cual.
- En `database-reviewer`: los comandos `psql $DATABASE_URL` (aquí la base se maneja con las herramientas de Supabase).
- En `security-reviewer`: el comando `npx eslint` (la app no usa npm). En `safety-guard`: la sección de integración con otras herramientas. En `database-migrations`: se agregó una nota aclarando qué partes no aplican.
- En `click-path-audit` y `production-audit`: ejemplos y enlaces a otras piezas del paquete que no se incluyeron.

## Regla de uso

Estas piezas son guías para revisar y proponer. Nada de lo que sugieran se aplica a la base real, ni se manda un correo o se lanza una convocatoria, sin el OK explícito de César.
