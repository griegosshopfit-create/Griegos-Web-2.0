(function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const references = sources => `<ul class="ody-sources">${sources.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a></li>`).join('')}</ul>`;
  const rootURL=new URL("../../",document.currentScript.src);
  const url=path=>new URL(path,rootURL).href;
  const editorialAssets = new Set([
    'calculadoras-metodo', 'entrenamiento-gimnasio', 'entrenamiento-casa',
    'nutricion-fundamentos', 'nutricion-organizacion', 'progresion-control',
    'suplementacion-criterio'
  ]);
  const editorialImage = (id, className = 'ody-card-media', priority = false) => {
    if (!editorialAssets.has(id)) return '';
    const src = url(`assets/editorial/${id}.jpg`);
    const mobile = url(`assets/editorial/${id}-768.jpg`);
    const sizes = className === 'ody-card-media'
      ? '(max-width: 530px) calc(100vw - 42px), (max-width: 1100px) 45vw, 400px'
      : '(max-width: 760px) calc(100vw - 42px), 960px';
    // These covers accompany a visible title, so their alt is deliberately empty.
    return `<picture class="editorial-media ${escape(className)}"><img src="${escape(src)}" srcset="${escape(mobile)} 768w, ${escape(src)} 1536w" sizes="${sizes}" width="1536" height="1024" alt="" loading="${priority ? 'eager' : 'lazy'}"${priority ? ' fetchpriority="high"' : ''} decoding="async"></picture>`;
  };
  window.ODY = {escape,references,url,editorialImage};
  const year=document.querySelector('#ody-year'); if(year)year.textContent=String(new Date().getFullYear());
  document.addEventListener('click',event=>{if(event.target.closest('[data-print]'))window.print();});
})();
