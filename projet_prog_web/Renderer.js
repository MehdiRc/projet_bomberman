/************************************* 
 * CLasse Engine
 * gère l'affichage du jeu
 * 
 * engine : l'engine dernièrement update
 * canvas : la zone d'affichage
 * debug_mode : l'état actuel du debug mode
**************************************/

//variables globales nécessaires pour calculer les FPS
let lastCalledTime;
let counter = 0;
let fpsArray = [];
let average = 0;

class Renderer {
    constructor (e,cvn) {
        this.engine = e;
        this.canvas = cvn;
        this.debug_mode = false;
    }

    /*FONCTION UPDATE
    * lance les fonctions de dessin et d'animation
    * prend en paramètre le dictionnaire d'évènements
    */
    update (events) {

        //calcul des FPS
        let FPS = this.evalFPS();

        //appel des fonctions de dessin
        this.drawHUD();
        this.drawGame(events);
        this.drawDebug(FPS, events);
    }

    /*FONCTION EVALFPS
    * calcule et retourne les FPS
    * code pris à l'URL https://gist.github.com/WA9ACE/d51659371a345a9327bd
    */
    evalFPS(){
        let fps;
            if (!lastCalledTime) {
                lastCalledTime = new Date().getTime();
                fps = 0;
            }
        
            let delta = (new Date().getTime() - lastCalledTime) / 1000;
            lastCalledTime = new Date().getTime();
            fps = Math.ceil((1/delta));
        
            if (counter >= 60) {
                let sum = fpsArray.reduce(function(a,b) { return a + b });
                average = Math.ceil(sum / fpsArray.length);
                counter = 0;
            } else {
                if (fps !== Infinity) {
                    fpsArray.push(fps);
                }
        
                counter++;
            }
        return (average);
    }

    /*FONCTION DRAWHUD
    * dessine le HUD
    */
    drawHUD(){
        //récupération du canvas et du contexte
        let hud = this.canvas;
        let context = hud.getContext('2d');

        //récupération de l'image du HUD
        let img_hud = document.getElementById("img_HUD");

        //dessin du mode 1 joueur
        if (this.engine.board.players.length==1){
            context.drawImage(img_hud,0,0,400,150,0,0,800,250);
            context.font = '60px serif';
            context.fillText(''+this.engine.board.players[0].life, 170, 110);
            context.fillText(''+this.engine.board.players[0].maxBomb, 170, 200);
        //dessin du mode multijoueur
        } else {
            context.drawImage(img_hud,0,150,400,150,0,0,800,250);
            context.font = '60px serif';
            context.fillText(''+this.engine.board.players[0].life, 170, 110);
            context.fillText(''+this.engine.board.players[0].maxBomb, 170, 200);
            context.fillText(''+this.engine.board.players[1].life, 710, 110);
            context.fillText(''+this.engine.board.players[1].maxBomb, 710, 200);
        }
    }

