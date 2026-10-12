from rest_framework import viewsets
from .models import Habitacion
from .serializers import HabitacionSerializer
from usuarios.permissions import IsAdministrador


class HabitacionViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if getattr(self, 'action', None) == 'destroy':
            return [IsAdministrador()]
        return super().get_permissions()
    queryset = Habitacion.objects.all().order_by('numero')
    serializer_class = HabitacionSerializer
