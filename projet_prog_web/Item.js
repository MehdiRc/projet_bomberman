/************************************* 
 * CLasse Items
 * représente les objets avec lesquels le joueur intéragit, hérite de Entity
 * 
 * lifeSPan: temps restant sur le terrain
 * maxLifeSpan: lifeSpan initial
**************************************/
class Item extends Entity{
    constructor (x, y, w, h, lifeSpan) {
        super(x, y, w, h);
        this.lifeSpan=lifeSpan;
        this.maxLifeSpan=lifeSpan;
    }

    /*FONCTION TIMER
    * décrémente le lifeSPan
    */
    timer(){
        this.lifeSpan--;
        return (this.lifeSpan<=0);
    }
}