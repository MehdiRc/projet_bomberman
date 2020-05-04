/************************************* 
 * CLasse Deflag
 * représente les déflagrations issues de l'explosion des bombes, hérite de Entity
 * 
 * lifeSPan: temps restant sur le terrain
 * maxLifeSpan: lifeSpan initial
 * range: portée restante
 * direction: top, bottom, left ou right
**************************************/

class Deflag extends Entity{
    constructor (x, y, w, h, lifeSpan, range, direction) {
        super(x, y, w, h);
        this.lifeSpan = lifeSpan;
        this.maxLifeSpan = lifeSpan;
        this.range = range;
        this.direction = direction;    
    }
    
    /*FONCTION TIMER
    * décrémente le lifeSPan
    */
    timer(){
        this.lifeSpan--;
        return (this.lifeSpan==0);
    }

    /*FONCTION PROPAGATE
    * crée de nouvelles déflagrations tant qu'il reste de la portée
    * prend en argument la liste de déflagrations, les dimensiosn d'une case et la liste de blocs
    */
    propagate(deflagList, stepX, stepY, objectList){

        //on vérifie si cette déflagration entre en collision avec un bloc
        let has_collided = false;
        objectList.forEach(e => {
            if (this.collision(e)){
                has_collided = true;
            }
        });

        //si aucune collision et qu'il reste de la portée
        if (this.range > 0 && !has_collided){
            //on crée de nouvelles déflagrations en fonction de l'orientation de la déflagration actuelle
            switch (this.direction){
                //déflagration centrale
                case "all":
                    //création des déflags
                    let def1 = new Deflag(this.x, this.y-stepY, this.w, this.h, this.lifeSpan, this.range-1, "top");
                    let def2 = new Deflag(this.x, this.y+stepY, this.w, this.h, this.lifeSpan, this.range-1, "bottom");
                    let def3 = new Deflag(this.x-stepX, this.y, this.w, this.h, this.lifeSpan, this.range-1, "left");
                    let def4 = new Deflag(this.x+stepX, this.y, this.w, this.h, this.lifeSpan, this.range-1, "right");
                    //on les ajoute dans le board
                    deflagList.push(def1);
                    deflagList.push(def2);
                    deflagList.push(def3);
                    deflagList.push(def4);
                    //on les propage
                    def1.propagate(deflagList, stepX, stepY, objectList);
                    def2.propagate(deflagList, stepX, stepY, objectList);
                    def3.propagate(deflagList, stepX, stepY, objectList);
                    def4.propagate(deflagList, stepX, stepY, objectList);
                    break;
                //vers le haut
                case "top":
                    let defT = new Deflag(this.x, this.y-stepY, this.w, this.h, this.lifeSpan, this.range-1, "top");
                    deflagList.push(defT);
                    defT.propagate(deflagList, stepX, stepY, objectList);
                    break;
                //vers le bas
                case "bottom":
                    let defB = new Deflag(this.x, this.y+stepY, this.w, this.h, this.lifeSpan, this.range-1, "bottom");
                    deflagList.push(defB);
                    defB.propagate(deflagList, stepX, stepY, objectList);
                    break;
                //vers la gauche
                case "left":
                    let defL = new Deflag(this.x-stepX, this.y, this.w, this.h, this.lifeSpan, this.range-1, "left");
                    deflagList.push(defL);
                    defL.propagate(deflagList, stepX, stepY, objectList);
                    break;
                //vers la droite
                case "right":
                    let defR = new Deflag(this.x+stepX, this.y, this.w, this.h, this.lifeSpan, this.range-1, "right");
                    deflagList.push(defR);
                    defR.propagate(deflagList, stepX, stepY, objectList);
                    break;
                default :
                    break;
            }
        }
    }
}