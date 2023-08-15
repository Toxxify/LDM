const cargoForm = document.querySelector('#x-form');
const cargoList = document.querySelector('#cargo-list');
const formStandarts = document.querySelector('#x-form-Standart');
const totalLDM = document.querySelector('#totalLDM');
const totalWeight = document.querySelector('#totalWeight');
const totalVolume = document.querySelector('#totalVolume');
const totalPallets = document.querySelector('#totalPallets');
const inputText = document.querySelector('#inputText');
const inputLength = document.querySelector('#inputLength');
const inputWidth = document.querySelector('#inputWidth');
const inputHeight = document.querySelector('#inputHeight');
const inputWeight = document.querySelector('#inputWeight');
const inputValue = document.querySelector('#inputValue');
const inputStacking = document.querySelector('#inputStacking');
const inputPalletCount = document.querySelector('#inputPalletCount');
const semitrailerSpace = document.querySelector('#semitrailer-space');
let semitrailerBlock = document.querySelector('#semitrailer');
const stTotalLDM = document.querySelector('#st-total-LDM');
const stTotalPallets = document.querySelector('#st-total-pallets');
const cargoFormBtnSave = cargoForm.querySelector('#x-form--save');
const cargoFormBtnChange = cargoForm.querySelector('#x-form--change');
const cargoFormBtnAdd = cargoForm.querySelector('#x-form--add');
const cargoFormBtnClear = cargoForm.querySelector('#x-form--clear');
const formWeightRadio = document.querySelectorAll("[name=tab-btn-weight]");
const stackingMaxCount = document.querySelector('#stackingMaxCount');
const stackingMaxHeight = document.querySelector('#stackingMaxHeight');
const colorGenerator = document.querySelector('#colorGenerator');
let colorCargo = document.querySelector('#colorCargo');
colorGenerator.addEventListener('click', changeColor);

const popupContainers = document.querySelector("#popup-containers");
let truck = document.querySelector("#truck");
truck.addEventListener("click", selectContainers);

cargoFormBtnSave.addEventListener('click', saveCargo);
cargoFormBtnAdd.addEventListener('click', addCargo);
cargoFormBtnChange.addEventListener('click', changeCargo);
cargoFormBtnClear.addEventListener('click', clearForm);
formStandarts.addEventListener('click', setStandard);
inputStacking.addEventListener('click', checkStacking);

function checkStacking() {
  if (inputStacking.checked) {
    stackingMaxHeight.disabled = false;
    stackingMaxCount.disabled = false;
  } else {
    stackingMaxHeight.disabled = true;
    stackingMaxCount.disabled = true;
    stackingMaxHeight.value = "";
    stackingMaxCount.value = "";
  }
}


let cargoDB = [];
let settingsDB = {};
const semitrailerScale = 2;
let semitrailer = {length: '1360', width: '240'/*245*/, height: '260'/*265*/, maxWeight: 22000/*24т*/}

  setSemitrailer(semitrailer.length, semitrailer.width);
  generateColor();
if (localStorage.getItem('cargoStorage')) {
  cargoDB = JSON.parse(localStorage.getItem('cargoStorage'));
  generationHTML();
  createPallet();
  colculateTotal();
}

// сохранение выбранного контейнера
// if (localStorage.getItem('LDMSettings')) {
//   settingsDB = JSON.parse(localStorage.getItem('LDMSettings'));
//   truck.innerHTML = settingsDB.currentSemitrailer;
// } else {
//   truck.innerHTML = "Eurotruck 86";
// }

function generationHTML(){
  cargoDB.forEach(function(cargo) {
    cargoList.insertAdjacentHTML('beforeend', generateListItemHTML(cargo));
  });
}

function validateForm(inputElement, valEl) {
  if ( valEl == false ) {
    inputElement.classList.add('danger');
    validForm = false;
  }
}

