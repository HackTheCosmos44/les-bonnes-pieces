import { ajoutListenersAvis, ajoutListenerEnvoyerAvis, afficherAvis } from "./avis.js";
// Récupération des pièces éventuellement stockées dans le localStorage
let pieces = window.localStorage.getItem("pieces");

// Récupération des pièces depuis le fichier JSON
if(pieces === null) {
    const reponse = await fetch(`http://localhost:8081/pieces`);
    const pieces = await reponse.json();
    
    // Transformation des pièces en JSON
    const valeurPieces = JSON.stringify(pieces);
    
    // Stockage des informations dans le localStorage
    window.localStorage.setItem("pieces", valeurPieces);
} else {
    pieces = JSON.parse(pieces);
}


// on appelle la fonction pour ajouter le listener au formulaire
ajoutListenerEnvoyerAvis();

// Fonction qui génère toute la page web
function genererPieces(pieces) {
    for (let i = 0; i < pieces.length; i++) {
        const article = pieces[i];

        // Récupération de l'élément du DOM qui accueillera les fiches
        const sectionFiches = document.querySelector(".fiches");

        // Création d’une balise dédiée à une pièce auto
        const pieceElement = document.createElement("article");

        // On crée l’élément img.
        const imageElement = document.createElement("img");
        // On accède à l’indice i de la liste pieces pour configurer la source de l’image.
        imageElement.src = article.image;
      
        //idem pour le nom, le prix, la description, la catégorie, et la disponibilite
        const nomElement = document.createElement("h2");
        nomElement.innerText = article.nom;

        const idElement = document.createElement("p");
        idElement.innerText = `identifiant : ${article.id}`;
    
        const prixElement = document.createElement("p");
        prixElement.innerText = `Prix: ${article.prix} € (${article.prix < 35 ? "€" : "€€€"})`;
    
        const categorieElement = document.createElement("p");
        categorieElement.innerText = article.categorie ?? "(aucune catégorie)";
    
        const descriptionElement = document.createElement("p");
        descriptionElement.innerText = article.description ?? "(Pas de description pour le moment)";
    
        const dispoElement = document.createElement("p");
        dispoElement.innerText = article.disponibilite ? "En stock" : "Rupture de stock";

        //bouton pour afficher les avis utilisateures
        const avisBouton = document.createElement("button");
        avisBouton.dataset.id = article.id;
        avisBouton.textContent = "Afficher les avis";
    
        sectionFiches.appendChild(pieceElement);
        pieceElement.appendChild(imageElement);
        pieceElement.appendChild(nomElement);
        pieceElement.appendChild(idElement);
        pieceElement.appendChild(prixElement);
        pieceElement.appendChild(categorieElement);
        pieceElement.appendChild(descriptionElement);
        pieceElement.appendChild(dispoElement);
        pieceElement.appendChild(avisBouton);

    }
    // Ajout de la fonction ajoutListenersAvis
    ajoutListenersAvis();
}
   
// Premier affichage de la page
genererPieces(pieces);

for(let i = 0; i < pieces.length; i++) {
    const id = pieces[i].id;
    const avisJSON = window.localStorage.getItem(`avis-piece-${id}`);
    const avis = JSON.parse(avisJSON);

    if(avis !== null) {
        const pieceElement = document.querySelector(`article[data-id="${id}"]`);
        afficherAvis(pieceElement, avis);
    }
}



//filtrage par prix croissant, en copiant la liste d'origine pour ne pas la modifier
const boutonTrier = document.querySelector(".btn-trier");
boutonTrier.addEventListener("click", function () {
    const piecesOrdonnees = Array.from(pieces);
    piecesOrdonnees.sort(function (a, b) {
        return a.prix - b.prix;
     });
    // Effacement de l'écran et regénération de la page
    document.querySelector(".fiches").innerHTML = "";
    genererPieces(piecesOrdonnees);
 });

 //filtrage par prix déccroissant, en copiant la liste d'origine pour ne pas la modifier
 const boutonDecroissant = document.querySelector(".btn-decroissant");
 boutonDecroissant.addEventListener("click", function () {
    const piecesOrdonnees = Array.from(pieces);
    piecesOrdonnees.sort(function (a, b) {
        return b.prix - a.prix;
    });
    // Effacement de l'écran et regénération de la page
    document.querySelector(".fiches").innerHTML = "";
    genererPieces(piecesOrdonnees);
 });

 //filtrage des pièces par prix abordable (si le prix < 35€, on affiche le produit, sinon on ne l'affiche pas)
 const boutonFiltrer = document.querySelector(".btn-filtrer");

 boutonFiltrer.addEventListener("click", function () {
    const piecesFiltrees = pieces.filter(function (piece) {
        return piece.prix <= 35;
    });

    // Effacement de l'écran et regénération de la page avec les pièces filtrées uniquement
    document.querySelector(".fiches").innerHTML = "";
    genererPieces(piecesFiltrees); console.log(piecesFiltrees)
 });

 //filtrage des pièces qui n'ont pas de description
 const boutonNoDescription = document.querySelector(".btn-nodesc");

boutonNoDescription.addEventListener("click", function () {
    const piecesFiltrees = pieces.filter(function (piece) {
        return piece.description
    });
    // Effacement de l'écran et regénération de la page avec les pièces filtrées uniquement
    document.querySelector(".fiches").innerHTML = "";
    genererPieces(piecesFiltrees); console.log(piecesFiltrees)
});

//récupération du nom des pièces (sous forme de liste)
const noms = pieces.map(piece => piece.nom);


//affichage du nom des pièces abordables
for(let i = pieces.length -1; i>=0; i--) {
    if(pieces[i].prix > 35) {
        noms.splice(i,1);
    }
}

const abordablesElements = document.createElement("ul");

for(let i = 0; i < noms.length; i++) {
    const nomElement = document.createElement("li");
    nomElement.innerText = noms[i];
    abordablesElements.appendChild(nomElement);
}

document.querySelector(".abordables").appendChild(abordablesElements)

//récupération et affichage du nom et du prix des pièces disponibles
const nomsDisponibles = pieces.map(piece => piece.nom)
const prixDisponibles = pieces.map(piece => piece.prix)

for(let i = pieces.length -1; i>=0; i--) {
    if(!pieces[i].disponibilite) {
        nomsDisponibles.splice(i,1);
        prixDisponibles.splice(i,1);
    }
}

const disponiblesElements = document.createElement("ul");
for(let i = 0; i < nomsDisponibles.length; i++) {
    const nomElement = document.createElement("li");
    nomElement.innerText = `${nomsDisponibles[i]} - ${prixDisponibles[i]} €`;
    disponiblesElements.appendChild(nomElement);
}

document.querySelector(".disponibles").appendChild(disponiblesElements);

//filtrage des prix avec le slider
const inputPrixMax = document.querySelector("#prix_max");
inputPrixMax.addEventListener("input", function () {
    const piecesFiltrees = pieces.filter(function (piece) {
        return piece.prix <= inputPrixMax.value;
    });
    // Effacement de l'écran et regénération de la page avec les pièces filtrées uniquement
    document.querySelector(".fiches").innerHTML = "";
    genererPieces(piecesFiltrees); console.log(piecesFiltrees)
});


// Ajout du listener pour mettre à jour des données du localStorage
const boutonMettreAJour = document.querySelector(".btn-maj");
boutonMettreAJour.addEventListener("click", function () {
  window.localStorage.removeItem("pieces");
});

