function Transaction(id, amount, date, category, subCategory, description) {
    this.id = id;
    this.amount = parseFloat(amount);
    this.date = date;
    this.category = category;
    this.subCategory = subCategory;
    this.description = description;
}

var transactionsList = [];
var currentlyEditing = false;

var categoryRadios = document.getElementsByName('category');
var subCategoryMenu = document.getElementById('subCategory');

function changeSubCategories() {
    var selectedType = "Income";
    for (var i = 0; i < categoryRadios.length; i++) {
        if (categoryRadios[i].checked) {
            selectedType = categoryRadios[i].value;
        }
    }
    subCategoryMenu.innerHTML = "";
    var optionsList = (selectedType === "Income") 
        ? ["Salary", "Bonus", "Allowances", "Petty Cash"] 
        : ["Food", "Rent", "Shopping", "Entertainment", "Travel"];

    optionsList.forEach(function(opt) {
        var newOption = document.createElement("option");
        newOption.value = opt;
        newOption.textContent = opt;
        subCategoryMenu.appendChild(newOption);
    });
}

for (var k = 0; k < categoryRadios.length; k++) {
    categoryRadios[k].addEventListener('change', changeSubCategories);
}

function loadMyData() {
    try {
        var savedStuff = localStorage.getItem('moneyAppData');
        if (savedStuff) {
            transactionsList = JSON.parse(savedStuff);
        }
    } catch (e) {
        console.error("Data load failed", e);
    }
    refreshTable();
}

function saveMyData() {
    try {
        localStorage.setItem('moneyAppData', JSON.stringify(transactionsList));
    } catch (e) {
        alert("Could not save data to storage.");
    }
    refreshTable();
}

