import base64

# Convert logo to base64 for embedding
with open('/home/user/Cardamyst/extracted_assets/slide29_image2.png', 'rb') as f:
    logo_data = base64.b64encode(f.read()).decode('utf-8')

print(f"Logo base64 (length: {len(logo_data)} chars):")
print(logo_data)