function validFormClear() {
  let delta = Array.from( document.getElementsByClassName("danger") );
  if (delta.length != 0) {
    delta.forEach( element => element.classList.remove("danger") );
  }
  validForm = true;
}

let validForm = true;
function createNewCargo () {
  validFormClear();
  validateForm(inputLength, inputLength.value);
  validateForm(inputWidth, inputWidth.value);
  validateForm(inputHeight, inputHeight.value);
  validateForm(inputWeight, inputWeight.value);

  if (validForm == true) {
    const newCargo = createCargoObject();
    cargoDB.push(newCargo);
    saveToLocalStorage();
    cargoList.insertAdjacentHTML('beforeend', generateListItemHTML(newCargo));
    createPallet();
    colculateTotal();
    return true;
  }
}


function setStandard(e) {
  e.preventDefault();
  
  if (e.target.dataset.std === 'eur') {
    inputLength.value = palletStandards.standartEURO.lenght;
    inputWidth.value = palletStandards.standartEURO.width;
  } else if (e.target.dataset.std === 'fin') {
    inputLength.value = palletStandards.standartFIN.lenght;
    inputWidth.value = palletStandards.standartFIN.width;
  } else if (e.target.dataset.std === 'usa') {
    inputLength.value = palletStandards.standartUSA.lenght;
    inputWidth.value = palletStandards.standartUSA.width;
  }
}

function createPallet() {
  const liArr = cargoList.querySelectorAll('li');
  semitrailerSpace.innerHTML = '';
  
  if (cargoDB.length > 0) {
    for (let i=0 ; i<liArr.length ; i++) {
      let palletLength = cargoDB[i].length;
      let palletWidth = cargoDB[i].width;
      let palletHeight = cargoDB[i].height;
  
      let stackHeight = palletHeight;
      let stackCounter = 1;
      for(let pc = cargoDB[i].palletCount ; pc >= 1 ; pc--) {
        // сделать более читаемое штабелирование
        if (stackHeight + palletHeight <= semitrailer.height && cargoDB[i].stacking == true && pc > 1) {
          stackHeight += palletHeight;
          stackCounter += Number(1);
        } else {
          let pal = `<div data-X="${i}" class="pallet" style="width: ${palletWidth/semitrailerScale}px; height: ${palletLength/semitrailerScale}px; background-color: ${cargoDB[i].palletColor};" data-tooltip="длина - ${palletLength}см. ширина - ${palletWidth}см. высота - ${palletHeight}см. вес ед. - ${cargoDB[i].weight}кг. объём - ${cargoDB[i].volume}м3. площадь - ${cargoDB[i].square}м2".><div class="pallet__inner">x${stackCounter}</div></div>`;
          stackHeight = palletHeight;
          stackCounter = 1;
          semitrailerSpace.insertAdjacentHTML('beforeend', pal);
        }
      }
    }
  }
}

function colculateTotal() {
  let sumLDM = 0;
  let sumWeight = 0;
  let sumVolume = 0;
  let sumPallets = 0;

  for (let i=0 ; i<cargoDB.length ; i++) {
    sumLDM += cargoDB[i].ldm;
    sumVolume += cargoDB[i].totalVolume;
    sumWeight += cargoDB[i].totalWeight;
    sumPallets += cargoDB[i].palletCount;
  }

  stTotalPallets.innerHTML = `паллет: ${sumPallets} шт`;
  totalPallets.innerHTML = `паллет: ${sumPallets} шт.`;
  totalLDM.innerHTML = `${sumLDM.toFixed(2)} LDM.`;
  totalWeight.innerHTML = `вес: ${sumWeight} кг.`;
  totalVolume.innerHTML = `объём: ${sumVolume.toFixed(2)} м3.`;
  stTotalLDM.innerHTML = `${(semitrailerSpace.clientHeight * semitrailerScale) / 100} LDM<br>`;
}



