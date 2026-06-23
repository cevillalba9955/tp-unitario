<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Added sections:
  - Core Principles (I–V)
  - Stack Tecnológico y Restricciones
  - Flujo de Trabajo y Calidad
  - Governance
Modified principles: N/A (initial ratification)
Removed sections: N/A
Templates reviewed:
  - .specify/templates/plan-template.md        ✅ alineado (Constitution Check section presente)
  - .specify/templates/spec-template.md        ✅ alineado (User Stories y Requirements compatibles)
  - .specify/templates/tasks-template.md       ✅ alineado (fases y roles de usuario compatibles)
Deferred TODOs: ninguno
-->

# FreelanceHub Constitution

## Core Principles

### I. Separación Estricta de Roles

La plataforma distingue dos actores primarios con responsabilidades mutuamente
excluyentes: **Freelancer** (publica y gestiona servicios) y **Comprador** (navega,
contrata y guarda favoritos). Toda funcionalidad DEBE diseñarse e implementarse
desde la perspectiva de uno de estos roles. Las interfaces, permisos y flujos de
datos NO DEBEN mezclar capacidades de ambos roles en una misma vista o endpoint sin
justificación explícita y aprobación. Un usuario puede tener ambos roles, pero las
vistas deben permanecer separadas.

**Rationale**: Mezclar responsabilidades de roles produce interfaces ambiguas,
reglas de autorización frágiles y experiencias de usuario confusas.

### II. Catálogo como Núcleo del Sistema

El catálogo de servicios es el artefacto central de la plataforma. Toda feature
DEBE justificar su relación con el catálogo (publicación, descubrimiento, contratación
o gestión). Los servicios DEBEN ser navegables y filtrables sin autenticación previa.
La búsqueda y el filtrado por categorías son capacidades de primer nivel y no pueden
degradarse a funcionalidades secundarias.

**Rationale**: El valor de la plataforma reside en la liquidez del catálogo; sin
descubrimiento efectivo, ni freelancers ni compradores tienen incentivo para
permanecer en el sistema.

### III. Integridad y Completitud de los Servicios

Un servicio publicado DEBE contener como mínimo: título, descripción, categoría, al
menos una opción de contratación con precio y tiempo de entrega definidos. Los
servicios incompletos NO DEBEN ser visibles en el catálogo público. Las opciones de
contratación (paquetes) DEBEN tener alcance, precio y plazo explícitos; valores
nulos o genéricos no son aceptables. La validación DEBE ejecutarse en el servidor;
la validación del cliente es complementaria, no sustituta.

**Rationale**: Servicios ambiguos o incompletos generan disputas, bajan la confianza
del comprador y dañan la reputación de la plataforma.

### IV. Seguridad y Control de Acceso Basado en Roles (RBAC)

La autenticación es obligatoria para cualquier acción de escritura (crear servicio,
contratar, guardar favorito). La autorización DEBE verificarse en cada endpoint
sensible; confiar únicamente en el cliente está prohibido. Los freelancers NO DEBEN
poder contratar sus propios servicios. Los compradores NO DEBEN poder modificar
servicios que no les pertenecen. Toda acción sobre datos de otro usuario DEBE
rechazarse con HTTP 403, nunca con 404 (salvo que la ocultación sea el
comportamiento correcto por diseño).

**Rationale**: La mezcla de roles y la falta de validación server-side son las
vulnerabilidades más comunes en marketplaces; este principio las previene de raíz.

### V. Entrega Incremental e Historias Independientes

Cada historia de usuario DEBE poder implementarse, probarse y demostrarse de forma
independiente sin requerir que otras historias estén completas. Las fases de
implementación DEBEN respetar el orden: infraestructura compartida → núcleo de
catálogo (P1) → gestión de servicios (P2) → contratación y favoritos (P3). Ninguna
historia de prioridad inferior DEBE bloquear el despliegue de una de mayor prioridad.
El MVP mínimo es el catálogo público navegable con al menos una historia de Comprador
funcional.

**Rationale**: La entrega incremental permite validar valor con usuarios reales antes
de completar el scope total, y reduce el riesgo de construir funcionalidades no
utilizadas.

## Stack Tecnológico y Restricciones

La plataforma es una **aplicación web** (no móvil nativa). Las decisiones de stack
concretas se documentan en cada `plan.md` de feature. Las siguientes restricciones
son fijas independientemente del stack elegido:

- El backend DEBE exponer una API REST o equivalente; la lógica de negocio NO DEBE
  residir en el cliente.
- El almacenamiento de archivos multimedia (imágenes, videos de servicios) DEBE
  delegarse a un servicio de almacenamiento dedicado; el servidor de aplicaciones
  NO DEBE almacenar binarios localmente en producción.
- Las respuestas de la API DEBEN incluir códigos HTTP semánticamente correctos
  (200, 201, 400, 401, 403, 404, 422, 500).
- La plataforma DEBE funcionar en los navegadores modernos de escritorio; la
  compatibilidad móvil es deseable pero no bloquea el MVP.

## Flujo de Trabajo y Calidad

- Cada feature comienza con una especificación (`spec.md`) aprobada antes de iniciar
  el plan de implementación.
- El `plan.md` DEBE incluir un Constitution Check que valide los principios I–V
  antes de iniciar implementación.
- Las tareas se generan en `tasks.md` organizadas por historia de usuario, en orden
  de prioridad (P1 primero).
- Los tests son opcionales por defecto; si se solicitan, DEBEN escribirse y fallar
  antes de la implementación (Red-Green-Refactor).
- Las decisiones de complejidad que violen algún principio DEBEN justificarse en la
  tabla "Complexity Tracking" del `plan.md`.

## Governance

- Esta constitución es el documento rector del proyecto; en caso de conflicto con
  cualquier otra guía, este documento prevalece.
- Las enmiendas requieren: (1) descripción del cambio, (2) justificación, (3)
  actualización de `CONSTITUTION_VERSION` según semver, (4) propagación a los
  templates afectados.
- El Constitution Check en cada `plan.md` es una puerta obligatoria (GATE); no
  puede omitirse.
- La revisión de cumplimiento ocurre en cada plan de implementación y en la revisión
  de código de cada feature.
- Las consultas sobre aplicación de principios en casos límite se resuelven
  favoreciendo el principio de menor sorpresa para el usuario final.

**Version**: 1.0.0 | **Ratified**: 2026-06-23 | **Last Amended**: 2026-06-23
