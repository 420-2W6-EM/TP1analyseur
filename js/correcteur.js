import postcss from 'postcss';
import axios from 'axios';
//npm run build

async function verifierTransitionCSS() {
    traitement((root) => {
        let hasTransition = false;

        root.walkDecls(decl => {
            if (decl.prop === 'transition') {
                hasTransition = true;
            }
        });

        if (hasTransition) {
            resultatAuMoinsUnEffetDeTransition.innerText = 'effet de transition trouvé';
            resultatAuMoinsUnEffetDeTransition.className = 'valid';
        } else {
            resultatAuMoinsUnEffetDeTransition.innerText = 'aucun effet de transition trouvé';
            resultatAuMoinsUnEffetDeTransition.className = 'invalid';
        }
    }, resultatAuMoinsUnEffetDeTransition);
}


async function verifierMediaQueries() {   
    traitement((root) => {
        let hasMediaQuery = false;

        root.walkAtRules('media', atRule => {
            hasMediaQuery = true;
        });

        if (hasMediaQuery) {
            resultatAuMoinsUneRequeteMediaDoitEtreUtilise.innerText = 'requête média trouvée';
            resultatAuMoinsUneRequeteMediaDoitEtreUtilise.className = 'valid';
        } else {
            resultatAuMoinsUneRequeteMediaDoitEtreUtilise.innerText = 'aucune requête média trouvée';
            resultatAuMoinsUneRequeteMediaDoitEtreUtilise.className = 'invalid';
        }
    }, resultatAuMoinsUneRequeteMediaDoitEtreUtilise);
}


async function verifier5TypesSelecteur() {    
    traitement((root) => {
        const selecteurs = new Set();

        root.walkRules(rule => {
            const selectors = rule.selector.split(',');
            selectors.forEach(selector => {
                if (selector.includes('#')) {
                    selecteurs.add('ID');
                } else if (selector.includes('.')) {
                    selecteurs.add('Class');
                } else if (selector.includes('[')) {
                    selecteurs.add('Attribute');
                } else if (selector.includes(':')) {
                    selecteurs.add('Pseudo-class');
                } else if (selector.includes('::')) {
                    selecteurs.add('Pseudo-element');
                } else if (selector.includes(',')) {
                    selecteurs.add('Comma');
                } else {
                    selecteurs.add('Type');
                }
            });
        });

        if (selecteurs.size >= 5) {
            resultat5typeDeSelecteurs.innerText = 'au moins 5 types de sélecteurs différents trouvés';
            resultat5typeDeSelecteurs.className = "valid";
        } else {
            resultat5typeDeSelecteurs.innerText = 'moins de 5 types de sélecteurs différents trouvés';
            resultat5typeDeSelecteurs.className = "valid";
        }

    }, resultat5typeDeSelecteurs);
}


async function verifierToutesLesTypesDePositionnementUtilisée() {    
    traitement((root) => {
        let hasRelative = false;
        let hasAbsolute = false;
        let hasFixed = false;
        let hasAbsoluteWithPosition = false;
        let hasFixedWithPosition = false;
        
        root.walkDecls(decl => {
            if (decl.prop === 'position') {
                if (decl.value === 'relative') {
                    hasRelative = true;
                } else if (decl.value === 'absolute') {
                    hasAbsolute = true;
                } else if (decl.value === 'fixed') {
                    hasFixed = true;
                }
            }
        
            if (decl.prop === 'left' || decl.prop === 'right' || decl.prop === 'top' || decl.prop === 'bottom') {
                const parent = decl.parent;
                parent.walkDecls('position', positionDecl => {
                    if (positionDecl.value === 'absolute') {
                        hasAbsoluteWithPosition = true;
                    } else if (positionDecl.value === 'fixed') {
                        hasFixedWithPosition = true;
                    }
                });
            }
        });
        
        if (hasRelative && hasAbsolute && hasFixed && hasAbsoluteWithPosition && hasFixedWithPosition) {
            resultatToutesLesTypesDePositionnementUtilisée.innerText = 'positionnements avec les propriétés de nécessaires trouvés';
            resultatToutesLesTypesDePositionnementUtilisée.className = "valid";
        } else {
            resultatToutesLesTypesDePositionnementUtilisée.innerText = 'positionnements ou propriétés manquant';
            resultatToutesLesTypesDePositionnementUtilisée.className = "invalid";
        }

    }, resultatToutesLesTypesDePositionnementUtilisée);
}


async function verifier3NouvellesProprietes() {    
    traitement((root) => {
        const proprietesConnues = new Set(['padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 
                                           'margin', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
                                           'background', 'background-image', 'brackground-color', 'opacity',
                                           'font', 'font-size', 'font-familly', 'color', 'text-decoration', 'text-align',
                                            'width', 'height', 'border-radius', 'display', 'visibility', 
                                            'position', 'top', 'left', 'right', 'bottom', 'z-index', 'font-family',
                                            'min-width', 'max-width', 'min-height', 'max-height', 'box-sizing',
                                            'border','border-top','border-left', 'border-right', 'border-bottom',
                                            'overflow', 'overflow-x', 'overflow-y', 'transition', 'background-size', 'background-color', 'box-shadow',
                                            'cursor']);
        const nouvellesProprietes = new Set();
        
        root.walkDecls(decl => {
            if (!proprietesConnues.has(decl.prop)) {
                nouvellesProprietes.add(decl.prop);
            }
        });
        
        resultat3NouvellesProprietes.innerHTML = ''; // Clear previous results
        
        nouvellesProprietes.forEach(propriete => {
            const messageElement = document.createElement('div');
            messageElement.textContent = `nouvelle propriété trouvée : ${propriete}`;
            resultat3NouvellesProprietes.appendChild(messageElement);
        });
        
        resultat3NouvellesProprietes.className = nouvellesProprietes.size >= 3 ? 'valid' : 'invalid';

        if(nouvellesProprietes.size == 0) {
            resultat3NouvellesProprietes.innerText = "aucune nouvelle propriété trouvé"
        }
        
        
    }, resultat3NouvellesProprietes);
}


