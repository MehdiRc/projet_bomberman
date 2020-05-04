/************************************* 
 * CLasse Player
 * représente un joueur, hérite de Entity
 * 
 * effect : l'effet du power up parmi :
 *          "lifeUp":"speedUp":"speedDown":"maxBombUp":"maxBombDown":"rangeUp":"rangeDown":"detonateUp": "detonateDown"
**************************************/
class PowerUp extends Item{
    constructor (x, y, w, h, lifeSpan, effect) {
        super(x, y, w, h, lifeSpan);
        this.effect = effect;
    }
}