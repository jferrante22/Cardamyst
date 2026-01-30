import openpyxl

# Load the Coverage Tracker to get definitions
tracker_file = '/home/user/Cardamyst/Cardamyst_Coverage_Tracker Jan 2026.xlsx'
wb = openpyxl.load_workbook(tracker_file, data_only=True)

# Read Definitions sheet
defs_ws = wb['Definitions']

print("COVERAGE STATUS DEFINITIONS")
print("="*80)
for row in defs_ws.iter_rows(min_row=10, values_only=True):
    if row[0] and row[0] != 'Status':
        status = row[0]
        counted = row[1] if len(row) > 1 else ''
        rationale = row[2] if len(row) > 2 else ''
        print(f"Status: {status}")
        print(f"  Counted as Covered? {counted}")
        print(f"  Rationale: {rationale}")
        print()

wb.close()