async function traitement(function1, resultatDiv) {
    const iframe = document.querySelector('#pageAccueil');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const link = Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).find(link => link.href.toLowerCase().includes('css/style'));

    if (!link) {
        resultatDiv.innerText = 'aucune feuille de style trouvée commençant par "css/"';
        resultatDiv.className = 'invalid';
        return;
    }

    try {
        const response = await axios.get(link.href);
        const cssText = response.data;
        const root = postcss.parse(cssText);
        function1(root, resultatDiv);

    } catch (error) {
        resultatDiv.innerText = 'erreur lors de la récupération de la feuille de style';
        resultatDiv.className = 'invalid';
        console.log(error);
    }
}


window.verifierTransitionCSS = verifierTransitionCSS;
window.verifierMediaQueries = verifierMediaQueries;
window.verifier5TypesSelecteur = verifier5TypesSelecteur;
window.verifierToutesLesTypesDePositionnementUtilisée = verifierToutesLesTypesDePositionnementUtilisée;
window.verifier3NouvellesProprietes = verifier3NouvellesProprietes;




function checkDoctype() {
    const iframes = document.querySelectorAll("iframe");
    let results = [];
    let valid = true;

    iframes.forEach(iframe => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc.doctype) {
            if (doc.doctype.name === 'html' && doc.doctype.publicId === '' && doc.doctype.systemId === '') {
                results.push(iframe.id + ' - DOCTYPE HTML5 trouvé');
            } else {
                results.push(iframe.id + ' - Aucun DOCTYPE HTML5 trouvé');
                valid = false;
            }
        } else {
            results.push(iframe.id + ' - Aucun DOCTYPE HTML5 trouvé');
            valid = false;
        }
    });
    document.getElementById('resultatcheckDoctype').innerText = results.join('\n');
    document.getElementById('resultatcheckDoctype').className = valid ? "valid" : "invalid";
}

async function validateIframeContent() {
    let results = [];
    let valid = true;
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
        try {
            const response = await axios.get(iframe.src);
            const htmlContent = response.data;
            const validationResult = await validateHTML(htmlContent);
            console.log(`Validation result for ${iframe.src}:`, validationResult);
            if (validationResult.messages.length > 0) {
                results.push(iframe.id + " - erreur détectée sur la page");
                let valid = false;
            } else {
                results.push(iframe.id + " - aucun erreur détecté");
            }
        } catch (error) {
            console.error(`Error fetching content from ${iframe.src}:`, error);
            results.push(iframe.id + " - impossible d'appeler le validateur pour le moment");
            valid = false;
        }
    }
    document.getElementById('resultatvalidateurW3C').innerText = results.join('\n');
    document.getElementById('resultatvalidateurW3C').className = valid ? "valid" : "invalid";

}

async function validateHTML(htmlContent) {
    const response = await axios.post('https://validator.w3.org/nu/?out=json', htmlContent, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    });
    return response.data;
}

function checkBodyOnlyHaveHeaderMainFooterAsChildren() {
    const iframes = document.querySelectorAll('iframe');
    let bodyStructureResults = [];
    let validBodyStructure = true;

    iframes.forEach(iframe => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const bodyChildren = Array.from(doc.body.children);
        const validTags = ['HEADER', 'MAIN', 'FOOTER', 'SCRIPT'];
        const invalidElements = bodyChildren.filter(child => !validTags.includes(child.tagName.toUpperCase()));
        const nbHeaderMainFotter = bodyChildren.filter(child => ['HEADER', 'MAIN', 'FOOTER'].includes(child.tagName.toUpperCase())).length;
        if (invalidElements.length === 0 && nbHeaderMainFotter == 3) {
            bodyStructureResults.push(`${iframe.id} - structure respectée`);
        } else {
            bodyStructureResults.push(`${iframe.id} - structure non-respectée`);
            validBodyStructure = false;
        }
    });

    document.getElementById('resultatTestStructureBody').innerText = bodyStructureResults.join('\n');
    document.getElementById('resultatTestStructureBody').className = validBodyStructure ? "valid" : "invalid";

}

function verifierTitleEtMeta() {
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatTestTitleAndMetaPresentOnEachPage');
    resultatDiv.innerHTML = ''; // Clear previous results
    let valid = true;

    iframes.forEach((iframe, index) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const pageIndex = `${iframe.id}`;
        let messages = [];

        // Vérifier la présence de la balise <title>
        const title = iframeDoc.querySelector('title');
        if (!title) {
            messages.push(`${pageIndex} - title manquant`);
            valid = false;
        }

        // Vérifier la présence de la balise <meta charset="...">
        const metaCharset = iframeDoc.querySelector('meta[charset]');
        if (!metaCharset) {
            messages.push(`${pageIndex} - meta pour le charset manquant`);
            valid = false;
        }

        // Ajouter les messages au div de résultat
        if (messages.length > 0) {
            resultatDiv.innerHTML += messages.join('<br>') + '<br>';
        }
    });

    if (valid) {
        resultatDiv.innerText = "title et meta présent";
    }

    resultatDiv.className = valid ? "valid" : "invalid";
}

function verifierElementsDeBase() {
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatAllBasicElementPresent');
    resultatDiv.innerHTML = ''; // Clear previous results

    const elementsRequis = ['IMG', 'UL', 'OL', 'A', 'P', 'H1', 'H2', 'DIV', 'SPAN'];
    const elementsTrouves = {
        'IMG': false,
        'UL': false,
        'OL': false,
        'A': false,
        'P': false,
        'H1': false,
        'H2': false,
        'DIV': false,
        'SPAN': false
    };

    iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        elementsRequis.forEach((element) => {
            if (iframeDoc.querySelector(element)) {
                elementsTrouves[element] = true;
            }
        });
    });

    // Si UL ou OL est trouvé, on considère que les deux sont trouvés
    if(elementsTrouves.UL || elementsTrouves.OL){
        elementsTrouves.UL = true;
        elementsTrouves.OL = true;
    }

    const elementsManquants = elementsRequis.filter(element => !elementsTrouves[element]);

    if (elementsManquants.length > 0) {
        elementsManquants.forEach(element => {
            resultatDiv.innerHTML += `manque l'élément ${element}<br>`;
        });
        resultatDiv.className = "invalid";
    } else {
        resultatDiv.innerHTML = 'tous les éléments requis sont présents.';
        resultatDiv.className = "valid";
    }
}

