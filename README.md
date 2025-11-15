# Atelier Bois Gravé – Mise en page (sans e‑commerce)

Cette version fournit la structure et le design du site (HTML/CSS/JS) sans panier ni paiement. Les boutons “Ajouter au panier” sont présents mais désactivés. Idéal pour valider l’identité visuelle et le contenu.

## Contenu
- Pages: `index.html`, `products.html`, `product.html`, `about.html`, `contact.html`, `faq.html`
- Styles: `assets/css/styles.css`
- JS: `assets/js/app.js` (rend la liste produits et les pages détail à partir de `assets/data/products.json`)
- Données d’exemple: `assets/data/products.json`

## Visualiser en local
Pour charger le JSON, servez les fichiers via un serveur statique:
```bash
# Python 3
python -m http.server 5173

# ou Node
npx serve .
```
Puis ouvrez http://localhost:5173

## Étapes suivantes (quand vous serez prêt)
- Brancher Snipcart: ajouter le snippet `<div id="snipcart" ...>` et les attributs data sur les boutons
- Activer le formulaire de contact (Formspree) en remplaçant `action="#"` par votre URL
- Déployer sur GitHub Pages

Souhaitez-vous que je prépare une branche “ecommerce” avec Snipcart déjà câblé pour activer le panier plus tard ?