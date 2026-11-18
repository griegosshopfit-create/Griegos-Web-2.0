(function () {
  'use strict';
  const container=document.querySelector('#ody-calculators'); if(!container)return;
  const E=window.ODY_ENGINE, H=window.ODY.escape, format=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(n);
  function field(f,prefix){const id=prefix+'-'+f.id, common=`id="${id}" name="${f.id}" required`;return `<label class="ody-field" for="${id}"><span>${H(f.label)}</span>${f.type==='select'?`<select ${common}>${f.options.map(([v,t])=>`<option value="${H(v)}">${H(t)}</option>`).join('')}</select>`:f.type==='textarea'?`<textarea ${common} rows="4">${H(f.value)}</textarea>`:`<input ${common} type="${f.type}" value="${H(f.value)}" ${f.type==='number'?`min="${f.min}" max="${f.max}" step="${f.step}"`:'maxlength="700"'}>`}</label>`;}
  container.innerHTML=window.ODY_CALCULATORS.map(c=>`<article class="ody-calculator" id="${c.id}" data-calc-category="${H(c.category)}"><div><span class="ody-kicker">${H(c.category)}</span><h2>${H(c.title)}</h2><p>${H(c.purpose)}</p><p><strong>Para quién:</strong> ${H(c.audience)}</p><details><summary>Fórmula, interpretación y límites</summary><p>${H(c.formula)}</p><p>${H(c.interpretation)}</p><p>${H(c.limits)}</p>${window.ODY.references([c.source])}</details></div><div class="ody-calc-work"><form data-calculator="${c.id}" novalidate><div class="ody-fields">${c.fields.map(f=>field(f,c.id)).join('')}</div><div class="ody-form-actions"><button class="ody-btn primary" type="submit">Calcular</button><button class="ody-btn secondary" type="reset">Limpiar resultado</button></div><p class="ody-error" role="alert" hidden></p><div class="ody-result" role="status" aria-live="polite" hidden></div></form></div></article>`).join('');
  function calculate(id,d){const n=k=>{if(!String(d.get(k)||'').trim())throw Error('Completa los campos.');return Number(d.get(k));},kg=()=>E.weight(n('weight'),d.get('weightUnit')),cm=()=>E.height(n('height'),d.get('heightUnit')),load=()=>E.weight(n('load'),d.get('loadUnit'));switch(id){
    case'imc':return `${format(E.bmi(kg(),cm()))} kg/m²`;
    case'reposo':return `${format(E.resting(kg(),cm(),n('age'),d.get('coefficient')))} kcal/día en reposo`;
    case'gasto':return `${format(E.expenditure(n('rest'),n('factor')))} kcal/día estimadas`;
    case'macros':{const m=E.macros(n('kcal'),n('proteinPercent'),n('fatPercent'));return `Proteína: ${format(m.protein)} g · Carbohidratos: ${format(m.carbs)} g · Grasas: ${format(m.fat)} g. Energía: ${format(E.macroEnergy(m.protein,m.carbs,m.fat))} kcal.`;}
    case'rm':return `${format(E.epley(load(),n('reps')))} kg de 1RM estimada`;
    case'cargas':return `${format(E.percentage(load(),n('percent')))} kg (${format(n('percent'))} % de la referencia)`;
    case'proteina':{const p=E.protein(kg());return `${format(p.min)}–${format(p.max)} g/día: intervalo educativo, no prescripción.`;}
    case'volumen':{const rows=parseRows(d.get('rows'),3).map(r=>({load:Number(r[0]),reps:Number(r[1]),sets:Number(r[2])}));return `${format(E.volume(rows))} kg·repeticiones` ;}
    case'ritmo':{const pace=E.pace(n('km'),n('minutes'));const seconds=Math.round(pace*60);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')} min/km`;}
    case'tiempo':{const minutes=E.time(n('km'),n('pace'));return `${format(minutes)} minutos (${format(minutes/60)} horas)`;}
    case'series':return Object.entries(E.weeklySets(parseRows(d.get('rows'),2).map(r=>({group:r[0],sets:Number(r[1])})))).map(([g,s])=>`${g}: ${s} series`).join(' · ');
    case'frecuencia':return E.frequency(n('days'),n('frequency'),String(d.get('groups')).split(',')).map((g,i)=>`Día ${i+1}: ${g.join(', ')||'Sin grupo asignado'}`).join(' · ');
    default:throw Error('Herramienta no reconocida.');
  }}
  function parseRows(text,length){const rows=String(text||'').trim().split('\n').map(r=>r.split(';').map(v=>v.trim()));if(rows.some(r=>r.length!==length||r.some(v=>!v)))throw Error(`Cada fila debe tener ${length} valores separados por punto y coma.`);return rows;}
  container.querySelectorAll('form').forEach(form=>{
    const result=form.querySelector('.ody-result'),error=form.querySelector('.ody-error');
    function clear(){result.hidden=true;result.textContent='';error.hidden=true;error.textContent='';}
    form.addEventListener('submit',event=>{event.preventDefault();clear();try{if(!form.checkValidity())throw Error('Completa los campos dentro de sus límites y usa números válidos.');const c=window.ODY_CALCULATORS.find(c=>c.id===form.dataset.calculator);result.innerHTML=`<strong class="ody-result-value">${H(calculate(c.id,new FormData(form)))}</strong><p>${H(c.interpretation)}</p><p>${H(c.limits)}</p>`;result.hidden=false;}catch(e){error.textContent=e.message;error.hidden=false;}});
    form.addEventListener('input',clear);
    form.addEventListener('reset',()=>{clear();form.querySelectorAll('select[name$="Unit"]').forEach(select=>{const input=form.elements.namedItem(select.name.replace('Unit',''));input.min=input.dataset.originalMin;input.max=input.dataset.originalMax;select.dataset.previous=select.options[0].value;});});
    form.querySelectorAll('select[name$="Unit"]').forEach(select=>{select.dataset.previous=select.value;const input=form.elements.namedItem(select.name.replace('Unit',''));input.dataset.originalMin=input.min;input.dataset.originalMax=input.max;select.addEventListener('change',()=>{const from=select.dataset.previous,to=select.value;const factor=from===to?1:from==='kg'?1/0.45359237:from==='lb'?0.45359237:from==='cm'?1/2.54:2.54;if(input.value.trim()&&Number.isFinite(Number(input.value)))input.value=String(Number((Number(input.value)*factor).toFixed(4)));if(input.min)input.min=String(Number(input.min)*factor);if(input.max)input.max=String(Number(input.max)*factor);select.dataset.previous=to;clear();});});
  });
  const filters=document.querySelector('#ody-calc-filters');
  const categories=['Todas',...new Set(window.ODY_CALCULATORS.map(c=>c.category))];
  filters.innerHTML=categories.map((c,i)=>`<button type="button" data-calc-filter="${H(c)}" aria-pressed="${i===0}" class="${i===0?'is-active':''}">${H(c)}</button>`).join('');
  filters.addEventListener('click',event=>{const button=event.target.closest('[data-calc-filter]');if(!button)return;filters.querySelectorAll('button').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});container.querySelectorAll('[data-calc-category]').forEach(card=>{card.hidden=button.dataset.calcFilter!=='Todas'&&card.dataset.calcCategory!==button.dataset.calcFilter;});});
})();
