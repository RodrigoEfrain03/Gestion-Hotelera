from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .permissions import IsAdministrador
from .serializers import CurrentUserSerializer, UserAdminSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(CurrentUserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserAdminSerializer
    permission_classes = [IsAdministrador]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def perform_destroy(self, instance):
        if instance.pk == self.request.user.pk:
            raise ValidationError({'detail': 'No puedes eliminar tu propia cuenta.'})
        instance.delete()
