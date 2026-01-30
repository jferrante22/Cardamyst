import json
from datetime import datetime

# Load the processed fingertip data
with open('/home/user/Cardamyst/fingertip_processed_data.json', 'r') as f:
    fingertip_data = json.load(f)

# Create dashboard data structure with monthly forecast
# For now, we'll keep the existing forecast data and just update Jan-26 actual
dashboard_data = {
    "report_date": "January 2026",
    "last_updated": datetime.now().isoformat(),
    "data_source": "January Fingertip 01.30.xlsx - Updated 01/30/2026",
    "coverage_snapshot": fingertip_data['coverage_snapshot'],
    "top_plans": fingertip_data['top_plans'],
    "monthly_forecast": {
        "commercial": {
            "months": [
                "Jan-26", "Feb-26", "Mar-26", "Apr-26", "May-26", "Jun-26",
                "Jul-26", "Aug-26", "Sep-26", "Oct-26", "Nov-26", "Dec-26",
                "Jan-27", "Feb-27", "Mar-27"
            ],
            "forecast": [
                0.0, 0.0, 0.0, 6.0, 11.0, 29.0, 44.0, 52.0, 58.0, 58.0, 58.0, 58.0,
                71.0, 83.0, 84.0
            ],
            "actual": [
                fingertip_data['coverage_snapshot']['commercial']['coverage_percent'],
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]
        }
    }
}

# Save to JSON
with open('/home/user/Cardamyst/dashboard_data.json', 'w') as f:
    json.dump(dashboard_data, f, indent=2)

print("Dashboard data JSON updated successfully!")
print(json.dumps(dashboard_data, indent=2))
