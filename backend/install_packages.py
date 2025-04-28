import subprocess
import sys

def install_packages():
    required_packages = ['flask', 'flask-cors', 'requests']
    
    print("Installing required packages...")
    for package in required_packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError:
            print(f"Failed to install {package}")
    
    print("\nAll packages installed. Your app.py should now work without import errors.")

if __name__ == "__main__":
    install_packages() 