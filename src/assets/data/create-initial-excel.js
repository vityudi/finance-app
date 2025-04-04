const XLSX = require('xlsx');

// Criar um workbook vazio
const workbook = XLSX.utils.book_new();

// Criar uma planilha vazia com cabeçalhos
const headers = ['id', 'description', 'amount', 'date', 'category', 'notes'];
const worksheet = XLSX.utils.aoa_to_sheet([headers]);

// Adicionar a planilha ao workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas');

// Salvar o arquivo
XLSX.writeFile(workbook, 'expenses.xlsx');

console.log('Arquivo Excel inicial criado com sucesso!'); 