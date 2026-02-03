from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Idea

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'last_login']

class IdeaSerializer(serializers.ModelSerializer):
    # Mapping model fields to frontend-expected names (snake_case to camelCase)
    referenceId = serializers.CharField(source='reference_id')
    isAnonymous = serializers.BooleanField(source='is_anonymous')
    canContact = serializers.BooleanField(source='can_contact')
    painPoint = serializers.CharField(source='pain_point')
    impactTags = serializers.JSONField(source='impact_tags')
    seenElsewhere = serializers.BooleanField(source='seen_elsewhere')
    seenElsewhereDetail = serializers.CharField(source='seen_elsewhere_detail', required=False, allow_null=True)
    additionalThoughts = serializers.CharField(source='additional_thoughts', required=False, allow_null=True)
    impactScore = serializers.IntegerField(source='impact_score')
    feasibilityScore = serializers.IntegerField(source='feasibility_score')
    internalNotes = serializers.CharField(source='internal_notes', required=False, allow_blank=True)
    lastUpdated = serializers.DateTimeField(source='last_updated', read_only=True)
    isRead = serializers.BooleanField(source='is_read')

    class Meta:
        model = Idea
        fields = [
            'id', 'referenceId', 'timestamp', 'name', 'isAnonymous', 
            'department', 'role', 'canContact', 'title', 'category', 
            'description', 'painPoint', 'impactTags', 'beneficiaries', 
            'complexity', 'seenElsewhere', 'seenElsewhereDetail', 
            'additionalThoughts', 'status', 'impactScore', 
            'feasibilityScore', 'owner', 'internalNotes', 
            'lastUpdated', 'isRead'
        ]