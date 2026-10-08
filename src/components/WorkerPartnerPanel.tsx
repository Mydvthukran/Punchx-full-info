import React, { useMemo, useState } from 'react';
import { Home, Wallet, ClipboardList, UserRound, Bell, Settings, LogOut, Menu, X, MapPin, Phone, Navigation, CheckCircle2, Clock3, CircleAlert, TrendingUp, CalendarDays, Star, ShieldCheck, Gift, LifeBuoy, ChevronRight, Search, Banknote, BriefcaseBusiness, Zap, MoreHorizontal, SlidersHorizontal, Route, MessageCircle, GraduationCap, Plus } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import './worker-partner-panel.css';

type Tab = 'home'|'orders'|'schedule'|'earnings'|'performance'|'training'|'inventory'|'profile'|'notifications'|'incentives'|'support'|'settings';
type Status = 'NEW'|'ACCEPTED'|'TRAVELLING'|'ARRIVED'|'SERVICE_STARTED'|'COMPLETED'|'CANCELLED';
type Order = { id:string; customer:string; service:string; address:string; distance:number; time:string; date:string; duration:string; price:number; earning:number; status:Status; payment:string; avatar:string };

const seed:Order[] = [
 {id:'PX10245',customer:'Amit Sharma',service:'AC Repair',address:'Salt Lake, Kolkata',distance:3.2,time:'3:30 PM',date:'Today',duration:'1h 30m',price:600,earning:450,status:'NEW',payment:'Paid',avatar:'AS'},
 {id:'PX10246',customer:'Rahul Sen',service:'Plumbing Repair',address:'New Town, Kolkata',distance:5.1,time:'5:00 PM',date:'Today',duration:'1h',price:500,earning:350,status:'ACCEPTED',payment:'Paid',avatar:'RS'},
 {id:'PX10247',customer:'Priya Roy',service:'Home Cleaning',address:'Rajarhat, Kolkata',distance:7.4,time:'7:00 PM',date:'Today',duration:'2h',price:800,earning:600,status:'COMPLETED',payment:'Paid',avatar:'PR'},
 {id:'PX10248',customer:'Sneha Das',service:'Electrical Repair',address:'Bidhannagar, Kolkata',distance:4.3,time:'10:00 AM',date:'Tomorrow',duration:'1h',price:450,earning:300,status:'NEW',payment:'Pending',avatar:'SD'}
];

const next:Record<Status,Status|null> = {NEW:'ACCEPTED',ACCEPTED:'TRAVELLING',TRAVELLING:'ARRIVED',ARRIVED:'SERVICE_STARTED',SERVICE_STARTED:'COMPLETED',COMPLETED:null,CANCELLED:null};
const labels:Record<Status,string> = {NEW:'New',ACCEPTED:'Accepted',TRAVELLING:'Travelling',ARRIVED:'Arrived',SERVICE_STARTED:'Service started',COMPLETED:'Completed',CANCELLED:'Cancelled'};
const week=[1200,1850,900,2100,1650,2450,1300];

const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);

