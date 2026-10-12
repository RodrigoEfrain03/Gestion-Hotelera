from django.contrib.auth.models import Group, Permission
from django.db.models import Q

ADMIN_GROUP = 'Administrador'
RECEPTION_GROUP = 'Recepción'
LEGACY_RECEPTION_GROUP = 'Recepcion'
ROLE_ADMIN = 'Administrador'
ROLE_RECEPTION = 'Recepción'

HOTEL_APPS = {'clientes', 'habitaciones', 'reservas', 'checkin_checkout', 'pagos'}


def ensure_roles_and_permissions():
    """Create/update application roles and their permissions. Safe to run repeatedly."""
    admin_group, _ = Group.objects.get_or_create(name=ADMIN_GROUP)
    reception_group, _ = Group.objects.get_or_create(name=RECEPTION_GROUP)

    # Move memberships created by stage 6 using the unaccented internal name.
    legacy = Group.objects.filter(name=LEGACY_RECEPTION_GROUP).first()
    if legacy and legacy.pk != reception_group.pk:
        for user in legacy.user_set.all():
            user.groups.add(reception_group)
        legacy.delete()

    # Administrators can manage all hotel data plus Django users/groups.
    admin_permissions = Permission.objects.filter(
        Q(content_type__app_label__in=HOTEL_APPS)
        | Q(content_type__app_label='auth', content_type__model__in=['user', 'group'])
    )
    admin_group.permissions.set(admin_permissions)

    # Reception can view/create/update operational hotel data, but not delete it.
    reception_permissions = Permission.objects.filter(
        Q(content_type__app_label__in=HOTEL_APPS)
        & (
            Q(codename__startswith='view_')
            | Q(codename__startswith='add_')
            | Q(codename__startswith='change_')
        )
    )
    reception_group.permissions.set(reception_permissions)

    return admin_group, reception_group


def display_role(user):
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser or user.groups.filter(name=ADMIN_GROUP).exists():
        return ROLE_ADMIN
    if user.groups.filter(name__in=[RECEPTION_GROUP, LEGACY_RECEPTION_GROUP]).exists():
        return ROLE_RECEPTION
    return 'Usuario'


def assign_role(user, role):
    admin_group, reception_group = ensure_roles_and_permissions()
    legacy = Group.objects.filter(name=LEGACY_RECEPTION_GROUP).first()
    groups_to_remove = [admin_group, reception_group]
    if legacy:
        groups_to_remove.append(legacy)
    user.groups.remove(*groups_to_remove)

    if role == ROLE_ADMIN:
        user.groups.add(admin_group)
        user.is_staff = True
    elif role == ROLE_RECEPTION:
        user.groups.add(reception_group)
        user.is_staff = False
    else:
        raise ValueError('Rol no reconocido.')

    user.save(update_fields=['is_staff'])
    return user
