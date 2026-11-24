// js/app.js — l-logic: SQL <-> tables, drag, relations
function sqlFromTables(tables){
  if(!tables.length) return "-- Your canvas is empty.\n-- Add a table to start generating SQL.";
  return tables.map(t=>{
    const lines = t.fields.map(f=>`  ${f.name} ${f.type}${f.pk && t.fields.filter(x=>x.pk).length===1 ? " PRIMARY KEY" : ""}`);
    const pks = t.fields.filter(f=>f.pk);
    if(pks.length>1) lines.push(`  PRIMARY KEY (${pks.map(f=>f.name).join(", ")})`);
    t.fields.filter(f=>f.fk && f.refTable && f.refField).forEach(f=>lines.push(`  FOREIGN KEY (${f.name}) REFERENCES ${f.refTable}(${f.refField})`));
    return `CREATE TABLE ${t.name} (\n${lines.join(",\n")}\n);`;
  }).join("\n\n");
}
function parseSQL(sql, lang){
  const clean = sql.replace(/--[^\n]*/g,"");
  const open=(clean.match(/\(/g)||[]).length, close=(clean.match(/\)/g)||[]).length;
  if(open!==close) return {tables:[],error: lang==="ar" ? `الأقواس ما متوازنينش — ${open} مفتوحين و ${close} مسدودين.` : `Unbalanced parentheses — ${open} opening and ${close} closing.`};
  const blocks=[...sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([A-Za-z_][\w]*)["`]?[\s]*\(([\s\S]*?)\)\s*;/gi)];
  if(!blocks.length) return {tables:[],error: lang==="ar" ? "ما لقيناش حتى CREATE TABLE كاملة." : "No complete CREATE TABLE found. Each table needs a closing );"};
  const tables=[];
  for(const b of blocks){
    const name=b[1], body=b[2];
    const parts=[]; let depth=0, cur="";
    for(const ch of body){ if(ch==="(") depth++; if(ch===")") depth--; if(ch==="," && depth===0){parts.push(cur); cur="";} else cur+=ch; }
    if(cur.trim()) parts.push(cur);
    const fields=[]; let pkList=[];
    parts.forEach(p=>{
      const pkM=p.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if(pkM){ pkList=pkM[1].split(",").map(s=>s.trim().replace(/["`]/g,"")); return; }
      const fkM=p.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+["`]?([\w]+)["`]?[\s]*\(([^)]+)\)/i);
      if(fkM){ const f=fields.find(x=>x.name===fkM[1].trim()); if(f){f.fk=true; f.refTable=fkM[2]; f.refField=fkM[3].trim();} return; }
      const m=p.trim().match(/^["`]?([A-Za-z_][\w]*)["`]?\s+([A-Za-z]+(?:\s*\(\s*\d+(?:\s*,\s*\d+)?\s*\))?)/i);
      if(!m) return;
      const ref=p.match(/REFERENCES\s+["`]?([\w]+)["`]?[\s]*\(([^)]+)\)/i);
      fields.push(mkField(m[1], (m[2]||"TEXT").toUpperCase().replace(/\s+/g,""), /PRIMARY\s+KEY/i.test(p), !!ref, ref?.[1]||"", ref?.[2]?.trim()||""));
    });
    fields.forEach(f=>{ if(pkList.includes(f.name)) f.pk=true; });
    if(fields.length) tables.push({id:uid(),name,x:60+(tables.length%3)*320,y:60+Math.floor(tables.length/3)*300,fields});
  }
  return {tables,error:""};
}
function highlightSQL(sql){
  const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  let out="", last=0;
  const re=/(--[^\n]*|'[^']*'|\b(?:CREATE|TABLE|IF|NOT|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|NULL|CHECK|CONSTRAINT)\b|\b(?:INT|VARCHAR|TEXT|BOOLEAN|TIMESTAMP|DECIMAL|UUID|JSON|SERIAL|BIGINT|DATE|TIME|FLOAT|DOUBLE)\b|\b\d+(?:\.\d+)?\b)/gi;
  for(const m of sql.matchAll(re)){
    out+=esc(sql.slice(last,m.index));
    const v=m[0], cls=v.startsWith("--")?"tok-comment":v.startsWith("'")?"tok-string":/^\d/.test(v)?"tok-number":/^(INT|VARCHAR|TEXT|BOOLEAN|TIMESTAMP|DECIMAL|UUID|JSON|SERIAL|BIGINT|DATE|TIME|FLOAT|DOUBLE)$/i.test(v)?"tok-type":"tok-kw";
    out+=`<span class="${cls}">${esc(v)}</span>`; last=m.index+v.length;
  }
  return out+esc(sql.slice(last)) || " ";
}
