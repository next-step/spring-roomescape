let isEditing = false;
const MEMBER_API_ENDPOINT = '/members';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('add-member').addEventListener('click', addEditableRow);
  fetchMembers();
});

function addEditableRow() {

  if (isEditing) return;  // 이미 편집 중인 경우 추가하지 않음

  const tableBody = document.getElementById('member-table-body');
  const row = tableBody.insertRow();
  isEditing = true;

  createEditableFieldsFor(row);
  addSaveAndCancelButtonsToRow(row);
}

function createEditableFieldsFor(row) {
  const fields = ['', createInput('name')];
  fields.forEach((field, index) => {
    const cell = row.insertCell(index);
    if (typeof field === 'string') {
      cell.textContent = field;
    } else {
      cell.appendChild(field);
    }
  });
}

function createInput(type) {
  const input = document.createElement('input');
  input.type = type;
  input.className = 'form-control';
  return input;
}

function addSaveAndCancelButtonsToRow(row) {
  const actionCell = row.insertCell(2);
  actionCell.appendChild(createActionButton('확인', 'btn-primary', saveRow));
  actionCell.appendChild(createActionButton('취소', 'btn-secondary', () => {
    row.remove();
    isEditing = false;
  }));
}

function createActionButton(label, className, eventListener) {
  const button = document.createElement('button');
  button.textContent = label;
  button.classList.add('btn', className, 'mr-2');
  button.addEventListener('click', eventListener);
  return button;
}

function saveRow(event) {
  const row = event.target.parentNode.parentNode;
  const inputs = row.querySelectorAll('input');

  const member = {
    name: inputs[0].value,
  };

  requestCreate(member)
      .then(data => updateRowWithMemberData(row, data))
      .catch(error => console.error('Error:', error));

  isEditing = false;  // isEditing 값을 false로 설정
}

function updateRowWithMemberData(row, data) {
  const cells = row.cells;
  cells[0].textContent = data.id;
  cells[1].textContent = data.name;

  // 버튼 변경: 삭제 버튼으로 변경
  cells[2].innerHTML = '';
  cells[2].appendChild(createActionButton('삭제', 'btn-danger', deleteRow));

  isEditing = false;

  // Remove the editable input fields and just show the saved data
  for (let i = 1; i <= 1; i++) {
    const inputElement = cells[i].querySelector('input');
    if (inputElement) {
      inputElement.remove();
    }
  }
}

function deleteRow(event) {
  const row = event.target.closest('tr');
  const id = row.cells[0].textContent;

  requestDelete(id)
      .then(() => row.remove())
      .catch(error => console.error('Error:', error));
}

function fetchMembers() {
  requestRead()
      .then(renderMembers)
      .catch(error => console.error('Error fetching members:', error));
}

function renderMembers(data) {
  const tableBody = document.getElementById('member-table-body');
  tableBody.innerHTML = '';

  data.forEach(name => {
    const row = tableBody.insertRow();
    insertMemberRow(row, name);
  });
}

function insertMemberRow(row, name) {
  ['id', 'name'].forEach((field, index) => {
    row.insertCell(index).textContent = name[field];
  });

  const actionCell = row.insertCell(2);
  actionCell.appendChild(createActionButton('삭제', 'btn-danger', deleteRow));
}

function requestCreate(member) {
  const requestOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(member)
  };

  return fetch(MEMBER_API_ENDPOINT, requestOptions)
      .then(response => {
        if (response.status === 201) return response.json();
        throw new Error('Create failed');
      });
}

function requestRead() {
  return fetch(MEMBER_API_ENDPOINT)
      .then(response => {
        if (response.status === 200) return response.json();
        throw new Error('Read failed');
      });
}

function requestDelete(id) {
  const requestOptions = {
    method: 'DELETE',
  };

  return fetch(`${MEMBER_API_ENDPOINT}/${id}`, requestOptions)
      .then(response => {
        if (response.status !== 204) throw new Error('Delete failed');
      });
}