export default function WorkerPartnerPanel({onTransition,showNotification}:{onTransition?:(s:any)=>void;showNotification?:(m:string)=>void}) {
 const {userProfile}=useAuth() as any;
 const [tab,setTab]=useState<Tab>('home');
 const [online,setOnline]=useState(true);
 const [orders,setOrders]=useState(seed);
 const [selected,setSelected]=useState<Order|null>(null);
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState('ALL');
 const [mobile,setMobile]=useState(false);
 const [withdraw,setWithdraw]=useState(false);
 const name=userProfile?.name||'Rahul Das';
 const today=orders.filter(function(o){return o.date==='Today'});
 const completed=today.filter(function(o){return o.status==='COMPLETED'}).length;
 const pending=today.filter(function(o){return o.status!=='COMPLETED'&&o.status!=='CANCELLED'}).length;
 const cancelled=today.filter(function(o){return o.status==='CANCELLED'}).length;
 const todayEarn=today.filter(function(o){return o.status==='COMPLETED'}).reduce(function(s,o){return s+o.earning},0);
 const filtered=useMemo(function(){return orders.filter(function(o){return (filter==='ALL'||o.status===filter)&&(o.id+' '+o.customer+' '+o.service+' '+o.address).toLowerCase().includes(query.toLowerCase())})},[orders,filter,query]);
 const nav=function(t:Tab){setTab(t);setSelected(null);setMobile(false)};
 const advance=function(o:Order){var n=next[o.status];if(!n)return;setOrders(function(xs){return xs.map(function(x){return x.id===o.id?Object.assign({},x,{status:n}):x})});showNotification?.(n==='COMPLETED'?'✓ Order '+o.id+' completed. '+money(o.earning)+' added to earnings.':'Order '+o.id+': '+labels[n])};
 const action=function(s:Status){return s==='NEW'?'Accept order':s==='ACCEPTED'?'Start travel':s==='TRAVELLING'?'Arrived':s==='ARRIVED'?'Start service':'Complete order'};
 const menu=[['home','Home',Home],['orders','Orders',ClipboardList],['schedule','Schedule',CalendarDays],['earnings','Earnings',Wallet],['performance','Performance',TrendingUp],['training','Training',ShieldCheck],['inventory','Inventory',BriefcaseBusiness],['profile','Profile',UserRound],['notifications','Notifications',Bell],['incentives','Incentives',Gift],['support','Support',LifeBuoy],['settings','Settings',Settings]] as any[];

 return <div className="wx-app">
  <aside className={'wx-sidebar '+(mobile?'open':'')}>
   <div className="wx-brand"><div className="wx-logo">P</div><div><b>PunchX</b><span>PARTNER PANEL</span></div><button className="wx-close" onClick={()=>setMobile(false)}><X/></button></div>
   <div className="wx-worker-mini"><div className="wx-avatar">RD</div><div><b>{name}</b><span>PX-WKR-1042</span></div><i className={online?'online':''}></i></div>
   <div className="wx-demo">DEMO MODE <span>API READY</span></div>
   <nav>{menu.map(function(m:any){var I=m[2];return <button key={m[0]} className={tab===m[0]?'active':''} onClick={()=>nav(m[0])}><I size={19}/><span>{m[1]}</span>{m[0]==='notifications'&&<em>3</em>}</button>})}</nav>
   <button className="wx-logout" onClick={()=>onTransition?.('panel-select')}><LogOut size={18}/> Logout</button>
  </aside>
  <div className="wx-main">
   <header className="wx-header"><button className="wx-menu" onClick={()=>setMobile(true)}><Menu/></button><div><span className="wx-eyebrow">PUNCHX / PARTNER OPERATIONS</span><h1>{tab==='home'?'Good evening, '+name+' 👋':menu.find(function(m:any){return m[0]===tab})?.[1]}</h1></div><div className="wx-head-actions"><button className={'wx-status '+(online?'is-online':'')} onClick={()=>{setOnline(!online);showNotification?.(online?'You are now offline':'You are now online and eligible for new orders')}}><i></i>{online?'ONLINE':'OFFLINE'}</button><button className="wx-bell" onClick={()=>nav('notifications')}><Bell size={20}/><b>3</b></button><button className="wx-profile-chip" onClick={()=>nav('profile')}><span>RD</span><strong>{name}</strong><ChevronRight size={15}/></button></div></header>
   <main className="wx-content">
    {tab==='home'&&<HomeView online={online} today={today} completed={completed} pending={pending} cancelled={cancelled} todayEarn={todayEarn} orders={orders} open={setSelected} advance={advance} action={action} nav={nav}/>}
    {tab==='orders'&&<OrdersView filtered={filtered} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} onOpen={setSelected}/>}
    {tab==='schedule'&&<ScheduleView/>}{tab==='earnings'&&<EarningsView todayEarn={todayEarn} onWithdraw={()=>setWithdraw(true)}/>} {tab==='performance'&&<PerformanceView/>}{tab==='training'&&<TrainingView/>}{tab==='inventory'&&<InventoryView/>}
    {tab==='profile'&&<ProfileView/>}
    {tab==='notifications'&&<NotificationsView/>}
    {tab==='incentives'&&<IncentivesView/>}
    {tab==='support'&&<SupportView/>}
    {tab==='settings'&&<SettingsView online={online} setOnline={setOnline}/>}
   </main>
   <footer className="wx-mobile-nav">{menu.slice(0,5).map(function(m:any){var I=m[2];return <button key={m[0]} className={tab===m[0]?'active':''} onClick={()=>nav(m[0])}><I size={19}/><span>{m[1]}</span></button>})}</footer>
  </div>
  {selected&&<OrderModal order={selected} close={()=>setSelected(null)} advance={()=>advance(selected)} action={action(selected.status)}/>}
  {withdraw&&<div className="wx-overlay"><div className="wx-modal wx-small"><button className="wx-modal-x" onClick={()=>setWithdraw(false)}><X/></button><div className="wx-modal-icon"><Banknote/></div><h2>Request withdrawal</h2><p>Available balance</p><strong className="wx-modal-money">{money(35750)}</strong><label>Amount<input defaultValue="35750" type="number" min="1" max="35750"/></label><button className="wx-primary" onClick={()=>{setWithdraw(false);showNotification?.('Withdrawal request submitted successfully.')}}>Request withdrawal</button></div></div>}
 </div>
}

