================================
 oladapt - OpenLayers Adaptador
================================

Este *script* adapta el componente *OpenLayers* que instala *bower*
para poder ser utilizado por *microzn*.

Se puede ejecutar sin argumentos desde la carpeta que contiene el
*script*. En este caso, se asume que *OpenLayers* está en la carpeta
`../../components/openlayers`.

Si estas dos condiciones no se cumplen (ejecutar desde la carpeta que
contiene el *script* y el directorio de *OpenLayers* está en el lugar
indicado), entonces hay que especificar en el parámetro `-p` (*path*)
la ubicación de *OpenLayers*.

El parámetro `-e` puede establecerse a *dev*, para indicar que prepare
*OpenLayers* para un ambiente de desarrollo. Por defecto, *oladapt*
prepara *OpenLayers* para producción.