function saveCargo(e) {
  e.preventDefault();
  let submitSucces = createNewCargo();
  if (submitSucces == true) {
    cargoForm.reset();
    inputLength.focus();
  }
}

function addCargo(e) {
  e.preventDefault();
  createNewCargo();
}

function clearForm(e){
  e.preventDefault();
  cargoForm.reset();
}

function changeCargo(e) {
  e.preventDefault();
  cargoDB.forEach( function callback(currentValue, index) {
    if (currentValue.id == cargoForm.dataset.id) {
      const newCargo = createCargoObject();
      cargoDB[index] = newCargo;
      delete cargoForm.dataset.id;
      saveToLocalStorage();
      cargoList.innerHTML = '';
      generationHTML();
      createPallet();
      cargoForm.reset();
    }
  });
  cargoForm.reset();
  cargoFormBtnChange.classList.toggle('hidden');
  cargoFormBtnSave.classList.toggle('hidden');
  colculateTotal();
}

function createCargoObject() {
  const stackingHeight = colculateStackingHeight(stackingMaxHeight.value);
  const stackingCount = colculateStackingCount(stackingMaxCount.value, inputHeight.value, stackingHeight, inputStacking.checked);
  const volume = colculateVolume(inputLength.value, inputWidth.value, inputHeight.value);
  const newCargo = {
    id: Date.now(),
    loaded: 0,
    text: inputText.value,
    length: Number(inputLength.value),
    width: Number(inputWidth.value),
    height: Number(inputHeight.value),
    weight: Number(inputWeight.value),
    stacking: inputStacking.checked,
    stackingMaxHeight: Number(stackingHeight),
    stackingMaxCount: Number(stackingCount),
    palletCount: Number(inputPalletCount.value),
    palletColor: colorCargo.innerHTML,
    volume: Number(volume),
    square: Number(colculateSquare()),
    ldm: Number(calculateLDM (inputLength.value, inputWidth.value, inputWeight.value, inputPalletCount.value, stackingCount)),
    totalWeight: Number(colculateWeight()),
    totalVolume: Number(colculateTotalvalume(volume, Number(inputPalletCount.value))),
    weightSumUp: checkWeightSumUp()
  }
  generateColor();
  return newCargo;
}

function generateListItemHTML (cargoItem) {
  return `
  <li id="${cargoItem.id}">
    <div>
      <div class="list__control">
        <button class="fa fa-arrow-left" aria-hidden="true"></button>
        <div class="list__control--column">
          <button class="list__control-btn list__control-btn--up" data-move="cargoListItemUp"></button>
          <button class="list__control-btn list__control-btn--down" id="cargoListItemDown"></button>
        </div>
      </div>
      <span data-value="_"><b>${cargoItem.palletCount}шт.</b></span>
      <span>длина: <b>${cargoItem.length}</b>см</span>
      <span>ширина: <b>${cargoItem.width}</b>см</span>
      <span>высота: <b>${cargoItem.height}</b>см</span>
      <span>вес: <b>${cargoItem.weight}</b>кг</span>
      <div class="sum">
        <span data-value="ldm">LDM <b>${cargoItem.ldm}</b></span>
        <span data-value="_">V <b>${cargoItem.totalVolume}м3</b></span>
        <span data-value="_">W <b>${cargoItem.totalWeight}кг</b></span>
      </div>
      <button data-action="edit" class="fa fa-pencil" title="Редактировать данные"></button>
      <button data-action="delete" class="fa fa-times-circle" title="Удалить данные"></button>
    </div>
    <div class="message">${cargoItem.text}</div>
  </li>`
}

function saveToLocalStorage () {
  localStorage.setItem('cargoStorage', JSON.stringify(cargoDB));
  localStorage.setItem('LDMSettings', JSON.stringify(settingsDB));
}

