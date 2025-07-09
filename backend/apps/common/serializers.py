from rest_framework import serializers

class ErrorSerializer(serializers.Serializer):
    error = serializers.CharField()
    detail = serializers.CharField(required=False)
    code = serializers.CharField(required=False)

class SuccessSerializer(serializers.Serializer):
    message = serializers.CharField()
    data = serializers.DictField(required=False)

class PaginationSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(required=False, allow_null=True)
    previous = serializers.URLField(required=False, allow_null=True)
    results = serializers.ListField()