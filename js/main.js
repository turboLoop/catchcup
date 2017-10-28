/**
 * Created by florianlechleitner on 28.10.17.
 */
(function( $ ) {

    /**
     * Assets
     */

    //Images
    cupImage = new Image();
    cupImage.src = "img/cup-default.svg";
    ballImage = new Image();
    ballImage.src = "img/becher-ball.svg";
    soundOnImage = new Image();
    soundOnImage.src = "img/sound-on.svg";
    soundOffImage = new Image();
    soundOffImage.src = "img/sound-off.svg";

    //audio
    var backgroundAudio = new Audio("audio/beyondthedarkness.mp3");
    backgroundAudio.volume = 0.5;
    var audioShoot = new Audio("audio/sfx_movement_jump10.wav");
    audioShoot.volume = 0.8;
    var audioLand = new Audio("audio/sfx_movement_jump10_landing.wav");
    audioLand.volume = 1;
    var audioFailing = new Audio("audio/sfx_sounds_falling12.wav");
    audioFailing.volume = 0.4;


    /**
     * Global Settings
     */

    globalSettings = {
        sound: true,
        notificationRead: false
    }

    window.onresize = function(event) {
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
    };


    window.initGame = function() {
        //Game Variables
        document.getElementById("endScreen").style.display = "none";
        document.getElementById("highscoresScreen").style.display = "none";
        document.getElementById("gameCanvas").style.cursor = "none";
        document.getElementById("startScreen").style.display = "block";
        document.getElementById("marqueeText").style.display = "block";
        backgroundAudio.play();
        resetEndScreen();
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ball = {
            position: {
                x: canvas.width / 2,
                y: canvas.height / 2
            },
            radius: 10,
            rotation: 0
        };

        cup = {
            position: {
                x: 50,
                y: canvas.height - 100
            },
            dimensions: {
                width: 150,
                height: 20
            },
            rotation: 0,
            pressed: false
        };

        physics = {
            velocity: {
                x: 0,
                y: 10
            },
            gravity: 1,
            wind: 0
        };

        player = {
            name: "",
            catched: false,
            score: -1,
            shots: 0
        };

        mousePos = {
            x: 0,
            y: 0
        };

        game = {
            loop: "",
            currentDifficulty: 20,
            difficultyIncrease: 2,
            pressedLoops: 0,
            showEndScreen: false,
            windChangeInterval: 0
        };

        highscores = [];

        //Background Music
        backgroundAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
        backgroundAudio.play();

        //Run Loop
        game.loop = setInterval(update, 1000/60);

    };

    window.onload = function() {
        window.initGame();
        window.loadHighscores();

        //Stick Cup to Mouse
        window.addEventListener("mousemove", function(e) {
            rotateCup(e);
            cup.position.x = e.clientX - cup.dimensions.width/2;
            cup.position.y = e.clientY - cup.dimensions.height/2;
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
        });

        //Click Event for shooting Ball
        window.addEventListener("mousedown", function(e) {
            player.shots++;
            if(player.catched) {
                game.currentDifficulty += game.difficultyIncrease;
                physics.velocity.y = - game.currentDifficulty;
                physics.velocity.x = cup.rotation * 0.8;
                player.catched = false;
                cupImage.src = "img/cup-pressed.svg";
                cup.pressed = true;
                audioShoot.play();
            }
        });

        //Key Controls
        window.addEventListener('keydown', function(e) {
            var keynum;
            if(e) {
                keynum = e.keyCode;
            } else if(e.which){
                keynum = e.which;
            }
            if(keynum == 83 && e.target.tagName.toUpperCase() != 'INPUT') {
                globalSettings.notificationRead = true;
                globalSettings.sound = !globalSettings.sound;
                audioShoot.muted = !globalSettings.sound;
                audioLand.muted = !globalSettings.sound;
                audioFailing.muted = !globalSettings.sound;
                backgroundAudio.muted = !globalSettings.sound;
            }
        }, false);

    };

    function rotateCup(e) {
        coefficient = (canvas.width / 2) - e.clientX;
        coefficient = coefficient / canvas.width;
        multiplyer = 30;
        cup.rotation = coefficient * multiplyer;
        cup.rotation = parseInt(cup.rotation);
    }

    function update() {
        //Background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if(parseInt(player.shots) < 1) {
            ball.position.x = cup.position.x + (cup.dimensions.width / 2);
            ball.position.y = cup.position.y;
        } else if(game.showEndScreen) {
            backgroundAudio.muted = true;
        } else {
            document.getElementById("gameCanvas").style.display = "block";
            document.getElementById("startScreen").style.display = "none";
            document.getElementById("marqueeText").style.display = "none";
            backgroundAudio.muted = !globalSettings.sound;
            gameLoop();
        }
    }

    function drawImage(image, x, y, scale, rotation){
        ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
        ctx.rotate(rotation);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);
    }

    function gameLoop() {

        //Ball
        ctx.beginPath();
        ctx.arc(ball.position.x - ball.radius/2, ball.position.y - ball.radius/2, ball.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.save();
        ctx.translate(ball.position.x, ball.position.y);
        if(ball.rotation > 360) {
            ball.rotation = 0;
        }
        if(!player.catched) {
            ball.rotation = ball.rotation + 3;
        }
        drawImage(ballImage, ball.position.x, ball.position.y, 1, -ball.rotation);
        ctx.restore();


        //Cup
        ctx.save();
        ctx.translate(cup.position.x + cup.dimensions.width / 2, cup.position.y + cup.dimensions.height / 2);
        ctx.rotate(cup.rotation * Math.PI/180);
        ctx.fillStyle = "transparent";
        ctx.fillRect(-cup.dimensions.width/2, -cup.dimensions.height/2, cup.dimensions.width, cup.dimensions.height);
        ctx.restore();

        //Cup Image
        if(cup.pressed) {
            game.pressedLoops++;
            if(game.pressedLoops > 10) {
                cupImage.src = "img/cup-default.svg";
                game.pressedLoops = 0;
                cup.pressed = false;
            }
        }

        ctx.save();
        ctx.translate(cup.position.x + cupImage.width / 2, cup.position.y + cupImage.height / 2);
        ctx.rotate(cup.rotation * Math.PI/180);
        ctx.drawImage(cupImage, - cupImage.width / 2 - 20, - cupImage.height / 2 - 60);
        ctx.restore();

        //Score
        ctx.fillStyle = 'black';
        ctx.font="30px 'Press Start 2P'";
        displayedScrore = Math.max(player.score, 0);
        if(!globalSettings.notificationRead) {
            ctx.fillText(displayedScrore, canvas.width - 630, 40);
        } else {
            ctx.fillText(displayedScrore, canvas.width - 120, 40);
        }

        //Sound
        if(!globalSettings.notificationRead) {
            ctx.fillStyle = 'black';
            ctx.font="30px 'Press Start 2P'";
            ctx.textAlign = "center";
            soundMassage = 'press "s" to mute';
            ctx.fillText(soundMassage, canvas.width - 300, 40);
        } else {
            if(globalSettings.sound) {
                ctx.drawImage(soundOnImage, canvas.width - 50, 10);
            } else {
                ctx.drawImage(soundOffImage, canvas.width - 50, 10);
            }
        }


        //Change ball y and velocity
        ball.position.y += physics.velocity.y;
        physics.velocity.y += physics.gravity;

        //Add wind
        game.windChangeInterval++;
        if(game.windChangeInterval > 5) {
            game.windChangeInterval = 0;
            physics.wind += calculateWind(-1, 1);
            physics.wind = Math.min(Math.max(physics.wind, -15), 15);
            ball.position.x += physics.wind;
        }

        drawWind(physics.wind);

        //Add Cup Rotation to X
        ball.position.x += physics.velocity.x;

        //Check if game is over
        if (ball.position.y > canvas.height + 200 && player.shots >= 1) {
            physics.velocity.y = 0;
            audioFailing.play();
            window.showEndScreen();
        }

        //Check if ball is catched
        if (
            //Check if Ball is in X Range of panel
        (ball.position.x < cup.position.x + cup.dimensions.width + 50 && ball.position.x > cup.position.x - 50)

        &&

        //Check if Ball is in Y range of Panel
        (ball.position.y > cup.position.y - cup.dimensions.height && ball.position.y < cup.position.y + cup.dimensions.height + 250)

        ) {

            if(!player.catched) {
                audioLand.play();
                player.score++;
            }

            player.catched = true;

            //Set y velocity to 0
            physics.velocity.y = 0;

            //Attach ball to center of panel
            ball.position.x = cup.position.x + (cup.dimensions.width / 2);

            //Place ball on top of panel
            ball.position.y = cup.position.y;
        }
    }

    window.showEndScreen = function() {
        backgroundAudio.pause();
        game.showEndScreen = true;
        clearInterval(game.loop);
        document.getElementById("gameCanvas").style.cursor = "auto";
        document.getElementById("gameCanvas").style.display = "none";
        document.getElementById("userScore").innerHTML = Math.max(player.score, 0);
        document.getElementById("highscoresScreen").style.display = "none";
        document.getElementById("endScreen").style.display = "block";
        document.getElementById("marqueeText").style.display = "block";
    }

    function calculateWind(min,max) {
        return Math.random()*(max-min)+min;
    }

    function drawWind(velocity) {
        ctx.fillStyle = 'black';
        ctx.font="30px 'Press Start 2P'";
        ctx.textAlign = "center";
        windFlag = "-";
        if(velocity < -10) {
            windFlag = "<<<";
        } else if (velocity < -5) {
            windFlag = "<<";
        } else if (velocity < 0) {
            windFlag = "<";
        } else if (velocity > 10) {
            windFlag = ">>>";
        } else if (velocity > 5) {
            windFlag = ">>";
        } else if (velocity > 0) {
            windFlag = ">";
        }
        ctx.fillText(windFlag, 50, 40);
    }

    function resetEndScreen() {
        document.getElementById("usernameInput").value = "";
        document.getElementById("usernameInputSubmit").style.display = 'none';
        document.getElementById("usernameInput").style.display = 'block';
        document.getElementById("usernameConfirmation").style.display = 'none';
    }

    window.checkNameInput = function (e) {
        player.name = document.getElementById("usernameInput").value;
        if(player.name.length > 0) {
            document.getElementById("usernameInputSubmit").style.display = 'block';
            if (e.keyCode == 13) {
                window.submitHighscore();
            }
        } else {
            document.getElementById("usernameInputSubmit").style.display = 'none';
        }
    };

    //Highscores
    window.submitHighscore = function() {
        document.getElementById("usernameInputSubmit").style.display = 'none';
        document.getElementById("usernameInput").style.display = 'none';
        document.getElementById("usernameConfirmation").style.display = 'block';
        window.loadHighscores();
    };

    window.loadHighscores = function () {
        /**
         * Todo: Load high-scores from CDN
         */
        return false;
    }

    window.drawHighscores = function() {
        var highscoreList = "";
        for(var i = 0; i < highscores.length; i++) {
            highscoreList += "<div class='highscoreLine'><span class='rank'>"+ (i+1) + "</span><span class='name'>" + highscores[i][0] + "</span><span class='score'>" + highscores[i][1] + "</span></div>";
        }
        $("#highscoreTable").html(highscoreList);
    }

    window.showHighscore = function() {
        document.getElementById("endScreen").style.display = "none";
        document.getElementById("highscoresScreen").style.display = 'block';

    }

    window.destroyGame = function() {
        $(".gameOfLifeWrapper", top.document).removeClass("open");
        $("body", top.document).css("overflow", "visible");
        $(".gameOfLifeWrapper", top.document).find("iframe").attr("src", "about:blank");
    }

})( jQuery );