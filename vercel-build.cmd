@echo off
echo Generando environment.prod.ts para Vercel...

REM Crear el archivo environment.prod.ts
(
echo export const environment = {
echo   production: true,
echo   firebaseConfig: {
echo     apiKey: '%FIREBASE_API_KEY%',
echo     authDomain: '%FIREBASE_AUTH_DOMAIN%',
echo     projectId: '%FIREBASE_PROJECT_ID%',
echo     storageBucket: '%FIREBASE_STORAGE_BUCKET%',
echo     messagingSenderId: '%FIREBASE_MESSAGING_SENDER_ID%',
echo     appId: '%FIREBASE_APP_ID%'
echo   }
echo };
) > src\environments\environment.prod.ts

echo ✅ Archivo environment.prod.ts generado
echo.
echo Contenido del archivo generado:
echo ----------------------------------------
type src\environments\environment.prod.ts
echo ----------------------------------------

REM Ejecutar build de Angular
echo.
echo Ejecutando ng build...
call ng build --configuration=production
