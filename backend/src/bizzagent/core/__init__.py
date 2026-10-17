"""Application-wide foundations and cross-cutting infrastructure.

Holds: config, database, security, errors, event bus + outbox, tenancy scope, logging.
Never holds: business rules, imports of ``bizzagent.modules``.
"""