    /*FONCTION DRAWGAME
    * dessine le contenu du board
    */
    drawGame(events){

        //largeur des cases du board
        let stepX = this.engine.board.width/this.engine.board.sizeMapX;
        let stepY = this.engine.board.height/this.engine.board.sizeMapY;

        //on affiche tout en décalé, afin de faire de la place pour le HUD
        let hud_margin = 250;

        //récupération du canvas et du contexte
        let canvas = this.canvas;
        let context = canvas.getContext('2d');

        //on efface le dessin de l'itération pécédente
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(0,hud_margin,canvas.width,canvas.height);
  
        //récupération des images
        let grass = document.getElementById("img_grass");
        let boulder_spritesheet = document.getElementById("img_boulder");
        let portal_spritesheet = document.getElementById("img_portal");
        let bomb_spritesheet = document.getElementById("img_bomb");
        let powerUp_spritesheet = document.getElementById("img_powerUp");
        let deflag_spritesheet = document.getElementById("img_deflags");
        let player_spritesheet = document.getElementById("img_player");


        /********************************************
         * Dessin de l'herbe en background
        ********************************************/
        for (let i=0; i<this.engine.board.sizeMapX; i++){
            for (let j=0; j<this.engine.board.sizeMapY; j++){
                context.drawImage(grass,stepX*i,stepY*j+hud_margin,stepX,stepY);
            }
        }


        /********************************************
         * Dessin des blocs
        ********************************************/
        this.engine.board.objects.forEach((e) => {
            if(e instanceof Boulder && e.breakable){
                //bloc cassable
                context.drawImage(boulder_spritesheet,32,0,32,32,e.x,e.y+hud_margin,stepX,stepY);
            } else if(e instanceof Boulder && !e.breakable){
                //bloc incassable
                context.drawImage(boulder_spritesheet,0,0,32,32,e.x,e.y+hud_margin,stepX,stepY);
            }
        });

        
        /********************************************
         * Dessin du portail
        ********************************************/
        if (this.engine.board.portal !== undefined){
            context.drawImage(portal_spritesheet,0,0,32,32,this.engine.board.portal.x,this.engine.board.portal.y+hud_margin,stepX,stepY);
        }

  
        /********************************************
         * Dessin des bombes et power_ups
        ********************************************/
        this.engine.board.items.forEach((e) => {
            //bombes
            if(e instanceof Bomb){
                let sx = 0;
                let sy = 0;

                //clignotement rouge en dessous de 1s
                if (e.lifeSpan < 10){sx=96;}
                else if (e.lifeSpan < 20){sx=80;}
                else if (e.lifeSpan < 30){sx=96;}
                else if (e.lifeSpan < 40){sx=80;}
                else if (e.lifeSpan < 50){sx=96;}
                else if (e.lifeSpan < 60){sx=80;}
                //animation du début, en fonction du lifepsan restant
                else if (e.lifeSpan<e.maxLifeSpan*(60/100)){sx = 64;}
                else if (e.lifeSpan<e.maxLifeSpan*(70/100)){sx = 48;}
                else if (e.lifeSpan<e.maxLifeSpan*(80/100)){sx = 32;}
                else if (e.lifeSpan<e.maxLifeSpan*(90/100)){sx = 16;}

                //dessin
                context.drawImage(bomb_spritesheet,sx,sy,16,16,e.x-(stepX-e.w)/2,(e.y-(stepY-e.w)/2)+hud_margin,stepX,stepY);

            //power ups
            } else if(e instanceof PowerUp){
                let sx=0;
                let sy=0;

                //trouver la bonne icone en fonction de l'effet du power up
                switch (e.effect){
                    case "lifeUp":
                        sx = 0;
                        break;
                    case "speedUp":
                        sx = 64;
                        break;
                    case "speedDown":
                        sx = 128;
                        break;
                    case "maxBombUp":
                        sx = 192;
                        break;
                    case "maxBombDown":
                        sx = 256;
                        break;
                    case "rangeUp":
                        sx = 320;
                        break;
                    case "rangeDown":
                        sx = 384;
                        break;
                    case "detonateUp":
                        sx = 448;
                        break;
                    case "detonateDown":
                        sx = 512;
                        break;
                    default:
                        break;
                }

                //clignotement lorsque lifeSpan < 1s
                if (e.lifeSpan < 10){sy=0;}
                else if (e.lifeSpan < 20){sy=64;}
                else if (e.lifeSpan < 30){sy=0;}
                else if (e.lifeSpan < 40){sy=64;}
                else if (e.lifeSpan < 50){sy=0;}
                else if (e.lifeSpan < 60){sy=64;}

                //dessin
                context.drawImage(powerUp_spritesheet,sx,sy,64,64,e.x,e.y+hud_margin,e.w,e.h);

            }
        });
        

        /********************************************
         * Dessin des déflagrations
        ********************************************/
        this.engine.board.deflags.forEach((e) => {
        if(e instanceof Deflag){
            let sx = 0;
            let sy = 0;

            //animation en fonction de l'évolution du lifeSpan
            if (e.lifeSpan<e.maxLifeSpan*(5/100)){sx = 48*6;}
            else if (e.lifeSpan<e.maxLifeSpan*(10/100)){sx = 48*5;}
            else if (e.lifeSpan<e.maxLifeSpan*(15/100)){sx = 48*4;}
            else if (e.lifeSpan<e.maxLifeSpan*(85/100)){sx = 48*3;}
            else if (e.lifeSpan<e.maxLifeSpan*(90/100)){sx = 48*2;}
            else if (e.lifeSpan<e.maxLifeSpan*(95/100)){sx = 48*1;}

            //choisir le bon set d'images et les transformations en fonction de la direction
            switch (e.direction){
                case "all":
                    context.drawImage(deflag_spritesheet,sx,sy,48,48,e.x-(stepX-e.w)/2,(e.y-(stepY-e.w)/2)+hud_margin,stepX,stepY);
                    break;
                case "left":
                    //si on est en bout d'explosion
                    if(e.range==0){sy=96;}
                    //si on est au millieu
                    else{sy=48;} 

                    context.save();
                    context.scale(-1,1);
                    context.drawImage(deflag_spritesheet,sx,sy,48,48,-(e.x-(stepX-e.w)/2+stepX),(e.y-(stepY-e.w)/2)+hud_margin,stepX,stepY);
                    context.restore();
                    break;
                case "right":
                    //si on est en bout d'explosion
                    if(e.range==0){sy=96;}
                    //si on est au millieu
                    else{sy=48;}

                    context.drawImage(deflag_spritesheet,sx,sy,48,48,e.x-(stepX-e.w)/2,(e.y-(stepY-e.w)/2)+hud_margin,stepX,stepY);
                    
                    break;
                case "top":
                    //si on est en bout d'explosion
                    if(e.range==0){sy=192;}
                    //si on est au millieu
                    else{sy=144;}

                    context.drawImage(deflag_spritesheet,sx,sy,48,48,e.x-(stepX-e.w)/2,(e.y-(stepY-e.w)/2)+hud_margin,stepX,stepY);
                    
                    break;
                case "bottom":
                    //si on est en bout d'explosion
                    if(e.range==0){sy=192;}
                    //si on est au millieu
                    else{sy=144;}

                    context.save();
                    context.scale(1,-1);
                    context.drawImage(deflag_spritesheet,sx,sy,48,48,e.x-(stepX-e.w)/2,(-(e.y-(stepY-e.w)/2+stepY))-hud_margin,stepX,stepY);
                    context.restore();
                    
                    break;
                default:
                    break;
            }
        }
        });

        
        /********************************************
         * Dessin dee joueurs
        ********************************************/
        this.engine.board.players.forEach((p,i) => {

            let sx = 0;
            let sy = 0;

            //sélection du deuxieme skin si il s'agit du second joueur
            if(i==1){
                sy = 32;
            }

            //en fonction de la direction, de la liste d'event et de l'animation frame, choisir le bon sprite
            switch(p.direction){
                //si le joeur est dirigé vers le haut
                case "up":
                    //si il se déplace
                    if (events["player" + (i+1) + "_up"]){
                        if(p.animationFrame<10){sx = 0;}
                        else if(p.animationFrame<20){sx = 16;}
                        else if(p.animationFrame<30){sx = 32;}
                        else {sx = 48;}
                    //si il est fixe
                    } else {
                        sx = 0;
                    }
                    break;
                //si le joeur est dirigé vers le bas
                case "down":
                    //si il se déplace
                    if (events["player" + (i+1) + "_down"]){
                        if(p.animationFrame<10){sx = 64;}
                        else if(p.animationFrame<20){sx = 80;}
                        else if(p.animationFrame<30){sx = 96;}
                        else {sx = 112;}
                    //si il est fixe
                    } else {
                        sx = 64;
                    }
                    break;
                //si le joeur est dirigé vers la gauche
                case "left":
                    sy += 16;
                    //si il se déplace
                    if (events["player" + (i+1) + "_left"]){
                        if(p.animationFrame<10){sx = 0;}
                        else if(p.animationFrame<20){sx = 16;}
                        else if(p.animationFrame<30){sx = 32;}
                        else {sx = 48;}
                    //si il est fixe
                    } else {
                        sx = 0;
                    }
                    break;
                //si le joeur est dirigé vers la droite
                case "right":
                    sy += 16;
                    //si il se déplace
                    if (events["player" + (i+1) + "_right"]){
                        if(p.animationFrame<10){sx = 64;}
                        else if(p.animationFrame<20){sx = 80;}
                        else if(p.animationFrame<30){sx = 96;}
                        else {sx = 112;}
                    //si il est fixe
                    } else {
                        sx = 64;
                    }
                    break;
                default:
                    break;
            }

            //clignotement si le joueur est invincible
            if(p.isInvincible()){
                if((p.invincibility % 10) <= 5){
                    context.drawImage(player_spritesheet,sx,sy,16,16,p.x,p.y+hud_margin,p.w,p.h);
                }
            //si il ne l'est pas, afficher normalement
            } else {
                context.drawImage(player_spritesheet,sx,sy,16,16,p.x,p.y+hud_margin,p.w,p.h);
            }
        });
    }