function verifierCSSetImages() {
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatFolderCSSandImagesUsed');
    resultatDiv.innerHTML = ''; // Clear previous results

    let cssUtilise = false;
    let imagesUtilisees = false;

    iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Vérifier la présence d'un lien contenant "css/" dans la source
        const links = iframeDoc.querySelectorAll('link[href*="css/"]');
        if (links.length > 0) {
            cssUtilise = true;
        }

        // Vérifier la présence d'une image contenant "images/" ou "image/" dans la source
        const images = iframeDoc.querySelectorAll('img[src*="images/"], img[src*="image/"], img[src*="Images/"], img[src*="Image/"]');
        if (images.length > 0) {
            imagesUtilisees = true;
        }
    });

    if (!cssUtilise) {
        resultatDiv.innerHTML += 'manque l\'utilisation d\'un dossier css<br>';
        resultatDiv.className = "invalid";
    }
    if (!imagesUtilisees) {
        resultatDiv.innerHTML += 'manque l\'utilisation d\'un dossier images<br>';
        resultatDiv.className = "invalid";
    }
    if (cssUtilise && imagesUtilisees) {
        resultatDiv.innerHTML = 'tous les éléments requis sont présents';
        resultatDiv.className = "valid";
    }
}

function verifierImagesLocales() {
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatAllImageLocal');
    resultatDiv.innerHTML = ''; // Clear previous results
    let valid = true;

    iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeId = iframe.id;
        const images = iframeDoc.querySelectorAll('img');

        images.forEach((image) => {
            const src = image.getAttribute('src');
            if (!src.toLowerCase().includes('images/') && !src.toLowerCase().includes('image/')) {
                resultatDiv.innerHTML += `${iframeId} - non-présent dans le dossier images : ${src}<br>`;
                valid = false;
            }
        });

        if (valid) {
            resultatDiv.innerHTML = "toutes les images respectent la contrainte"
            resultatDiv.className = "valid";
        } else {
            resultatDiv.className = "invalid";
        }
    });
}

function verifierNavEtLiens() {
    resultatNavEtLiens.innerText = "doit être vérifié manuellement";
    resultatNavEtLiens.className = "manuel";
    /*
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatNavEtLiens');
    resultatDiv.innerHTML = ''; // Clear previous results
    let valid = true;

    iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeId = iframe.id;
        const header = iframeDoc.querySelector('body > header');
        let navPresent = false;
        let liensManquants = [];

        if (header) {
            const nav = header.querySelector('nav');
            if (nav) {
                navPresent = true;
                const liens = nav.querySelectorAll('a');
                const liensRequis = ['Accueil.html', 'Recherche.html', 'Favoris.html'];
                liensRequis.forEach((lien) => {
                    if (![...liens].some(a => a.getAttribute('href') === lien)) {
                        liensManquants.push(lien);
                    }
                });
            }
        }

        if (!navPresent) {
            resultatDiv.innerHTML += `${iframeId} - nav manquant<br>`;
            valid = false;
        }
        liensManquants.forEach((lien) => {
            resultatDiv.innerHTML += `${iframeId} - lien manquant dans le Nav vers ${lien}<br>`;
            valid = false;
        });
    });


    resultatDiv.className = valid ? "valid" : "invalid";
    */
}

function verifierHeaderFooterIdentiques() {
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatHeaderFooterIdentique');
    resultatDiv.innerHTML = ''; // Clear previous results
    let valid = true;

    const headers = {};
    const footers = {};

    iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeId = iframe.id;
        const header = iframeDoc.querySelector('header');
        const footer = iframeDoc.querySelector('footer');

        if (header) {
            headers[iframeId] = header.innerHTML;
        }
        if (footer) {
            footers[iframeId] = footer.innerHTML;
        }
    });

    const iframeIds = Object.keys(headers);
    for (let i = 0; i < iframeIds.length; i++) {
        for (let j = i + 1; j < iframeIds.length; j++) {
            const id1 = iframeIds[i];
            const id2 = iframeIds[j];

            if (headers[id1] !== headers[id2]) {
                resultatDiv.innerHTML += `${id1} et ${id2} - header différent<br>`;
                valid = false;
            }
            if (footers[id1] !== footers[id2]) {
                resultatDiv.innerHTML += `${id1} et ${id2} - footer différent<br>`;
                valid = false;
            }
        }
    }

    if (valid) {
        resultatDiv.innerHTML = "tous les HEADER et FOOTER sont identiques"
    }

    resultatDiv.className = valid ? "valid" : "invalid";
}

function listerNouvellesBalises() {
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatNouvellesBalisesHTML');
    resultatDiv.innerHTML = ''; // Clear previous results

    const balisesAutorisees = [
        'div', 'span', 'header', 'main', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7',
        'img', 'i', 'meta', 'title', 'head', 'body', 'html', 'link', 'p', 'style', 'script', 'video', 'audio',
        'nav', 'ul', 'ol', 'li', 'br', 'form', 'label', 'input', 'select', 'option', 'button', 
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a'
    ];
    const nouvellesBalises = new Set();

    iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const allElements = iframeDoc.querySelectorAll('*');

        allElements.forEach((element) => {
            const tagName = element.tagName.toLowerCase();
            if (!balisesAutorisees.includes(tagName)) {
                nouvellesBalises.add(tagName);
            }
        });
    });

    if (nouvellesBalises.size > 0) {
        nouvellesBalises.forEach((balise) => {
            resultatDiv.innerHTML += `${balise}<br>`;
        });
    } else {
        resultatDiv.innerHTML = 'aucune nouvelle balise trouvée';
    }

    resultatDiv.className = nouvellesBalises.size >= 2 ? "valid" : "invalid";
}

