from django.contrib import admin
from .models import Idea

@admin.register(Idea)
class IdeaAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'title', 'department', 'status', 'impact_score', 'feasibility_score', 'is_read', 'timestamp')
    list_filter = ('status', 'department', 'category', 'complexity', 'is_read', 'can_contact')
    search_fields = ('reference_id', 'title', 'description', 'name')
    readonly_fields = ('id', 'reference_id', 'timestamp', 'last_updated')
    
    fieldsets = (
        ('Reference', {
            'fields': ('id', 'reference_id', 'timestamp', 'last_updated')
        }),
        ('Identity', {
            'fields': ('name', 'is_anonymous', 'department', 'role', 'can_contact')
        }),
        ('Proposition', {
            'fields': ('title', 'category', 'description')
        }),
        ('Impact & Feasibility', {
            'fields': ('pain_point', 'impact_tags', 'beneficiaries', 'complexity', 'seen_elsewhere', 'seen_elsewhere_detail')
        }),
        ('Admin Management', {
            'fields': ('status', 'impact_score', 'feasibility_score', 'owner', 'internal_notes', 'is_read')
        }),
    )