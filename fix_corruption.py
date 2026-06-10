import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'd:\桌面\gitlab\web_mall\src\views\PointsManagement.vue', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines 3348-3355
print("=== Lines 3348-3355 ===")
for i in range(3347, 3356):
    print(f"L{i+1}: {repr(lines[i].rstrip()[:80])}")

print("\n=== Lines 3408-3416 ===")
for i in range(3407, 3417):
    print(f"L{i+1}: {repr(lines[i].rstrip()[:80])}")
