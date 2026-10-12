from django.contrib.auth.models import User
from rest_framework import serializers
from .permissions import user_role
from .roles import assign_role, ROLE_ADMIN, ROLE_RECEPTION


class CurrentUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name', 'role', 'is_active']

    def get_role(self, obj):
        return user_role(obj)

    def get_name(self, obj):
        full = obj.get_full_name().strip()
        return full or obj.username


class UserAdminSerializer(CurrentUserSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    role = serializers.ChoiceField(choices=[ROLE_ADMIN, ROLE_RECEPTION], write_only=True, required=False)
    role_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'name', 'role', 'role_display', 'is_active', 'password']

    def get_role_display(self, obj):
        return user_role(obj)

    def validate_username(self, value):
        qs = User.objects.filter(username__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ya existe un usuario con este nombre.')
        return value

    def validate_email(self, value):
        if not value:
            return value
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Ya existe un usuario con este correo.')
        return value

    def _apply_role(self, user, role):
        assign_role(user, role)

    def create(self, validated_data):
        role = validated_data.pop('role', 'Recepción')
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria.'})
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        self._apply_role(user, role)
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role:
            self._apply_role(instance, role)
        return instance
