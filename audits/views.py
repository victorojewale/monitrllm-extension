from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
import json
from .models import Report
import re
import traceback



@csrf_exempt
def submit_report(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            #print("Incoming data:", data)

            conversation_link = data.get('conversation_link')
            unique_user_id = data.get('user_id')

            # Ensure conversation_link is a string and matches the expected URL format
            if not conversation_link or not isinstance(conversation_link, str):
                return JsonResponse({'status': 'error', 'message': 'Conversation link must be a valid string.'}, status=400)

            # Custom URL validation for conversation links
            pattern = r'^https:\/\/chatgpt\.com\/share\/[a-f0-9\-]+$'
            if not re.match(pattern, conversation_link):
                return JsonResponse({'status': 'error', 'message': 'Conversation link must be a valid ChatGPT share link.'}, status=400)

            # Prevent duplicate conversation links
            if Report.objects.filter(conversation_link=conversation_link).exists():
                return JsonResponse({'status': 'error', 'message': 'This conversation link has already been submitted.'}, status=400)

            # Validate that feedback or conversation link is provided
            if not (data.get('feedback') or conversation_link):
                return JsonResponse({'status': 'error', 'message': 'Feedback or Conversation Link is required.'}, status=400)
            rating = data.get('rating')
            try:
                rating = int(rating) if rating is not None else None
            except ValueError:
                return JsonResponse({'status': 'error', 'message': 'Rating must be a number.'}, status=400)

            report = Report(
                feedback=data.get('feedback'),
                purpose=data.get('purpose'),
                outcome=data.get('outcome'),
                conversation_link=conversation_link,
                rating=rating,
                unique_user_id=unique_user_id
            )

            report.save()

            return JsonResponse({'status': 'success', 'message': 'Report submitted successfully.'})

        except Exception as e:
            import sys
            exc_type, exc_value, exc_traceback = sys.exc_info()
            print("Error submitting report:", e)
            traceback_lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
            print(''.join(traceback_lines))
            return JsonResponse({'status': 'error', 'message': 'Internal server error'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


def view_reports(request):
    user_id = request.GET.get('user_id')
    if user_id:
        reports = Report.objects.filter(unique_user_id=user_id).values()
    else:
        reports = Report.objects.all().values()
    return JsonResponse(list(reports), safe=False)

@csrf_exempt
def delete_report(request, report_id):
    if request.method == 'DELETE':
        try:
            report = Report.objects.get(id=report_id)
            report.delete()
            return JsonResponse({'status': 'success', 'message': 'Report deleted successfully.'})
        except Report.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Report not found.'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
