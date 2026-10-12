import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronRight, Clock3, MapPin, Navigation2, ShieldCheck, UserRound, X, Camera, Save, Loader2 } from 'lucide-react';
import { AppScreen } from '../types';
import { useAuth } from '../lib/authContext';

interface CitizenProfileDrawerProps { isOpen:boolean; onClose:()=>void; onTransition:(screen:AppScreen)=>void; citizenName:string; citizenAddress:string; showNotification:(message:string)=>void; }

export default function CitizenProfileDrawer({isOpen,onClose,onTransition,citizenName,citizenAddress,showNotification}:CitizenProfileDrawerProps){
  const { userProfile, updateUserProfile } = useAuth();
  const [history]=useState<any[]>(()=>{try{const parsed=JSON.parse(localStorage.getItem('punchx_order_history')||'[]');return Array.isArray(parsed)?parsed:[];}catch{return[];}});
  const activeOrder=useMemo(()=>{try{const raw=localStorage.getItem('punchx_active_order');return raw?JSON.parse(raw):null;}catch{return null;}},[]);
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(citizenName);
  const [phone,setPhone]=useState(userProfile?.phone||'');
  const [address,setAddress]=useState(citizenAddress);
  const [photoURL,setPhotoURL]=useState(userProfile?.photoURL||'');
  const [saving,setSaving]=useState(false);
  const [photoError,setPhotoError]=useState('');
  const photoInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{setName(citizenName||'');setPhone(userProfile?.phone||'');setAddress(citizenAddress||'');setPhotoURL(userProfile?.photoURL||'');},[citizenName,citizenAddress,userProfile]);
  const go=(screen:AppScreen)=>{onClose();onTransition(screen);};
  const handlePhoto=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file)return;
    setPhotoError('');
    if(!file.type.startsWith('image/')){setPhotoError('Choose an image file.');return;}
    if(file.size>8*1024*1024){setPhotoError('Photo must be smaller than 8 MB.');return;}
    try{
      const source=await new Promise<HTMLImageElement>((resolve,reject)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read image'));};img.src=url;});
      const canvas=document.createElement('canvas');const scale=Math.min(1,512/Math.max(source.width,source.height));canvas.width=Math.round(source.width*scale);canvas.height=Math.round(source.height*scale);
      const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Image processing is unavailable.');
      ctx.drawImage(source,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/jpeg',0.78);
      if(data.length>650000){setPhotoError('This photo could not be compressed enough. Choose a smaller image.');return;}
      setPhotoURL(data);
    }catch{setPhotoError('Could not process that photo. Please try another image.');}
    e.target.value='';
  };
  const saveProfile=async()=>{
    if(name.trim().length<2){showNotification('Please enter your full name.');return;}
    if(address.trim().length>0&&address.trim().length<5){showNotification('Please enter a more complete address.');return;}
    setSaving(true);
    try{
      const updates:any={name:name.trim(),phone:phone.trim(),address:address.trim(),photoURL};
      await updateUserProfile(updates);
      try{localStorage.setItem('punchx_user_name',name.trim());localStorage.setItem('punchx_user_address',address.trim());}catch{}
      setEditing(false);showNotification('Your profile has been updated.');
    }catch{showNotification('Could not save your profile. Please try again.');}
    finally{setSaving(false);}
  };
  return <AnimatePresence>{isOpen&&<div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6">
    <motion.button aria-label="Close profile" className="absolute inset-0 bg-black/45 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/>
    <motion.section role="dialog" aria-modal="true" aria-label="PunchX citizen profile" initial={{opacity:0,scale:.94,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.94,y:16}} transition={{type:'spring',stiffness:320,damping:30}} className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_25px_100px_rgba(17,18,25,.30)] ring-1 ring-black/10">
      <div className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-4"><div><div className="text-[10px] font-black uppercase tracking-[.16em] text-[#7358d7]">Citizen account</div><h2 className="mt-0.5 text-lg font-black">Your PUNCHX profile</h2></div><div className="flex items-center gap-2">{!editing&&<button onClick={()=>setEditing(true)} className="rounded-xl bg-[#f0ecff] px-3 py-2 text-xs font-extrabold text-[#5b45c7]">Edit profile</button>}<button onClick={onClose} className="rounded-full bg-[#f3f4f6] p-2" aria-label="Close"><X className="h-5 w-5"/></button></div></div>
      <div className="max-h-[78vh] space-y-4 overflow-y-auto p-5">
        <section className="rounded-3xl bg-[#f2efff] p-4"><div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#17191d] text-white">{photoURL?<img src={photoURL} alt="Your profile" className="h-full w-full object-cover"/>:<UserRound className="h-7 w-7"/>}{editing&&<button onClick={()=>photoInput.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/45" aria-label="Upload profile photo"><Camera className="h-5 w-5"/></button>}</div>
          <input ref={photoInput} type="file" accept="image/*" onChange={handlePhoto} className="hidden"/>
          <div className="min-w-0 flex-1">{editing?<><label className="block text-[10px] font-bold text-[#737781]">Full name</label><input value={name} onChange={e=>setName(e.target.value)} maxLength={100} className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-[#7358d7]" placeholder="Your full name"/></>:<h3 className="truncate text-base font-black">{citizenName||'PUNCHX Citizen'}</h3>}
          <p className="mt-1 flex items-center gap-1 text-[10px] text-[#7e828d]"><MapPin className="h-3.5 w-3.5 shrink-0"/><span className="truncate">{citizenAddress||'Residential address not set'}</span></p></div><span className="rounded-full bg-white px-2 py-1 text-[8px] font-black text-[#5b45c7] ring-1 ring-[#7358d7]/10"><ShieldCheck className="mr-1 inline h-3 w-3"/>ACCOUNT</span>
        </div>{editing&&<><button onClick={()=>photoInput.current?.click()} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-[#5b45c7] ring-1 ring-[#7358d7]/20"><Camera className="h-4 w-4"/>Add / change photo</button>{photoError&&<p className="mt-2 text-xs font-semibold text-rose-600">{photoError}</p>}</>}</section>
        {editing&&<section className="space-y-3 rounded-2xl border border-black/5 p-4"><label className="block text-xs font-bold text-[#656a75]">Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} maxLength={30} className="mt-1 block w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-[#17191d] outline-none focus:border-[#7358d7]" placeholder="Phone number"/></label><label className="block text-xs font-bold text-[#656a75]">Home / service address<textarea value={address} onChange={e=>setAddress(e.target.value)} maxLength={500} rows={3} className="mt-1 block w-full resize-y rounded-xl border border-black/10 px-3 py-2.5 text-sm text-[#17191d] outline-none focus:border-[#7358d7]" placeholder="Enter your address"/></label><p className="text-[10px] leading-4 text-[#858a93]">Your changes are saved to your PunchX account. Location permission is managed by your browser/device.</p><div className="flex gap-2"><button disabled={saving} onClick={()=>{setEditing(false);setName(citizenName||'');setPhone(userProfile?.phone||'');setAddress(citizenAddress||'');setPhotoURL(userProfile?.photoURL||'');setPhotoError('');}} className="flex-1 rounded-xl bg-[#f4f5f7] px-3 py-3 text-xs font-extrabold">Cancel</button><button disabled={saving} onClick={saveProfile} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#7358d7] px-3 py-3 text-xs font-extrabold text-white disabled:opacity-60">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Saving…':'Save changes'}</button></div></section>}
        {activeOrder?.id&&<section className="rounded-3xl bg-[#17191d] p-4 text-white"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.14em] text-[#b9adff]"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"/>Active service</span><span className="text-[10px] text-white/45">{activeOrder.status||'Processing'}</span></div><h3 className="mt-3 text-base font-black">{activeOrder.category||'Home service'}</h3><p className="mt-1 text-xs text-white/55">{activeOrder.workerName||'Professional assignment pending'}</p><button onClick={()=>go('tracking')} className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#17191d]">Open live tracking <Navigation2 className="h-4 w-4"/></button></section>}
        <section className="grid grid-cols-2 gap-2.5"><button onClick={()=>go('providers')} className="rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm ring-1 ring-black/5"><CalendarDays className="h-5 w-5 text-[#7358d7]"/><div className="mt-3 text-sm font-black">Book service</div><div className="mt-1 text-[10px] text-[#8b8f98]">Browse all services</div></button><button onClick={()=>go('tracking')} className="rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm ring-1 ring-black/5"><Navigation2 className="h-5 w-5 text-[#7358d7]"/><div className="mt-3 text-sm font-black">Track service</div><div className="mt-1 text-[10px] text-[#8b8f98]">Open your active job</div></button></section>
        <section className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><div className="text-[10px] font-black uppercase tracking-[.14em] text-[#9296a0]">Order activity</div><div className="mt-1 text-lg font-black">{history.length}</div><div className="text-[10px] text-[#8b8f98]">saved service records</div></div><Clock3 className="h-7 w-7 text-[#7358d7]"/></div><button onClick={()=>showNotification('Your service history is available from the booking records shown in PUNCHX.')} className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#f6f6f8] px-3 py-2.5 text-[10px] font-black text-[#4c5058]">View activity details <ChevronRight className="h-4 w-4"/></button></section>
        <div className="rounded-2xl bg-[#f7f8fa] p-3 text-[10px] leading-5 text-[#7b808a]">Automatic GPS works when location permission is allowed by your browser and device. You can manage that permission in device settings.</div>
      </div>
    </motion.section>
  </div>}</AnimatePresence>;
}
