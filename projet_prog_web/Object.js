/************************************* 
 * CLasse Objet
 * représente tou les objets présents sur le board
 * calcule les collisions entre objets
 * le calcul des collisions a été repris du TP2
 * 
 * x,y : coordonnées en pixels
 * w,h : dimensiosn en pixels
**************************************/
class Object {
    constructor (x, y, w, h) {
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
    }

    /* FONCTION MDIFF
    *  retourne la différence de MInkowsi entre this et other sous la forme d'un objet
    */
    mDiff (other) {
        return new Object(other.x - this.x - this.w, other.y - this.y - this.h, this.w + other.w, this.h + other.h);
    }

    /* FONCTION HASORIGIN
    *  retourne un boléen indiquant si l'objet contient l'origine
    */
    hasOrigin () {
        return (this.x < 0 && this.x + this.w > 0)
        	&& (this.y < 0 && this.y + this.h > 0);
    }

    /* FONCTION COLLISON
    *  calcule les collisons et replace les objets
    *  retourne un boléen indiquant si il y eu collision
    */
    collision (other) {

        //calcul de la différence de minkowski
        let mdiff = this.mDiff(other);

        //si la différence contient, l'origine, il y a eu collision
        if (mdiff.hasOrigin()) {
            //pas de repositionnement pour les collisons avec des déflagrations
            if (this instanceof Deflag || other instanceof Deflag){
                return true;
            } else {
                //calcul des encadrements du la différence de minkowski
                let top = 0-mdiff.y;
                let bottom = mdiff.h+mdiff.y;
                let left = 0-mdiff.x;
                let right = mdiff.w+mdiff.x;

                //trouve l'encadrement le plus petit
                let min = 99999;
                let dir = "";

                if (top<min){
                    min = top;
                    dir = "top";
                }
                if (bottom<min){
                    min = bottom;
                    dir = "bottom";
                }
                if (left<min){
                    min = left;
                    dir = "left";
                }
                if (right<min){
                    min = right;
                    dir = "right";
                }

                //on repositionne this en fonction du plus petit encadrement
                switch(dir){
                    case "top":
                        this.y = this.y - top;
                        break;
                    case "bottom":
                        this.y = this.y + bottom;
                        break;
                    case "left":
                        this.x = this.x - left;
                        break;
                    case "right":
                        this.x = this.x + right;
                        break;
                    default:
                        break;
                }
                
                return true;
            }

        } else {
            return false;
        }
        
    }

}