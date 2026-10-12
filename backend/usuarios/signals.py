from django.db.models.signals import post_migrate
from django.dispatch import receiver

from .roles import ensure_roles_and_permissions


@receiver(post_migrate)
def configure_default_roles(sender, **kwargs):
    # Idempotent: it is safe to run after every migrate.
    ensure_roles_and_permissions()
