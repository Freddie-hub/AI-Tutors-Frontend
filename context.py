import os

# List of file paths to combine
file_paths = [
    r"C:\Users\HP\Documents\technofusion\app\globals.css",
    r"C:\Users\HP\Documents\technofusion\app\layout.tsx",
    r"C:\Users\HP\Documents\technofusion\app\page.tsx"
    r"C:\Users\HP\Documents\technofusion\components\navbar.tsx",
    r"C:\Users\HP\Documents\technofusion\components\footer.tsx",
    r"C:\Users\HP\Documents\technofusion\components\overviewContainer.tsx",
    r"C:\Users\HP\Documents\technofusion\components\services.tsx",
    r"C:\Users\HP\Documents\technofusion\components\serviceTags.tsx",
    r"C:\Users\HP\Documents\technofusion\data\services.tsx",
]

# Output file (saved safely in your Downloads folder)
output_file = r"C:\Users\HP\Downloads\Python Scripts\combined_tsx_code2.txt"

with open(output_file, "w", encoding="utf-8") as outfile:
    for path in file_paths:
        outfile.write("\n" + "="*100 + "\n")
        outfile.write(f"File: {path}\n")
        outfile.write("="*100 + "\n\n")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as infile:
                    outfile.write(infile.read())
            except Exception as e:
                outfile.write(f"[Error reading file: {e}]\n")
        else:
            outfile.write("[File not found]\n")

print(f"Combined code written to: {output_file}")
