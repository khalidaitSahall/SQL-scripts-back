// js/data.js — ghir l-data w l-traduction, bla logic
const TYPES = ["INT","VARCHAR(255)","TEXT","BOOLEAN","TIMESTAMP","DECIMAL(10,2)","UUID","JSON"];
const uid = () => Math.random().toString(36).slice(2,9);
const mkField = (name,type,pk=false,fk=false,refTable="",refField="") => ({id:uid(),name,type,pk,fk,refTable,refField});
const INITIAL_TABLES = [
  {id:"t-users",name:"users",x:80,y:70,fields:[mkField("id","UUID",true),mkField("username","VARCHAR(255)"),mkField("email","VARCHAR(255)"),mkField("created_at","TIMESTAMP")]},
  {id:"t-posts",name:"posts",x:600,y:60,fields:[mkField("id","UUID",true),mkField("user_id","UUID",false,true,"users","id"),mkField("title","VARCHAR(255)"),mkField("content","TEXT"),mkField("published_at","TIMESTAMP")]},
  {id:"t-comments",name:"comments",x:320,y:380,fields:[mkField("id","UUID",true),mkField("post_id","UUID",false,true,"posts","id"),mkField("user_id","UUID",false,true,"users","id"),mkField("content","TEXT"),mkField("created_at","TIMESTAMP")]},
];
const TEMPLATES = [
  {name:"users",blurb:"Identity + account basics",fields:[mkField("id","UUID",true),mkField("username","VARCHAR(255)"),mkField("email","VARCHAR(255)"),mkField("created_at","TIMESTAMP")]},
  {name:"posts",blurb:"Authored content",fields:[mkField("id","UUID",true),mkField("user_id","UUID",false,true,"users","id"),mkField("title","VARCHAR(255)"),mkField("content","TEXT"),mkField("published_at","TIMESTAMP")]},
  {name:"orders",blurb:"Purchase header",fields:[mkField("id","UUID",true),mkField("user_id","UUID",false,true,"users","id"),mkField("total","DECIMAL(10,2)"),mkField("status","VARCHAR(255)"),mkField("created_at","TIMESTAMP")]},
  {name:"products",blurb:"Catalog item",fields:[mkField("id","UUID",true),mkField("name","VARCHAR(255)"),mkField("price","DECIMAL(10,2)"),mkField("in_stock","BOOLEAN"),mkField("metadata","JSON")]},
];
const SAMPLE_SQL = `CREATE TABLE authors (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);

CREATE TABLE books (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES authors(id),
  title VARCHAR(255),
  published_at TIMESTAMP
);`;
const I18N = {
  en:{app:"Schema Canvas",tagline:"Draw it. Ship the SQL.",addTable:"Add Table",templates:"Table templates",useTemplate:"Use template",fieldPalette:"Field type palette",canvas:"Canvas",selected:"Selected table",fields:"fields",tableName:"Table name",newField:"New field name",addField:"Add Field",noTable:"No table selected",noTableHint:"Click any table to edit it.",sqlEditor:"SQL Editor",apply:"Apply to Diagram",sync:"Sync from Diagram",copy:"Copy",copied:"Copied",download:"Download .sql",loadSample:"Load sample",settings:"Settings",language:"Language",close:"Close",clear:"Clear",exportSQL:"Export SQL",how:"How it works",how1:"1. Drag table headers to arrange.",how2:"2. Double-click a table name to rename.",how3:"3. Mark FK fields and link them.",how4:"4. Copy or export SQL on the right.",blankTitle:"Start with a blank canvas",blankHint:"Add a table or use a template.",firstTable:"Add your first table",deleteTable:"Delete Table",unsaved:"Unsaved SQL changes",synced:"In sync with diagram"},
  ar:{app:"لوحة المخطط",tagline:"ارسمها. صدّر SQL.",addTable:"إضافة جدول",templates:"قوالب الجداول",useTemplate:"استعمل القالب",fieldPalette:"أنواع الحقول",canvas:"اللوحة",selected:"الجدول المختار",fields:"حقول",tableName:"اسم الجدول",newField:"سميّة الحقل الجديد",addField:"إضافة حقل",noTable:"حتى جدول ما مختار",noTableHint:"ضغط على شي جدول باش تبدّلو.",sqlEditor:"محرر SQL",apply:"طبق على المخطط",sync:"مزامنة من المخطط",copy:"نسخ",copied:"تم النسخ",download:"تحميل .sql",loadSample:"تحميل مثال",settings:"الإعدادات",language:"اللغة",close:"سد",clear:"مسح",exportSQL:"تصدير SQL",how:"كيفاش كتخدم",how1:"1. جرّ راس الجدول باش ترتّب.",how2:"2. ضغط جوج مرات باش تبدّل السمية.",how3:"3. علّم FK وربطها بجدول آخر.",how4:"4. نسخ ولا صدّر SQL.",blankTitle:"بدا بلوحة خاوية",blankHint:"زيد جدول ولا استعمل قالب.",firstTable:"زيد أول جدول",deleteTable:"حذف الجدول",unsaved:"كاين تبديلات ما تطبقاتش",synced:"متزامن مع المخطط"}
};
