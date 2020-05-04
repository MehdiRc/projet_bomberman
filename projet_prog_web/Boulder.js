/************************************* 
 * CLasse Boulder
 * représente les blocs, hérite de Object
 * 
 * breakable : booléen indiquant si le bloc est destructible ou non
 * has_portal : booléen indiquant si le bloc contient le portail
**************************************/
class Boulder extends Object {
    constructor (x, y, w, h, breakable) {
        super(x, y, w, h);
        this.breakable = breakable;
        this.has_portal = false;
    }
}