function calculateLDM (length, width, weight, palCount, stack) {
  let LDMWeight = semitrailer.maxWeight / semitrailer.length * 100;
  let LDMSquere = ((length * width * palCount * stack / semitrailer.width) / 100).toFixed(2);
  let LDMWeightCargo = (weight / LDMWeight).toFixed(2);
  return LDMSquere > LDMWeightCargo ? LDMSquere : LDMWeightCargo;
}

function colculateVolume (length, width, height) {
  return ((length / 100) * (width / 100) * (height / 100)).toFixed(2);
}

function colculateTotalvalume(volume, stackingCount) {
  return (volume * stackingCount).toFixed(2);
}

function colculateSquare() {
  return ((inputLength.value / 100) * (inputWidth.value / 100)).toFixed(2);
}

function colculateWeight() {
  const sumUpBoolean = checkWeightSumUp();
  console.log(sumUpBoolean, inputWeight.value, inputPalletCount.value);
  if (sumUpBoolean == "true") return inputWeight.value * 1;
  if (sumUpBoolean == "false") return inputWeight.value * inputPalletCount.value;
}

function colculateStackingHeight(sHeight){
  return sHeight == "" ? semitrailer.height : sHeight;
}

function colculateStackingCount(sMaxCount, cHeight, sHeight, stacking){
  if (sMaxCount != "") return sMaxCount;
  if (sMaxCount == "" && stacking) {
    let stackHeight = Number(cHeight);
    let stackCounter = 0;
    for( ; stackHeight < sHeight; stackCounter++){
      stackHeight += Number(cHeight);
    }
    return stackCounter;
  } else return 1;
}

/* использовать для всех радио */
function checkWeightSumUp() {
  let sumUpBoolean;
  formWeightRadio.forEach(function(element){
    if(element.checked) sumUpBoolean = element.dataset.sumpu;
  });
  console.log(sumUpBoolean);
  return sumUpBoolean;
}

function changeColor (e) {
  e.preventDefault();
  generateColor ();
}

function generateColor () {
  const colorResult = '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase();
  colorCargo.innerHTML = colorResult;
  colorCargo.style.backgroundColor = colorResult;
}

/* тернарно */
function isRequired(obj) {
  let value = +obj.value.replace(/\D/g,'')||0;
  if (obj.dataset.required == 'requiredLength'){
    if (value > semitrailer.length) value = semitrailer.length;
    if (value < 0) value = 0;
  }
  if (obj.dataset.required == 'requiredWidth'){
    if (value > semitrailer.width) value = semitrailer.width;
    if (value < 0) value = 0;
  }
  if (obj.dataset.required == 'requiredHeight'){
    if (value > semitrailer.height) value = semitrailer.height;
    if (value < 0) value = 0;
  }
  if (obj.dataset.required == 'requiredWeight'){
    if (value > semitrailer.maxWeight) value = semitrailer.maxWeight;
    if (value < 0) value = 0;
  }
  obj.value = value;
  // https://javascript.ru/forum/misc/30075-ogranichenie-maksimalnogo-chisla-vvoda.html
}

function selectContainers(e) {
  e.preventDefault();
  if(popupContainers.classList == 'hidden') {
    popupContainers.classList.remove('hidden');
  } else {
    popupContainers.classList.add('hidden');
  }
}

for (key in containers) {
  let wrapperElement = document.createElement('div');
  wrapperElement.classList.add("containers-item");
  wrapperElement.dataset.containerName = key;
  wrapperElement.innerHTML = layout(containers[key].name, containers[key].length, containers[key].width, containers[key].height, containers[key].doorWidth, containers[key].doorHeight, containers[key].maxWeight, containers[key].capacity, containers[key].ownWeight, containers[key].img);
  popupContainers.append(wrapperElement);
}

