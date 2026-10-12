from rest_framework import viewsets
from .models import Cliente
from .serializers import ClienteSerializer
from usuarios.permissions import IsAdministrador


class ClienteViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if getattr(self, 'action', None) == 'destroy':
            return [IsAdministrador()]
        return super().get_permissions()
    queryset = Cliente.objects.all().order_by('nombre')
    serializer_class = ClienteSerializer
