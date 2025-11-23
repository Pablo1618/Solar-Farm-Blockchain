#!/usr/bin/env bash

coproc GEN { dotnet /app/DataGeneration.dll; }

sleep 1

echo "start dev01 Power 3 50 100" >&"${GEN[1]}"
echo "start dev02 Power 3 250 350" >&"${GEN[1]}"
echo "start dev03 Power 3 300 400" >&"${GEN[1]}"
echo "start dev04 Power 3 300 450" >&"${GEN[1]}"

echo "start dev01 AirTemp 5 5 15" >&"${GEN[1]}"
echo "start dev02 AirTemp 5 10 20" >&"${GEN[1]}"
echo "start dev03 AirTemp 5 20 30" >&"${GEN[1]}"
echo "start dev04 AirTemp 5 25 30" >&"${GEN[1]}"

echo "start dev01 PanelTemp 5 15 20" >&"${GEN[1]}"
echo "start dev02 PanelTemp 5 40 60" >&"${GEN[1]}"
echo "start dev03 PanelTemp 5 60 80" >&"${GEN[1]}"
echo "start dev04 PanelTemp 5 70 90" >&"${GEN[1]}"

echo "start dev01 Irradiance 3 200 400" >&"${GEN[1]}"
echo "start dev02 Irradiance 3 500 700" >&"${GEN[1]}"
echo "start dev03 Irradiance 3 600 800" >&"${GEN[1]}"
echo "start dev04 Irradiance 3 700 900" >&"${GEN[1]}"

sleep 120

echo "exit" >&"${GEN[1]}"
exec {GEN[1]}>&-
wait "${GEN_PID}"
