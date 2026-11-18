/* Matemáticas educativas puras: no acceden a DOM, red ni almacenamiento. */
(function (root) {
  'use strict';
  function number(value, label, min, max) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`${label}: introduce un valor entre ${min} y ${max}.`);
    return value;
  }
  function integer(value, label, min, max) { number(value,label,min,max); if (!Number.isInteger(value)) throw new Error(`${label}: usa un número entero.`); return value; }
  function weight(value, unit='kg') { if (!['kg','lb'].includes(unit)) throw new Error('Unidad de peso inválida.'); return number(value,'Peso',0.01,10000)*(unit==='lb'?0.45359237:1); }
  function height(value, unit='cm') { if (!['cm','in'].includes(unit)) throw new Error('Unidad de altura inválida.'); return number(value,'Altura',1,1000)*(unit==='in'?2.54:1); }
  function bmi(kg, cm) { number(kg,'Peso kg',25,350); number(cm,'Altura cm',100,250); return kg/(cm/100)**2; }
  function resting(kg, cm, age, coefficient) { number(kg,'Peso kg',25,350); number(cm,'Altura cm',100,250); number(age,'Edad adulta',18,100); if (!['male','female'].includes(coefficient)) throw new Error('Selecciona el coeficiente de la ecuación.'); const result=10*kg+6.25*cm-5*age+(coefficient==='male'?5:-161); if(result<300||result>5000)throw new Error('Esta combinación queda fuera del intervalo admitido por la herramienta. Revisa los datos; no se genera una estimación.'); return result; }
  function expenditure(rest, factor) { return number(rest,'Energía en reposo',300,5000)*number(factor,'Factor de actividad',1,2.5); }
  function macroEnergy(protein, carbs, fat) { return number(protein,'Proteína g',0,1000)*4+number(carbs,'Carbohidratos g',0,2000)*4+number(fat,'Grasas g',0,1000)*9; }
  function macros(kcal, proteinPercent, fatPercent) { number(kcal,'Energía kcal',500,6000); number(proteinPercent,'Proteína %',0,100); number(fatPercent,'Grasa %',0,100); if (proteinPercent+fatPercent>100) throw new Error('Los porcentajes no pueden superar 100 %.'); return {protein:kcal*proteinPercent/100/4,fat:kcal*fatPercent/100/9,carbs:kcal*(100-proteinPercent-fatPercent)/100/4}; }
  function epley(load,reps) { number(load,'Carga kg',0.1,1000); integer(reps,'Repeticiones',1,10); return reps===1?load:load*(1+reps/30); }
  function percentage(load,percent) { return number(load,'Carga de referencia',0.1,1000)*number(percent,'Porcentaje',0,100)/100; }
  function protein(kg) { number(kg,'Peso kg',25,350); return {min:kg*1.4,max:kg*2}; }
  function volume(rows) { if (!Array.isArray(rows)||!rows.length||rows.length>100) throw new Error('Introduce entre 1 y 100 ejercicios.'); return rows.reduce((sum,r)=>sum+number(r.load,'Carga',0,1000)*integer(r.reps,'Repeticiones',1,100)*integer(r.sets,'Series',1,100),0); }
  function pace(km,minutes) { return number(minutes,'Tiempo en minutos',0.1,10000)/number(km,'Distancia km',0.1,1000); }
  function time(km,minPerKm) { return number(km,'Distancia km',0.1,1000)*number(minPerKm,'Ritmo min/km',1,60); }
  function weeklySets(rows) { if (!Array.isArray(rows)||!rows.length||rows.length>100) throw new Error('Introduce entre 1 y 100 registros.'); const totals={}; for (const r of rows) { const group=String(r.group||'').trim(); if (!group||group.length>60||['__proto__','constructor','prototype'].includes(group)) throw new Error('Nombre de grupo inválido.'); totals[group]=(Object.hasOwn(totals,group)?totals[group]:0)+integer(r.sets,'Series',0,100); } return totals; }
  function frequency(days,frequency,groups) { integer(days,'Días',1,7); integer(frequency,'Frecuencia',1,days); if (!Array.isArray(groups)||!groups.length||groups.length>12) throw new Error('Escribe entre 1 y 12 grupos.'); const names=[...new Set(groups.map(g=>String(g).trim()).filter(Boolean))]; if (!names.length||names.some(g=>g.length>60)) throw new Error('Grupos inválidos.'); const schedule=Array.from({length:days},()=>[]); names.forEach((g,index)=>{ for(let occurrence=0;occurrence<frequency;occurrence++) schedule[(index+Math.floor(occurrence*days/frequency))%days].push(g); }); return schedule; }
  const api=Object.freeze({number,integer,weight,height,bmi,resting,expenditure,macroEnergy,macros,epley,percentage,protein,volume,pace,time,weeklySets,frequency});
  root.ODY_ENGINE=api;
  if (typeof module==='object'&&module.exports) module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
