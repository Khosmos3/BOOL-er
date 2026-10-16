function get(element) {
    return document.getElementById(element);
}

const inputElement = get("input");
const zeroesFirst = true;
const numbers = true;

inputElement.addEventListener("input", (event) => {
    let statement = get("input").value.trim();
    let table = document.getElementsByTagName("table")[0];

    // Clear Table
    let toRemove = table.rows.length;
    for  (let i = 0; i < toRemove; i++)
        get("table").deleteRow(0);

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

    // Header Row
    let topRow = get("table").insertRow(0)
    for (let i = 0; i < variables.length; i++) {
        let cell = topRow.insertCell(i)
        cell.innerHTML = variables[i].bold();
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
                cell.innerHTML = numbers ? (eval(finalStatement) ? "1" : "0") : eval(finalStatement);
                if (eval(finalStatement)) amountTrues++;
                if (eval(finalStatement) + "" === "undefined")
                    get("table").deleteRow(1);
                else cell.style.backgroundColor = eval(cell.innerHTML) ? "rgba(81, 240, 166, 0.7)" : "rgba(242, 51, 83, 0.7)"; 
            } catch (e) {
                improper = true;
                cell.innerHTML = "N/A";
                cell.style.backgroundColor = "rgba(180, 187, 191)";
            }
        }
    }

    // Various indicator labels
    if (amountTrues === numRows) get("indicator").innerHTML = "Tautology!";
    else if (amountTrues === 0 && !improper && numRows > 1) get("indicator").innerHTML = "Taut-falsity!";
    else if (improper) get("indicator").innerHTML = "Improper Syntax";
    else get("indicator").innerHTML = "";
});

// User is updating the statement
inputElement.addEventListener("keydown", (event) => {
    if (event.key?.match?.(/enter|tab/i))
        event.preventDefault();         
});