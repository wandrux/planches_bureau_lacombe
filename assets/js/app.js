(function(){
  const money = (n) => new Intl.NumberFormat('fr-FR', {style:'currency', currency:'EUR'}).format(n);
  const qs = (s, r=document) => r.querySelector(s);
  const getYear = () => { const y = qs('#year'); if (y) y.textContent = new Date().getFullYear(); };
  getYear();

  const DATA_URL = 'assets/data/products.json';

  // Parse URL params
  const params = new URLSearchParams(location.search);
  const catFromUrl = params.get('cat') || '';

  async function loadProducts(){
    const res = await fetch(DATA_URL, {cache:'no-store'});
    if (!res.ok) throw new Error('Impossible de charger les produits');
    return await res.json();
  }

  function productImage(p){
    return p.image || `https://placehold.co/800x600?text=${encodeURIComponent(p.name)}`;
  }

  function el(tag, props={}, children=[]){
    const e = document.createElement(tag);
    for (const [k,v] of Object.entries(props)){
      if (k === 'text') e.textContent = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'class') e.className = v;
      else e.setAttribute(k, v);
    }
    for (const c of [].concat(children)) if (c) e.appendChild(c);
    return e;
  }

  function renderCard(p){
    const card = el('article', {class:'product-card'});
    const link = el('a', {href:`product.html?id=${encodeURIComponent(p.id)}`});
    const img = el('img', {class:'product-thumb', src:productImage(p), alt:p.name});
    link.appendChild(img);

    const body = el('div', {class:'product-body'});
    const title = el('h3', {text:p.name});
    const meta = el('div', {class:'product-meta'});
    const price = el('div', {class:'price', text: money(p.price)});
    const more = el('a', {href:`product.html?id=${encodeURIComponent(p.id)}`}, [document.createTextNode('Voir →')]);
    meta.append(price, more);

    const actions = el('div', {class:'card-actions'});
    const add = el('button', {class:'btn btn-primary add-btn', disabled:'', title:'Bientôt disponible'}, [document.createTextNode('Ajouter au panier')]);
    actions.append(add);

    body.append(title, meta, actions);
    card.append(link, body);
    return card;
  }

  async function renderFeatured(){
    const cont = qs('#featured-grid');
    if (!cont) return;
    try{
      const prods = await loadProducts();
      const featured = prods.filter(p => p.featured).slice(0, 6);
      featured.forEach(p => cont.appendChild(renderCard(p)));
    }catch(err){
      cont.innerHTML = '<div class="empty-state">Produits en cours de chargement…</div>';
      console.error(err);
    }
  }

  function applyFilters(list){
    const searchInput = qs('#search');
    const categorySel = qs('#category');
    const sortSel = qs('#sort');

    const q = (searchInput?.value || '').toLowerCase().trim();
    const cat = (categorySel?.value || '').trim();
    const sort = (sortSel?.value || 'popularity');

    let out = list.filter(p => {
      const inCat = !cat || p.category === cat;
      const inQ = !q || [p.name, p.description, (p.tags||[]).join(' '), p.wood, p.category].join(' ').toLowerCase().includes(q);
      return inCat && inQ;
    });

    switch(sort){
      case 'price-asc': out = out.sort((a,b) => a.price - b.price); break;
      case 'price-desc': out = out.sort((a,b) => b.price - a.price); break;
      case 'name': out = out.sort((a,b) => a.name.localeCompare(b.name)); break;
      default: out = out.sort((a,b) => (b.popularity||0) - (a.popularity||0));
    }
    return out;
  }

  async function renderProducts(){
    const grid = qs('#products-grid');
    if (!grid) return;

    const empty = qs('#products-empty');
    const searchInput = qs('#search');
    const categorySel = qs('#category');
    const sortSel = qs('#sort');

    try{
      const products = await loadProducts();

      if (categorySel && catFromUrl) categorySel.value = catFromUrl;

      const update = () => {
        grid.innerHTML = '';
        const filtered = applyFilters(products);
        if (filtered.length === 0){
          empty?.removeAttribute('hidden');
        } else {
          empty?.setAttribute('hidden', 'hidden');
          filtered.forEach(p => grid.appendChild(renderCard(p)));
        }
      };

      searchInput?.addEventListener('input', update);
      categorySel?.addEventListener('change', update);
      sortSel?.addEventListener('change', update);

      update();
    }catch(err){
      grid.innerHTML = '<div class="empty-state">Erreur de chargement des produits.</div>';
      console.error(err);
    }
  }

  async function renderProductDetail(){
    const cont = qs('#product-detail');
    if (!cont) return;

    const id = new URLSearchParams(location.search).get('id');
    if (!id){
      cont.innerHTML = '<div class="empty-state">Produit introuvable.</div>';
      return;
    }
    try{
      const products = await loadProducts();
      const p = products.find(x => String(x.id) === String(id));
      if (!p){
        cont.innerHTML = '<div class="empty-state">Produit introuvable.</div>';
        return;
      }

      const left = el('div', {class:'big-img'}, [
        el('img', {src: productImage(p), alt: p.name})
      ]);

      const right = el('div', {class:'side'});
      right.append(
        el('h1', {text:p.name}),
        el('div', {class:'price', text: money(p.price)}),
        el('p', {class:'specs', text: p.shortDesc || ''}),
        el('p', {text: p.description || ''})
      );

      const form = el('div', {class:'add-form'});
      if (p.variants && p.variants.length){
        const label = el('label', {for:'variant', text:'Variante'});
        const sel = el('select', {id:'variant', name:'variant'});
        p.variants.forEach(v => sel.appendChild(el('option', {value:v, text:v})));
        form.append(label, sel);
      }
      const l1 = el('label', {for:'grav1', text:'Gravure - Ligne 1'});
      const grav1 = el('input', {id:'grav1', type:'text', placeholder:'Ex: Famille Martin'});
      const l2 = el('label', {for:'grav2', text:'Gravure - Ligne 2'});
      const grav2 = el('input', {id:'grav2', type:'text', placeholder:'Ex: 2025'});

      const lq = el('label', {for:'qty', text:'Quantité'});
      const qty = el('input', {id:'qty', type:'number', min:'1', value:'1'});

      const btn = el('button', {class:'btn btn-primary', disabled:'', title:'Le panier sera disponible prochainement'}, [document.createTextNode('Ajouter au panier')]);

      form.append(l1, grav1, l2, grav2, lq, qty, el('div', {style:'height:.6rem'}), btn);
      right.append(form);

      cont.append(left, right);
    }catch(err){
      cont.innerHTML = '<div class="empty-state">Erreur de chargement du produit.</div>';
      console.error(err);
    }
  }

  // Kickoff
  renderFeatured();
  renderProducts();
  renderProductDetail();
})();