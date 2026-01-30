import openpyxl
import json

# Load the processed data
with open('/home/user/Cardamyst/fingertip_processed_data.json', 'r') as f:
    new_data = json.load(f)

# Load the Coverage Tracker
tracker_file = '/home/user/Cardamyst/Cardamyst_Coverage_Tracker Jan 2026.xlsx'
wb = openpyxl.load_workbook(tracker_file)

# Update Executive Summary sheet
exec_ws = wb['Executive Summary']

# Update report date (Row 4, Column B)
exec_ws['B4'] = 'January 2026 (Updated 01/30/2026)'

# Update coverage snapshot data
# Row 8: Commercial
exec_ws['B8'] = new_data['coverage_snapshot']['commercial']['total_lives']
exec_ws['C8'] = new_data['coverage_snapshot']['commercial']['covered_lives']
exec_ws['D8'] = new_data['coverage_snapshot']['commercial']['coverage_percent'] / 100

# Row 9: Federal Programs
exec_ws['B9'] = new_data['coverage_snapshot']['federal_programs']['total_lives']
exec_ws['C9'] = new_data['coverage_snapshot']['federal_programs']['covered_lives']
exec_ws['D9'] = new_data['coverage_snapshot']['federal_programs']['coverage_percent'] / 100

# Row 10: Medicare
exec_ws['B10'] = new_data['coverage_snapshot']['medicare']['total_lives']
exec_ws['C10'] = new_data['coverage_snapshot']['medicare']['covered_lives']
exec_ws['D10'] = new_data['coverage_snapshot']['medicare']['coverage_percent'] / 100

# Row 11: Medicaid
exec_ws['B11'] = new_data['coverage_snapshot']['medicaid']['total_lives']
exec_ws['C11'] = new_data['coverage_snapshot']['medicaid']['covered_lives']
exec_ws['D11'] = new_data['coverage_snapshot']['medicaid']['coverage_percent'] / 100

# Row 12: Total (formulas should auto-calculate, but we can set them)
exec_ws['B12'] = new_data['coverage_snapshot']['total']['total_lives']
exec_ws['C12'] = new_data['coverage_snapshot']['total']['covered_lives']
exec_ws['D12'] = new_data['coverage_snapshot']['total']['coverage_percent'] / 100

# Update top plans (Rows 16-25)
# Clear existing data first
for row in range(16, 26):
    exec_ws[f'A{row}'] = None
    exec_ws[f'B{row}'] = None
    exec_ws[f'C{row}'] = None
    exec_ws[f'D{row}'] = None

# Add new top plans
for i, plan in enumerate(new_data['top_plans'][:10], start=16):
    exec_ws[f'A{i}'] = plan['name']
    exec_ws[f'B{i}'] = plan['type']
    exec_ws[f'C{i}'] = plan['covered_lives']
    exec_ws[f'D{i}'] = plan['status']

# Update Monthly Tracking sheet
monthly_ws = wb['Monthly Tracking']

# Update Jan-26 actual data (Column B)
# Row 7: Commercial Actual %
monthly_ws['B7'] = new_data['coverage_snapshot']['commercial']['coverage_percent'] / 100

# Row 9: Commercial Covered Lives
monthly_ws['B9'] = new_data['coverage_snapshot']['commercial']['covered_lives']

# Row 10: Federal Lives
monthly_ws['B10'] = new_data['coverage_snapshot']['federal_programs']['covered_lives']

# Row 14: Medicare Actual %
monthly_ws['B14'] = new_data['coverage_snapshot']['medicare']['coverage_percent'] / 100

# Row 15: Medicare Covered Lives
monthly_ws['B15'] = new_data['coverage_snapshot']['medicare']['covered_lives']

# Row 19: Medicaid Actual %
monthly_ws['B19'] = new_data['coverage_snapshot']['medicaid']['coverage_percent'] / 100

# Row 20: Medicaid Covered Lives
monthly_ws['B20'] = new_data['coverage_snapshot']['medicaid']['covered_lives']

# Update Charts sheet
charts_ws = wb['Charts']

# Row 4: Jan-26 data
charts_ws['C4'] = new_data['coverage_snapshot']['commercial']['coverage_percent'] / 100  # Comm Actual
charts_ws['D4'] = new_data['coverage_snapshot']['medicare']['coverage_percent'] / 100    # Medicare
charts_ws['E4'] = new_data['coverage_snapshot']['medicaid']['coverage_percent'] / 100    # Medicaid
# Total calculation
total_pct = new_data['coverage_snapshot']['total']['coverage_percent'] / 100
charts_ws['F4'] = total_pct

# Update Plan Detail sheet with top plans
plan_detail_ws = wb['Plan Detail']

# Update the total count (Row 2)
total_plans = len(new_data['top_plans'])
total_covered = new_data['coverage_snapshot']['total']['covered_lives']
plan_detail_ws['A2'] = f'Total: {total_plans} plans covering {total_covered:,} lives'

# Clear existing plan data (rows 5+)
for row in range(5, 100):  # Clear up to row 100
    for col in ['A', 'B', 'C', 'D', 'E', 'F']:
        plan_detail_ws[f'{col}{row}'] = None

# Add new plan data
current_row = 5
for plan in new_data['top_plans']:
    # Determine segment
    plan_type = plan['type']
    if plan_type == 'Fed Prog':
        segment = 'Commercial (Federal)'
    elif plan_type in ['Commercial', 'Employer', 'PBM', 'FEHBP', 'HIX', 'Pvt HIX', 'Municipal Plan']:
        segment = 'Commercial'
    elif plan_type in ['Medicare PDP', 'Medicare MA', 'Medicare SN', 'EGWP', 'Medi-Medi', 'PACE']:
        segment = 'Medicare'
    elif plan_type in ['State Medicaid', 'Managed Medicaid', 'HIX-Medicaid', 'CHiP']:
        segment = 'Medicaid'
    else:
        segment = 'Other'

    plan_detail_ws[f'A{current_row}'] = segment
    plan_detail_ws[f'B{current_row}'] = plan['name']
    plan_detail_ws[f'C{current_row}'] = plan['type']
    plan_detail_ws[f'D{current_row}'] = ''  # Payer Name (we don't have this in top_plans)
    plan_detail_ws[f'E{current_row}'] = plan['covered_lives']
    plan_detail_ws[f'F{current_row}'] = plan['status']
    current_row += 1

# Save the updated workbook
wb.save(tracker_file)
print(f"Coverage Tracker updated successfully!")
print(f"Updated file: {tracker_file}")
