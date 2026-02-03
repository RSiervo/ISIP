from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count
from django.contrib.auth.models import User
from .models import Idea
# Fix: Ensure UserSerializer is imported
from .serializers import IdeaSerializer, UserSerializer

class IdeaViewSet(viewsets.ModelViewSet):
    queryset = Idea.objects.all()
    serializer_class = IdeaSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class PublicTrackView(APIView):
    permission_classes = [permissions.AllowAny()]

    def get(self, request, ref_id):
        try:
            # We use reference_id because that's the snake_case name in models.py
            idea = Idea.objects.get(reference_id=ref_id)
            serializer = IdeaSerializer(idea)
            return Response(serializer.data)
        except Idea.DoesNotExist:
            return Response({"error": "Reference token not found"}, status=404)

class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated()]

    def get(self, request):
        total = Idea.objects.count()
        by_status = Idea.objects.values('status').annotate(count=Count('status'))
        
        status_dict = {s['status']: s['count'] for s in by_status}
        formatted_status = {
            "Review": status_dict.get('Review', 0),
            "Pilot": status_dict.get('Pilot', 0),
            "Implemented": status_dict.get('Implemented', 0),
            "Deferred": status_dict.get('Deferred', 0),
        }

        top_depts = Idea.objects.values('department').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        return Response({
            "total": total,
            "byStatus": formatted_status,
            "topDepartments": list(top_depts)
        })

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated()]