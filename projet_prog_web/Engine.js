/************************************* 
 * CLasse Engine
 * gère les évènements, collisions et la mise à jouur des objets en jeu
 * 
 * board : le niveau actuel
 * spawn_pass : le nb de frame depuis le dernier spawn d'objets
 * var_spawn : si à 0, déclenche le spawn d'items
**************************************/

class Engine{
    constructor(board){
        this.board = board;
        this.spawn_pass = 0;
        this.var_spawn = (-1);
    }

    /*FONCTION HANDLE_EVENTS
    * prend en argement le dictionnaire d'évènements
    * effectue les actions associées
    */
    handle_events(events){
        //effectue ces actions pour chaque joeur de la partie
        this.board.players.forEach((p,i) => {

            //déplacements
            if (events["player" + (i+1) + "_up"]){
                this.board.players[i].move(0,-1);
                this.board.players[i].direction = "up";
            } else if (events["player" + (i+1) + "_down"]){
                this.board.players[i].move(0,1);
                this.board.players[i].direction = "down";
            } else if (events["player" + (i+1) + "_left"]){
                this.board.players[i].move(-1,0);
                this.board.players[i].direction = "left";
            } else if (events["player" + (i+1) + "_right"]){
                this.board.players[i].move(1,0);
                this.board.players[i].direction = "right";
            }
    
            //poser une bombe
            if (events["player" + (i+1) + "_bomb"]){
                this.board.placeBomb(this.board.players[i]);
            }
        });
    }


    /*FONCTION SPAWN_POWERS_UP
    * spawn aléatoirement 1 à 4 power up tout les 600 à 800 ticks
    * retourne un boléen indiquant si le spawn a été effectué
    */
    spawn_powers_up(){
        if (this.spawn_pass>600){
            //définition de var_spawn en fonction du nombre de ticks
            let k = this.spawn_pass;
            let rdm = Math.floor(Math.random() * Math.floor(800-k));
            this.var_spawn = rdm;
            //si var_spawn = 0, alors on fait spawnner les powerUps et on renvoie true
            if (rdm <= 0){
                let rand_n = Math.floor(Math.random() * Math.floor(4));
                this.board.spawn_powerUps(rand_n);
                return true;
            }
        }
        return false;
    }


    /*FONCTION UPDATE
    * met à jour l'engine et calculant le résultat des évènements
    * et les collisions
    */
    update(events){

        this.spawn_pass++;

        //update l'état des joeurs
        this.board.players.forEach(p =>{
            p.update();
        });

        //gère les évènements
        this.handle_events(events);

        //collisions des joeurs
        this.board.players.forEach((player) => {
            this.board.objects.forEach((other, i) => {
                let has_collision = player.collision(other);
            });

            this.board.deflags.forEach((defl, j) => {
                //si le joueur touche une déflagration, il perd de la vie
                let defl_player_collide = player.collision(defl);
                if (defl_player_collide){
                    if(!player.isInvincible()){
                        player.hurt(1);
                        player.invincibility = 100;
                    }
                }
            });

            this.board.items.forEach((o, j) => {
                if (o instanceof PowerUp){
                    //si le joueur touche un item, il gagne son effet
                    let powerUp_player_collide = player.collision(o);
                    if (powerUp_player_collide){
                        player.applyEffect(o.effect);
                        this.board.remove_item(j);
                    }
                }
            });
        })

        //collions entre autres objets
        this.board.objects.forEach((other, i) => {
            this.board.deflags.forEach((defl, j) => {
                let defl_boulder_collide = defl.collision(other);
                //si il y a colliosion déflagration-rocher
                if (defl_boulder_collide){
                    //si le rocher est destructiible, il est détruit
                    if (other.breakable){
                        this.board.destroy(i);
                        defl.range = 0;
                        if (other.has_portal){
                            this.board.portal = new Object(other.x,other.y,other.w,other.h);
                        }
                    //si il est indestructible, la déplagration est détruite
                    } else {
                        this.board.remove_deflag(j);
                    }
                }
            });
        });

        //fait spawn les powerUp sur le terrain:
        //si ils ont spawn, alors spawn_pass est réinitialisé
        if(this.spawn_powers_up()){
            this.spawn_pass = 0;
        }

        //met à jour les timers des objets sur le terrain
        this.board.detonateBombs();
        this.board.expire();

    }
}