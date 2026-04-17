import csv
from django.http import HttpResponse
from django.contrib import admin
from .models import Report

@admin.action(description="Export selected reports to CSV")
def export_reports_as_csv(modeladmin, request, queryset):
    # Create the HttpResponse object with the appropriate CSV header.
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="audit_reports.csv"'

    writer = csv.writer(response)
    # Write the header row including the unique_user_id field
    writer.writerow(['ID', 'Feedback', 'Purpose', 'Outcome', 'Conversation Link', 'Rating', 'Timestamp', 'Unique User ID'])

    # Write the data rows for each selected object
    for report in queryset:
        writer.writerow([
            report.id,
            report.feedback,
            report.purpose,
            report.outcome,
            report.conversation_link,
            report.rating,
            report.timestamp,
            report.unique_user_id,  # Include unique_user_id in the data row
        ])

    return response

class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'feedback', 'purpose', 'outcome', 'conversation_link', 'rating', 'timestamp', 'unique_user_id')
    actions = [export_reports_as_csv]

# Register the model with the custom admin class
admin.site.register(Report, ReportAdmin)
