let sermaye = document.getElementById("sermaye");
let winRate = document.getElementById("winRate");
let sermayeOrani = document.getElementById("sermayeOrani");
let kacIslem = document.getElementById("kacIslem");
let profitOrani = document.getElementById("profitOrani");
let profitResult = document.getElementById("profitResult");
let lastSermaye = document.getElementById("lastSermaye");
let calculateBtn = document.getElementById('calculate'); 
let resetBtn = document.getElementById('reset'); 
let bilesik = document.getElementById('bilesikSermaye');
let sabit = document.getElementById('sabitSermaye');
 

// Pozisyon sermayesi = Sermaye*sermaye %'si // iki seçenek olacak biri bileşik(kazandıkça artan) diğer sabit
// profit = pozisyon sermayesi*profit %'si
// kaç işlem = işlem sayısı
// toplam kazanç = profit*kaç işlem 
// bileşik kazanç sermaye hesaplama = toplam kazanç + sermaye


//profit calc
let calc = function(){
 return (sermaye.value*sermayeOrani.value/100)*(profitOrani.value/100);
 
}

//yeni sermaye calc
let yeniSermaye = function(){
 return  Number(sermaye.value) + calc();
}


calculateBtn.addEventListener('click', ()=>{

if(sabit.checked){
 sermaye.value = Number(sermaye.value);
}
 else if(bilesik.checked){
    for(let i = 0; i < Number(kacIslem.value); i++){
sermaye.value = Number(yeniSermaye());
 }} else{
    alert('Lütfen bir sermaye tipi seç!')
 }
});

resetBtn.addEventListener('click', ()=>{
    sermaye.value = 100;
    winRate.value = 1;
    sermayeOrani.value = 10;
    kacIslem.value = 1;
    profitOrani.value = 10;
    lastSermaye.textContent = '0';
    profitResult.textContent = '0';

})