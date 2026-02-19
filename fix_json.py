import json
import os

# Definiera sökvägen till din fil
input_path = os.path.join('data', 'buildings.geojson')
output_path = os.path.join('data', 'buildings_with_id.geojson')

# 1. Ladda originalfilen
print(f"Läser filen: {input_path}...")
with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 2. Ge varje byggnad ett permanent nummer (Building_ID)
# Detta nummer kommer aldrig att ändras oavsett hur många gånger du klickar
for i, feature in enumerate(data['features'], start=1):
    feature['properties']['Building_ID'] = i

# 3. Spara med 'indent', vilket gör filen stabil och läsbar för webbläsaren
print(f"Sparar ny fil: {output_path}...")
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Klart! Nu kan du ladda upp 'buildings_with_id.geojson' till din GitHub.")