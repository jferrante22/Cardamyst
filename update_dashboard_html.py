import json
import re

# Load the new dashboard data
with open('/home/user/Cardamyst/dashboard_data.json', 'r') as f:
    new_data = json.load(f)

# Read the existing HTML file
with open('/home/user/Cardamyst/executive-dashboard.html', 'r') as f:
    html_content = f.read()

# Convert the new data to a formatted JSON string
new_data_json = json.dumps(new_data, indent=2)

# Find and replace the dashboard data
# Pattern to match: "const dashboardData = {" ... "};"
# We need to be careful to match the entire JSON object

# Find the start position
start_marker = "const dashboardData = "
start_pos = html_content.find(start_marker)

if start_pos == -1:
    print("ERROR: Could not find 'const dashboardData = ' in HTML file")
    exit(1)

# Find the end of the JSON object (looking for "};" after the data)
# We'll start searching from the start position and count braces
search_start = start_pos + len(start_marker)
brace_count = 0
in_json = False
end_pos = search_start

for i in range(search_start, len(html_content)):
    char = html_content[i]

    if char == '{':
        brace_count += 1
        in_json = True
    elif char == '}':
        brace_count -= 1
        if brace_count == 0 and in_json:
            # Found the closing brace, now look for semicolon
            if i + 1 < len(html_content) and html_content[i + 1] == ';':
                end_pos = i + 2
                break
            else:
                end_pos = i + 1
                break

if end_pos == search_start:
    print("ERROR: Could not find end of dashboardData JSON object")
    exit(1)

# Replace the old data with new data
new_html = (
    html_content[:start_pos] +
    f"const dashboardData = {new_data_json};" +
    html_content[end_pos:]
)

# Write the updated HTML file
with open('/home/user/Cardamyst/executive-dashboard.html', 'w') as f:
    f.write(new_html)

print("Dashboard HTML updated successfully!")
print(f"Data replaced from position {start_pos} to {end_pos}")
