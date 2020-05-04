/************************************* 
 * CLasse Player
 * représente un joueur, hérite de Entity
 * 
 * id :id du joueur
 * speed : vitesse du joueur
 * life : vie du joueur
 * bombPlaced : nombre de bombes du joueur actuellement présentes sur le terrain
 * maxBomb : nombre max de bombes plaçables
 * bomb : caractéristiques des bombes du joeur
 * orientation : orientation du joueur (up, down, left, right)
 * animationFrame : frame d'animation actuelle
 * invincibility : temps d'invincibilité restant (si a 0, peut prendre des dégats)
**************************************/
class Player extends Entity{
    constructor (x, y, w, h, id) {
        super(x, y, w, h);
        this.id = id;
        this.speed = 4;
        this.life = 2;
        this.bombPlaced = 0;
        this.maxBomb = 2;
        this.bomb = new Bomb(x, y, w, h, 60*3, 2, id)
        this.orientation = "down";
        this.animationFrame = 0;
        this.invincibility = 0;
    }

    /* FONCTION MOVE
    *  déplace le joueur en fonction de sa vitesse
    */
    move(dx, dy){
        this.x += dx*this.speed;
        this.y += dy*this.speed;
    }

    /* FONCTION CAN_PLACE_BOMB
    * retourne un boléen indiquant si le joeur peut placer une bombe
    */
    canPlaceBomb(){
        if (this.bombPlaced<this.maxBomb){
            //on incrémente le nombre de bombes placées
            this.bombPlaced++;
            return true;
        }
        return false;
    }

    /* FONCTION REMOVE_BOMB
    *  retire une bombes de la liste de bombes placées
    */
    removeBomb(){
        this.bombPlaced--;
        if (this.bomPlaced < 0){
            this.bombPlaced = 0;
        }
    }

    /* FONCTION HURT
    *  diminue la vie du joueur en fonction de dmg
    */
    hurt(dmg){
        this.life = this.life - dmg;
    }

    /* FONCTION ID_DEAD
    * retourne un boléen indiquant si le joueur est mort
    */
    isDead(){
        return (this.life <= 0);
    }

    /* FONCTION APPLY_EFFECT
    *  applique l'effet passé en argument au joueur
    */
    applyEffect(effect){
        switch (effect){
            case "lifeUp":
                this.life++;
                break;
            case "speedUp":
                this.speed+=0.5;
                break;
            case "speedDown":
                if (this.speed>1){
                    this.speed-=0.5;
                }
                break;
            case "maxBombUp":
                this.maxBomb++;
                break;
            case "maxBombDown":
                if (this.maxBomb>1){
                    this.maxBomb--;
                }
                break;
            case "rangeUp":
                this.bomb.range++;
                break;
            case "rangeDown":
                if (this.bomb.range>1){
                    this.bomb.range--;
                }
                break;
            case "detonateUp":
                this.bomb.lifeSpan+=30;
                break;
            case "detonateDown":
                if (this.bomb.lifeSpan>=60){
                    this.bomb.lifeSpan = this.bomb.lifeSpan - 30;
                }
                break;
            default:
                break;
        }
    }

    /* FONCTION IS_INVINCIBLE
    *  retourne un boléen indiquant si le joeur est en période d'nvincibilité
    */
    isInvincible(){
        return (this.invincibility>0);
    }

    /* FONCTION UPDATE
    *  update les propriétés du joueur
    */
    update(){
        //augmente l'nimationframe, la réinitialise si elle dépasse 40
        this.animationFrame++;
        if(this.animationFrame >=40){
            this.animationFrame = 0;
        }

        //décrémente la période d'invincibilité
        if (this.invincibility>0){
            this.invincibility--;
        }
    }
}