function Stat(p:any){return <div className="wx-stat"><div className="wx-icon"><p.icon size={18}/></div><div><span>{p.label}</span><strong>{p.value}</strong>{p.trend&&<small>{p.trend}</small>}</div></div>}

function HomeView(p:any){
 var active=p.today.find(function(o:Order){return o.status!=='COMPLETED'&&o.status!=='CANCELLED'});
 return <div className="wx-stack">
  <div className="wx-hero"><div><span className="wx-pill"><i></i>{p.online?'Ready for orders':'Offline'}</span><h2>{p.online?'You’re online and ready for today’s work.':'You’re currently offline.'}</h2><p>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · Kolkata service area</p></div><div className="wx-hero-earn"><span>Today’s earnings</span><strong>{money(p.todayEarn)}</strong><small>+12.4% vs last week</small></div></div>
  <div className="wx-stats"><Stat label="Today’s orders" value={p.today.length} icon={ClipboardList} trend="+2 today"/><Stat label="Completed" value={p.completed} icon={CheckCircle2}/><Stat label="Pending" value={p.pending} icon={Clock3}/><Stat label="Cancelled" value={p.cancelled} icon={CircleAlert}/><Stat label="Working hours" value="6h 25m" icon={BriefcaseBusiness}/><Stat label="Avg. order" value={money(412)} icon={TrendingUp}/></div>
  <div className="wx-grid-main">
   <section className="wx-card wx-active-card"><div className="wx-card-head"><div><span className="wx-section-label">PRIORITY</span><h3>Active order</h3></div>{active&&<span className={'wx-badge '+active.status.toLowerCase()}>{labels[active.status]}</span>}</div>{active?<OrderCompact order={active} open={()=>p.open(active)} advance={()=>p.advance(active)} action={p.action(active.status)}/>:<div className="wx-empty"><CheckCircle2 size={32}/><b>No active orders</b><span>You’re all caught up. Check upcoming bookings for your next visit.</span><button onClick={()=>p.nav('orders')}>View orders <ChevronRight size={15}/></button></div>}</section>
   <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">PERFORMANCE</span><h3>Performance score</h3></div><span className="wx-score-number">92/100</span></div><div className="wx-score-row"><div className="wx-ring"><strong>92</strong><span>Excellent</span></div><div><p>Keep response and arrival times high to unlock peak-hour incentives.</p><div className="wx-progress-row"><span>Completion</span><b>95%</b><div><i style={{width:'95%'}}/></div></div><div className="wx-progress-row"><span>On-time arrival</span><b>91%</b><div><i style={{width:'91%'}}/></div></div></div></div></section>
  </div>
  <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">SCHEDULE</span><h3>Today’s orders</h3></div><button className="wx-link" onClick={()=>p.nav('orders')}>View all <ChevronRight size={14}/></button></div><div className="wx-timeline">{p.orders.filter(function(o:Order){return o.date==='Today'}).map(function(o:Order){return <button className="wx-time-row" key={o.id} onClick={()=>p.open(o)}><time>{o.time}</time><span className={'wx-dot '+o.status.toLowerCase()}></span><div><b>{o.service}</b><small>{o.customer} · {o.address}</small></div><strong>{money(o.earning)}</strong><span className={'wx-mini-status '+o.status.toLowerCase()}>{labels[o.status]}</span><ChevronRight size={15}/></button>})}</div></section>
  <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">UPCOMING</span><h3>Next bookings</h3></div><CalendarDays size={19}/></div>{p.orders.filter(function(o:Order){return o.date!=='Today'}).map(function(o:Order){return <button className="wx-upcoming-row" key={o.id} onClick={()=>p.open(o)}><div className="wx-date-box"><b>{o.time.split(' ')[0]}</b><span>{o.time.split(' ')[1]}</span></div><div><b>{o.service}</b><span>{o.customer} · {o.address}</span></div><strong>{money(o.earning)}</strong><ChevronRight size={15}/></button>})}</section>
  <section className="wx-quick"><button onClick={()=>p.nav('orders')}><ClipboardList/><b>Manage orders</b><span>Accept & complete jobs</span></button><button onClick={()=>p.nav('earnings')}><Wallet/><b>View earnings</b><span>Track your income</span></button><button onClick={()=>p.nav('profile')}><UserRound/><b>Update profile</b><span>Keep details current</span></button><button onClick={()=>p.nav('support')}><LifeBuoy/><b>Get support</b><span>Need help?</span></button></section>
 </div>
}

