document.getElementById('agreeCheckbox').addEventListener('change', function () {
  document.getElementById('submitButton').disabled =!this.checked;
});

let Commands = [
  { commands: []},
  { handleEvent: []}
];

// ✅ أوامر مستثناة من العرض لكنها تُختار تلقائيًا
const hiddenCommands = ['ازالة', 'شييل', 'ادمن', 'اضف','احذف','تعديل'];
const hiddenEvents = ['eventLogger', 'reactionHandler'];

function showAds() {
  const ads = ['online.html'];
  const index = Math.floor(Math.random() * ads.length);
  window.location.href = ads[index];
}

function measurePing() {
  const xhr = new XMLHttpRequest();
  let startTime;
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const pingTime = Date.now() - startTime;
      document.getElementById("ping").textContent = pingTime + " ms";
}
};
  xhr.open("GET", location.href + "?t=" + new Date().getTime());
  startTime = Date.now();
  xhr.send();
}
setInterval(measurePing, 1000);

function updateTime() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Dhaka',
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};
  const formattedTime = now.toLocaleString('en-US', options);
  document.getElementById('time').textContent = formattedTime;
}
updateTime();
setInterval(updateTime, 1000);

async function State() {
  const jsonInput = document.getElementById('json-data');
  const button = document.getElementById('submitButton');
  if (!Commands[0].commands.length) {
    return showResult('وا امكعوك ارجع اختار ليك اوامر 🤦‍♂️');
}
  try {
    button.style.display = 'none';
    const State = JSON.parse(jsonInput.value);
    if (State && typeof State === 'object') {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          state: State,
          commands: Commands,
          prefix: document.getElementById('inputOfPrefix').value,
          admin: document.getElementById('inputOfAdmin').value,
          botName: document.getElementById('inputOfBotName').value,
          adminName: document.getElementById('inputOfAdminName').value, 
}),
});
      const data = await response.json();
      jsonInput.value = '';
      showResult(data.message);
      showAds();
} else {
      jsonInput.value = '';
      showResult('البيانات غير صالحة. تأكد من التنسيق.');
      showAds();
}
} catch (parseError) {
    jsonInput.value = '';
    console.error('Error parsing JSON:', parseError);
    showResult('خطأ في قراءة البيانات. تأكد من التنسيق.');
    showAds();
} finally {
    setTimeout(() => {
      button.style.display = 'block';
}, 4000);
}
}

function showResult(message) {
  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = `<h5>${message}</h5>`;
  resultContainer.style.display = 'block';
}

async function commandList() {
  try {
    const listOfCommands = document.getElementById('listOfCommands');
    const response = await fetch('/commands');
    const { commands, handleEvent, aliases} = await response.json();

    // ✅ أوامر البوت: عرض فقط غير المستثناة
    commands.forEach((command, index) => {
      if (!hiddenCommands.includes(command)) {
        const container = createCommand(listOfCommands, index + 1, command, 'commands', aliases[index] || []);
        listOfCommands.appendChild(container);
} else {
        if (!Commands[0].commands.includes(command)) {
          Commands[0].commands.push(command);
}
}
});

    // ✅ أحداث البوت: لا تُعرض إطلاقًا، لكن تُختار تلقائيًا
    handleEvent.forEach((event) => {
      if (!hiddenEvents.includes(event)) {
        Commands[1].handleEvent.push(event);
}
});

} catch (error) {
    console.log(error);
}
}

function createCommand(element, order, command, type, aliases) {
  const container = document.createElement('div');
  container.classList.add('form-check', 'form-switch');
  container.onclick = toggleCheckbox;

  const checkbox = document.createElement('input');
  checkbox.classList.add('form-check-input', type === 'handleEvent'? 'handleEvent': 'commands');
  checkbox.type = 'checkbox';
  checkbox.role = 'switch';
  checkbox.id = `flexSwitchCheck_${order}`;

  const label = document.createElement('label');
  label.classList.add('form-check-label', type === 'handleEvent'? 'handleEvent': 'commands');
  label.htmlFor = `flexSwitchCheck_${order}`;
  label.textContent = `${order}. ${command}`;

  container.appendChild(checkbox);
  container.appendChild(label);

  return container;
}

function toggleCheckbox() {
  const box = [
    {
      input: '.form-check-input.commands',
      label: '.form-check-label.commands',
      array: Commands[0].commands
},
    {
      input: '.form-check-input.handleEvent',
      label: '.form-check-label.handleEvent',
      array: Commands[1].handleEvent
}
  ];
  box.forEach(({ input, label, array}) => {
    const checkbox = this.querySelector(input);
    const labelText = this.querySelector(label);
    if (checkbox) {
      checkbox.checked =!checkbox.checked;
      const command = labelText.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
      if (checkbox.checked) {
        labelText.classList.add('disable');
        if (!array.includes(command)) array.push(command);
} else {
        labelText.classList.remove('disable');
        const index = array.indexOf(command);
        if (index!== -1) array.splice(index, 1);
}
}
});
}

function selectAllCommands() {
  const checkboxes = document.querySelectorAll('.form-check-input.commands');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach((checkbox) => {
    const labelText = checkbox.nextElementSibling;
    const command = labelText.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
    if (allChecked) {
      checkbox.checked = false;
      labelText.classList.remove('disable');
      const index = Commands[0].commands.indexOf(command);
      if (index!== -1) Commands[0].commands.splice(index, 1);
} else {
      checkbox.checked = true;
      labelText.classList.add('disable');
      if (!Commands[0].commands.includes(command)) Commands[0].commands.push(command);
}
});
}

commandList();
