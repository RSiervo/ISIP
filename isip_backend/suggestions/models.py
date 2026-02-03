import random
import string
import uuid
from django.db import models

def generate_ref_id():
    """
    Generates a unique 6-character alphanumeric reference ID 
    prefixed with ISIP- (e.g., ISIP-A1B2C3)
    """
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ISIP-{code}"

class Idea(models.Model):
    STATUS_CHOICES = [
        ('Review', 'Review'),
        ('Pilot', 'Pilot'),
        ('Implemented', 'Implemented'),
        ('Deferred', 'Deferred'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Use the function above as the default value
    reference_id = models.CharField(
        max_length=20, 
        unique=True, 
        default=generate_ref_id
    )
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Section 1: Identity
    name = models.CharField(max_length=255, blank=True)
    is_anonymous = models.BooleanField(default=False)
    department = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    can_contact = models.BooleanField(default=True)
    
    # Section 2: Proposition
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField()
    
    # Section 3: Impact
    pain_point = models.TextField()
    impact_tags = models.JSONField(default=list) 
    beneficiaries = models.CharField(max_length=255)
    
    # Section 4: Feasibility
    complexity = models.CharField(max_length=100)
    seen_elsewhere = models.BooleanField(default=False)
    seen_elsewhere_detail = models.TextField(blank=True, null=True)
    additional_thoughts = models.TextField(blank=True, null=True)
    
    # Admin Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Review')
    impact_score = models.IntegerField(default=5)
    feasibility_score = models.IntegerField(default=5)
    owner = models.CharField(max_length=255, default='Unassigned')
    internal_notes = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.reference_id} - {self.title}"