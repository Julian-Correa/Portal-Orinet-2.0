# TODO — Portal OriNet 2.0

Estados: `pendiente` · `en-proceso` · `hecho`

---

## Completado en v1

Las siguientes mejoras fueron implementadas en el repositorio original y forman parte de la base estable de la v2:

- Sacar `.env` del control de versiones
- CORS estricto y errores sin fugas
- Tests con Vitest y Supertest
- Unificar capa HTTP Express / Netlify Function (handler canonico)
- Reglas de negocio configurables desde backend
- CI con GitHub Actions
- Limpieza de codigo
- Manejo de errores de red en `updateCustomerEmail`
- Estabilizar Vite 8.x
- Documentacion IA completa

---

## A — Refactor Frontend

### A1 — Extraer hooks de estado y networking
- Estado: pendiente
- Motivo: `App.jsx` concentra logica de sesion, fetching y estado global. Extraer hooks como `useCustomerSession` y `useCustomerSummary` para separar concerns.
- Archivos afectados: `src/App.jsx`, nuevos archivos en `src/hooks/`.

### A2 — Centralizar manejo de estado global
- Estado: pendiente
- Motivo: el estado de sesion se pasa por props desde App. Evaluar Context API o store liviano para desacoplar componentes.
- Depende de: A1.

### A3 — Evaluar router
- Estado: pendiente
- Motivo: si se agregan nuevas pantallas o flujos en 2.0, un router (React Router u otro) simplifica la navegacion y permite deep linking.
- Nota: solo implementar si hay multiples rutas reales. No agregar complejidad innecesaria.

### A4 — Mejorar separacion de componentes
- Estado: pendiente
- Motivo: los componentes existentes (LoginScreen, ProfileScreen, EmailCard) reciben muchas props desde App. Encapsular logica propia en cada componente.
- Depende de: A1, A2.

---

## B — Mejora de UX

### B1 — Rediseno visual
- Estado: pendiente
- Motivo: la v1 tiene un diseno funcional pero basico. La v2 es oportunidad para mejorar la identidad visual.

### B2 — Mejores estados de carga y feedback
- Estado: pendiente
- Motivo: mejorar spinners, skeletons, transiciones y mensajes de error para una experiencia mas pulida.

### B3 — Accesibilidad basica
- Estado: pendiente
- Motivo: revisar contraste, labels, navegacion por teclado y roles ARIA en los componentes principales.

---

## C — Nuevas funcionalidades

### C1 — (Por definir segun necesidad del negocio)
- Estado: pendiente
- Nota: agregar aqui features nuevas a medida que se definan.

---

## D — Infraestructura y observabilidad

### D1 — Logging estructurado
- Estado: pendiente
- Motivo: los errores del proveedor se loguean con `console.error`. Evaluar un formato estructurado para mejor debugging en Netlify.

### D2 — Rate limit distribuido
- Estado: pendiente
- Motivo: el rate limit actual es por instancia de funcion. Si el trafico crece, evaluar solucion distribuida (Redis o similar).
- Prioridad: baja hasta que el trafico lo justifique.

### D3 — Mover express/cors a devDependencies
- Estado: pendiente
- Motivo: `express` y `cors` solo se usan en desarrollo local, no en el runtime serverless. Moverlos a `devDependencies` reduce el tiempo de install en Netlify.

---

## Orden sugerido

1. A1 -> A2 -> A4 (refactor frontend, base para todo lo demas)
2. B1 -> B2 -> B3 (UX, en paralelo con refactor si es posible)
3. A3 (router, solo si se agregan pantallas)
4. C1+ (features nuevas)
5. D1 -> D2 -> D3 (infra, segun necesidad)
