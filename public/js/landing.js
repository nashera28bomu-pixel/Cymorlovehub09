// LANDING PAGE JS — hero card hover animations
document.querySelectorAll('.hero-card').forEach((card,i)=>{
  card.style.animationDelay=(i*.1)+'s';
  card.style.opacity='0';
  card.style.transform='translateY(20px)';
  card.style.transition='opacity .6s ease, transform .6s ease';
  setTimeout(()=>{card.style.opacity='1';card.style.transform='translateY(0)';},300+i*100);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const target=document.querySelector(a.getAttribute('href'));
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});