function OrderCompact(p:any){var o=p.order;return <div className="wx-order-focus"><div className="wx-customer"><div className="wx-avatar large">{o.avatar}</div><div><span>ORDER #{o.id}</span><h4>{o.customer}</h4><p>{o.service} · {o.duration}</p></div><button className="wx-icon-btn" onClick={p.open}><MoreHorizontal/></button></div><div className="wx-order-facts"><div><MapPin/><span>Location</span><b>{o.address}</b><small>{o.distance} km away</small></div><div><Clock3/><span>Booking</span><b>{o.date} · {o.time}</b><small>Estimated {o.duration}</small></div><div><Banknote/><span>Your earning</span><b>{money(o.earning)}</b><small>{o.payment}</small></div></div><div className="wx-order-actions"><button className="wx-secondary" onClick={p.open}>View details</button><button className="wx-primary" onClick={p.advance}>{p.action}<ChevronRight size={16}/></button></div></div>}

function OrdersView({filtered,filter,setFilter,query,setQuery,onOpen}:any){
  const tabs=['ALL','NEW','ACCEPTED','TRAVELLING','ARRIVED','SERVICE_STARTED','COMPLETED','CANCELLED'];
  return <div className="wx-stack">
    <div className="wx-page-intro"><div><span className="wx-section-label">WORK QUEUE</span><h2>Orders</h2><p>Manage every booking from assignment to completion.</p></div><button className="wx-primary"><SlidersHorizontal size={16}/> Filters</button></div>
    <div className="wx-toolbar"><div className="wx-search"><Search size={17}/><input placeholder="Search order, customer or service…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="wx-tabs">{tabs.map(t=><button className={filter===t?'active':''} key={t} onClick={()=>setFilter(t)}>{t==='ALL'?'All':statusLabel[t]||t.replace('_',' ')}</button>)}</div></div>
    <section className="wx-card wx-table-card"><div className="wx-table-head"><span>Order</span><span>Customer / service</span><span>Schedule</span><span>Amount</span><span>Status</span><span></span></div>
      {filtered.map((o:any)=><button className="wx-table-row" key={o.id} onClick={()=>onOpen(o)}><b>#{o.id}</b><div><strong>{o.customer}</strong><span>{o.service}</span></div><div><strong>{o.date}</strong><span>{o.time} · {o.distance} km</span></div><div><strong>{money(o.earning)}</strong><span>{o.payment}</span></div><span className={'wx-badge '+o.status.toLowerCase()}>{statusLabel[o.status]}</span><ChevronRight size={17}/></button>)}
      {!filtered.length&&<div className="wx-empty"><Search/><b>No orders found</b><span>Try another filter or search.</span></div>}
    </section>
  </div>;
}

function EarningsView({todayEarn,onWithdraw}:{todayEarn:number;onWithdraw:()=>void}){
  const values=[1200,1850,900,2100,1650,2450,1300];
  const total=values.reduce((a,b)=>a+b,0);
  return <div className="wx-stack">
    <div className="wx-page-intro"><div><span className="wx-section-label">FINANCIALS</span><h2>My earnings</h2><p>Track payouts, bonuses, platform charges and withdrawals.</p></div><button className="wx-primary" onClick={onWithdraw}><Banknote size={16}/> Withdraw</button></div>
    <div className="wx-stats"><Stat label="Today" value={money(todayEarn)} icon={Banknote}/><Stat label="This week" value={money(total)} icon={TrendingUp}/><Stat label="This month" value={money(47750)} icon={CalendarDays}/><Stat label="Total earnings" value={money(182450)} icon={Wallet}/><Stat label="Pending" value={money(2500)} icon={Clock3}/><Stat label="Available" value={money(35750)} icon={CheckCircle2}/></div>
    <div className="wx-grid-main">
      <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">LAST 7 DAYS</span><h3>Daily earnings</h3></div><span className="wx-trend">↗ 14.8%</span></div><div className="wx-bars">{values.map((v,i)=><div className="wx-bar-col" key={i}><div className="wx-bar" style={{height:Math.max(8,(v/Math.max(...values))*100)+'%'}} title={money(v)}></div><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small></div>)}</div></section>
      <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">PAYOUT BREAKDOWN</span><h3>Transparent calculation</h3></div></div><div className="wx-breakdown"><span>Gross service earnings <b>{money(42500)}</b></span><span>Visiting fees <b>{money(6000)}</b></span><span>Bonuses & incentives <b>{money(4000)}</b></span><span>Platform charges <b>-{money(4250)}</b></span><span>Adjustments <b>-{money(500)}</b></span><strong>Net earnings <b>{money(47750)}</b></strong></div></section>
    </div>
    <section className="wx-card wx-payout"><div><span className="wx-section-label">PAYMENT & WITHDRAWAL</span><h3>Available balance</h3><strong>{money(35750)}</strong><p>Last payout: 05 Oct 2026 · XXXX XXXX 4521</p></div><button className="wx-primary" onClick={onWithdraw}>Request withdrawal</button></section>
  </div>;
}

function ScheduleView(){
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">WORK CALENDAR</span><h2>Schedule & availability</h2><p>Control when PunchX can send you jobs.</p></div><button className="wx-primary"><CalendarDays size={16}/> Edit availability</button></div>
    <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">WEEKLY HOURS</span><h3>Working windows</h3></div><span className="wx-badge completed">Active</span></div><div className="wx-hours">{days.map((d,i)=><div key={d}><b>{d}</b><span>{i===6?'10:00 AM – 4:00 PM':'09:00 AM – 08:00 PM'}</span><i className={i===6?'off':''}></i></div>)}</div></section>
    <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">FIELD CONTROLS</span><h3>Work preferences</h3></div></div><div className="wx-control-grid"><button><Clock3/><b>Breaks</b><span>Set unavailable periods</span></button><button><Route/><b>Service radius</b><span>Manage job distance</span></button><button><CalendarDays/><b>Time off</b><span>Request a day off</span></button><button><CircleAlert/><b>Emergency pass</b><span>Handle emergencies</span></button></div></section>
  </div>;
}
function PerformanceView(){
  return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">QUALITY SCORE</span><h2>Performance & growth</h2><p>See the metrics that influence professional level and job opportunities.</p></div></div>
    <div className="wx-stats"><Stat label="Customer rating" value="4.8 / 5" icon={Star}/><Stat label="Completion rate" value="95%" icon={CheckCircle2}/><Stat label="On-time arrival" value="91%" icon={Timer}/><Stat label="Response rate" value="98%" icon={MessageCircle}/><Stat label="Repeat customers" value="34%" icon={UserRound}/><Stat label="Partner level" value="Gold" icon={ShieldCheck}/></div>
    <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">QUALITY BREAKDOWN</span><h3>Customer experience</h3></div><Star/></div><div className="wx-rating-bars">{[['Professionalism',94],['Quality of work',92],['Punctuality',91],['Communication',96],['Cleanliness',89]].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}%</b><div><i style={{width:x[1]+'%'}}/></div></div>)}</div></section>
  </div>;
}
function TrainingView(){
  const courses=['Electrical safety','Material estimation','Before / after proof','Customer communication'];
  return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">SKILLS & CERTIFICATION</span><h2>Training center</h2><p>Improve service quality and unlock higher-value opportunities.</p></div></div>
    <section className="wx-card wx-incentive"><div className="wx-incentive-icon"><GraduationCap/></div><div className="wx-incentive-main"><span>RECOMMENDED</span><h3>Professional customer service</h3><p>15 minutes · 4 lessons · Certificate</p><div className="wx-big-progress"><i style={{width:'65%'}}></i></div><div><b>65% complete</b><span>Continue</span></div></div><button className="wx-primary">Continue</button></section>
    <div className="wx-incentive-grid">{courses.map(x=><section className="wx-card" key={x}><GraduationCap/><span>COURSE</span><h3>{x}</h3><p>Practical PunchX field training.</p><button className="wx-link">Start lesson <ChevronRight size={14}/></button></section>)}</div>
  </div>;
}
function InventoryView(){
  const items=['Multimeter','Screwdriver set','Tester','Safety gloves','Drill machine','Insulation tape'];
  return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">TOOLS & MATERIALS</span><h2>Inventory & work kit</h2><p>Keep essential tools ready for service visits.</p></div><button className="wx-primary"><Plus size={16}/> Add item</button></div>
    <section className="wx-card"><div className="wx-card-head"><div><span className="wx-section-label">MY KIT</span><h3>Equipment checklist</h3></div><Package/></div>{items.map((x,i)=><div className="wx-inventory-row" key={x}><Package/><div><b>{x}</b><span>{i<4?'Available in kit':'Check before next job'}</span></div><strong className={i<4?'good':''}>{i<4?'Available':'Check stock'}</strong><ChevronRight size={15}/></div>)}</section>
    <section className="wx-card"><h3>Material requests</h3><p className="wx-muted">For customer-approved additional materials, request them before purchase so costs stay transparent.</p><button className="wx-secondary"><Plus size={15}/> Create material request</button></section>
  </div>;
}
function ProfileView(){return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">PARTNER PROFILE</span><h2>My profile</h2><p>Professional identity, verification and availability.</p></div><button className="wx-primary">Edit profile</button></div><section className="wx-profile-hero wx-card"><div className="wx-avatar xl">RD</div><div><h2>Rahul Das</h2><p>Electrician · Partner ID PX-WKR-1042</p><div className="wx-profile-meta"><span><Star size={15} fill="currentColor"/> 4.8</span><span>1,248 orders</span><span>5+ years</span><span className="wx-verified"><ShieldCheck size={15}/> Verified Partner</span></div></div></section><div className="wx-grid-main"><section className="wx-card"><h3>Personal information</h3><div className="wx-form-grid">{['Full name','Phone number','Email','Address','City','PIN code'].map(function(x,i){return <label key={x}>{x}<input defaultValue={['Rahul Das','+91 98XXXXXX42','rahul@example.com','Salt Lake, Kolkata','Kolkata','700091'][i]}/></label>})}</div></section><section className="wx-card"><h3>Professional information</h3><div className="wx-detail-list"><span>Primary service <b>Electrician</b></span><span>Skills <b>Wiring, Repair, Installation</b></span><span>Experience <b>5+ years</b></span><span>Service radius <b>15 km</b></span><span>Languages <b>English, Hindi, Bengali</b></span><span>Verification <b className="wx-verified">Verified</b></span></div></section></div><section className="wx-card"><div className="wx-card-head"><h3>Documents & verification</h3><ShieldCheck/></div><div className="wx-docs">{['Aadhaar verification','PAN verification','Address proof','Skill certificate','Bank verification'].map(function(x,i){return <div key={x}><span>{x}</span><b className={i===4?'pending':''}>{i===4?'Pending':'Verified'}</b><small>•••• •••• 4521</small></div>})}</div></section><section className="wx-card"><div className="wx-card-head"><h3>Working hours</h3><Clock3/></div><div className="wx-hours">{['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(function(d,i){return <div key={d}><b>{d}</b><span>{i===6?'10:00 AM – 4:00 PM':'09:00 AM – 08:00 PM'}</span><i className={i===6?'off':''}></i></div>})}</div></section></div>}

function NotificationsView(){return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">UPDATES</span><h2>Notifications</h2><p>Orders, payments and partner announcements.</p></div><button className="wx-secondary">Mark all as read</button></div><section className="wx-card wx-notes">{[['New order assigned','AC Repair · PX10245 · 3.2 km away','2 min ago'],['Payment received','₹600 has been added to your earnings.','1 hour ago'],['Weekend incentive','Complete 10 orders to earn ₹500 bonus.','Today'],['Profile verification','Your skill certificate was verified.','Yesterday']].map(function(n,i){return <div className={i<2?'unread':''} key={n[0]}><div className="wx-note-icon">{i===0?<ClipboardList/>:i===1?<Banknote/>:i===2?<Gift/>:<ShieldCheck/>}</div><div><b>{n[0]}</b><p>{n[1]}</p><small>{n[2]}</small></div><ChevronRight/></div>})}</section></div>}
function IncentivesView(){return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">EARN MORE</span><h2>Incentives & bonuses</h2><p>Complete targets and unlock extra partner earnings.</p></div></div><section className="wx-card wx-incentive"><div className="wx-incentive-icon"><Gift/></div><div className="wx-incentive-main"><span>ACTIVE CAMPAIGN</span><h3>Complete 10 orders</h3><p>Earn an extra ₹500 this week.</p><div className="wx-big-progress"><i style={{width:'70%'}}/></div><div><b>7 / 10 orders</b><span>3 remaining</span></div></div><strong>₹500</strong></section><div className="wx-incentive-grid">{['Weekend Bonus','Peak Hour Bonus','High Rating Bonus','Monthly Target'].map(function(x,i){return <div className="wx-card" key={x}><Zap/><span>INCENTIVE</span><h3>{x}</h3><p>{i===0?'₹300':i===1?'₹150':i===2?'₹250':'₹1,000'} extra</p></div>})}</div></div>}
function SupportView(){return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">PARTNER CARE</span><h2>Help & support</h2><p>Order, payment, customer and technical support.</p></div><button className="wx-primary"><LifeBuoy size={16}/> Contact support</button></div><div className="wx-support-grid">{[['Order issue','Report an order problem',ClipboardList],['Payment issue','Missing or incorrect earnings',Banknote],['Customer report','Safety or customer concern',CircleAlert],['Technical issue','App or location problem',Settings],['Call support','Talk to PunchX support',Phone],['Emergency assistance','Urgent partner assistance',LifeBuoy]].map(function(x:any){var I=x[2];return <button className="wx-card wx-support-card" key={x[0]}><I/><div><b>{x[0]}</b><span>{x[1]}</span></div><ChevronRight/></button>})}</div></div>}
function SettingsView(p:any){return <div className="wx-stack"><div className="wx-page-intro"><div><span className="wx-section-label">CONTROL CENTER</span><h2>Settings</h2><p>Account, notifications, privacy and availability.</p></div></div>{['Account','Notifications','Privacy & location','App preferences','Account status'].map(function(x,i){return <section className="wx-card wx-setting" key={x}><div><b>{x}</b><span>{i===0?'Edit profile · Change password · Login security':i===1?'Order alerts · Payment alerts · Promotions':i===2?'Location permission · Data settings':i===3?'Language · Theme · Terms & Privacy':'Deactivate account · Logout'}</span></div>{i===2?<button className="wx-secondary">Manage</button>:i===4?<button className="wx-danger">Deactivate</button>:<ChevronRight/>}</section>})}<section className="wx-card wx-setting"><div><b>Availability</b><span>{p.online?'Online — eligible for new orders':'Offline — no new orders'}</span></div><button className={'wx-toggle-btn '+(p.online?'on':'')} onClick={()=>p.setOnline(!p.online)}>{p.online?'ONLINE':'OFFLINE'}</button></section></div>}

function OrderModal(p:any){var o=p.order;return <div className="wx-overlay"><div className="wx-modal wx-order-modal"><button className="wx-modal-x" onClick={p.close}><X/></button><div className="wx-modal-top"><span className={'wx-badge '+o.status.toLowerCase()}>{labels[o.status]}</span><span>ORDER #{o.id}</span></div><div className="wx-customer"><div className="wx-avatar large">{o.avatar}</div><div><h2>{o.customer}</h2><p>{o.service}</p></div></div><div className="wx-modal-grid"><div><MapPin/><span>Address</span><b>{o.address}</b><small>{o.distance} km away</small></div><div><CalendarDays/><span>Booking</span><b>{o.date} · {o.time}</b><small>{o.duration}</small></div><div><Banknote/><span>Customer total</span><b>{money(o.price)}</b><small>Payment: {o.payment}</small></div><div><Wallet/><span>Your earning</span><b>{money(o.earning)}</b><small>After platform charges</small></div></div><div className="wx-status-line">{['ACCEPTED','TRAVELLING','ARRIVED','SERVICE_STARTED','COMPLETED'].map(function(s,i){return <React.Fragment key={s}><span className={['ACCEPTED','TRAVELLING','ARRIVED','SERVICE_STARTED','COMPLETED'].indexOf(o.status)>=i?'done':''}>{i+1}</span>{i<4&&<i/>}</React.Fragment>})}</div><div className="wx-status-labels"><span>Accepted</span><span>Travel</span><span>Arrived</span><span>Service</span><span>Done</span></div><div className="wx-modal-actions"><button className="wx-secondary"><Phone size={16}/> Contact</button><button className="wx-secondary"><Navigation size={16}/> Navigate</button>{o.status!=='COMPLETED'&&<button className="wx-primary" onClick={p.advance}>{p.action}<ChevronRight size={16}/></button>}</div></div></div>}
