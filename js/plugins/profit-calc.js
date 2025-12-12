let sermaye = document.getElementById("sermaye");
let winRate = document.getElementById("winRate");
let sermayeOrani = document.getElementById("sermayeOrani");
let kacIslem = document.getElementById("kacIslem");
let profitOrani = document.getElementById("profitOrani");
let profitResult = document.getElementById("profitResult");
let lastSermaye = document.getElementById("lastSermaye");
let calculateBtn = document.getElementById("calculate");
let resetBtn = document.getElementById("reset");
let bilesik = document.getElementById("bilesikSermaye");
let sabit = document.getElementById("sabitSermaye");

// Pozisyon sermayesi = Sermaye*sermaye %'si // iki seçenek olacak biri bileşik(kazandıkça artan) diğer sabit
// profit = pozisyon sermayesi*profit %'si
// kaç işlem = işlem sayısı
// toplam kazanç = profit*kaç işlem
// bileşik kazanç sermaye hesaplama = toplam kazanç + sermaye

//profit calc
let calc = function () {
  return (
    ((sermaye.value * sermayeOrani.value) / 100) * (profitOrani.value / 100)
  );
};

//yeni sermaye calc
let yeniSermaye = function () {
  return Number(sermaye.value) + calc();
};

calculateBtn.addEventListener("click", () => {
  
  if (bilesik.checked) {
    let temp = sermaye.value;
    for (let i = 0; i < kacIslem.value; i++) {
      sermaye.value = yeniSermaye();
      lastSermaye.textContent = yeniSermaye();
      profitResult.textContent =  yeniSermaye() - temp;
    } sermaye.value = temp;

  } else if (sabit.checked) {
      const temp2 = sermaye.value;
    for (let i = 0; i < kacIslem.value; i++) {
       
             
lastSermaye.textContent = calc([i]);

        
        
        console.log(temp2, lastSermaye.textContent, calc(), yeniSermaye());
    }
        
  } else {
    alert('lütfen bir sermaye tipi seçiniz');
  }
   
});



resetBtn.addEventListener("click", () => {
  sermaye.value = 100;
  winRate.value = 100;
  sermayeOrani.value = 10;
  kacIslem.value = 5;
  profitOrani.value = 10;
  lastSermaye.textContent = "0";
  profitResult.textContent = "0";
});