function refreshTable() {
    var tableBody = document.getElementById('transactionList');
    var filter = document.getElementById('filterCategory').value;
    var sortChoice = document.getElementById('sortBy').value;
    
    tableBody.innerHTML = "";
    var totalInc = 0;
    var totalExp = 0;

    transactionsList.forEach(function(item) {
        if (item.category === "Income") totalInc += item.amount;
        else totalExp += item.amount;
    });

    var sortedList = [...transactionsList];
    if (sortChoice === "newest") sortedList.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortChoice === "oldest") sortedList.sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sortChoice === "high") sortedList.sort((a, b) => b.amount - a.amount);

    var count = 0;
    sortedList.forEach(function(entry) {
        if (filter === "all" || entry.category === filter) {
            count++;
            var row = `<tr>
                <td>${entry.date}</td>
                <td>${entry.category}</td>
                <td>${entry.subCategory}</td>
                <td>${entry.description}</td>
                <td>₹${entry.amount.toFixed(2)}</td>
                <td>
                    <button onclick="startEdit(${entry.id})">Edit</button>
                    <button onclick="deleteEntry(${entry.id})">Delete</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        }
    });

    if (count === 0) {
        tableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>No records found.</td></tr>";
    }

    document.getElementById('totalIncome').innerText = "₹" + totalInc.toFixed(2);
    document.getElementById('totalExpense').innerText = "₹" + totalExp.toFixed(2);
    document.getElementById('netBalance').innerText = "₹" + (totalInc - totalExp).toFixed(2);

    updateVisualChart();
}

function updateVisualChart() {
    var chartBox = document.getElementById('barChart');
    if (!chartBox) return; 

    chartBox.innerHTML = "";
    var expenseMap = {};
    var highestValue = 0;

    transactionsList.forEach(function(item) {
        if (item.category === "Expense") {
            expenseMap[item.subCategory] = (expenseMap[item.subCategory] || 0) + item.amount;
            if (expenseMap[item.subCategory] > highestValue) highestValue = expenseMap[item.subCategory];
        }
    });

    if (highestValue > 0) {
        [0, highestValue / 2, highestValue].forEach(val => {
            var label = document.createElement("div");
            label.className = "y-axis-label";
            label.style.position = "absolute";
            label.style.left = "-55px";
            label.style.fontSize = "11px"; 
            label.style.bottom = (val / highestValue * 80) + "%";
            label.innerText = "₹" + val.toFixed(0);
            chartBox.appendChild(label);
        });

        for (var sub in expenseMap) {
            var barHeight = (expenseMap[sub] / highestValue) * 80;
            chartBox.innerHTML += `
                <div class="bar-wrapper">
                    <small>₹${expenseMap[sub].toFixed(0)}</small>
                    <div class="bar" style="height: ${barHeight}%;"></div>
                    <div class="bar-label">${sub}</div>
                </div>`;
        }
    } else {
        chartBox.innerHTML = `
            <div style="text-align: center; color: gray; padding: 50px; width: 100%;">
                <p>No expense data to plot.</p>
            </div>`;
    }
}


document.getElementById('downloadBtn').onclick = function() {
    if (transactionsList.length === 0) return alert("No data to download.");
    var csv = "Date,Category,Sub-Category,Description,Amount\n";
    transactionsList.forEach(t => {
        var d = t.date.split("-");
        csv += `${d[2]}/${d[1]}/${d[0]},${t.category},${t.subCategory},${t.description},${t.amount}\n`;
    });
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "Financial_Report.csv";
    link.click();
};

document.getElementById('transactionForm').onsubmit = function(event) {
    event.preventDefault();
    
    var amtInput = document.getElementById('amount');
    var dateInput = document.getElementById('date');
    var descInput = document.getElementById('description');
    
    [amtInput, dateInput].forEach(el => el.style.border = "1px solid #ccc");

    var isValid = true;
    if (parseFloat(amtInput.value) <= 0 || amtInput.value === "") {
        amtInput.style.border = "2px solid red"; 
        isValid = false;
    }
    if (dateInput.value === "" || new Date(dateInput.value) > new Date()) {
        dateInput.style.border = "2px solid red";
        isValid = false;
    }

    if (!isValid) {
        alert("Please fix the fields highlighted in red.");
        return;
    }

    var chosenCategory = document.querySelector('input[name="category"]:checked').value;
    var subCatValue = document.getElementById('subCategory').value;

    if (currentlyEditing) {
        var editId = document.getElementById('editId').value;
        var index = transactionsList.findIndex(t => t.id == editId);
        transactionsList[index] = new Transaction(editId, parseFloat(amtInput.value), dateInput.value, chosenCategory, subCatValue, descInput.value);
        currentlyEditing = false;
    } else {
        transactionsList.push(new Transaction(Date.now(), amtInput.value, dateInput.value, chosenCategory, subCatValue, descInput.value));
    }

    saveMyData();
    closeTheModal();
};

function deleteEntry(id) {
    if (confirm("Are you sure you want to delete this?")) {
        transactionsList = transactionsList.filter(t => t.id !== id);
        saveMyData();
    }
}

function startEdit(id) {
    currentlyEditing = true;
    var item = transactionsList.find(t => t.id === id);
    document.getElementById('editId').value = item.id;
    document.getElementById('amount').value = item.amount;
    document.getElementById('date').value = item.date;
    document.getElementById('description').value = item.description;
    document.querySelector(`input[name="category"][value="${item.category}"]`).checked = true;
    changeSubCategories();
    document.getElementById('subCategory').value = item.subCategory;
    document.getElementById('modalOverlay').style.display = 'flex';
}

document.getElementById('openModalBtn').onclick = function() {
    currentlyEditing = false;
    document.getElementById('transactionForm').reset();
    changeSubCategories();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('modalOverlay').style.display = 'flex';
};

function closeTheModal() { document.getElementById('modalOverlay').style.display = 'none'; }
document.getElementById('closeModalBtn').onclick = closeTheModal;
document.getElementById('filterCategory').onchange = refreshTable;
document.getElementById('sortBy').onchange = refreshTable;

loadMyData();