function validateIframeBodyChildren() {
    const resultDiv = document.getElementById('resultatEnfantDirectDuBodySontConteneur');
    resultDiv.innerHTML = ''; // Clear previous results
    let valid = true;

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const bodyChildren = iframeDoc.body.children;

        for (let i = 0; i < bodyChildren.length; i++) {
            const child = bodyChildren[i];
            if (!child.classList.contains('container') && !child.classList.contains('container-fluid') && child.tagName != 'SCRIPT') {
                const message = `${iframe.id} : élément ${child.tagName} n'est pas un conteneur`;
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                resultDiv.appendChild(messageElement);
                valid = false;
            }
        }
    });
    if(valid) {
        const message = `les enfants directs du body sont des conteneurs`;
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement); 
    }
    resultDiv.className = valid ? "valid" : "invalid";

}


function validateBootstrapHierarchy() {
    const resultDiv = document.getElementById('resultatHierachieBootstrapRespecté');
    resultDiv.innerHTML = ''; // Clear previous results
    let valid = true;

    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const containers = iframeDoc.querySelectorAll('.container, .container-fluid');

        containers.forEach(container => {
            const containerChildren = Array.from(container.children);
            containerChildren.forEach(child => {
                if (!child.classList.contains('row')) {
                    const message = `${iframe.id} : la hiérarchie container > row > col non-respectée`;
                    if(!resultDiv.innerText.includes(message)) {
                        const messageElement = document.createElement('div');
                        messageElement.textContent = message;
                        resultDiv.appendChild(messageElement);
                    }
                    valid = false;
                    return;
                }

                const rowChildren = Array.from(child.children);
                const columnClasses = ['col', 'col-auto', ...Array.from({ length: 12 }, (_, i) => `col-${i + 1}`)];
                rowChildren.forEach(rowChild => {
                    if (!columnClasses.some(cls => rowChild.classList.contains(cls))) {
                        const message = `${iframe.id} : la hiérarchie container > row > col non-respectée`;
                        if(!resultDiv.innerText.includes(message)) {
                            const messageElement = document.createElement('div');
                            messageElement.textContent = message;
                            resultDiv.appendChild(messageElement);
                        }
                        valid = false;
                        return;
                    }
                });

                if (rowChildren.length == 0) {
                    const message = `${iframe.id} : container sans row trouvé`;
                    if(!resultDiv.innerText.includes(message)) {
                        const messageElement = document.createElement('div');
                        messageElement.textContent = message;
                        resultDiv.appendChild(messageElement);
                    }
                    valid = false;
                }
            });
        });

        if (containers.length == 0) {
            const message = `${iframe.id} : aucun conteneur trouvé`;
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            resultDiv.appendChild(messageElement);
            valid = false;
        }
    });

    if(valid) {
        const message = `hiérachie container > row > col respectée`;
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }
    resultDiv.className = valid ? "valid" : "invalid";
}

function checkContainerClassesUsage() {
    const resultDiv = document.getElementById('resultat2TypeContainerUtiliser');
    resultDiv.innerHTML = ''; // Clear previous results

    const iframes = document.querySelectorAll('iframe');
    let containerUsed = false;
    let containerFluidUsed = false;

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc.querySelector('.container')) {
            containerUsed = true;
        }
        if (iframeDoc.querySelector('.container-fluid')) {
            containerFluidUsed = true;
        }
    });

    console.log(containerUsed);
    if (!containerUsed) {
        const message = "la classe .container n'a pas été utilisée";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    console.log(containerFluidUsed);
    if (!containerFluidUsed) {
        const message = "la classe .container-fluid n'a pas été utilisée";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    if(containerFluidUsed && containerUsed) {
        const message = "les classes conteneurs ont été utilisées";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    resultDiv.className = containerUsed & containerFluidUsed ? "valid" : "invalid";
}

function checkColumnClassesUsage() {
    const resultDiv = document.getElementById('resultat3TypeColonneUtilisé');
    resultDiv.innerHTML = ''; // Clear previous results

    const iframes = document.querySelectorAll('iframe');
    let colUsed = false;
    let colAutoUsed = false;
    let colSizeUsed = false;

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc.querySelector('.col')) {
            colUsed = true;
        }
        if (iframeDoc.querySelector('.col-auto')) {
            colAutoUsed = true;
        }
        for (let i = 1; i <= 12; i++) {
            if (iframeDoc.querySelector(`.col-${i}`)) {
                colSizeUsed = true;
                break;
            }
        }
    });

    if (!colUsed) {
        const message = "aucune colonne .col utilisée";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    if (!colSizeUsed) {
        const message = "aucune colonne .col-1, .col-2 ..., .col-12 utilisée";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    if (!colAutoUsed) {
        const message = "aucune colonne .col-auto utilisée";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    if(colAutoUsed && colSizeUsed && colUsed) {
        const message = "les 3 types de colonnes ont été utilisées";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    resultDiv.className = colUsed & colSizeUsed & colAutoUsed ? "valid" : "invalid";

}

function checkNestedRows() {
    const resultDiv = document.getElementById('resultatRangéeImbriquée');
    resultDiv.innerHTML = ''; // Clear previous results

    const iframes = document.querySelectorAll('iframe');
    let nestedRowDetected = false;

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const columnClasses = ['col', 'col-auto', ...Array.from({ length: 12 }, (_, i) => `col-${i + 1}`)];

        columnClasses.forEach(colClass => {
            const columns = iframeDoc.querySelectorAll(`.${colClass}`);
            columns.forEach(column => {
                const row = column.querySelector('.row');
                if (row) {
                    const rowChildren = Array.from(row.children);
                    if (rowChildren.some(child => columnClasses.some(cls => child.classList.contains(cls)))) {
                        nestedRowDetected = true;
                    }
                }
            });
        });
    });

    if (!nestedRowDetected) {
        const message = "aucune rangée imbriquée détectée";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    } else {
        const message = "rangée imbriquée détectée";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
    }

    resultDiv.className = nestedRowDetected ? "valid" : "invalid";
}

function checkResponsiveImages() {
    const resultDiv = document.getElementById('resultatImageResponsive');
    resultDiv.innerHTML = ''; // Clear previous results
    let valid = true;

    const iframes = document.querySelectorAll('iframe');

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const images = iframeDoc.querySelectorAll('img.img-fluid');

        if (images.length == 0) {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${iframe.id} : aucune image fluid trouvée`;
            resultDiv.appendChild(messageElement);
            valid = false
        } else {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${iframe.id} : images fluid trouvées`;
            resultDiv.appendChild(messageElement);
            valid = true
        }
    });

    resultDiv.className = valid ? "valid" : "invalid";
}

