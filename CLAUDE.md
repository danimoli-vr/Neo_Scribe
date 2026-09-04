# Guía para Claude Code

Las convenciones de arquitectura de este proyecto (capa de datos central,
cuándo dividir un componente, gestión segura de `localStorage`, tests) están
documentadas en [`GEMINI.md`](GEMINI.md), en la raíz del repositorio.

Léelo antes de tocar persistencia de datos o de ampliar una vista existente.
Se mantiene en un único archivo compartido entre agentes de IA (en vez de
duplicarlo aquí) para que no queden dos copias desincronizándose con el
tiempo — si actualizas una convención, actualiza `GEMINI.md`, no este archivo.
