
import os
import subprocess

# Generated "UtilityHub" icon path
SOURCE_IMAGE = "/Users/muhammadrizwansar/.gemini/antigravity/brain/873e3907-ddcf-4d18-a46e-ebc4e8674f62/utility_hub_icon_1768795165582.png"
PROJECT_ROOT = "/Users/muhammadrizwansar/code/UtilityApp"

IOS_PATH = os.path.join(PROJECT_ROOT, "ios/UtilityApp/Images.xcassets/AppIcon.appiconset")
ANDROID_RES_PATH = os.path.join(PROJECT_ROOT, "android/app/src/main/res")
AMAZON_PATH = os.path.join(PROJECT_ROOT, "amazon_assets")

# (size, filename)
IOS_ICONS = [
    (20, "Icon-20.png"),
    (40, "Icon-20@2x.png"),
    (60, "Icon-20@3x.png"),
    (29, "Icon-29.png"),
    (58, "Icon-29@2x.png"),
    (87, "Icon-29@3x.png"),
    (40, "Icon-40.png"),  # Base 40
    (80, "Icon-40@2x.png"),
    (120, "Icon-40@3x.png"),
    (60, "Icon-60.png"), # Base 60
    (120, "Icon-60@2x.png"),
    (180, "Icon-60@3x.png"),
    (1024, "Icon-1024.png"),
]

# (size, folder_name)
ANDROID_ICONS = [
    (48, "mipmap-mdpi"),
    (72, "mipmap-hdpi"),
    (96, "mipmap-xhdpi"),
    (144, "mipmap-xxhdpi"),
    (192, "mipmap-xxxhdpi"),
]

# (size, filename)
AMAZON_ICONS = [
    (114, "amazon-icon-114.png"),
    (512, "amazon-icon-512.png"),
]

def generate_icon(size, output_path):
    # sips -z height width source --out dest
    cmd = ["sips", "-z", str(size), str(size), SOURCE_IMAGE, "--out", output_path]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
        print(f"Generated: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error generating {output_path}: {e}")

def main():
    if not os.path.exists(SOURCE_IMAGE):
        print(f"Error: Source image not found at {SOURCE_IMAGE}")
        return

    print("Generating iOS icons...")
    if not os.path.exists(IOS_PATH):
        print(f"Error: iOS path not found: {IOS_PATH}")
    else:
        for size, filename in IOS_ICONS:
            generate_icon(size, os.path.join(IOS_PATH, filename))

    print("Generating Android icons...")
    for size, folder in ANDROID_ICONS:
        folder_path = os.path.join(ANDROID_RES_PATH, folder)
        if not os.path.exists(folder_path):
             os.makedirs(folder_path, exist_ok=True)
        
        generate_icon(size, os.path.join(folder_path, "ic_launcher.png"))
        generate_icon(size, os.path.join(folder_path, "ic_launcher_round.png"))

    print("Generating Amazon icons...")
    if not os.path.exists(AMAZON_PATH):
        os.makedirs(AMAZON_PATH, exist_ok=True)
    
    for size, filename in AMAZON_ICONS:
        generate_icon(size, os.path.join(AMAZON_PATH, filename))

if __name__ == "__main__":
    main()