function checkSizeChangeXsToMd() {
    const resultDiv = document.getElementById('resultatChangementTailleXsVersMd');
    resultDiv.innerHTML = ''; // Clear previous results

    const iframes = document.querySelectorAll('iframe');
    let sizeChangeDetected = false;

    const colMdClasses = ['col-md', 'col-md-auto', ...Array.from({ length: 12 }, (_, i) => `col-md-${i + 1}`)];

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        colMdClasses.forEach(colClass => {
            const elements = iframeDoc.querySelectorAll(`.${colClass}`);
            if (elements.length > 0) {
                sizeChangeDetected = true;
            }
        });
    });

    if (!sizeChangeDetected) {
        const message = "aucun changement de taille entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "invalid";
    } else {
        const message = "changement de taille entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "valid";
    }
}

function checkTextAlignmentChangeXsToMd() {
    const resultDiv = document.getElementById('resultatChangementAlignementTexetXsVersMd');
    resultDiv.innerHTML = ''; // Clear previous results

    const iframes = document.querySelectorAll('iframe');
    let alignmentChangeDetected = false;

    const textAlignMdClasses = ['text-md-left', 'text-md-center', 'text-md-right', 'text-md-start', 'text-md-end'];

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        textAlignMdClasses.forEach(textClass => {
            const elements = iframeDoc.querySelectorAll(`.${textClass}`);
            if (elements.length > 0) {
                alignmentChangeDetected = true;
            }
        });
    });

    if (!alignmentChangeDetected) {
        const message = "aucun changement d'alignement entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "invalid";
    } else {
        const message = "changement d'alignement entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "valid";
    }
}

function checkOrderChangeXsToMd() {
    const resultDiv = document.getElementById('resultatChangementOrdreXsVersMd');
    resultDiv.innerHTML = ''; // Clear previous results

    const iframes = document.querySelectorAll('iframe');
    let orderChangeDetected = false;

    const orderMdClasses = ['order-md-first', 'order-md-last', ...Array.from({ length: 6 }, (_, i) => `order-md-${i}`)];

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        orderMdClasses.forEach(colClass => {
            const elements = iframeDoc.querySelectorAll(`.${colClass}`);
            if (elements.length > 0) {
                orderChangeDetected = true;
            }
        });
    });

    if (!orderChangeDetected) {
        const message = "aucun changement d'ordre entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "invalid";
    } else {
        const message = "changement d'ordre entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "valid";
    }
}

function checkVisibilityChangeXsToMd() {
    const resultDiv = document.getElementById('resultatChangementVisibilitéXsVersMd');
    resultDiv.innerHTML = ''; // Clear previous results

    const iframes = document.querySelectorAll('iframe');
    let visibilityChangeDetected = false;

    const visibilityMdClasses = ['d-md-none', 'd-md-flex', 'd-md-block', 'd-md-inline', 'd-md-flex', 'd-md-grid', 'd-md-none'];

    iframes.forEach(iframe => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        visibilityMdClasses.forEach(colClass => {
            const elements = iframeDoc.querySelectorAll(`.${colClass}`);
            if(elements.length > 0)
            {
                visibilityChangeDetected = true;
            }
        });
    });

    if (!visibilityChangeDetected) {
        const message = "aucun changement de visibilité entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "invalid";
    } else {
        const message = "changement de visibilité entre xs et md détecté";
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        resultDiv.appendChild(messageElement);
        resultDiv.className = "valid";
    }
}

function verifierBootstrapLinkPresent() {
    const iframes = document.querySelectorAll('iframe');
    const resultatDiv = document.getElementById('resultatBibliothequeBootstrapPresent');
    resultatDiv.innerHTML = ''; // Clear previous result;
    let bootstrapUtilisé = true;

    iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Vérifier la présence d'un lien contenant "bootstrap" dans la source
        const links = iframeDoc.querySelectorAll('link[href*="bootstrap"]');
        if (links.length == 0) {
            bootstrapUtilisé = true;
            const message = `${iframe.id} : aucun link vers Bootstrap identifié`;
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            resultatDiv.appendChild(messageElement);
            bootstrapUtilisé = false
        } else {
            const message = `${iframe.id} : link vers Bootstrap identifié`;
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            resultatDiv.appendChild(messageElement);
        }
    });

    resultatDiv.className = bootstrapUtilisé ? "valid" : "invalid";

}


