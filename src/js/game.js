$(window).load(function(){
    Gamepad.init();
});

var game = {
    //Comienza inicializando los objetos, precargando los assets y mostrando la pantalla de inicio
    init: function(){
        //Inicializa los objetos
        levels.init();
        loader.init();
        mouse.init();

        //Oculta todas las capas del juego y muestra la pantalla de iniciio
        $('.gamelayer').hide();
        $('.#gamestartscreen').show();

        //Obtener el controlador para el canvas y el contexto del juego
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');
    }
}