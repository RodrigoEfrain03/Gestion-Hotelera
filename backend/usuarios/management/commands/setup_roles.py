from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from usuarios.roles import ADMIN_GROUP, RECEPTION_GROUP, ensure_roles_and_permissions


class Command(BaseCommand):
    help = 'Crea/actualiza los roles Administrador y Recepción con sus permisos.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--assign-superusers',
            action='store_true',
            help='Añade todos los superusuarios existentes al grupo Administrador.',
        )

    def handle(self, *args, **options):
        admin_group, reception_group = ensure_roles_and_permissions()

        if options['assign_superusers']:
            User = get_user_model()
            for user in User.objects.filter(is_superuser=True):
                user.groups.add(admin_group)

        self.stdout.write(self.style.SUCCESS('Roles configurados correctamente.'))
        self.stdout.write(f'  - {ADMIN_GROUP}: {admin_group.permissions.count()} permisos')
        self.stdout.write(f'  - {RECEPTION_GROUP}: {reception_group.permissions.count()} permisos operativos')
        if options['assign_superusers']:
            self.stdout.write(self.style.SUCCESS('Superusuarios añadidos al grupo Administrador.'))
