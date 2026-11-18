(function(){
  'use strict';const H=window.ODY.escape;
  const covers = {
    'fundamentos-nutricion': 'nutricion-fundamentos',
    'organizacion-semanal': 'nutricion-organizacion',
    'macronutrientes': 'nutricion-fundamentos',
    'progresion-con-control': 'progresion-control',
    'suplementacion-responsable': 'suplementacion-criterio'
  };
  const library=document.querySelector('#ody-resource-library');
  if(library){const area=library.dataset.area,rows=area==='nutrition'?window.ODY_NUTRITION:window.ODY_RESOURCES;
    const categories=[...new Set(rows.map(r=>r.category))];
    const filter=document.querySelector('#ody-resource-category');filter.innerHTML='<option value="all">Todas las categorías</option>'+categories.map(c=>`<option value="${H(c)}">${H(c)}</option>`).join('');
    function render(){const visible=rows.filter(r=>filter.value==='all'||r.category===filter.value);library.innerHTML=visible.map(r=>`<article class="ody-program-card">${window.ODY.editorialImage(covers[r.id])}<span class="ody-kicker">${H(r.category)}</span><h2>${H(r.title)}</h2><p>${H(r.objective)}</p><a class="ody-btn primary" href="${window.ODY.url("pages/odyssey/recurso.html")}?area=${area}&id=${encodeURIComponent(r.id)}">Leer recurso completo ↗</a></article>`).join('');document.querySelector('#ody-resource-status').textContent=`${visible.length} recursos gratuitos.`;}filter.addEventListener('change',render);render();}
  const detail=document.querySelector('#ody-resource-detail');if(!detail)return;
  const params=new URLSearchParams(location.search),area=params.get('area'),rows=area==='nutrition'?window.ODY_NUTRITION:area==='academy'?window.ODY_RESOURCES:[],r=rows.find(r=>r.id===params.get('id'));
  if(!r){detail.innerHTML='<h1>Recurso no encontrado</h1><p>Revisa el enlace o vuelve a las bibliotecas.</p><a class="ody-btn primary" href="' + window.ODY.url('pages/odyssey/nutricion.html') + '">Nutrición</a> <a class="ody-btn secondary" href="' + window.ODY.url('pages/odyssey/academy.html') + '">Academy</a>';return;}
  document.title=r.title+' | GRIEGOS ODYSSEY';
  detail.innerHTML=`<header class="ody-article-head"><span class="ody-kicker">${H(r.category)} · GRATUITO</span><h1>${H(r.title)}</h1><p class="ody-lead">${H(r.objective)}</p><p>${H(r.intro)}</p>${window.ODY.editorialImage(covers[r.id], "ody-article-cover", true)}<p>Revisión editorial: ${H(r.reviewed)}. No implica revisión clínica individual.</p><div class="ody-article-actions"><button class="ody-btn primary" type="button" data-print>Imprimir / Guardar como PDF</button> <a class="ody-btn secondary" href="${window.ODY.url(area==='nutrition'?'academy/nutrition/index.html':'academy/recursos/index.html')}">Volver a la biblioteca</a></div></header>${r.sections.map(s=>`<section class="ody-article-section"><h2>${H(s.heading)}</h2>${(s.paragraphs||[]).map(text=>`<p>${H(text)}</p>`).join('')}${s.bullets?`<ul>${s.bullets.map(text=>`<li>${H(text)}</li>`).join('')}</ul>`:''}</section>`).join('')}<section class="ody-article-section"><h2>Límites de este recurso</h2><p>${H(r.limitations)}</p><h2>Fuentes</h2>${window.ODY.references(r.references)}</section>${r.store?`<aside class="ody-shop-note"><span class="ody-kicker">ENLACE COMERCIAL OPCIONAL</span><h2>Explorar productos relacionados</h2><p>La biblioteca es gratuita. Este enlace lleva al inventario real de Store; no recomienda productos individuales ni afirma que necesites suplementos.</p><a class="ody-btn secondary" href="${window.ODY.url("store/index.html")}?category=${r.store.category}&subcategory=${r.store.subcategory}#tienda">Visitar la categoría en Store ↗</a></aside>`:''}`;
})();
