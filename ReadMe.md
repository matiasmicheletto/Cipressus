# Cupressys

Sistema de cómputo de calificaciones de actividades académicas

## Estructura básica

Las actividades del curso se organizan en una estructura jerárquica que permite calcular la calificación general un alumno o parcial de cada actividad realizada recorriendo el árbol y computando la suma ponderada de los puntajes obtenidos y registrados en cada hoja del arbol.
Existe un arbol que contiene los factores de ponderación y luego cada alumno tiene su lista de notas referenciadas a las hojas del arbol.

Ejemplo de jerarquía de actividades:

```json
{
  "calificaciones": { // Raíz del arbol
    "nombre": "Nota final", 
    "factor": 1,
    "children": [{
        "nombre": "asistencia",     // Nombre de la actividad
        "factor": 0.15          // La nota aporta el 15% de la calificación total
      },
      {
        "nombre": "parciales",
        "factor": 0.5,          // Esta actividad aporta el 50%
        "children": [{
          "nombre": "Primer parcial",  
          "factor": 0.5,            // Para obtener el aporte a la calificacion total hay que multplicar factores hasta llegar a la raiz
          "children": [{
            "nombre": "Ej 1 - Primer parcial",
            "factor": 0.25,
            "id":"p1_ej1"       // El identificador sirve para obtener la nota del alumno y no puede repetirse
          }, {
            "nombre": "Ej 2 - Primer parcial",
            "factor": 0.25,
            "id":"p1_ej2"
          }, {
            "nombre": "Ej 3 - Primer parcial",
            "factor": 0.25,
            "id":"p1_ej3"
          }, {
            "nombre": "Ej 4 - Primer parcial",
            "factor": 0.25,
            "id":"p1_ej4"
          }]
        }, {
          "nombre": "Segundo parcial",
          "factor": 0.5,
          "children": [{
            "nombre": "Ej 1 - Segundo parcial",
            "factor": 0.25,
            "id":"p2_ej1"
          }, {
            "nombre": "Ej 2 - Segundo parcial",
            "factor": 0.25,
            "id":"p2_ej2"
          }, {
            "nombre": "Ej 3 - Segundo parcial",
            "factor": 0.25,
            "id":"p2_ej3"
          }, {
            "nombre": "Ej 4 - Segundo parcial",
            "factor": 0.25,
            "id":"p2_ej4"
          }]
        }]
      },
      {
        "nombre": "laboratorios",
        "factor": 0.35,
        "children": [{
            "nombre": "Probador",
            "factor": 0.2,
            "vencimiento": 2000,        // Esta actividad tiene asignada una fecha de vencimiento (unix time)
            "desgaste": 1,              // El desgaste son los puntos que pierde por día transcurrido
            "children": [{
                "nombre": "Estética probador",
                "factor": 0.5,
                "id":"l0_estetica"
              },
              {
                "nombre": "Funcionamiento probador",
                "factor": 0.5,
                "id":"l0_funcionamiento"
              }
            ]
          },
          {
            "nombre": "Laboratorio 1",
            "factor": 0.16,
            "vencimiento":2000,
            "desgaste": 10,
            "children": [{
                "nombre": "Implementación laboratorio 1",
                "factor": 0.4,
                "children": [{
                    "nombre": "Presentación prototipo laboratorio 1",
                    "factor": 0.5,
                    "id":"l1_impl_presentacion"
                  },
                  {
                    "nombre": "Funcionamiento prototipo laboratorio 1",
                    "factor": 0.5,
                    "id":"l1_impl_funcionamiento"
                  }
                ]
              },
              {
                "nombre": "Informe laboratorio 1",
                "factor": 0.6,
                "children": [{
                  "nombre": "Presentación informe laboratorio 1",
                  "factor": 0.5,
                  "id":"l1_informe_presentacion"
                }, {
                  "nombre": "Contenido informe laboratorio 1",
                  "factor": 0.5,
                  "id":"l1_informe_contenido"
                }]
              }
            ]
          },
          {
            "nombre": "Laboratorio 2",
            "factor": 0.16,
            "vencimiento":2000,
            "desgaste": 10,
            "children": [{
                "nombre": "Implementación laboratorio 2",
                "factor": 0.4,
                "children": [{
                    "nombre": "Presentación prototipo laboratorio 2",
                    "factor": 0.5,
                    "id":"l2_impl_presentacion"
                  },
                  {
                    "nombre": "Funcionamiento prototipo laboratorio 2",
                    "factor": 0.5,
                    "id":"l2_impl_funcionamiento"
                  }
                ]
              },
              {
                "nombre": "Informe laboratorio 2",
                "factor": 0.6,
                "children": [{
                  "nombre": "Presentación informe laboratorio 2",
                  "factor": 0.5,
                  "id":"l2_informe_presentacion"
                }, {
                  "nombre": "Contenido informe laboratorio 2",
                  "factor": 0.5,
                  "id":"l2_informe_contenido"
                }]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

