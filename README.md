# Outil d'aide à la correction pour le TP1

## Fonctionnement

* Télécharger l'outil (soit un ZIP à partir de ce dépôt ou faire un git clone)
* Faire un dossier dans le dossier de l'outil pour mettre les TP des étudiants (ex : TPetudiant)
* Décompresser dans le dossier TPetudiant le TP de l'étudiant
* Modifier les URL dans les lignes 38/42/46/50 pour pointer vers les pages du TP de l'étudiant
  * Ligne 38 : Page d'accueil (ex : TPetudiant/TP1-Dayron/Accueil.html)
  * Ligne 42 : Page de recherche (ex : TPetudiant/TP1-Dayron/Recherche.html)
  * Ligne 46 : Page de détail (ex : TPetudiant/TP1-Dayron/Detail.html)
  * Ligne 50 : Page de favoris (ex : TPetudiant/TP1-Dayron/Favoris.html)
* Ouvrir la page TP1analyseur.html avec LiveServer


## Remarques importantes

* Si l'une des 4 pages n'est pas chargés dans les iframes, ça ne marche pas...
  * logique, mais bon certains étudiants ne l'avaient pas compris :P
* Il peut y avoir des faux négatifs dans les cas suivants :
  * Si le HTML est vraiment trop mal formatté (ne passe pas la validation W3C) 
    * raison : le javascript ne permet pas d'analyser la page toujours comme y faut
  * Si le CSS est vraiment trop mal formatté (ne passe pas la validation W3C)
    * raison : la bibliothèque javascript postcss n'arrive pas à analyser le fichier CSS
  * Si un autre faux négatif arrive, svp me le signaler, les étudiants sont imaginatifs pour inventé des problèmes
* Il pourrait y avoir des faux positifs, mais c'est rare
  * J'en ait trouvé quelque s'un en corrigeant à la main tous mes TPs et en comparant avec l'outil, ça été corrigé
* Quelques critères de corrections ont été adoucie, car j'en avais fait en classe :
  * De mémoire, je m'en rappel juste d'un, c'est pour les images fluid, tant que ça été utilisé au moins une fois, s'était content, je ne forçais pas toutes les images à avoir la classe image-fluid


## Limitations de l'outil

* Il doit y avoir un seul fichier de style et il doit être dans le dossier "style" ou "styles".
* Ça ne permet pas de savoir si ça fait du sens ce qu'ils ont fait, il faut quand même observer
  * Par exemple, l'utilisation des positions relatif, absolute, fixed parfois s'était du n'importe quoi


## Amélioration à venir

* Améliorer l'énoncé du TP pour que presque 100% des éléments soient auto-corrigeable