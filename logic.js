function get(element) {
    return document.getElementById(element);
}

const inputElement = get("input");

const flip = get("flip-toggle");
const letterNumber = get("letter-number-toggle");

flip.addEventListener("change", event => update())
letterNumber.addEventListener("change", event => update())
inputElement.addEventListener("input", event => update());

// User is updating the statement
inputElement.addEventListener("keydown", (event) => {
    if (event.key?.match?.(/enter|tab/i))
        event.preventDefault();         
});

function update(event) {
    let statement = get("input").value.trim();
    let truthTable = document.getElementsByTagName("table")[0];
    let kMap = document.getElementsByTagName("table")[1];
    let zeroesFirst = flip.checked;
    let numbers = letterNumber.checked;

    // Clear Tables
    let truthTableRows = truthTable.rows.length;
    let kMapRows = kMap.rows.length;
    for  (let i = 0; i < truthTableRows; i++)
        get("table").deleteRow(0);
    for  (let i = 0; i < kMapRows; i++)
        get("map").deleteRow(0);

    // Manage Input
    let variables = [];
    let operators = ["~", "'", "’", "!", "v", "+", "|", "&", "•", "(", ")", " ", "[", "]", "{", "}"];
    let isFunction = false;
    let trueSymbol = numbers ? "1" : "T";
    let falseSymbol = numbers ? "0" : "F";
    if (statement.includes("=")) {
        isFunction = statement.substring(0, statement.indexOf("="));
        statement = statement.substring(statement.indexOf("=") + 1);
    }
    checker: for (let i = 0; i < statement.length; i++) {
        for (let j = 0; j < variables.concat(operators).length; j++)
            if (statement[i] == variables.concat(operators)[j]) continue checker;
        variables.push(statement[i]);
    }

    // Header Row Truth Table
    let topRow = get("table").insertRow(0)
    for (let i = 0; i < variables.length; i++) {
        let cell = topRow.insertCell(i)
        cell.innerHTML = variables[i].bold();
        cell.style.backgroundColor = "rgba(255, 255, 255)";
    }
    let conclusionCell = topRow.insertCell(variables.length);
    conclusionCell.innerHTML = variables.length ? (isFunction ? isFunction.bold() : statement.bold()) : "(Waiting for something to happen?)";
    conclusionCell.style.backgroundColor = variables.length ? "rgba(255, 255, 255)" : "rgba(164, 102, 179, 0.6)";

    // Truth Table
    let numRows = Math.pow(2, variables.length);
    let amountTrues = 0;
    let improper = false;
    let replacedOperators = statement.replaceAll("|", "||")
                                        .replaceAll("v", "||")
                                        .replaceAll("+", "||")
                                        .replaceAll("&", "&&")
                                        .replaceAll("•", "&&")
                                        .replaceAll("~", "!")
                                        .replaceAll("[", "(")
                                        .replaceAll("]", ")")
                                        .replaceAll("{", "(")
                                        .replaceAll("}", ")");

    // Replaces ' to ! (Ex. A' -> !A)
    for (let i = 1; i < replacedOperators.length; i++) {
        if (replacedOperators[i] === "'" || replacedOperators[i] === "’") {
            if (variables.includes(replacedOperators[i-1]))
                replacedOperators = replacedOperators.substring(0, i - 1) + "!" 
                                    + replacedOperators[i - 1] + replacedOperators.substring(i + 1);
            else if (replacedOperators[i-1] === ")") {
                let countClose = 1;
                let step = 1;
                while(countClose > 0 && i - step >= 0) {
                    step++;

                    if (replacedOperators[i - step] === ")")
                        countClose++;
                    else if (replacedOperators[i - step] === "(")
                        countClose--;
                }

                replacedOperators = replacedOperators.substring(0, i - step) + "!" 
                                    + replacedOperators.substring(i - step, i) + replacedOperators.substring(i + 1);
            } 
        }
    }

    let completeResults = [];
    for (let i = 0; i < numRows; i++) {
        let row = get("table").insertRow(i + 1);
        
        for (let j = 0; j < variables.length + 1; j++) {
            let cell = row.insertCell(j)
            cell.innerHTML = Math.floor(i / (numRows / Math.pow(2, j + 1))) % 2 ? (zeroesFirst ? trueSymbol : falseSymbol) : (zeroesFirst ? falseSymbol : trueSymbol);
            cell.style.backgroundColor = cell.innerHTML === trueSymbol ? "rgba(81, 240, 166, 0.7)" : "rgba(242, 51, 83, 0.7)";
            
            if (j !== variables.length) continue;

            // Replace variables with trues and falses appropriately
            let specificReplacedOperators = replacedOperators;
            for (let k = 0; k < variables.length; k++)
                specificReplacedOperators = specificReplacedOperators.replaceAll(variables[k], Math.floor(i / (numRows / Math.pow(2, k + 1))) % 2 ? "▤" : "▥");
            finalStatement = specificReplacedOperators.replaceAll("▤", zeroesFirst + "").replaceAll("▥", !zeroesFirst + "");

            // Fill cells with colors and truth values
            try {
                completeResults.push(eval(finalStatement));
                cell.innerHTML = numbers ? (eval(finalStatement) ? "1" : "0") : eval(finalStatement);
                if (eval(finalStatement)) amountTrues++;
                if (eval(finalStatement) + "" === "undefined")
                    get("table").deleteRow(1);
                else cell.style.backgroundColor = eval(cell.innerHTML) ? "rgba(81, 240, 166, 0.7)" : "rgba(242, 51, 83, 0.7)"; 
            } catch (e) {
                improper = true;
                cell.innerHTML = "N/A";
                cell.style.backgroundColor = "rgba(180, 187, 191)";
                if (!variables.length)
                    get("table").deleteRow(1);  
            }
        }
    }

    // Various indicator labels
    if (amountTrues === numRows) get("indicator").innerHTML = "Tautology!";
    else if (amountTrues === 0 && !improper && numRows > 1) get("indicator").innerHTML = "Taut-falsity!";
    else if (improper && variables.length) get("indicator").innerHTML = "Improper Syntax";
    else get("indicator").innerHTML = "";

    // K-map

    completeResults = zeroesFirst ? completeResults.map(x => x ? 1 : 0) : completeResults.map(x => x ? 1 : 0).toReversed();
    let cells = [];
    let shiftKMap = n => Math.round(-1.33*n*n*n + 5*n*n - 1.66*n);
    let row = get("map").insertRow(0);
    if (variables.length === 0) {
        cells.push(row.insertCell(0))
        cells[0].innerHTML = "...";
    } else if (variables.length === 1) {
        cells.push(row.insertCell(0))
        cells[cells.length-1].innerHTML = completeResults[0] ?? "N/A";

        row = get("map").insertRow(1);
        cells.push(row.insertCell(0))
        cells[cells.length-1].innerHTML = completeResults[1] ?? "N/A";
    } else if (variables.length === 2) {
        cells.push(row.insertCell(0))
        cells[cells.length-1].innerHTML = completeResults[0] ?? "N/A";
        cells.push(row.insertCell(1))
        cells[cells.length-1].innerHTML = completeResults[2] ?? "N/A";

        row = get("map").insertRow(1);
        cells.push(row.insertCell(0))
        cells[cells.length-1].innerHTML = completeResults[1] ?? "N/A";
        cells.push(row.insertCell(1))
        cells[cells.length-1].innerHTML = completeResults[3] ?? "N/A";
    } else if (variables.length === 3) {
        for (let i = 0; i < 4; i++) {
            cells.push(row.insertCell(i))
            cells[cells.length-1].innerHTML = completeResults[shiftKMap(i)] ?? "N/A";
        }
        row = get("map").insertRow(1);
        for (let i = 0; i < 4; i++) {
            cells.push(row.insertCell(i))
            cells[cells.length-1].innerHTML = completeResults[shiftKMap(i)+1] ?? "N/A";
        }
    } else if (variables.length === 4) {
        for (let i = 0; i < 4; i++) {
            cells.push(row.insertCell(i))
            cells[cells.length-1].innerHTML = completeResults[2*shiftKMap(i)] ?? "N/A";
        }
        for (let i = 1; i < 4; i++) {
            row = get("map").insertRow(i);
            for (let j = 0; j < 4; j++) {
                cells.push(row.insertCell(j))
                cells[cells.length-1].innerHTML = completeResults[2*shiftKMap(j) + shiftKMap(i)/2] ?? "N/A";
            }
        }
    } else {
        row.insertCell(0).innerHTML = "BOOL-er currently <br> supports a maximum <br>of 4 variables";
    }

    cells.forEach(cell => {
        cell.style.backgroundColor = "rgb(255, 255, 255)";
        cell.style.width = "50px";
        cell.style.height = "50px";
        cell.onclick = () => {
            cell.style.color = cell.dataset.state == "true" ?  "rgb(0, 0, 0)" : "rgb(255, 0, 0)";
            cell.dataset.state = cell.dataset.state == "true" ? false : true;
        };
    })

}