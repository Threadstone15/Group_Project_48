@echo off

:: Variables
set TOMCAT_DIR="C:\Program Files\Apache Software Foundation\Tomcat 10.1"
set WEBAPPS_DIR="%TOMCAT_DIR%\webapps"
set WAR_FILE="C:\Users\ASUS\Desktop\Maven_JAVA\java-application\backend\target\crud.war"

:: Stop Tomcat
echo Stopping Tomcat...
%TOMCAT_DIR%\bin\shutdown.bat

:: Remove old application
echo Removing old application...
rmdir /s /q "%WEBAPPS_DIR%\crud"

:: Deploy new application
echo Deploying new application...
copy /y %WAR_FILE% "%WEBAPPS_DIR%"

:: Start Tomcat
echo Starting Tomcat...
%TOMCAT_DIR%\bin\startup.bat

echo Deployment completed.