function verifierStyles() {
    const iframes = document.querySelectorAll('iframe');
    let results = [];

    iframes.forEach(iframe => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const iframeId = iframe.id;

        // Vérifier les styles inline
        const elementsWithInlineStyles = doc.querySelectorAll('[style]');
        if (elementsWithInlineStyles.length > 0) {
            results.push(`${iframeId} : style inline détecté sur un ou plusieurs éléments`);
        }

        // Vérifier les balises <style>
        const styleTags = doc.querySelectorAll('style');
        if (styleTags.length > 0) {
            results.push(`${iframeId} : style sous forme de balise <style> détecté`);
        }
    });

    // Afficher les résultats
    if (results.length > 0) {
        resultatStylePresentUnSeulFichierCSS.innerText = results.join('\n');
        resultatStylePresentUnSeulFichierCSS.className = 'invalid';
    } else {
        resultatStylePresentUnSeulFichierCSS.innerText = 'aucun style inline ou balise <style> détecté';
        resultatStylePresentUnSeulFichierCSS.className = 'valid';
    }
}

function checkFontAwesomeInIframes() {
    const iframes = document.querySelectorAll('iframe');
    resultatInclureBibliothequeFontawesome.innerText = "";
    let fontAwesomeFoundGlobal = true;

    iframes.forEach((iframe) => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const linkElements = iframeDocument.querySelectorAll('link');
        let fontAwesomeFound = false;

        linkElements.forEach((link) => {
            if (link.href.includes('fontawesome') || link.href.includes('font-awesome')) {
                fontAwesomeFound = true;
            }
        });

        if (!fontAwesomeFound) {
            fontAwesomeFoundGlobal = false;
            resultatInclureBibliothequeFontawesome.innerHTML += `${iframe.id} : bibliothèque fontawesome manquant<br>`;
        }
    });

    if(fontAwesomeFoundGlobal) {
        resultatInclureBibliothequeFontawesome.innerText = "FontAwesome trouvé dans tous les iframes";
    }
    resultatInclureBibliothequeFontawesome.className = fontAwesomeFoundGlobal ? "valid" : "invalid";
}


function countFontAwesomeIconsInIframes() {
    const iframes = document.querySelectorAll('iframe');
    let uniqueImages = new Set();

    iframes.forEach((iframe) => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const icons = iframeDocument.querySelectorAll('i[class*="fa-"], span[class*="fa-"]');
        icons.forEach((icon) => uniqueImages.add(icon.className));
    });

    let totalIcons = uniqueImages.size;
    resultat4IconesFontawesome.innerText = `${totalIcons} icones fontawesome détectées`;
    resultat4IconesFontawesome.className = totalIcons >= 4 ? "valid" : "invalid";
}

function calculresultatAccueil1() {
    resultatAccueil1.className = "manuel";
    resultatAccueil1.innerText = "doit être validé manuellement";
}
function calculresultatAccueil2() {
    resultatAccueil2.className = "manuel";
    resultatAccueil2.innerText = "doit être validé manuellement";
}
function calculresultatAccueil3() {
    resultatAccueil3.className = "manuel";
    resultatAccueil3.innerText = "doit être validé manuellement";
}
function calculresultatAccueil4() {
    resultatAccueil4.className = "manuel";
    resultatAccueil4.innerText = "doit être validé manuellement";
}
function calculresultatAccueil5() {
    resultatAccueil5.className = "manuel";
    resultatAccueil5.innerText = "doit être validé manuellement";
}
function calculresultatRecherche1() {
    resultatRecherche1.className = "manuel";
    resultatRecherche1.innerText = "doit être validé manuellement";
}
function calculresultatRecherche2() {
    resultatRecherche2.className = "manuel";
    resultatRecherche2.innerText = "doit être validé manuellement";
}
function calculresultatRecherche3() {
    resultatRecherche3.className = "manuel";
    resultatRecherche3.innerText = "doit être validé manuellement";
}
function calculresultatRecherche4() {
    resultatRecherche4.className = "manuel";
    resultatRecherche4.innerText = "doit être validé manuellement";
}
function calculresultatRecherche5() {
    resultatRecherche5.className = "manuel";
    resultatRecherche5.innerText = "doit être validé manuellement";
}
function calculresultatRecherche6() {
    verifierFormulairePageRecherche();
    /*resultatRecherche6.className = "manuel";
    resultatRecherche6.innerText = "doit être validé manuellement";*/
}
function calculresultatRecherche7() {
    resultatRecherche7.className = "manuel";
    resultatRecherche7.innerText = "doit être validé manuellement";
}
function calculresultatRecherche8() {
    resultatRecherche8.className = "manuel";
    resultatRecherche8.innerText = "doit être validé manuellement";
}
function calculresultatRecherche9() {
    resultatRecherche9.className = "manuel";
    resultatRecherche9.innerText = "doit être validé manuellement";
}
function calculresultatRecherche10() {
    resultatRecherche10.className = "manuel";
    resultatRecherche10.innerText = "doit être validé manuellement";
}
function calculresultatRecherche11() {
    /*resultatRecherche11.className = "manuel";
    resultatRecherche11.innerText = "doit être validé manuellement";*/
}
function calculresultatRecherche12() {
    /*resultatRecherche12.className = "manuel";
    resultatRecherche12.innerText = "doit être validé manuellement";*/
}
function calculresultatRecherche13() {
    /*resultatRecherche13.className = "manuel";
    resultatRecherche13.innerText = "doit être validé manuellement";*/
}

