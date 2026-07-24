// CREATE PAGE JS
const S={style:'Romantic',length:'Medium',language:'English',theme:'Rose Garden',musicType:'built-in',musicTrack:'soft-piano',musicFile:null,photos:[]};

// Step nav
function goStep(n){
  if(n>1&&!validate(n-1))return;
  document.querySelectorAll('.step-section').forEach(s=>s.classList.remove('active'));
  document.getElementById(n==='success'?'step-success':`step-${n}`).classList.add('active');
  if(typeof n==='number'){
    document.querySelectorAll('.step-dot').forEach((d,i)=>{
      d.classList.toggle('active',i+1===n);
      d.classList.toggle('done',i+1<n);
    });
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

function validate(step){
  if(step===1){
    if(!document.getElementById('senderName').value.trim()||!document.getElementById('recipientName').value.trim()){
      alert('Please enter both names.');return false;
    }
  }
  if(step===2){
    if(!document.getElementById('howMet').value.trim()){alert('Please share how you met.');return false;}
  }
  return true;
}

// Chips
makeChips('styleGrid','style',S);
makeChips('lengthGrid','length',S);
makeChips('langGrid','language',S);
makeChips('musicGrid','musicTrack',S);
makeThemes('themeGrid','theme',S);

// Photos
const photoZone=document.getElementById('photoZone');
const photoInput=document.getElementById('photoInput');
photoZone.addEventListener('click',()=>photoInput.click());
photoZone.addEventListener('dragover',e=>{e.preventDefault();photoZone.classList.add('drag');});
photoZone.addEventListener('dragleave',()=>photoZone.classList.remove('drag'));
photoZone.addEventListener('drop',e=>{e.preventDefault();photoZone.classList.remove('drag');addPhotos([...e.dataTransfer.files].filter(f=>f.type.startsWith('image/')));});
photoInput.addEventListener('change',()=>{addPhotos([...photoInput.files]);photoInput.value='';});

function addPhotos(files){
  const rem=10-S.photos.length;
  S.photos.push(...files.slice(0,rem));
  renderPhotos();
}
function removePhoto(i){S.photos.splice(i,1);renderPhotos();}
function renderPhotos(){
  const c=document.getElementById('photoPreviews');c.innerHTML='';
  S.photos.forEach((f,i)=>{
    const w=document.createElement('div');w.className='photo-wrap';
    const img=document.createElement('img');img.src=URL.createObjectURL(f);
    const btn=document.createElement('button');btn.className='photo-rm';btn.textContent='×';btn.onclick=()=>removePhoto(i);
    w.appendChild(img);w.appendChild(btn);c.appendChild(w);
  });
  photoZone.querySelector('p').textContent=S.photos.length>=10?'Maximum 10 photos reached':'Tap to add photos';
}

// Music tabs
function switchMusicTab(t){
  document.querySelectorAll('.music-tab').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.music-panel').forEach(p=>p.classList.remove('on'));
  document.getElementById(`tab-${t}`).classList.add('on');
  document.getElementById(`panel-${t}`).classList.add('on');
  S.musicType=t==='bi'?'built-in':'upload';
}
const musicZone=document.getElementById('musicZone');
const musicInput=document.getElementById('musicInput');
musicZone.addEventListener('click',()=>musicInput.click());
musicInput.addEventListener('change',()=>{
  if(musicInput.files[0]){S.musicFile=musicInput.files[0];document.getElementById('musicFileName').textContent=`♪ ${musicInput.files[0].name}`;}
});

// Generate
async function generate(){
  const btn=document.getElementById('genBtn');
  const spinner=document.getElementById('genSpinner');
  const txt=document.getElementById('genText');
  const err=document.getElementById('genError');
  err.textContent='';

  const fd=new FormData();
  const fields=['senderName','recipientName','occasion','relationshipDuration','nickname','favoritePlace','futureDream','firstDate','howMet','loveMost','favoriteMemory','secretThings','specialMoments','futureDreamsTogether','funnyMemory','promises','extraDetails'];
  fields.forEach(f=>{const v=document.getElementById(f)?.value?.trim();if(v)fd.append(f,v);});
  fd.append('writingStyle',S.style);fd.append('letterLength',S.length);
  fd.append('language',S.language);fd.append('theme',S.theme);
  fd.append('musicType',S.musicType);fd.append('musicTrack',S.musicTrack);
  S.photos.forEach(f=>fd.append('images',f));
  if(S.musicType==='upload'&&S.musicFile)fd.append('music',S.musicFile);

  if(!fd.get('senderName')||!fd.get('recipientName')){err.textContent='Please go back and fill in the names.';return;}

  btn.disabled=true;txt.textContent='Crafting your experience...';spinner.style.display='block';

  try{
    const res=await fetch('/api/experiences/generate/letter',{method:'POST',body:fd});
    const data=await res.json();
    if(!res.ok||!data.success)throw new Error(data.error||'Generation failed.');
    document.getElementById('shareUrl').value=data.shareUrl;
    document.getElementById('previewBtn').href=data.shareUrl;
    goStep('success');
  }catch(e){
    err.textContent=e.message;
  }finally{
    btn.disabled=false;txt.textContent='✦ Generate My Experience';spinner.style.display='none';
  }
}
