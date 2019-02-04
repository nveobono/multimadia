// Solicitud requestAnimationFrame y cancelAnimationFrame para su uso en el código del juego

(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

$(window).load(function () {
    game.init();
});


var game = {
    // Comenzar inicialización de objetos, precarga de elementos y pantalla de inicio
    init: function () {
        // Inicializar objetos
        levels.init();
        loader.init();
        mouse.init();


        // Oculta todas las capas del juego y muestra la pantalla de inicio
        $('.gamelayer').hide();
        $('#gamestartscreen').show();

        // Obtener el controlador para el canvas y el contexto del juego
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');
    },

    showLevelScreen: function () {
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },

    // Modo Game
    mode: "intro",
    // Coordenadas X & Y de la honda
    slingshotX: 140,
    slingshotY: 280,
    start: function () {
        $('.gamelayer').hide();
        // Mostrar el canvas del juego y la posición
        $('#gamecanvas').show();
        $('#scorescreen').show();
        game.mode = "intro";
        game.offsetLeft = 0;
        game.ended = false;
        game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    },
    handlePanning: function () {
        game.offsetLeft++; // Marcador de posición temporal - mantiene la panorámica a la derecha
    },
    animate: function () {
        // Anima el fondo
        game.handlePanning();

        // Anima los personajes


        // Dibuja el fondo con desplazamiento (parallax scrolling)
        game.context.drawImage(game.currentLevel.backgroundImage, game.offsetLeft / 4, 0, 640, 480, 0, 0, 640, 480);
        game.context.drawImage(game.currentLevel.foregroundImage, game.offsetLeft, 0, 640, 480, 0, 0, 640, 480);

        // Dibuja la honda
        game.context.drawImage(game.slingshotImage, game.slingshotX - game.offsetLeft, game.slingshotY);
        game.context.drawImage(game.slingshotFrontImage, game.slingshotX - game.offsetLeft, game.
            slingshotY);
        if (!game.ended) {
            game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
        }
    },

    // Velocidad máxima de panoramización por fotograma en píxeles
    maxSpeed: 3,
    // Mínimo y Máximo desplzamaiento panorámico
    minOffset: 0,
    maxOffset: 300,
    // Desplazamiento panorámico actual
    offsetLeft: 0,
    // La puntuación del juego
    score: 0,

    // Desplegar la pantalla para centrarse en newCenter
    panTo: function (newCenter) {
        if (Math.abs(newCenter - game.offsetLeft - game.canvas.width / 4) > 0
            && game.offsetLeft <= game.maxOffset && game.offsetLeft >= game.minOffset) {
            var deltaX = Math.round((newCenter - game.offsetLeft - game.canvas.width / 4) / 2);
            if (deltaX && Math.abs(deltaX) > game.maxSpeed) {
                deltaX = game.maxSpeed * Math.abs(deltaX) / (deltaX);
            }
            game.offsetLeft += deltaX;
        } else {

            return true;
        }
        if (game.offsetLeft < game.minOffset) {
            game.offsetLeft = game.minOffset;
            return true;
        } else if (game.offsetLeft > game.maxOffset) {
            game.offsetLeft = game.maxOffset;
            return true;
        }
        return false;
    },

    handlePanning: function () {
        if (game.mode == "intro") {
            if (game.panTo(700)) {
                game.mode = "load-next-hero";
            }
        }
        if (game.mode == "wait-for-firing") {
            if (mouse.dragging) {
                game.panTo(mouse.x + game.offsetLeft)
            } else {
                game.panTo(game.slingshotX);
            }
        }
        if (game.mode == "load-next-hero") {
            // TODO:
            // Comprobar si algún villano está vivo, si no, terminar el nivel (éxito)
            // Comprobar si quedan más herores para cargar, si no terminar el nivel (fallo)
            //Cargar el heroe y fijar a modo de espera para disparar (wait-for-firing)
            game.mode = "wait-for-firing";
        }
        if (game.mode == "firing") {
            game.panTo(game.slingshotX);
        }
        if (game.mode == "fired") {
            // TODO:
            // Hacer una panorámica donde quiera que el héroe se encuente actualmente
        }
    }
}

var levels = {
    //Nivel de datos
    data: [
        {
            // Primer nivel
            foreground: 'desert-foreground',
            background: 'clouds-background',
            entities: []
        },
        {
            // Segundo nivel
            foreground: 'desert-foreground',
            background: 'clouds-background',
            entities: []
        }
    ],
    // Inicializa la pantalla de selección de nivel
    init: function () {
        var html = "";
        for (var i = 0; i < levels.data.length; i++) {
            var level = levels.data[i];
            html += '<input type="button" value="' + (i + 1) + '">';
        };
        $('#levelselectscreen').html(html);

        // Establece los controladores de eventos de clic de botón para cargar el nivel
        $('#levelselectscreen input').click(function () {
            levels.load(this.value - 1);
            $('#levelselectscreen').hide();
        });
    },

    // Carga todos los datos e imagenes para un nivel especidifco
    load: function (number) {

        // declaras un nuevo objeto de nivel actual
        game.currentLevel = { number: number, hero: [] }
        game.score = 0;
        $('#score').html('Score: ' + game.score);
        var level = levels.data[number];

        // Cargar el fondo, el primer plano y las imágenes de la honda
        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/" + level.background + ".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/" + level.foreground + ".png");
        game.slingshotImage = loader.loadImage("images/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");

        // LLamar a game.start() cuando los assets se hayan cargado
        if (loader.loaded) {
            game.start()
        } else {
            loader.onload = game.start;
        }
    }
}

var loader = {
    loaded: true,
    loadedCount: 0, // Assents que han sido cargados antes
    totalCount: 0,  // Número total de assets que es necesario cargar

    init: function () {
        // Comprueba el soporte para sonido
        var mp3Support, oggSupport;
        var audio = document.createElement('audio');
        if (audio.canPlayType) {
            // Actualmente canPlayType() devuelve: "", "maybe" o "probably"
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');
        } else {
            // La etiqueta de audio no es soportada
            mp3Support = false;
            oggSupport = false;
        }

        // Comprueba para ogg, mp3 y finalmente fija soundFileExtn como undefined
        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },

    loadImage: function (url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },

    soundFileExtn: ".ogg",
    loadSound: function (url) {
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src = url + loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },

    itemLoaded: function () {
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded ' + loader.loadedCount + ' of ' + loader.totalCount);
        if (loader.loadedCount === loader.totalCount) {
            // El loader ha cargado completamente..
            loader.loaded = true;
            // Oculta la pantalla de carga
            $('#loadingscreen').hide();
            // Y llama al método loader.onload si este existe
            if (loader.onload) {
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}

var mouse = {
    x: 0,
    y: 0,
    down: false,
    init: function () {
        $('#gamecanvas').mousemove(mouse.mousemovehandler);
        $('#gamecanvas').mousedown(mouse.mousedownhandler);
        $('#gamecanvas').mouseup(mouse.mouseuphandler);
        $('#gamecanvas').mouseout(mouse.mouseuphandler);
    },
    mousemovehandler: function (ev) {
        var offset = $('#gamecanvas').offset();
        mouse.x = ev.pageX - offset.left;
        mouse.y = ev.pageY - offset.top;
        if (mouse.down) {
            mouse.dragging = true;
        }
    },
    mousedownhandler: function (ev) {
        mouse.down = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
        ev.originalEvent.preventDefault();
    },
    mouseuphandler: function (ev) {
        mouse.down = false;
        mouse.dragging = false;
    }
}
