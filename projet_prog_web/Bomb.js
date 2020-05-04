/************************************* 
 * CLasse Bomb
 * représente les bombes, hérite de la classe item
 * 
 * range : la portée d'explosion
 * id_player : l'id du joueur qui a posé la bombe
**************************************/
class Bomb extends Item{
    constructor (x, y, w, h, lifeSpan, range, id_player) {
        super(x, y, w, h, lifeSpan);
        this.range = range;
        this.id_player = id_player;
    }

    /*FONCTION DETONATE
    * fait exploser la bombe et met à jour les listes
    */
    detonate(itemList, i, player, objectList, deflagList, stepX, stepY){
        //on retire la bombe du board
        itemList.splice(i, 1);
        //on retire la bombe du joueur
        player.removeBomb();
        //on crée une déflagration, et on l'ajoute au board
        let deflag = new Deflag(this.x, this.y, this.w, this.h, 100, this.range, "all");
        deflagList.push(deflag);
        //on propage la déflagration
        deflag.propagate(deflagList, stepX, stepY, objectList);
    }
}