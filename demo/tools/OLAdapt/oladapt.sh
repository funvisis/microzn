#!/bin/bash

SCRIPT_PATH=$(dirname `which $0`)
OLPATH="../../components/openlayers"

# Esplicación de GETOPTS
# http://stackoverflow.com/questions/12036445/bash-command-line-arguments/12036574#12036574

while getopts p:e: opt; do
  case $opt in
  p)
      OLPATH=$OPTARG
      ;;
  e)
      ENVI=$OPTARG
      ;;
  esac
done

shift $((OPTIND - 1))

if([[ ! -f ${OLPATH}/build/microzn.cfg ]]); then
    # No uso enlace simbólico porque la carpeta
    # del OpenLayers puede estar en cualquier lado.

    cp ${SCRIPT_PATH}/microzn.cfg ${OLPATH}/build
fi
if([[ ! -f ${OLPATH}/OpenLayers.js ]]); then
    # Aquí sí uso enlace simbólico porque tanto
    # el objetivo como la fuente están dentro de
    # la carpeta del OpenLayers, cuya estructura no
    # cambia.

    ln -s build/OpenLayers.js ${OLPATH}
fi

cd ${OLPATH}/build

if([[ $ENVI == dev ]]); then
    BUILDCMD=buildUncompressed.py
else
    BUILDCMD=build.py
fi

./$BUILDCMD microzn

echo "SCRIPT_PATH = " $SCRIPT_PATH
echo "OLPATH = " $OLPATH
echo "ENVI = " $ENVI
