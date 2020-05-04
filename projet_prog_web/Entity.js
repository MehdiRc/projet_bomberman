/************************************* 
 * CLasse Deflag
 * représente les objets non fixes, hérite de Objet
 * 
 * ne sert pas dans le code actuelle, cette classe a été crée au cas ou on aurai voulu rajouter plus d'objets mouvants
 * (comme des ennemis)
**************************************/
class Entity extends Object {
    constructor (x, y, w, h) {
        super(x, y, w, h)    
    }
}