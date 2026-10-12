from rest_framework.permissions import BasePermission
from .roles import display_role, ROLE_ADMIN


def user_role(user):
    return display_role(user)


class IsAdministrador(BasePermission):
    message = 'Esta acción requiere rol Administrador.'

    def has_permission(self, request, view):
        return user_role(request.user) == ROLE_ADMIN
