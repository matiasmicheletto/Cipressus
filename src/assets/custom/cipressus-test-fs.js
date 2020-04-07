(function (public) { ///// Test Felder-Silverman de estilos de aprendizaje
    public.test_FS = {
        questions: [{
                text: "Entiendo mejor algo",
                options: ["si lo practico.", "si pienso en ello."]
            },
            {
                text: "Me considero",
                options: ["realista.", "innovador."]
            },
            {
                text: "Cuando pienso acerca de lo que hice ayer, es más probable que lo haga sobre la base de",
                options: ["una imagen.", "palabras."]
            },
            {
                text: "Tengo tendencia a",
                options: ["entender los detalles de un tema pero no ver claramente su estructura completa", "entender la estructura completa pero no ver claramente los detalles."]
            },
            {
                text: "Cuando estoy aprendiendo algo nuevo, me ayuda",
                options: ["hablar de ello.", "pensar en ello."]
            },
            {
                text: "Si yo fuera profesor, yo preferiría dar un curso",
                options: ["que trate sobre hechos y situaciones reales de la vida.", "que trate con ideas y teorías."]
            },
            {
                text: "Prefiero obtener información nueva de",
                options: ["imágenes, diagramas, gráficas o mapas.", " instrucciones escritas o información verbal."]
            },
            {
                text: "Una vez que entiendo",
                options: ["todas las partes, entiendo el total.", "el total de algo, entiendo como encajan sus partes."]
            },
            {
                text: "En un grupo de estudio que trabaja con un material difícil, es más probable que",
                options: ["participe y contribuya con ideas.", "no participe y solo escuche."]
            },
            {
                text: "Es más fácil para mí",
                options: ["aprender hechos.", "aprender conceptos."]
            },
            {
                text: "En un libro con muchas imágenes y gráficas es más probable que",
                options: ["revise cuidadosamente las imágenes y las gráficas.", " me concentre en el texto escrito."]
            },
            {
                text: "Cuando resuelvo problemas de matemáticas",
                options: ["generalmente trabajo sobre las soluciones con un paso a la vez.", "frecuentemente sé cuales son las soluciones, pero luego tengo dificultad para imaginarme los pasos para llegar a ellas."]
            },
            {
                text: "En las clases a las que he asistido",
                options: ["he llegado a saber como son muchos de los estudiantes.", "raramente he llegado a saber como son muchos estudiantes."]
            },
            {
                text: "Cuando leo temas que no son de ficción, prefiero",
                options: ["algo que me enseñe nuevos hechos o me diga como hacer algo.", "algo que me dé nuevas ideas en que pensar."]
            },
            {
                text: "Me gustan los maestros",
                options: ["que utilizan muchos esquemas en el pizarrón.", "que toman mucho tiempo para explicar."]
            },
            {
                text: "Cuando estoy analizando un cuento o una novela",
                options: ["pienso en los incidentes y trato de acomodarlos para configurar los temas.", "me doy cuenta de cuales son los temas cuando termino de leer y luego tengo que regresar y encontrar los incidentes que los demuestran."]
            },
            {
                text: "Cuando comienzo a resolver un problema de tarea, es más probable que",
                options: ["comience a trabajar en su solución inmediatamente.", "primero trate de entender completamente el problema."]
            },
            {
                text: "Prefiero la idea de",
                options: ["certeza.", "teoría."]
            },
            {
                text: "Recuerdo mejor",
                options: ["lo que veo.", "lo que oigo."]
            },
            {
                text: "Es más importante para mí que un profesor",
                options: ["exponga el material en pasos secuenciales claros.", "me dé un panorama general y relacione el material con otros temas."]
            },
            {
                text: "Prefiero estudiar",
                options: ["en un grupo de estudio.", "solo."]
            },
            {
                text: "Me considero",
                options: ["cuidadoso en los detalles de mi trabajo.", "creativo en la forma en la que hago mi trabajo."]
            },
            {
                text: "Cuando alguien me da direcciones de nuevos lugares, prefiero",
                options: ["un mapa.", "instrucciones escritas."]
            },
            {
                text: "Aprendo",
                options: ["a un paso constante. Si estudio con ahínco consigo lo que deseo.", "en inicios y pausas. Me llego a confundir y súbitamente lo entiendo."]
            },
            {
                text: "Prefiero primero",
                options: ["hacer algo y ver que sucede.", "pensar como voy a hacer algo."]
            },
            {
                text: "Cuando leo por diversión, me gustan los escritores que",
                options: ["dicen claramente los que desean dar a entender.", "dicen las cosas en forma creativa e interesante."]
            },
            {
                text: "Cuando veo un esquema o bosquejo en clase, es más probable que recuerde",
                options: ["la imagen.", "lo que el profesor dijo acerca de ella."]
            },
            {
                text: "Cuando me enfrento a un cuerpo de información",
                options: ["me concentro en los detalles y pierdo de vista el total de la misma.", "trato de entender el todo antes de ir a los detalles."]
            },
            {
                text: "Recuerdo más fácilmente",
                options: ["algo que he hecho.", "algo en lo que he pensado mucho."]
            },
            {
                text: "Cuando tengo que hacer un trabajo, prefiero",
                options: ["dominar una forma de hacerlo.", "intentar nuevas formas de hacerlo."]
            },
            {
                text: "Cuando alguien me enseña datos, prefiero",
                options: ["gráficas.", "resúmenes con texto."]
            },
            {
                text: "Cuando escribo un trabajo, es más probable que",
                options: ["lo haga (piense o escriba) desde el principio y avance.", " lo haga (piense o escriba) en diferentes partes y luego las ordene."]
            },
            {
                text: "Cuando tengo que trabajar en un proyecto de grupo, primero quiero",
                options: ["realizar una 'tormenta de ideas' donde cada uno contribuye con ideas.", "realizar la 'tormenta de ideas' en forma personal y luego juntarme con el grupo para comparar las ideas."]
            },
            {
                text: "Considero que es mejor elogio llamar a alguien",
                options: ["sensible.", "imaginativo."]
            },
            {
                text: "Cuando conozco gente en una fiesta, es más probable que recuerde",
                options: ["cómo es su apariencia.", "lo que dicen de sí mismos."]
            },
            {
                text: "Cuando estoy aprendiendo un tema, prefiero",
                options: ["mantenerme concentrado en ese tema, aprendiendo lo más que pueda de él.", "hacer conexiones entre ese tema y temas relacionados."]
            },
            {
                text: "Me considero",
                options: ["abierto.", "reservado."]
            },
            {
                text: "Prefiero cursos que dan más importancia a",
                options: ["material concreto (hechos, datos).", " material abstracto (conceptos, teorías)."]
            },
            {
                text: "Para divertirme, prefiero",
                options: ["ver televisión.", "leer un libro."]
            },
            {
                text: "Algunos profesores inician sus clases haciendo un bosquejo de lo que enseñarán. Esos bosquejos son",
                options: ["algo útiles para mí.", "muy útiles para mí."]
            },
            {
                text: "La idea de hacer una tarea en grupo con una sola calificación para todos",
                options: ["me parece bien.", "no me parece bien."]
            },
            {
                text: "Cuando hago grandes cálculos",
                options: ["tiendo a repetir todos mis pasos y revisar cuidadosamente mi trabajo.", "me cansa hacer su revisión y tengo que esforzarme para hacerlo."]
            },
            {
                text: "Tiendo a recordar lugares en los que he estado",
                options: ["fácilmente y con bastante exactitud.", "con dificultad y sin mucho detalle."]
            },
            {
                text: "Cuando resuelvo problemas en grupo, es más probable que yo",
                options: ["piense en los pasos para la solución de los problemas.", "piense en las posibles consecuencias o aplicaciones de la solución en un amplio rango de campos."]
            }
        ],
        evalMatrix: [ // Puntajes: evalMatrix[escala][pregunta][opcion]
            [
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0]
            ], // Act
            [
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0]
            ], // Refl
            [
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0]
            ], // Sens
            [
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0]
            ], // Int
            [
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0]
            ], // Vis
            [
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0]
            ], // Ver
            [
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0],
                [0, 0],
                [0, 0],
                [0, 0],
                [1, 0]
            ], // Sec
            [
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1],
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 1]
            ] // Glo
        ],
        profileDesc: [
            [
                "Aprende por interacción directa con el material de estudio. Prefiere la comunicación visual.", // Activo
                "Le gusta reflexionar sobre el material de estudio. Prefiere el trabajo individual y comunicación grupal mínima." // Reflexivo
            ],
            [
                "Detallista y práctico con preferencia por hechos concretos y aplicaciones del mundo real.", // Sensitivo
                "Creativo y se siente atraído por el contenido teórico y abstracto." // Intuitivo
            ],
            [
                "Recuerda fácilmente imágenes que se le presenta (gráficos, fotos, esquemas, etc.).", // Visual   
                "Recuerda fácilmente frases escritas o habladas." // Verbal
            ],
            [
                "Prefiere aprender de manera lineal, mediante secuencia de pasos lógicos.", // Secuencial
                "Prefiere que se le presente un esquema general y luego aprende y entiende las partes por separado sin seguir un orden específico." // Global
            ],
        ],
        eval: function (answers) { // Computo de escalas (metodo general escalas PsiMESH [http://www.psimesh.com])
            var var_sum = []; // Arreglo de puntajes sumados para cada escala
            for (var vble = 0; vble < 8; vble++) {
                var sum = []; // Arreglo con valores de puntajes de cada resepuesta
                for (var quest in answers) // Para cada pregunta
                    sum[quest] = this.evalMatrix[vble][quest][answers[quest]]; // Puntaje que otorga cada pregunta a la escala actual
                var_sum[vble] = sum.reduce(function(a, b){return a + b}, 0); // Sumar arreglo de puntajes de la escala actual
            }
            var scales = [];
            for (var sc = 0; sc < 8; sc += 2)
                scales[sc / 2] = var_sum[sc + 1] - var_sum[sc];
            return scales;
        }
    }
})(Cipressus);