import json

# Load current dashboard data
with open('/home/user/Cardamyst/dashboard_data.json', 'r') as f:
    data = json.load(f)

# Load logo base64
with open('/home/user/Cardamyst/logo_base64.txt', 'r') as f:
    lines = f.readlines()
    logo_b64 = lines[1].strip()  # Second line has the base64

# Read the template, replace data and logo
html_template_start = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Market Access Dashboard - Cardamyst</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
'''

# CSS and rest of HTML will be added by the complete file generation
# For now, this confirms we have the tools to update

print(f"Logo base64 length: {len(logo_b64)}")
print("Dashboard data loaded successfully")
print(f"Commercial coverage: {data['coverage_snapshot']['commercial']['coverage_percent']}%")
