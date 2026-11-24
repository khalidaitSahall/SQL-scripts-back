// js/main.js — l-component l-kbir + render
const {useState,useMemo,useRef,useEffect}=React;
function App(){
  const [lang,setLang]=useState("en");
  const t=I18N[lang];
  const [tables,setTables]=useState(INITIAL_TABLES);
  const [sel,setSel]=useState("t-posts");
  const [zoom,setZoom]=useState(0.86);
  const [pan,setPan]=useState({x:0,y:0});
  const [sql,setSql]=useState(()=>sqlFromTables(INITIAL_TABLES));
  const [dirty,setDirty]=useState(false);
  const [err,setErr]=useState("");
  const [toast,setToast]=useState("");
  const [settings,setSettings]=useState(false);
  const [newField,setNewField]=useState("");
  const [fieldType,setFieldType]=useState("VARCHAR(255)");
  const [renaming,setRenaming]=useState(null);
  const [renameVal,setRenameVal]=useState("");
  const dragRef=useRef(null);
  const liveSql=useMemo(()=>sqlFromTables(tables),[tables]);
  useEffect(()=>{ if(!dirty) setSql(liveSql); },[liveSql]);
  useEffect(()=>{ if(!toast) return; const id=setTimeout(()=>setToast(""),3500); return ()=>clearTimeout(id); },[toast]);
  const selected=tables.find(x=>x.id===sel);
  const rels=[]; tables.forEach(tab=>tab.fields.forEach(f=>{ if(!f.fk||!f.refTable) return; const to=tables.find(x=>x.name===f.refTable); if(!to) return; const tf=to.fields.find(x=>x.name===(f.refField||"id"))||to.fields[0]; if(tf) rels.push({key:tab.id+"-"+f.id,from:tab,f,to,tf}); }));
  const rowY=(tab,fid)=>tab.y+52+tab.fields.findIndex(f=>f.id===fid)*31+15;
  const pathFor=r=>{ const x1=r.from.x+250,y1=rowY(r.from,r.f.id),x2=r.to.x,y2=rowY(r.to,r.tf.id),c=Math.max(55,Math.abs(x2-x1)*0.45); return `M ${x1} ${y1} C ${x1+c} ${y1}, ${x2-c} ${y2}, ${x2} ${y2}`; };
  const upd=(id,patch)=>setTables(ts=>ts.map(x=>x.id===id?{...x,...patch}:x));
  const updField=(tid,fid,patch)=>upd(tid,{fields: tables.find(x=>x.id===tid).fields.map(f=>f.id===fid?{...f,...patch}:f)});
  const addTable=(tpl)=>{
    const base=tpl||{name:`table_${tables.length+1}`,fields:[mkField("id","UUID",true)]};
    const count=tables.filter(x=>x.name.startsWith(base.name)).length;
    const name=tpl&&count===0?base.name:`${base.name}_${count+1}`;
    const nt={id:uid(),name,x:70+(tables.length%4)*300,y:70+Math.floor(tables.length/4)*300,fields:base.fields.map(f=>({...f,id:uid()}))};
    setTables([...tables,nt]); setSel(nt.id); setToast(`${name} added.`);
  };
  const addField=()=>{
    if(!selected) return;
    const name=(newField.trim()||`field_${selected.fields.length+1}`).toLowerCase().replace(/\s+/g,"_");
    upd(selected.id,{fields:[...selected.fields,mkField(name,fieldType)]}); setNewField(""); setToast(`Field ${name} added to ${selected.name}.`);
  };
  const applySQL=()=>{
    const r=parseSQL(sql,lang);
    if(r.error){ setErr(r.error); setToast(r.error); return; }
    setErr(""); setTables(r.tables); setSel(r.tables[0]?.id||""); setDirty(false); setToast(`Applied! ${r.tables.length} tables.`);
  };
  const syncFromDiagram=()=>{ setSql(liveSql); setDirty(false); setErr(""); setToast("Synced from diagram."); };
  const copySQL=async()=>{ try{ await navigator.clipboard.writeText(sql); }catch(e){ const ta=document.createElement("textarea"); ta.value=sql; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); } setToast("SQL copied."); };
  const downloadSQL=()=>{ const b=new Blob([sql],{type:"text/plain"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="schema.sql"; a.click(); URL.revokeObjectURL(u); setToast("schema.sql downloaded."); };
  const onTableDown=(e,tab)=>{ if(e.target.closest("input,button,select")) return; setSel(tab.id); dragRef.current={kind:"table",id:tab.id,sx:e.clientX,sy:e.clientY,ox:tab.x,oy:tab.y}; e.currentTarget.setPointerCapture(e.pointerId); };
  const onCanvasDown=(e)=>{ if(e.target.closest(".table-card")) return; setSel(""); dragRef.current={kind:"pan",sx:e.clientX,sy:e.clientY,ox:pan.x,oy:pan.y}; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove=(e)=>{ const d=dragRef.current; if(!d) return; if(d.kind==="table") setTables(ts=>ts.map(x=>x.id===d.id?{...x,x:Math.max(0,Math.min(1140,d.ox+(e.clientX-d.sx)/zoom)),y:Math.max(0,Math.min(760,d.oy+(e.clientY-d.sy)/zoom))}:x)); else setPan({x:Math.max(-700,Math.min(250,d.ox+(e.clientX-d.sx))),y:Math.max(-550,Math.min(250,d.oy+(e.clientY-d.sy)))}); };
  return (
    <div dir={lang==="ar"?"rtl":"ltr"} lang={lang} className="min-h-[100dvh] flex flex-col overflow-x-clip" style={{background:"var(--bg)"}}>
      <header className="sticky top-0 z-30 border-b" style={{background:"var(--surface)",borderColor:"var(--line)"}}>
        <div className="px-3 sm:px-5 h-[62px] flex items-center gap-2 flex-wrap">
          <div className="w-9 h-9 rounded-xl grid place-items-center text-white shrink-0" style={{background:"linear-gradient(135deg,#5b5bd6,#7c3aed)"}}>◈</div>
          <div className="leading-tight"><h1 className="font-display font-extrabold text-[18px]">{t.app}</h1><p className="hidden sm:block text-[11px]" style={{color:"var(--muted)"}}>{t.tagline}</p></div>
          <div className="ms-auto flex items-center gap-2 flex-wrap">
            <button onClick={()=>setSettings(true)} className="px-3 h-9 rounded-lg text-[13px] font-semibold border" style={{borderColor:"var(--line)"}}>⚙ {t.settings}</button>
            <button onClick={downloadSQL} className="px-3 h-9 rounded-lg text-[13px] font-semibold border" style={{borderColor:"var(--line)"}}>↓ {t.exportSQL}</button>
            <button onClick={()=>{if(confirm(t.clear+"?")){setTables([]);setSel("");setToast("Canvas cleared.");}}} className="px-3 h-9 rounded-lg text-[13px] font-semibold text-red-600 border border-red-100">⌫ {t.clear}</button>
            <button onClick={()=>addTable()} className="px-4 h-9 rounded-lg text-[13px] font-bold text-white" style={{background:"linear-gradient(135deg,#5b5bd6,#7c3aed)"}}>+ {t.addTable}</button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        <aside className="lg:w-[258px] shrink-0 border-b lg:border-b-0 lg:border-e p-4 overflow-y-auto thin-scroll" style={{background:"var(--surface)",borderColor:"var(--line)"}}>
          <button onClick={()=>addTable()} className="w-full h-11 rounded-xl text-white font-bold text-[14px]" style={{background:"linear-gradient(135deg,#5b5bd6,#7c3aed)"}}>+ {t.addTable}</button>
          <p className="mt-4 mb-2 text-[11px] font-bold tracking-wider uppercase" style={{color:"var(--muted)"}}>{t.templates}</p>
          <div className="grid gap-2">{TEMPLATES.map(tp=>(
            <button key={tp.name} onClick={()=>addTable(tp)} className="text-start rounded-xl border p-3" style={{borderColor:"var(--line)",background:"var(--surface-2)"}}>
              <span className="font-bold text-[13px]">▦ {tp.name}</span><span className="block text-[11px] mt-1" style={{color:"var(--muted)"}}>{tp.blurb}</span>
              <span className="text-[11px] font-bold mt-2 inline-block" style={{color:"var(--primary)"}}>{t.useTemplate} →</span>
            </button>))}
          </div>
          <p className="mt-5 mb-2 text-[11px] font-bold tracking-wider uppercase" style={{color:"var(--muted)"}}>{t.fieldPalette}</p>
          <div className="flex flex-wrap gap-1.5">{TYPES.map(x=>(
            <button key={x} onClick={()=>{setFieldType(x); setToast(`${x} selected.`);}} className="mono px-2 py-1.5 rounded-lg border text-[11px] font-semibold" style={{borderColor:fieldType===x?"var(--primary)":"var(--line)",background:fieldType===x?"var(--surface-3)":"var(--surface)",color:fieldType===x?"var(--primary)":"var(--ink)"}}>{x}</button>))}
          </div>
          <div className="mt-5 rounded-xl p-3 border" style={{borderColor:"var(--line)",background:"var(--surface-2)"}}>
            <p className="font-bold text-[13px]">✦ {t.how}</p>
            <ul className="mt-2 space-y-1.5 text-[12px]" style={{color:"var(--muted)"}}><li>{t.how1}</li><li>{t.how2}</li><li>{t.how3}</li><li>{t.how4}</li></ul>
          </div>
        </aside>
        <section className="flex-1 min-w-0 flex flex-col relative">
          <div className="px-4 h-11 flex items-center gap-3 text-[12px] font-semibold border-b" style={{borderColor:"var(--line)",background:"var(--surface)"}}>
            <span>▦ {t.canvas}</span><span style={{color:"var(--muted)"}}>{tables.length} tables · {rels.length} rels</span>
            <div className="ms-auto flex items-center border rounded-lg overflow-hidden" style={{borderColor:"var(--line)"}}>
              <button onClick={()=>setZoom(z=>Math.max(0.55,+(z-0.1).toFixed(2)))} className="px-2 h-8">−</button>
              <span className="px-2 mono text-[11px] w-11 text-center">{Math.round(zoom*100)}%</span>
              <button onClick={()=>setZoom(z=>Math.min(1.4,+(z+0.1).toFixed(2)))} className="px-2 h-8">+</button>
            </div>
          </div>
          <div className="relative flex-1 h-[560px] lg:h-auto min-h-[540px] overflow-hidden canvas-grid" onPointerDown={onCanvasDown} onPointerMove={onMove} onPointerUp={()=>dragRef.current=null} onPointerLeave={()=>dragRef.current=null}>
            <div className="absolute origin-top-left will-change-transform" style={{width:1400,height:900,transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})`}}>
              <svg className="absolute inset-0 pointer-events-none" width="1400" height="900" style={{overflow:"visible"}}>
                <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7c3aed" /></marker></defs>
                {rels.map(r=>(
                  <g key={r.key}><path d={pathFor(r)} fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 3" markerEnd="url(#arrow)" />
                  <g><rect x={(r.from.x+250+r.to.x)/2-58} y={(rowY(r.from,r.f.id)+rowY(r.to,r.tf.id))/2-12} width="116" height="21" rx="10" fill="#fff" stroke="#ddd6fe" />
                  <text x={(r.from.x+250+r.to.x)/2} y={(rowY(r.from,r.f.id)+rowY(r.to,r.tf.id))/2+2} textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b5bd6" className="mono">{`${r.f.name} → ${r.to.name}.${r.tf.name}`}</text></g></g>
                ))}
              </svg>
              {tables.map(tab=>(
                <article key={tab.id} onPointerDown={e=>onTableDown(e,tab)} onClick={()=>setSel(tab.id)} className="table-card absolute rounded-2xl overflow-hidden select-none" style={{left:tab.x,top:tab.y,width:250,background:"var(--surface)",border:sel===tab.id?"2px solid var(--primary)":"1px solid var(--line)",boxShadow:"0 10px 28px rgba(20,24,38,.11)",touchAction:"none"}}>
                  <header className="px-3 h-[42px] flex items-center gap-2 cursor-grab" style={{background:sel===tab.id?"linear-gradient(135deg,#5b5bd6,#7c3aed)":"var(--surface-2)"}}>
                    <span className="w-6 h-6 rounded-md grid place-items-center shrink-0" style={{background:sel===tab.id?"rgba(255,255,255,.22)":"var(--surface-3)",color:sel===tab.id?"#fff":"var(--primary)"}}>▦</span>
                    {renaming===tab.id ? <input autoFocus value={renameVal} onChange={e=>setRenameVal(e.target.value)} onBlur={()=>{ if(renameVal.trim()) upd(tab.id,{name:renameVal.trim().toLowerCase().replace(/\s+/g,"_")}); setRenaming(null); }} onKeyDown={e=>{if(e.key==="Enter") e.target.blur(); if(e.key==="Escape") setRenaming(null);}} className="min-w-0 flex-1 h-7 px-2 rounded-md border text-[14px] font-bold mono" />
                    : <button onDoubleClick={()=>{setRenaming(tab.id); setRenameVal(tab.name);}} className="flex-1 min-w-0 text-start font-display font-bold text-[14px] truncate" style={{color:sel===tab.id?"#fff":"var(--ink)"}}>{tab.name}</button>}
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{background:"#fef3c7",color:"#92400e"}}>{tab.fields.filter(f=>f.pk).length} PK</span>
                  </header>
                  <div className="py-1">{tab.fields.map(f=>(
                    <div key={f.id} className="field-row px-3 flex items-center gap-2 text-[12px]"><span className="flex-1 truncate mono font-medium">{f.name}</span><span className="mono text-[10px]" style={{color:"var(--muted)"}}>{f.type}</span>{f.pk && <span className="text-[9px] font-extrabold px-1 py-0.5 rounded bg-amber-100 text-amber-800">PK</span>}{f.fk && <span className="text-[9px] font-extrabold px-1 py-0.5 rounded bg-violet-100 text-violet-700">FK</span>}</div>
                  ))}</div>
                </article>
              ))}
              {!tables.length && <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-8 rounded-3xl shadow-xl w-[360px] max-w-[90vw]" style={{background:"var(--surface)"}}><h2 className="font-display font-bold text-xl">{t.blankTitle}</h2><p className="text-sm mt-1" style={{color:"var(--muted)"}}>{t.blankHint}</p><button onClick={()=>addTable()} className="mt-4 px-4 h-10 rounded-lg text-white font-bold text-sm" style={{background:"var(--primary)"}}>{t.firstTable}</button></div>}
            </div>
          </div>
        </section>
        <aside className="lg:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-s flex flex-col min-h-[620px] lg:min-h-0" style={{background:"var(--surface)",borderColor:"var(--line)"}}>
          {selected ? <div className="p-4 border-b" style={{borderColor:"var(--line)"}}>
            <p className="text-[10px] font-bold tracking-wider uppercase" style={{color:"var(--muted)"}}>{t.selected}</p>
            <div className="flex items-start justify-between gap-2"><h2 className="font-display font-extrabold text-[20px] truncate">{selected.name}</h2>
            <button onClick={()=>{setTables(tables.filter(x=>x.id!==selected.id)); setSel(""); setToast(`${selected.name} deleted.`);}} className="shrink-0 text-[12px] font-bold text-red-600 px-2 h-8 rounded-lg border border-red-100">🗑 {t.deleteTable}</button></div>
            <p className="text-[12px]" style={{color:"var(--muted)"}}>{selected.fields.length} {t.fields}</p>
            <label className="block mt-3 text-[12px] font-bold">{t.tableName}</label>
            <input value={selected.name} onChange={e=>upd(selected.id,{name:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")})} className="mt-1 w-full h-9 px-3 rounded-lg border mono text-[13px]" style={{borderColor:"var(--line)",background:"var(--surface-2)"}} />
            <div className="mt-3 max-h-[210px] overflow-y-auto thin-scroll space-y-2">{selected.fields.map(f=>(
              <div key={f.id} className="rounded-xl border p-2.5" style={{borderColor:"var(--line)"}}>
                <div className="flex gap-1.5">
                  <input value={f.name} onChange={e=>updField(selected.id,f.id,{name:e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")})} className="min-w-0 flex-1 h-8 px-2 rounded-md border mono text-[12px]" />
                  <select value={f.type} onChange={e=>updField(selected.id,f.id,{type:e.target.value})} className="w-[108px] h-8 px-1 rounded-md border mono text-[11px]">{TYPES.map(x=><option key={x}>{x}</option>)}</select>
                  <button onClick={()=>upd(selected.id,{fields:selected.fields.filter(x=>x.id!==f.id)})} className="w-8 h-8 grid place-items-center rounded-md text-red-500">✕</button>
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <button onClick={()=>updField(selected.id,f.id,{pk:!f.pk})} className="px-2 h-7 rounded-full border text-[11px] font-bold">PK {f.pk?"On":"Off"}</button>
                  <button onClick={()=>updField(selected.id,f.id,{fk:!f.fk,refTable:!f.fk?(tables.find(x=>x.id!==selected.id)?.name||""):f.refTable,refField:!f.fk?"id":f.refField})} className="px-2 h-7 rounded-full border text-[11px] font-bold">FK {f.fk?"On":"Off"}</button>
                  {f.fk && <select value={`${f.refTable}.${f.refField}`} onChange={e=>{const [a,b]=e.target.value.split("."); updField(selected.id,f.id,{refTable:a,refField:b});}} className="flex-1 min-w-[130px] h-7 px-1 rounded-md border text-[11px] mono">{tables.flatMap(x=>x.fields.map(y=><option key={x.name+"."+y.name} value={`${x.name}.${y.name}`}>{x.name}.{y.name}</option>))}</select>}
                </div>
              </div>))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={newField} onChange={e=>setNewField(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") addField();}} placeholder={t.newField} className="min-w-0 flex-1 h-9 px-3 rounded-lg border text-[13px]" style={{borderColor:"var(--line)"}} />
              <select value={fieldType} onChange={e=>setFieldType(e.target.value)} className="w-[112px] h-9 px-1 rounded-lg border mono text-[11px]">{TYPES.map(x=><option key={x}>{x}</option>)}</select>
              <button onClick={addField} className="shrink-0 px-3 h-9 rounded-lg text-white font-bold text-[13px]" style={{background:"var(--primary)"}}>{t.addField}</button>
            </div>
          </div> : <div className="p-4 border-b" style={{borderColor:"var(--line)"}}><p className="font-bold text-[14px]">{t.noTable}</p><p className="text-[12px] mt-1" style={{color:"var(--muted)"}}>{t.noTableHint}</p></div>}
          <div className="flex items-center gap-2 px-4 h-11 border-b" style={{borderColor:"var(--line)"}}><h3 className="text-[13px] font-bold">{t.sqlEditor}</h3><span className="ms-auto text-[11px] font-bold px-2 py-1 rounded-full" style={{background:dirty?"#fef3c7":"#d1fae5",color:dirty?"#92400e":"#065f46"}}>{dirty?t.unsaved:t.synced}</span></div>
          <div className="flex-1 flex flex-col min-h-[420px] p-3">
            <div className="flex flex-wrap gap-1.5 pb-2">
              <button onClick={applySQL} className="px-3 h-9 rounded-lg text-[12px] font-bold text-white" style={{background:"linear-gradient(135deg,#5b5bd6,#7c3aed)"}}>→ {t.apply}</button>
              <button onClick={syncFromDiagram} className="px-3 h-9 rounded-lg text-[12px] font-bold border" style={{borderColor:"var(--line)"}}>↻ {t.sync}</button>
              <button onClick={copySQL} className="px-3 h-9 rounded-lg text-[12px] font-bold border" style={{borderColor:"var(--line)"}}>⧉ {t.copy}</button>
              <button onClick={downloadSQL} className="px-3 h-9 rounded-lg text-[12px] font-bold border" style={{borderColor:"var(--line)"}}>↓ {t.download}</button>
              <button onClick={()=>{setSql(SAMPLE_SQL); setDirty(true); setToast("Sample loaded — press Apply.");}} className="px-3 h-9 rounded-lg text-[12px] font-bold border" style={{borderColor:"var(--line)"}}>📄 {t.loadSample}</button>
            </div>
            <div dir="ltr" className="relative flex-1 min-h-[260px] rounded-xl border overflow-hidden" style={{borderColor:err?"#fca5a5":"var(--line)",background:"var(--surface-2)"}}>
              <pre aria-hidden="true" className="absolute inset-0 m-0 p-3 overflow-auto mono text-[12px] leading-[1.65] whitespace-pre pointer-events-none" dangerouslySetInnerHTML={{__html:highlightSQL(sql)+"\n"}} />
              <textarea value={sql} onChange={e=>{setSql(e.target.value); setDirty(true); setErr("");}} onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="s"){e.preventDefault(); applySQL();}}} spellCheck={false} className="absolute inset-0 w-full h-full p-3 mono text-[12px] leading-[1.65] whitespace-pre resize-none outline-none bg-transparent thin-scroll" style={{color:"transparent",caretColor:"var(--ink)"}} />
            </div>
            {err && <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-[12px] text-red-800">⚠ {err}<span className="block text-red-600 font-semibold mt-0.5">Diagram not changed — fix SQL and try again.</span></div>}
          </div>
        </aside>
      </main>
      {settings && <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center px-3" onClick={()=>setSettings(false)}>
        <div role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} className="w-full max-w-[480px] rounded-3xl border p-5 shadow-2xl" style={{background:"var(--surface)",borderColor:"var(--line)"}}>
          <div className="flex items-center gap-2"><h2 className="font-display font-extrabold text-[19px]">{t.settings}</h2><button onClick={()=>setSettings(false)} className="ms-auto w-9 h-9 grid place-items-center rounded-lg border" style={{borderColor:"var(--line)"}}>✕</button></div>
          <p className="mt-5 mb-2 text-[12px] font-bold">🌐 {t.language} / اللغة</p>
          <div className="grid gap-2">
            {[["en","English","Schema Canvas · Add Table · SQL Editor"],["ar","العربية","لوحة المخطط · إضافة جدول · محرر SQL"]].map(([code,label,sub])=>(
              <button key={code} onClick={()=>{setLang(code); setToast(code==="ar"?"تبدّلات اللغة للعربية.":"Language switched to English.");}} className="text-start rounded-2xl border p-3.5 flex items-center gap-3" style={{borderColor:lang===code?"var(--primary)":"var(--line)",background:lang===code?"var(--surface-3)":"var(--surface)"}}>
                <span className="w-5 h-5 rounded-full border-2 grid place-items-center shrink-0" style={{borderColor:lang===code?"var(--primary)":"var(--line)"}}>{lang===code && <span className="w-2.5 h-2.5 rounded-full" style={{background:"var(--primary)"}} />}</span>
                <span><span className="block font-bold text-[14px]">{label}</span><span className="block text-[12px]" style={{color:"var(--muted)"}}>{sub}</span></span>
                <span className="ms-auto text-[11px] font-bold px-2 py-1 rounded-full" style={{background:"var(--surface-2)",color:"var(--primary)"}}>{code==="ar"?"RTL":"LTR"}</span>
              </button>))}
          </div>
          <button onClick={()=>setSettings(false)} className="mt-4 w-full h-11 rounded-xl text-white font-bold text-[14px]" style={{background:"linear-gradient(135deg,#5b5bd6,#7c3aed)"}}>{t.close}</button>
        </div>
      </div>}
      {toast && <div role="status" className="fixed bottom-4 start-1/2 -translate-x-1/2 z-[60] max-w-[92vw] rounded-2xl border px-4 py-3 shadow-2xl text-[13px] font-semibold" style={{background:"var(--surface)",borderColor:"var(--line)"}}>✓ {toast}</div>}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