    /*FONCTION DRAWDEBUG
    * dessine le debug
    */
    drawDebug(FPS,events){

        //récupération du contexte et de l'état du debug_mode
        let debug_switch = events["debug"];
        let context=this.canvas.getContext("2d");

        //si le débug mode est enclenché
        if (debug_switch && !this.debug_mode){
            //changement de l'état du debug mode à true
            this.debug_mode = true;

            //création de la node du debug
            let debug =  document.getElementById("debug");
            debug.style.height = "200px";
            debug.appendChild(document.createTextNode('Debug Mode : on'));

            console.log("Debug Mode : on")
        }

        //si le debug_mode est désactivé
        if (!debug_switch && this.debug_mode){
            //changement de l'état du debug mode à false
            this.debug_mode = false;

            //suppression de la node du debug
            let debug =  document.getElementById("debug");
            debug.innerHTML = "";

            console.log("Debug Mode : off")
        }

        //si le debug mode est actif
        if (debug_switch && this.debug_mode){

            //on réinitialise la node du debug
            let debug =  document.getElementById("debug");
            debug.innerHTML = "";
            debug.style.marginBottom = 600;

            //en tête du debug et FPS
            debug.appendChild(document.createTextNode('Debug Mode : on      FPS : ' + FPS ));
            debug.innerHTML+= "<br>";
            debug.innerHTML+= "<br>";

            //état des variables pour le spawn des powerUp
            debug.appendChild(document.createTextNode('Spawn Pass :  ' + this.engine.spawn_pass + '    Générator Number :  ' + this.engine.var_spawn));
            debug.innerHTML+= "<br>";
            debug.innerHTML+= "<br>";

            //pour chaque joueur, afficher leurs attributs
            this.engine.board.players.forEach((player,i) => {
                debug.appendChild(document.createTextNode('Player ' + (i+1) + ' :'));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('X : ' + Math.trunc(player.x)));
                debug.appendChild(document.createTextNode('Y : ' + Math.trunc(player.y) + ''));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('Bomb Placed : ' + player.bombPlaced + ''));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('Max Bomb : ' + player.maxBomb + ''));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('Speed : ' + player.speed + ''));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('Life : ' + player.life + ''));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('Direction : ' + player.direction + '   AnimFrame : ' + player.animationFrame));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('Bomb : '));
                debug.innerHTML+= "<br>";
                debug.appendChild(document.createTextNode('LifeSpan : ' + player.bomb.lifeSpan + '   Range : ' + player.bomb.range + '   ID : ' + player.bomb.id_player));
                debug.innerHTML+= "<br>";
                

                debug.innerHTML+= "<br>";
            });

            //pour chaque bombe et power up, afficher ses attributs
            this.engine.board.items.forEach((obj,i) => {
                if(obj instanceof Bomb){
                    debug.appendChild(document.createTextNode('BOMB ' + i + ' :'));
                    debug.innerHTML+= "<br>";
                    debug.appendChild(document.createTextNode('X : ' + Math.trunc(obj.x)));
                    debug.appendChild(document.createTextNode('Y : ' + Math.trunc(obj.y) + ''));
                    debug.appendChild(document.createTextNode('LifeSpan : ' + obj.lifeSpan + '   Range : ' + obj.range + '   ID : ' + obj.id_player));
                    debug.innerHTML+= "<br>";
                }
                if(obj instanceof PowerUp){
                    debug.appendChild(document.createTextNode('POWERUP ' + i + ' :'));
                    debug.innerHTML+= "<br>";
                    debug.appendChild(document.createTextNode('X : ' + Math.trunc(obj.x)));
                    debug.appendChild(document.createTextNode('Y : ' + Math.trunc(obj.y) + ''));
                    debug.appendChild(document.createTextNode('LifeSpan : ' + obj.lifeSpan + '   Effect : ' + obj.effect));
                    debug.innerHTML+= "<br>";
                }

                debug.innerHTML+= "<br>";
            });

            //afficher le bloc contenant le portail
            this.engine.board.objects.forEach((e) => {
                if(e instanceof Boulder && e.breakable && e.has_portal){
                    context.fillStyle = "rgb(0,0,255)";
                    context.fillRect(e.x,e.y+250,e.w,e.h);
                    context.fillStyle = "rgb(255,255,255)";
                }
            });
        }
    }


    /*FONCTION DRAWEND
    * dessine le message de fin de partie passé en argument
    * prend en argument win, un boléen indiquant s'il s'agit d'un message de victoire ou défaite
    */
    drawEnd(msg,win){

        //récupération du canvas
        let canvas = this.canvas;
        let context = canvas.getContext('2d');

        context.font = '140px serif';

        //dans le cas d'une victoire
        if (win){
            context.fillStyle = "rgb(200,150,0)";
            context.strokeStyle = "rgb(0,0,0)";
            let text = context.measureText(''+msg);
            let w = text.width;
            context.fillText(''+msg, canvas.width/2-w/2, 400);
            context.strokeText(''+msg, canvas.width/2-w/2, 400);
        //dans le vas d'une défaite
        } else {
            context.fillStyle = "rgb(200,000,0)";
            context.strokeStyle = "rgb(0,0,0)";
            let text = context.measureText(''+msg);
            let w = text.width;
            context.fillText(''+msg, canvas.width/2-w/2, 400);
            context.strokeText(''+msg, canvas.width/2-w/2, 400);
        }
            
    }

    /*FONCTION CLEAR
    * clear le canvas
    */
    clear(){
        let canvas = this.canvas;
        let context = canvas.getContext('2d');

        //effacer le conteu du canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        //retirer le debug
        let debug =  document.getElementById("debug");
        debug.innerHTML = "";
    }

}