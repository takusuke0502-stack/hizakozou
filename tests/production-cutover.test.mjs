import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=f=>readFileSync(new URL(f,root),'utf8');
const pages=['index.html','staff.html','voices.html','access.html','msm.html','news.html','privacy.html','symptoms/index.html','symptoms/knee-pain.html','symptoms/lower-back-pain.html','symptoms/sciatica.html','symptoms/hip-osteoarthritis.html','symptoms/spinal-stenosis.html'];
const site='https://hizakozou.jp';
const fileFor=url=>decodeURIComponent(url.pathname).replace(/^\//,'')+(url.pathname.endsWith('/')?'index.html':'');
const referenced=html=>[...html.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)].map(m=>m[1]).concat([...html.matchAll(/\bsrcset="([^"]+)"/g)].flatMap(m=>m[1].split(',').map(v=>v.trim().split(/\s+/)[0])));
for(const file of pages) {
 test(`${file}: production SEO and tracking are enabled`,()=>{
  const html=read(file),url=site+'/'+file.replace(/index\.html$/,'');
  assert.match(html,/data-site-layout="redesign-v1"/);
  assert.match(html,/name="robots" content="index,follow,max-image-preview:large"/);
  assert(html.includes(`rel="canonical" href="${url}"`));
  assert(html.includes(`property="og:url" content="${url}"`));
  const head=html.split('</head>')[0];assert.match(head,/src="\/scripts\/tracking-config\.js/);assert.match(head,/src="\/scripts\/tracking\.js/);
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  assert(schemas.some(s=>s['@type']==='WebPage'&&s.url===url));
  if(file!=='index.html')assert(schemas.some(s=>s['@type']==='BreadcrumbList'));
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'duplicate IDs');
  assert.doesNotMatch(html,/>[^<]*(?:試作ページ|公開用の方針は確認中|試作での送信)[^<]*</);
 });
 test(`${file}: resources and local anchor destinations exist`,()=>{
  const html=read(file),base=site+'/'+file;
  for(const ref of referenced(html)){
   if(/^(?:data:|mailto:|tel:|javascript:)/.test(ref))continue;
   const url=new URL(ref,base);if(url.origin!==site)continue;
   const target=fileFor(url);assert(existsSync(new URL(target,root)),`${file}: ${ref}`);
   if(url.hash&&target.endsWith('.html')){
    const id=decodeURIComponent(url.hash.slice(1));assert(read(target).includes(`id="${id}"`)||read(target).includes(`name="${id}"`),`${file}: missing ${ref}`);
   }
  }
  for(const a of html.matchAll(/<a\b[^>]*href="([^"]+)"/g))assert(!new URL(a[1],base).pathname.match(/^\/redesign\/.*\.html$/),`production navigation leads to preview: ${a[1]}`);
 });
}
test('symptom hub keeps every previously published condition reachable',()=>{
 const hub=read('symptoms/index.html');
 for(const f of readdirSync(new URL('symptoms/',root)).filter(f=>f.endsWith('.html')&&f!=='index.html'))assert(hub.includes(`/symptoms/${f}`),f);
});
test('canonical sitemap includes published service pages and excludes previews',()=>{
 const xml=read('sitemap.xml');for(const file of pages)assert(xml.includes(`<loc>${site}/${file.replace(/index\.html$/,'')}</loc>`),file);
 assert.doesNotMatch(xml,/\/redesign\//);
 const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(new Set(urls).size,urls.length);
});
test('authored pages survive the blog generator ownership gate',()=>{
 const generator=read('scripts/build-blog.mjs');assert.match(generator,/if \(html.includes\('data-site-layout="redesign-v1"'\).*?continue;/);
 assert.match(generator,/if \(html.includes\('data-site-layout="redesign-v1"'\)\) return;/);
 assert.match(read('symptoms/knee-osteoarthritis.html'),/data-content-owner="author"/);
});
test('LINE and phone destinations retain the approved contact details',()=>{
 for(const file of pages.filter(f=>f!=='privacy.html')){const html=read(file);assert(html.includes('https://lin.ee/X01F2mP'));assert(html.includes('tel:0471143274'));}
});
test('production symptom illustrations and safety sections are retained',()=>{
 for(const file of pages.filter(f=>f.startsWith('symptoms/')&&f!=='symptoms/index.html')){
  const html=read(file);assert.match(html,/<picture\b/);assert.match(html,/<details\b/);assert.match(html,/受診/);assert.match(html,/医療機関/);
  if(/sciatica|spinal-stenosis|hip-osteoarthritis/.test(file))assert.match(html,/(?:参考|出典)/);
 }
 assert(read('symptoms/sciatica.html').includes('ダブルクラッシュ症候群'));
 assert(read('symptoms/spinal-stenosis.html').includes('なぜ腰を反ってしまうのか'));
});
function formHarness(response, values={}){
 const fields={};for(const key of ['name','email','phone','message','consent'])fields[`contact-${key}`]={value:{name:'テスト',email:'patient@example.test',phone:'',message:'相談内容',...values}[key]||'',checked:key==='consent',attributes:{},setAttribute(k,v){this.attributes[k]=v},focus(){this.focused=true}};
 for(const key of ['name','email','phone','message','consent'])fields[`contact-${key}-error`]={textContent:''};
 const status={textContent:''},button={disabled:false,setAttribute(){},removeAttribute(){}};let handler,reset=false,calls=[];
 const form={querySelector:()=>button,addEventListener:(_,fn)=>{handler=fn},reset:()=>{reset=true}};
 const document={getElementById:id=>id==='site-contact-form'?form:id==='contact-form-status'?status:fields[id]};
 vm.runInNewContext(read('scripts/site-contact.js'),{document,URLSearchParams,fetch:async(url,request)=>{calls.push({url,request});if(response instanceof Error)throw response;return {ok:response.httpOk!==false,headers:{get:()=>response.contentType||'application/json'},json:async()=>response.payload}}});
 return {submit:()=>handler({preventDefault(){}}),fields,status,button,calls,get reset(){return reset}};
}
test('contact validation blocks bad email and leaves patient data unsent',async()=>{
 const h=formHarness({payload:{ok:true,status:'success'}},{email:'invalid'});await h.submit();assert.equal(h.calls.length,0);assert.equal(h.reset,false);assert.equal(h.fields['contact-email'].attributes['aria-invalid'],'true');assert(h.fields['contact-email'].focused);
});
test('contact consent is required before sending',async()=>{
 const h=formHarness({payload:{ok:true,status:'success'}});h.fields['contact-consent'].checked=false;await h.submit();assert.equal(h.calls.length,0);
});
test('email-only enquiry matches deployed name/phone/message contract',async()=>{
 const h=formHarness({payload:{ok:true,status:'success'}});await h.submit();assert.equal(h.calls.length,1);const data=new URLSearchParams(h.calls[0].request.body);assert.equal(data.get('phone'),'未記入（メールで返信）');assert.equal(data.get('message'),'返信先メール：patient@example.test\n\n相談内容');assert.equal(h.reset,true);assert.equal(h.button.disabled,false);
});
test('network, backend, and unexpected responses retain input and provide a fallback',async()=>{
 for(const response of [new Error('offline'),{httpOk:false,payload:{ok:false,status:'error'}},{payload:{ok:false,status:'error'}},{contentType:'text/html',payload:null},{payload:{ok:true}}]){
  const h=formHarness(response);await h.submit();assert.equal(h.reset,false);assert.equal(h.button.disabled,false);assert.match(h.status.textContent,/LINEまたは電話/);
 }
});
test('repeated submission is ignored while a request is in progress',async()=>{
 const h=formHarness({payload:{ok:true,status:'success'}});const first=h.submit();await h.submit();await first;assert.equal(h.calls.length,1);
});
test('preview form remains disabled and is separate from production form',()=>{
 assert.match(read('redesign/contact-form.js'),/const PREVIEW_ONLY = true/);assert.doesNotMatch(read('scripts/site-contact.js'),/PREVIEW_ONLY|試作ページ/);assert.match(read('index.html'),/id="site-contact-form"/);
});
