$(window).load(function(){
    game.init();
});

var game = {
    //Comienza inicializando los objetos, precargando los assets y mostrando la pantalla de inicio
    init: function(){

        levels.init();

        //Oculta todas las capas del juego y muestra la pantalla de iniciio
        $('.gamelayer').hide();
        $('#gamestartscreen').show('slow');

        //Obtener el controlador para el canvas y el contexto del juego
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');

    },

    showLevelScreen:function(){
        $('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },
}
var levels = {
    //Nivel de datos
    data:[
        {   //Primer nivel
            foreground:'desert-foreground',
            background:'clouds-background',
            entities:[]
        },
        {   //Segundo nivel
            foreground:'desert-foreground',
            background:'clouds-background',
            entities:[]
        }
    ],
    //Inicializa la pantalla de selección de nivel
    init:function(){
        var html ="";
        for (var i=0; i < levels.data.length; i++){
            var level = levels.data[i];
            html += '<input type="button" value="'+(i+1)+'">';
        };
        $('#levelselectscreen').html(html);

        //Establece los controladores de eventos de click de botón para cargar el nivel
        $('#levelselectscreen input').click(function(){
            levels.load(this.value-1);
            $('#levelselectscreen').hide();
        });
    },
    //carga todos los datos e imágenes para un nivel específico
    load:function(number){
        game.currentLevel = {number: number, hero:[]};
        game.score=0;
        $('#score').html('Score: '+game.score);
        var level = levels.data[number];

        game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/"+level.background+"png");
        game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/"+level.background+"png");

        game.slingshotFrontImage = loader.loadImage(image/slingshot.png);
        game.slingshotFrontFrontImage = loader.loadImage(image/slingshot-front.png);

        if(loader.loaded){
            game.start()
        }else{
            loader.onload = game.start;
        }
    }
}

var loader = {
    loader: true,
    loadedCount:0,
    totalCount:0,

    int: function(){
        var mp3Support, oggSupport;
        var audio = document.createElement('audio');
        if(audio.canPlayType){
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio; codecs ="vorbis"');
        }else{
            mp3Support = false;
            oggSupport = false;
        }

        loader.soundFileExtn = oggSupport?".ogg":mp3Support?".mp3":undefined;
    },

    loadImage: function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },
    soundFileExtn: ".ogg",
    loadSound:function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src = url+loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },
    itemLoaded:function(){
        loader.loadedCount++;
        $('#loadingmessege').html('Loaded '+loader.loadedCount+' of '+loader.totalCount);
        if(loader.loadedCount == loader.totalCount){
            loader.loaded = true;
            
            $('#loadingscreen').hide()

            if(loader.onload){
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}