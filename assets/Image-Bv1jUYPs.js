import{d as D,b as F,e as S,r as p,o as a,f as o,g as l,n as E,h as H,w as d,u as c,D as h,c as w,a as r,i as N,m as R,F as U,p as V,j as L,k as P,v as z,_ as A}from"./index-DXR9EW3n.js";import{T as O}from"./TypicalTextStandalone.vue_vue_type_style_index_0_scoped_e12cd1ae_lang-Ce7sREvd.js";const _=s=>(V("data-v-7c65a325"),s=s(),L(),s),X={class:"image-wrapper",contenteditable:"false"},$={key:0,class:"image-menu"},q=_(()=>l("div",{class:"tooltip"},"Toggle caption ",-1)),G=_(()=>l("div",{class:"tooltip"},"Replace image",-1)),J=["src"],K={key:2,class:"image-upload"},M=["src"],Q=_(()=>l("span",null,"Click to select a new image",-1)),W=["accept"],Y=D({__name:"Image",props:{element:{},index:{},editable:{type:Boolean}},setup(s){const e=s,k=F(),g=S(()=>e.element.use_text),y=["image/png","image/gif","image/jpeg"];e.element&&(e.element.use_text=e.element?.additional_data?.use_caption??!0);const b=()=>{e.element.use_text=!e.element.use_text,e.element.additional_data.use_caption=!e.element.additional_data.use_caption,g.value&&P(()=>{e.element.focus()})},I=t=>{e.element.additional_data||(e.element.additional_data={}),e.element.additional_data.url=t},x=()=>{e.element.additional_data||(e.element.additional_data={}),e.element.additional_data.url=null},f=p(),C=()=>{f.value.click()},u=p(!1),n=p(),T=e.element.schema.uploadHandler,B=async t=>{try{u.value=!0;const i=t.target.files[0];n.value=URL.createObjectURL(i);const m=await T(i),v=new Image;if(v.src=m,await new Promise(j=>{v.onload=()=>{j(!0)}}),n.value=null,typeof m=="string")I(m);else throw new Error("The return type of the uploadHandler must be a string")}catch(i){console.error("Error uploading imoge",i)}finally{u.value=!1}};return(t,i)=>(a(),o(U,null,[l("div",X,[l("div",{class:E(["image-preview-overlay",{"image-preview-overlay-active":u.value}])},null,2),t.editable?(a(),o("div",$,[H(c(h),{"auto-width":"",position:"top",hover:""},{content:d(()=>[q]),default:d(()=>[l("div",{class:"image-menu-item",onClick:b},"T")]),_:1}),t.element.additional_data?.url?(a(),w(c(h),{key:0,"auto-width":"",position:"top",hover:""},{content:d(()=>[G]),default:d(()=>[l("div",{class:"image-menu-item",onClick:x},"X")]),_:1})):r("",!0)])):r("",!0),t.element.additional_data?.url?(a(),o("img",{key:1,class:"image",src:t.element.additional_data.url,draggable:"false"},null,8,J)):t.editable?(a(),o("div",K,[n.value?(a(),o("img",{key:0,class:"image-preview",src:n.value},null,8,M)):(a(),o("div",{key:1,class:"file-input",onClick:C},[Q,N(l("input",{type:"file",ref_key:"file_input_ref",ref:f,accept:y.join(", "),onInput:B},null,40,W),[[z,!1]])]))])):r("",!0)]),g.value?(a(),w(c(O),R({key:0,class:"m-t-10",editable:t.editable,text:t.element.text},c(k)),null,16,["editable","text"])):r("",!0)],64))}}),te=A(Y,[["__scopeId","data-v-7c65a325"]]);export{te as default};