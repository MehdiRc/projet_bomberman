
/*FONCTION INIT
* initialise une nouvelle partie et lance la boucle de jeu
*/
let init = function(map, debug_mode){

    // On récupère une référence vers l'objet canvas
    let canvas = document.getElementById("cvn");

    //création du tableau du jeu, de l'engine et du renderer
    let board = new Board(map, canvas);
    let engine = new Engine(board);
    let renderer = new Renderer(engine, canvas);

    //initialisation des variables d'event
    let events = create_events();
    events["debug"] = debug_mode;
    
    //variables necessaires à la limitation des FPS
    let end_game = false;
    let then = Date.now();


    //boucle de jeu
    function game(){

        //limitation à 60 FPS (environ 140 fps sans)
        now = Date.now();
        delta = now - then;
        if (delta > 1000/60){
            then = now - (delta % 1000/60);

            //on lance les update tant que la fin de partie n'est pas détectée
            if(end_game == ""){
                try {
                    engine.update(events);
                    renderer.update(events);
                    end_game = endGame(engine, renderer);   //détecte la fin de partie
                } catch (e) {
                    throw (e);
                }
            }
        }

        //gère le restart et le retour au menu
        if (events["restart"]){
            //si on doit restart, on supprime les eventListener et on relance une fonction init (le debug mode actuel est conservé)
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            init(map, events["debug"]);
        }else if(events["menu"]){
            //si on doit restart, on supprime les eventListener et on relance une fonction init (le debug mode actuel est conservé)
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            //on efface le canvas
            renderer.clear();
            //retour au menu
            launch_menu();
        } else {
            //continuation normale de la boucle de jeu
            requestAnimationFrame(game);
        }
    }

    requestAnimationFrame(game);

}


/*FONCTION CREATE_EVENTS
* crée les eventsListeners dus aux input clavier
* lors d'un keydown, place l'évènement correspondant à true
* lors d'un keyup, à false (sauf exceptions)
* retourne events, un dictionnaire avec un booléen correspondant à chauque event
*/
let create_events = function(){

    let events = [];
    events["restart"] = false;
    events["debug"] = false;
    events["menu"] = false;

    document.addEventListener('keydown', handleKeyDown = function(e){
        const touche = e.key;
        switch (touche){
            case "s":
                events["player1_down"] = true;
                break;
            case "z":
                events["player1_up"] = true;
                break;
            case "q":
                events["player1_left"] = true;
                break;
            case "d":
                events["player1_right"] = true;
                break;
            case "ArrowDown":
                events["player2_down"] = true;
                break;
            case "ArrowUp":
                events["player2_up"] = true;
                break;
            case "ArrowLeft":
                events["player2_left"] = true;
                break;
            case "ArrowRight":
                events["player2_right"] = true;
                break;
            case "e":
                events["player1_bomb"] = true;
                break;
            case "+":
                events["player2_bomb"] = true;
                break;
            case "r":
                events["restart"] = true;
                break;
            default :
                break;
        }    
     }, false);

     document.addEventListener('keyup', handleKeyUp = function(e){
        const touche = e.key;
        switch (touche){
            case "s":
                events["player1_down"] = false;
                break;
            case "z":
                events["player1_up"] = false;
                break;
            case "q":
                events["player1_left"] = false;
                break;
            case "d":
                events["player1_right"] = false;
                break;
            case "ArrowDown":
                events["player2_down"] = false;
                break;
            case "ArrowUp":
                events["player2_up"] = false;
                break;
            case "ArrowLeft":
                events["player2_left"] = false;
                break;
            case "ArrowRight":
                events["player2_right"] = false;
                break;
            case "e":
                events["player1_bomb"] = false;
                break;
            case "+":
                events["player2_bomb"] = false;
                break;
            case "Enter" : 
                //change le mode de debug dès qu'on relache la touche r
                events["debug"] = !events["debug"];
                break;
            case "m" : 
                events["menu"] = true;
                break;
            default :
                break;
        }    
     }, false);

    return events;
}


/*FONCTION ENDGAME
* détecte la fin d'un niveau 
* si c'est le cas, retourne un message de victoire/défaire, sinon retourne ""
*/
let endGame = function(engine, renderer) {

    let players = engine.board.players;
    let res = ""

    //on regarde si on est en mode 1joueur 
    if (players.length == 1){
        let player = players[0];
        let portal = engine.board.portal;
        //si le joeur n'a plus de vie, on renvoie le message de défaite
        if (player.isDead()){
            res += "You lose!";
            renderer.drawEnd(res,false);      
            console.log(res);
        //si il est vivant et se trouve sur le portail, on renvoie le message de victoire
        } else if(portal !== undefined){
            if (player.x > portal.x && player.y > portal.y && player.x+player.w < portal.x+portal.w && player.y+player.h < portal.y+portal.y){
                res += "You Win !";
                renderer.drawEnd(res,true);
                console.log(res);
            }
        }
        return res;
    //ou multi-joueur
    } else {
        players.forEach((player, i) => {
            //si un joueur n'a plus de vie, alors l'autre gagne
            if (player.isDead()){
                res += "Player" + (2-i) + " Win !";
                renderer.drawEnd(res,true);
                console.log(res);
            }
        });
        return res;
    }
}

/*FONCTION LAUCH_MENU
* crée les deux boutons du menu (singlePLayer et Multiplayer)
* lance le jeu lors qu'on appuie sur un bouton
*/
let launch_menu = function(){

    //récupération du conteneur
    let conteneur = document.getElementById("tab");

    let menu = document.createElement("div");
    menu.className = "menu";
    document.body.insertBefore(menu, conteneur);

    menu.innerHTML = "<img src=" + "textures/menuTItre.png" + "></img>";

    //création du bouton SInglePLayer
    let singleplayer_button = document.createElement("div");
    singleplayer_button.className = "singleplayer_button";
    
    menu.appendChild(singleplayer_button);

    singleplayer_button.style.marginLeft = "110px";
    singleplayer_button.style.marginTop = "50px";
    singleplayer_button.innerHTML = "<img src=" + "textures/button1.png" + "></img>";

    //création du bouton MUltiplayer
    let multiplayer_button = document.createElement("div");
    multiplayer_button.className = "multiplayer_button";
    
    menu.appendChild(multiplayer_button);

    multiplayer_button.style.marginLeft = "110px";
    multiplayer_button.style.marginTop = "20px";
    multiplayer_button.innerHTML = "<img src=" + "textures/button2.png" + "></img>";

    
    //eventListener du bouton singlePlayer
    singleplayer_button.addEventListener("click", handleSinglePlayerLaunch = function () {
        //on détruit l'eventListener, au cas ou
        singleplayer_button.removeEventListener("click", handleSinglePlayerLaunch);
        //on retire les deux boutons
        document.body.removeChild(menu);
        //on lance le jeu avec la carte singlePLayer
        init("singleplayer.json", false);
    });

    //eventListener du bouton multiPlayer
    multiplayer_button.addEventListener("click", handleMultiPlayerLaunch = function () {
        //on détruit l'eventListener, au cas ou
        multiplayer_button.removeEventListener("click", handleMultiPlayerLaunch);
        //on retire les deux boutons
        document.body.removeChild(menu);
        //on lance le jeu avec la carte multiPLayer
        init("multiplayer.json",false);
    });
    
    
}

//lors du chargement de la page, on lance le menu
window.addEventListener("load", launch_menu);
