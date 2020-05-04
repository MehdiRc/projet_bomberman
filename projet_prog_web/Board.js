/************************************* 
 * CLasse Board
 * contient toute les données du plateau de jeu
 * 
 * players : liste des joeurs
 * objects : liste des obstacles
 * items : liste des bombes et power up
 * deflags : liste des déflagrations
 * sizeMapX, sizeMapY : taille du plateau en nombre de cases
 * width, height : taille du plateau en pixels
 * portal : objet contenant le portail, undefined au début, apparait lorsque le bloc le contenant est détruit
 * 
 * le contructeur appelle make_grid afin de charger les données du niveau
**************************************/
class Board {   
    constructor (map, canvas) {
      this.players = [];
      this.objects = [];
      this.items = [];
      this.deflags = [];
      this.sizeMapX = 0;
      this.sizeMapY = 0;
      this.width = canvas.width;
      this.height = canvas.height-250;
      this.makeGrid(map, canvas);
    }

    /*FONCTION MAKEGRID
    * prend en argument le path vers le fichier JSON contenant les données du niveau
    * initialise les attributs du Board en fonction de ces données
    */
    makeGrid(path){
     
      //récupération des données depuis le fichier JSON
      //on utilise une promesse afin que l'éxécution ne continue que lorsque le niveau a finit de charger
      let promise = new Promise (function(resolve, reject){
          var xhttp = new XMLHttpRequest();
          
          xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
              let result = JSON.parse(xhttp.responseText);
              resolve(result);
            }
          };
          xhttp.open("GET",path, true);
          xhttp.overrideMimeType("text/plain");
          xhttp.send(null);
      })

      let that = this;

      //calculs et initialisation des attributs du board
      promise.then(function(value){
        //récupération du tableau de données
        let map = value;

        //id du prochain joueur à être créé
        let id_player = 1;

        //calcul des dimensions en nombre de cases
        that.sizeMapX = map[0].length;
        that.sizeMapY = map.length;

        //calcul des dimensions d'une case
        let stepX = that.width/that.sizeMapX;
        let stepY = that.height/that.sizeMapY;

        //récupération des données de la map
        for(let j = 0; j< that.sizeMapY; j++){
          for(let i = 0; i<  that.sizeMapX; i++){

            //calcul des coordonées de l'objet en pixels
            let x = i*stepX;
            let y = j*stepY;

            //création des objets en fonction de leur type
            switch (map[j][i]){
              //création d'un rocher indestructible
              case "u":
                that.objects.push(new Boulder(x, y, stepX, stepY, false));

                break;
              //création d'un rocher destructible
              case "b":
                that.objects.push(new Boulder(x, y, stepX, stepY, true));
                break;
              //création d'un joueur
              case "p":
                that.players.push(new Player(x, y, stepX*(80/100), stepY*(80/100), id_player));
                //on incrémente l'id du prochain joueur
                id_player++;
                break;
              default:
                break;
            }
          }
        }

        //création du portail si on est en singlePlayer
        if(that.players.length==1){

          let portal_spawned = false;

          while(!portal_spawned){
            //on fait apparaitre le portail dans un rocher destructible au hasard;
            that.objects.forEach(b => {
              if(b.breakable && !portal_spawned){
                let rdn = Math.floor(Math.random() * Math.floor(20));
                if (rdn==0){
                  //dès qu'un portail peut spawn, on passe l'attribut has_portal du bloc qui le contient à true
                  b.has_portal = true;
                  portal_spawned = true;
                }
              }  
            });
          }
        }

      });  
    }

    /*FONCTION TO_CENTER_TILE
    * change les coordonnées d'un objet pour le placer au centre de la case qui le contient
    */
    toCenterTile(x,y){
      //calcul des dimensiosn d'une case
      let stepX = this.width/this.sizeMapX;
      let stepY = this.height/this.sizeMapY;

      let tileX = -1;
      let tileY = -1;

      //on charche les coordonnées de la case contenant
      while(x>=0){
        x = x-stepX;
        tileX++;
      }
      while(y>=0){
        y = y-stepY;
        tileY++;
      }

      //on retourne les coordonnées du millieu de la case
      return ([tileX*stepX+stepX/2,tileY*stepY+stepY/2]);

    }

    /*FONCTION PLACE_BOMB
    * place sur le board une bombe
    * elle contient les propriétés de la bombe du joueur passé en argument
    */
    placeBomb(player){
      //création de la bombe avec les bon attributs
      let B = new Bomb(player.x, player.y, player.w, player.h, player.bomb.lifeSpan, player.bomb.range, player.bomb.id_player);

      //on centre la bombe dans la case la contenant
      let newCenter  = this.toCenterTile(player.x+player.w/2, player.y+player.h/2);
      let newx = newCenter[0];
      let newy = newCenter[1];
      B.x = newx-B.w/2;
      B.y = newy-B.h/2;

      //on place une bombe s'il n'y a pas déja de bombe sur la case, et que le joeur a la possibilité de le faire
      let i = this.items.findIndex (function (e) { return e.x==B.x && e.y==B.y; });
      if (i<0 && player.canPlaceBomb()){
        //on rajoute la bome à la liste des items
        this.items.push(B);
      }
    }


    /*FONCTION DETONATE_BOMB
    * réduit le lifeSpan des bombes et les fait exploser si il atteint 0
    */
    detonateBombs(){
      //calcul des dimensions des cases
      let stepX = this.width/this.sizeMapX;
      let stepY = this.height/this.sizeMapY;

      this.items.forEach((e,i) => {
        if (e instanceof Bomb){
          //on réduit le lifeSpan
          let state = e.timer();
          //si il est à 0, la faire exploser
          if (state){
            e.detonate(this.items, i, this.players[e.id_player-1], this.objects, this.deflags, stepX, stepY);
          }
        }  
      });
    }


    /*FONCTION EXPIRE
    * reduit le lifeSpan des entités temporaire et les retire si besoin
    */
    expire(){
      //les déflagrations
      this.deflags.forEach((d,i) => {
        //on réduit le lifeSpan
        let state = d.timer();
         //si il est à 0, le retirer du board
        if (state){
          this.remove_deflag(i)
        }
      });

      //les power ups
      this.items.forEach((d,i) => {
        if (d instanceof PowerUp){
          //on réduit le lifeSpan
          let state = d.timer();
           //si il est à 0, e retirer du board
          if (state){
            this.remove_item(i)
          }
        }
      });

    }

    /*FONCTION DESTROY
    * retire un élément de la liste d'objets
    */
    destroy(i){
      this.objects.splice(i, 1);
    }

    /*FONCTION REMOVE_DEFLAGS
    * retire un élément de la liste de déflagrations
    */
    remove_deflag(i){
      this.deflags.splice(i, 1);
    }

    /*FONCTION REMOVE_ITEMS
    * retire un élément de la liste d'items'
    */
    remove_item(i){
      this.items.splice(i, 1);
    }

    /*FONCTION SPAWN8POWERUPS
    * fait apparaitre n power ups sur le board
    */
    spawn_powerUps(n){

      //calcul des dimensions d'une case
      let stepX = this.width/this.sizeMapX;
      let stepY = this.height/this.sizeMapY;

      //calcul de chacun des n power-ups
      for (let i=0; i<n+1; i++){
        //sélectionner un effet aléatoirement
        let id_effect = Math.floor(Math.random() * Math.floor(9));
        let effect = "";
        switch (id_effect){
          case 0:
            effect = "lifeUp";
            break;
          case 1:
            effect = "speedUp";
            break;
          case 2:
            effect = "speedDown";
            break;
          case 3:
            effect = "maxBombUp"; 
            break;
          case 4:
            effect = "maxBombDown";
            break;
          case 5:
            effect = "rangeUp"; 
            break;
          case 6:
            effect = "rangeDown";
            break;
          case 7:
            effect = "detonateUp"; 
            break;
          case 8:
            effect = "detonateDown";
            break;
          default:
            break;
        }

        //indique si on a trouvé une case valide pour le spawn
        let valid_spawn = false;
        //les coordonées
        let x,y;
        //l'objet powerup
        let powerUp;

        //tant qu'on a pas trouvé le spawn valide
        while(!valid_spawn){
          valid_spawn = true;

          //générer des coordonées de case au hasard (sauf les bords)
          x = Math.floor(Math.random() * Math.floor(this.sizeMapX-2));
          y = Math.floor(Math.random() * Math.floor(this.sizeMapY-2));

          //creer un nouveau power up à ces coordonnées
          powerUp = new PowerUp((x+1)*stepX, (y+1)*stepY, stepX*80/100, stepY*80/100, 500, effect);

          //le placer au millieu de la case
          let newCenter  = this.toCenterTile(powerUp.x+powerUp.w/2, powerUp.y+powerUp.h/2);
          let newx = newCenter[0];
          let newy = newCenter[1];
          powerUp.x = newx-powerUp.w/2;
          powerUp.y = newy-powerUp.h/2;

          //si il entre en collision avec un autre objet, on ne le crée pas
          this.players.forEach(e => {
            if (powerUp.collision(e)){
              valid_spawn = false;
            }
          });
          this.objects.forEach(e => {
            if (powerUp.collision(e)){
              valid_spawn = false;
            }
          });
          this.items.forEach(e => {
            if (powerUp.collision(e)){
              valid_spawn = false;
            }
          });
        }

        //si le power up a été créé, on le rajoute à la liste d'items
        if (powerUp instanceof PowerUp){
          this.items.push(powerUp);
        }
      }
    }
}