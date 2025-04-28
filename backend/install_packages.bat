@echo off
echo Installing required packages...
echo.

python -m pip install flask
echo Flask installed
echo.

python -m pip install flask-cors
echo Flask-CORS installed
echo.

python -m pip install requests
echo Requests installed
echo.

echo All required packages have been installed.
echo Your app.py should now work without import errors.
echo.
pause 