function verifierFormulairePageRecherche() {
    const iframe = document.querySelector('#pageRecherche');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const formulaire = doc.querySelector('form');
    
    if (formulaire) {
        document.getElementById('resultatRecherche6').innerText = 'Formulaire trouvé';
        document.getElementById('resultatRecherche6').className = 'valid';

        const boutonSoumettre = formulaire.querySelector('button[type="submit"], input[type="submit"]');
        if (boutonSoumettre) {
            document.getElementById('resultatRecherche12').innerText = 'Bouton soumettre trouvé';
            document.getElementById('resultatRecherche12').className = 'valid';
        } else {
            document.getElementById('resultatRecherche12').innerText = 'Bouton soumettre non trouvé';
            document.getElementById('resultatRecherche12').className = 'invalid';
        }

        const boutonReinitialiser = formulaire.querySelector('button[type="reset"], input[type="reset"]');
        if (boutonReinitialiser) {
            document.getElementById('resultatRecherche11').innerText = 'Bouton réinitialisé trouvé';
            document.getElementById('resultatRecherche11').className = 'valid';
        } else {
            document.getElementById('resultatRecherche11').innerText = 'Bouton réinitialisé non trouvé';
            document.getElementById('resultatRecherche11').className = 'invalid';
        }

        const inputs = formulaire.querySelectorAll('input, select');
        let allInputsHaveName = true;
        inputs.forEach(input => {
            if (!input.hasAttribute('name')) {
                allInputsHaveName = false;
            }
        });

        if (formulaire.method.toLowerCase() === 'post' && formulaire.action === 'https://www.w3schools.com/action_page.php' && allInputsHaveName) {
            document.getElementById('resultatRecherche13').innerText = 'Formulaire envoie par POST à la bonne URL et tous les champs ont des attributs name';
            document.getElementById('resultatRecherche13').className = 'valid';
        } else {
            document.getElementById('resultatRecherche13').innerText = 'Formulaire n\'envoie pas par POST à la bonne URL ou tous les champs n\'ont pas des attributs name';
            document.getElementById('resultatRecherche13').className = 'invalid';
        }
    } else {
        document.getElementById('resultatRecherche6').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatRecherche6').className = 'invalid';
        document.getElementById('resultatRecherche12').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatRecherche12').className = 'invalid';
        document.getElementById('resultatRecherche11').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatRecherche11').className = 'invalid';
        document.getElementById('resultatRecherche13').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatRecherche13').className = 'invalid';
    }
}



function calculresultatDetail1() {
    resultatDetail1.className = "manuel";
    resultatDetail1.innerText = "doit être validé manuellement";
}
function calculresultatDetail2() {
    resultatDetail2.className = "manuel";
    resultatDetail2.innerText = "doit être validé manuellement";
}
function calculresultatDetail3() {
    resultatDetail3.className = "manuel";
    resultatDetail3.innerText = "doit être validé manuellement";
}
function calculresultatDetail4() {
    verifierFormulairePageDetail();
    /*resultatDetail4.className = "manuel";
    resultatDetail4.innerText = "doit être validé manuellement";*/
}
function calculresultatDetail5() {
    /*resultatDetail5.className = "manuel";
    resultatDetail5.innerText = "doit être validé manuellement";*/
}
function calculresultatDetail6() {
    /*resultatDetail6.className = "manuel";
    resultatDetail6.innerText = "doit être validé manuellement";*/
}
function calculresultatDetail7() {
    /*resultatDetail7.className = "manuel";
    resultatDetail7.innerText = "doit être validé manuellement";*/
}

function verifierFormulairePageDetail() {
    const iframe = document.querySelector('#pageDetail');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const formulaire = doc.querySelector('form');
    
    if (formulaire) {
        document.getElementById('resultatDetail4').innerText = 'Formulaire trouvé';
        document.getElementById('resultatDetail4').className = 'valid';

        const champHidden = formulaire.querySelector('input[type="hidden"][name="nom"]');
        if (champHidden && champHidden.value.trim() !== '') {
            document.getElementById('resultatDetail5').innerText = 'Champs hidden trouvé';
            document.getElementById('resultatDetail5').className = 'valid';
        } else {
            document.getElementById('resultatDetail5').innerText = 'Champs hidden non trouvé';
            document.getElementById('resultatDetail5').className = 'invalid';
        }

        const boutonSoumettre = formulaire.querySelector('button[type="submit"], input[type="submit"]');
        if (boutonSoumettre) {
            document.getElementById('resultatDetail6').innerText = 'Bouton soumettre trouvé';
            document.getElementById('resultatDetail6').className = 'valid';
        } else {
            document.getElementById('resultatDetail6').innerText = 'Bouton soumettre non trouvé';
            document.getElementById('resultatDetail6').className = 'invalid';
        }

        if (formulaire.method.toLowerCase() === 'post' && formulaire.action === 'https://www.w3schools.com/action_page.php') {
            document.getElementById('resultatDetail7').innerText = 'Formulaire envoie par POST à la bonne URL';
            document.getElementById('resultatDetail7').className = 'valid';
        } else {
            document.getElementById('resultatDetail7').innerText = 'Formulaire n\'envoie pas par POST à la bonne URL';
            document.getElementById('resultatDetail7').className = 'invalid';
        }
    } else {
        document.getElementById('resultatDetail4').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatDetail4').className = 'invalid';
        document.getElementById('resultatDetail5').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatDetail5').className = 'invalid';
        document.getElementById('resultatDetail6').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatDetail6').className = 'invalid';
        document.getElementById('resultatDetail7').innerText = 'Formulaire non trouvé';
        document.getElementById('resultatDetail7').className = 'invalid';
    }
}




function calculresultatFavoris1() {
    resultatFavoris1.className = "manuel";
    resultatFavoris1.innerText = "doit être validé manuellement";
}
function calculresultatFavoris2() {
    resultatFavoris2.className = "manuel";
    resultatFavoris2.innerText = "doit être validé manuellement";
}
function calculresultatFavoris3() {
    resultatFavoris3.className = "manuel";
    resultatFavoris3.innerText = "doit être validé manuellement";
}
function calculresultatFavoris4() {
    resultatFavoris4.className = "manuel";
    resultatFavoris4.innerText = "doit être validé manuellement";
}
function calculresultatFavoris5() {
    resultatFavoris5.className = "manuel";
    resultatFavoris5.innerText = "doit être validé manuellement";
}
function calculresultatFavoris6() {
    resultatFavoris6.className = "manuel";
    resultatFavoris6.innerText = "doit être validé manuellement";
}
function calculresultatFavoris7() {
    resultatFavoris7.className = "manuel";
    resultatFavoris7.innerText = "doit être validé manuellement";
}
function calculresultatFavoris8() {
    resultatFavoris8.className = "manuel";
    resultatFavoris8.innerText = "doit être validé manuellement";
}
function calculresultatFavoris9() {
    verifierFormulairesPageFavoris();/*
    resultatFavoris9.className = "manuel";
    resultatFavoris9.innerText = "doit être validé manuellement";*/
}
function calculresultatFavoris10() {/*
    resultatFavoris10.className = "manuel";
    resultatFavoris10.innerText = "doit être validé manuellement";*/
}
function calculresultatFavoris11() {/*
    resultatFavoris11.className = "manuel";
    resultatFavoris11.innerText = "doit être validé manuellement";*/
}
function calculresultatFavoris12() {/*
    resultatFavoris12.className = "manuel";
    resultatFavoris12.innerText = "doit être validé manuellement";*/
}
function calculresultatFavoris13() {/*
    resultatFavoris13.className = "manuel";
    resultatFavoris13.innerText = "doit être validé manuellement";*/
}

