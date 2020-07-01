; (function () {
    //Aqui escribiremos con ecmascript 6 y se transpilará a javascript antiguo
    //compatible con todos los navegadores

    //Creamos la clase Snake y su consturctor
    class Cuadrado {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.width = 10
            this.height = 10
            this.back = null //Cuadrado de atrás
        }
        drawn() {
            //fillRect llena donde tenemos la coordenada indicada dentro del canvas
            //los dos primeros son las corrdenadas en eje c y y 
            //los dos ultimos son el alto y ancho del cuadrado
            ctx.fillRect(this.x, this.y, this.width, this.height)
            ctx.fillStyle = "#ffffffe0";
            if (this.hasBack()) {
                this.back.drawn()
            }
        }
        //Agregar cuadrados a la snake
        add() {
            if (this.hasBack()) return this.back.add()
            this.back = new Cuadrado(this.x, this.y)
        }
        //esta funcion devuelve V si eres cualquier cuadrado, y F si no tienes nada atrás
        //y eres el ultimo cuadrado
        hasBack() {
            return this.back !== null
        }

        copy() {
            if (this.hasBack()) {
                this.back.copy()

                this.back.x = this.x
                this.back.y = this.y
            }
        }

        rightsquare() {
            this.copy()
            this.x += 10
        }
        leftsquare() {
            this.copy()
            this.x -= 10
        }
        upsquare() {
            this.copy()
            this.y -= 10
        }
        downsquare() {
            this.copy()
            this.y += 10
        }

        golpe(cabeza, segundo = false) {
            if (this === cabeza && !this.hasBack()) return false
            if (this === cabeza) return this.back.golpe(cabeza, true)

            if (segundo && !this.hasBack()) return false
            if (segundo) return this.back.golpe(cabeza)

            //No es ni la cabeza ni el segundo

            if (this.hasBack()) {
                return cuadroHit(this, cabeza) || this.back.golpe(cabeza)
            }
            //No es la caebza ni el segundo y el es el ultimo
            return cuadroHit(this, cabeza)


        }
        //Evaluar si colisiona la snake con los bordes del canvas
        golpeBorder() {
            return this.x > 590 || this.x < 0 || this.y > 290 || this.y < 0
        }
    }

    class Snake {
        constructor() {
            this.head = new Cuadrado(100, 0)
            this.drawcuadrado()
            this.direction = "right"
            this.head.add()
            this.head.add()
            this.head.add()
        }
        drawcuadrado() {
            //Accedemos a la clase cuadrado y usamos su método drawn
            this.head.drawn()
        }
        //mover el snake
        //Primero validamos si va en una dirección para indicar
        //Que no puede ir en la dirección contraria como tal
        //es decir que si va a la derecha no pueda devolverse, ya que no seria logico
        //Aunque igual si hiciera ese movimiento simplemente perderia al chocar los cuadros.
        right() {
            //lo movemos 10 px a la derecha
            if(this.direction === 'left') return;
            this.direction = 'right';
        }
        left() {
            //lo movemos 10 px a la izquierda
            if(this.direction === 'right') return;
            this.direction = 'left';
        }
        up() {
            //lo movemos 10 px hacia arriba
            if(this.direction === 'down') return;
            this.direction = 'up';
        }
        down() {
            //lo movemos 10 px hacia abajo
            if(this.direction === 'up') return;
            this.direction = 'down';
        }

        move() {
            if (this.direction === 'right') return this.head.rightsquare()
            if (this.direction === 'left') return this.head.leftsquare()
            if (this.direction === 'up') return this.head.upsquare()
            if (this.direction === 'down') return this.head.downsquare()
        }

        eat() {
            puntos++
            this.head.add()
            puntaje.setAttribute('value', puntos)
        }

        dead() {
            //Si esto devuelve veradero osea hay choque entonces estamos muertos
            return this.head.golpe(this.head) || this.head.golpeBorder()
            //Morir por chocar con los bordes      
        }
    }


    //Función generadora de numeros random
    class Aleatory {
        static get(inicio, fin) {
            return Math.floor(Math.random() * fin) + inicio
        }
    }

    //metodo para mostrar la comida del snake
    class Food {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.width = 10
            this.height = 10
        }
        //Las coordenadas en las que aparecerá la comida serán aleatorias
        static generate() {
            return new Food(Aleatory.get(0, 500), Aleatory.get(0, 300))
        }
        //esta funcion la ejecutaremos con un setInterval al final del codigo

        //dibujar la comida
        drawComida() {
            ctxf.fillRect(this.x, this.y, this.width, this.height)
            ctxf.fillStyle = "#ffffffe0";
        }
    }

    //Empezamos el dibujo
    const canvas = document.getElementById('canvascont')
    const ctx = canvas.getContext('2d')
    const ctxf = canvas.getContext('2d')
    const snake = new Snake()
    let arrayfood = []
    let puntos = 0
    let puntaje = document.getElementById('puntajeinput')
    let retry = document.querySelector('.buttonretry')
    //console.log(retry)
    

    //con eventos se malipulan via Listeners o  escuchas
    //En este casp haremos que nos avise cuando se presiona una tecla del teclado o se de clik en un area
    //con addEvenListener podemos hacer esto

    //Capturamos las pulsaciones del teclaody activamos un evento a partir de esto
    window.addEventListener("keydown", function (event) {
        //con el atributo keyCode vemos que numero es la tecla que presionamos 37 izq, 39 der, 38 up, 40 down
        //console.log(event.keyCode);

        event.preventDefault()
        //con preventDefault nos deshacemos del comportamiento por default de las teclas de dirección, para que no haga scroll al usarlas
        if (event.keyCode === 40) return snake.down();
        if (event.keyCode === 38) return snake.up();
        if (event.keyCode === 39) return snake.right();
        if (event.keyCode === 37) return snake.left();

    })

    //Una función que se ejecute constantemente y dé el efecto del movimiento
    const movement = setInterval(function () {
        //Ejecutamos la función move
        snake.move()
        //clearRect en lugar de diibujar borra lo que se encuentre dentro del cuadrado que dibujemos
        //En este caso borraremos todo el canvas, desde la coordenada (0 x, 0 y) todo el ancho y alto del canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        //Volvemos a dibujar el cuadrado en la nueva posición
        snake.drawcuadrado()
        drawFood()

        if (snake.dead()) {
            console.log("Game over")

            //Hacer que el intervalo se detenga, esto lo hacemos
            //con clearInterval
            window.clearInterval(movement)
            gameOver()
        }
    }, 1000 / 10)


    //Ejecución cada 5 segundos de el generador de comida
    setInterval(function () {
        const comida = Food.generate()
        arrayfood.push(comida)
        //console.log(arrayfood)
        setTimeout(function () {
            //Eliminar la comida
            removeFromComidas(comida)
        }, 10000)
    }, 4000)

    //Función para dibujar la comida
    function drawFood() {
        for (const index in arrayfood) {
            const foodi = arrayfood[index]
            if (typeof foodi !== "undefined") {
                foodi.drawComida()
                //si chocan las coordenadas de la comida con la cabeza de la serpiente
                if (hit(foodi, snake.head)) {
                    //activa el metodo eat que lo que hace es agregar un cuadro mas con el método add
                    snake.eat()
                    //Luego remueve esta coordenada del array elimnando la comida del canvas
                    //asi da el efecto deseado
                    removeFromComidas(foodi)
                }
            }
            //console.log(foodi)


        }
    }
    //Función para borrar comidas
    function removeFromComidas(comida) {
        //console.log(comida)
        //El arreglo que genera filter reemplazará al arreglo que ya tenemos
        //De esta forma generamos un arreglo nuevo sin el que queremos eliminar
        arrayfood = arrayfood.filter(function (f) {
            return comida !== f
        })
    }

    //Evaluar si colisiona la snake consigo misma
    function cuadroHit(cuadrado_uno, cuadrado_dos) {
        return cuadrado_uno.x == cuadrado_dos.x && cuadrado_uno.y == cuadrado_dos.y
    }


    //Algoritmo para colisiones
    //Con esto evaluamos que la cabeza de la serpiente choca con la comida
    function hit(a, b) {
        var hit = false
        if (b.x + b.width >= a.x && b.x < a.x + a.width) {
            if (b.y + b.height >= a.y && b.y < a.y + a.height) hit = true
        }
        if (b.x <= a.x && b.x + b.width >= a.x + a.width) {
            if (b.y <= a.y && b.y + b.height >= a.y + a.height) hit = true
        }
        if (a.x <= b.x && a.x + a.width >= b.x + b.width) {
            if (a.y <= b.y && a.y + a.height >= b.y + b.height) hit = true
        }
        return hit;
    }


    //Texto de game over
    function gameOver(){
        ctx.font = "20pt Verdana";
        ctx.fillStyle="#0b8a02";
        ctx.fillText("GAME OVER",210,150);
        retry.setAttribute('style', 'display:block')
    }

})()