function layout (name, length, width, height, doorWidth, doorHeight, maxWeight, capacity, ownWeight, img) {
  return `
  <div class="containers-item__name">${name}</div>
  <div class="containers-item__wrap">
    <div><img class="containers-item__img" src="img/${img}" alt=""></div>
    <div>
      <div>Длина внутри ${length} см</div>
      <div>Ширина внутри ${width} см</div>
      <div>Высота внутри ${height} см</div>
      <div>Вес констукции ${ownWeight} кг</div>
    </div>
    <div>
      <div>Ширина двери ${doorWidth} см</div>
      <div>Высота двери ${doorHeight} см</div>
      <div>Вместимость ${capacity} м3</div>
      <div>Максимальный груз ${maxWeight} кг</div>
    </div>
  </div>
  `
}

popupContainers.addEventListener('click', choiseContainers);
function choiseContainers(e){
  const cName = e.target.closest('.containers-item').dataset.containerName;
  popupContainers.classList.add('hidden')
  truck.innerHTML = containers[cName].name.toLowerCase();
  setSemitrailer(containers[cName].length, containers[cName].width);
}

function setSemitrailer(semitrailerLength, semitrailerWidth) {
  semitrailerBlock.style.width = semitrailerWidth / semitrailerScale + 'px';
  semitrailerBlock.style.height = semitrailerLength / semitrailerScale + 'px';
}

//https://all-time.lt/ru/service/perevozki-sbornih-gruzov/

// https://ru.stackoverflow.com/questions/1426555/%D0%9A%D0%B0%D0%BA-%D0%BE%D0%B3%D1%80%D0%B0%D0%BD%D0%B8%D1%87%D0%B8%D1%82%D1%8C-%D1%87%D0%B8%D1%81%D0%BB%D0%BE%D0%B2%D1%8B%D0%B5-%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B2-%D0%B8%D0%BD%D0%BF%D1%83%D1%82%D0%B0%D1%85-js





/********** Кнопки списка **********/
// cargoList.addEventListener('click', createPallet);  // УДАЛИТЬ!!!
cargoList.addEventListener('click', moveItemUp);
cargoList.addEventListener('click', deleteCargo);
cargoList.addEventListener('click', editCargo);


function editCargo(e) {
  if (e.target.dataset.action !== 'edit') return;

  const parentNodeId = e.target.closest('li');
  cargoFormBtnChange.classList.remove('hidden');
  cargoFormBtnSave.classList.add('hidden');
  let crgLst = cargoList.querySelectorAll('li');
  if (parentNodeId.classList.contains('editable') == true) {
    cargoFormBtnChange.classList.toggle('hidden');
    cargoFormBtnSave.classList.toggle('hidden');
    parentNodeId.classList.toggle('editable');
  } else {
    crgLst.forEach( function removeClassEdit(c) {
      c.classList.remove('editable');
    });
    parentNodeId.classList.add('editable');
  }

  cargoDB.forEach( function callback(currentValue, index) {
    if (currentValue.id == parentNodeId.id) {
      cargoForm.dataset.id = currentValue.id;
      inputText.value = currentValue.text;
      inputLength.value = currentValue.length;
      inputWidth.value = currentValue.width;
      inputHeight.value = currentValue.height;
      inputWeight.value = currentValue.weight;
      inputStacking.checked = currentValue.stacking;
      inputPalletCount.value = currentValue.palletCount;
      colorCargo.value = currentValue.palletColor;
      colorCargo.style.backgroundColor = currentValue.palletColor;
    }
  });
}


function deleteCargo(e) {
  if (e.target.dataset.action !== 'delete') return;

  const parentNode = e.target.closest('li');
  const id = Number(parentNode.id);
  const index = cargoDB.findIndex( (cargo) => cargo.id === id );
  cargoDB.splice(index, 1);
  parentNode.remove();
  saveToLocalStorage();
  colculateTotal();
  createPallet();
}


function moveItemUp (e) {
  if (e.target.dataset.move !== 'cargoListItemUp') return;
  
  console.log( document.querySelectorAll("#cargo-list li"),  e.target.closest('li')) ;
}