function verifierFormulairesPageFavoris() {
    const iframe = document.querySelector('#pageFavoris');
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    const trs = doc.querySelectorAll('tr');
    const formulaires = doc.querySelectorAll('form');
    
    if (formulaires.length === trs.length - 1) {
        document.getElementById('resultatFavoris9').innerText = 'Formulaires présents';
        document.getElementById('resultatFavoris9').className = 'valid';
    } else {
        document.getElementById('resultatFavoris9').innerText = 'le nombre de formulaire doit être == nbr de TR - 1 du TABLE';
        document.getElementById('resultatFavoris9').className = 'invalid';
    }

    if (formulaires.length > 0) {
        const premierFormulaire = formulaires[0];

        const champHidden = premierFormulaire.querySelector('input[type="hidden"][name="nom"]');
        if (champHidden && champHidden.value.trim() !== '') {
            document.getElementById('resultatFavoris11').innerText = 'champ hidden trouvé et bien configuré';
            document.getElementById('resultatFavoris11').className = 'valid';
        } else {
            document.getElementById('resultatFavoris11').innerText = 'champ hidden non trouvé ou mal configuré';
            document.getElementById('resultatFavoris11').className = 'invalid';
        }

        const boutonSoumettre = premierFormulaire.querySelector('button[type="submit"], input[type="submit"]');
        if (boutonSoumettre) {
            document.getElementById('resultatFavoris12').innerText = 'bouton soumettre trouvé';
            document.getElementById('resultatFavoris12').className = 'valid';
        } else {
            document.getElementById('resultatFavoris12').innerText = 'bouton soumettre non trouvé';
            document.getElementById('resultatFavoris12').className = 'invalid';
        }

        if (premierFormulaire.method.toLowerCase() === 'post' && premierFormulaire.action === 'https://www.w3schools.com/action_page.php') {
            document.getElementById('resultatFavoris13').innerText = 'formulaire bien configuré';
            document.getElementById('resultatFavoris13').className = 'valid';
        } else {
            document.getElementById('resultatFavoris13').innerText = 'formulaire mal-configuré';
            document.getElementById('resultatFavoris13').className = 'invalid';
        }
    } else {
        document.getElementById('resultatFavoris11').innerText = 'nb formulaire invalide';
        document.getElementById('resultatFavoris11').className = 'invalid';
        document.getElementById('resultatFavoris12').innerText = 'nb formulaire invalide';
        document.getElementById('resultatFavoris12').className = 'invalid';
        document.getElementById('resultatFavoris13').innerText = 'nb formulaire invalide';
        document.getElementById('resultatFavoris13').className = 'invalid';
    }
}

window.onload = () => {
    checkDoctype();
    //validateIframeContent();
    checkBodyOnlyHaveHeaderMainFooterAsChildren();
    verifierTitleEtMeta();
    verifierElementsDeBase();
    verifierCSSetImages();
    verifierImagesLocales();
    verifierNavEtLiens();
    verifierHeaderFooterIdentiques();
    listerNouvellesBalises();
    validateIframeBodyChildren();
    validateBootstrapHierarchy();
    checkContainerClassesUsage();
    checkColumnClassesUsage();
    checkNestedRows();
    checkResponsiveImages();
    checkSizeChangeXsToMd();
    checkTextAlignmentChangeXsToMd();
    checkOrderChangeXsToMd();
    checkVisibilityChangeXsToMd();
    verifierBootstrapLinkPresent();
    verifierStyles();
    window.verifierTransitionCSS();
    window.verifierMediaQueries();
    window.verifier5TypesSelecteur();
    window.verifierToutesLesTypesDePositionnementUtilisée();
    window.verifier3NouvellesProprietes();
    checkFontAwesomeInIframes();
    countFontAwesomeIconsInIframes();
    calculresultatAccueil1();
    calculresultatAccueil2();
    calculresultatAccueil3();
    calculresultatAccueil4();
    calculresultatAccueil5();
    calculresultatRecherche1();
    calculresultatRecherche2();
    calculresultatRecherche3();
    calculresultatRecherche4();
    calculresultatRecherche5();
    calculresultatRecherche6();
    calculresultatRecherche7();
    calculresultatRecherche8();
    calculresultatRecherche9();
    calculresultatRecherche10();
    calculresultatRecherche11();
    calculresultatRecherche12();
    calculresultatRecherche13();
    calculresultatDetail1();
    calculresultatDetail2();
    calculresultatDetail3();
    calculresultatDetail4();
    calculresultatDetail5();
    calculresultatDetail6();
    calculresultatDetail7();
    calculresultatFavoris1();
    calculresultatFavoris2();
    calculresultatFavoris3();
    calculresultatFavoris4();
    calculresultatFavoris5();
    calculresultatFavoris6();
    calculresultatFavoris7();
    calculresultatFavoris8();
    calculresultatFavoris9();
    calculresultatFavoris10();
    calculresultatFavoris11();
    calculresultatFavoris12();
    calculresultatFavoris13();
    version.innerText = "Version 1.4";
    dateheureversion.innerText = "2025-02-26 13H16";
}
